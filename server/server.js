const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS configuration - EXACT FIX
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://intervue-polling-system-sigma.vercel.app", // Your actual Vercel URL
      "https://*.vercel.app", // Allow all Vercel subdomains
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"],
  },
});

// Express CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://intervue-polling-system-sigma.vercel.app", // Your actual Vercel URL
      "https://*.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
  })
);

app.use(express.json());

// --- In-memory storage (replace with a database in production) ---
let currentPoll = null;
let pollTimer = null;
const pollHistory = []; // Store completed polls
const connectedUsers = new Map(); // socketId -> { name, type: 'teacher'|'student' }
const studentVotes = new Map(); // studentName -> optionIndex

// --- REST API Endpoints ---
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

app.get("/api/poll/current", (req, res) => {
  res.json({
    poll: currentPoll,
    totalVotes: studentVotes.size,
    results: currentPoll ? calculateResults() : null,
  });
});

// --- Socket.IO Connection Handling ---
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on("join", ({ name, userType }) => {
    connectedUsers.set(socket.id, { name, type: userType });
    socket.join(userType === "teacher" ? "teachers" : "students");
    console.log(`${userType} ${name} joined`);

    socket.emit("poll_state", {
      poll: currentPoll,
      hasVoted: userType === "student" ? studentVotes.has(name) : false,
      results: currentPoll ? calculateResults() : null,
    });

    broadcastUserCount();
    io.emit("participants_update", Array.from(connectedUsers.values()));
  });

  // Teacher creates a new poll
  socket.on("create_poll", ({ question, options, timeLimit = 60 }) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.type !== "teacher") {
      return socket.emit("error", {
        message: "Only teachers can create polls",
      });
    }

    studentVotes.clear();
    clearTimeout(pollTimer);

    currentPoll = {
      id: Date.now(),
      question,
      options: options.map((option) => ({ text: option, votes: 0 })),
      timeLimit,
      createdAt: new Date(),
      isActive: true,
    };

    io.emit("new_poll", currentPoll);

    pollTimer = setTimeout(endPoll, timeLimit * 1000);
    console.log(`Poll created: ${question}`);
  });

  // Student submits a vote
  socket.on("submit_vote", ({ optionIndex }) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.type !== "student") return;
    if (!currentPoll || !currentPoll.isActive)
      return socket.emit("error", { message: "No active poll" });
    if (studentVotes.has(user.name))
      return socket.emit("error", { message: "You have already voted" });

    studentVotes.set(user.name, optionIndex);
    currentPoll.options[optionIndex].votes++;

    socket.emit("vote_confirmed", { optionIndex });

    const results = calculateResults();
    io.emit("poll_update", { totalVotes: studentVotes.size, results });

    const totalStudents = Array.from(connectedUsers.values()).filter(
      (u) => u.type === "student"
    ).length;
    if (studentVotes.size >= totalStudents && totalStudents > 0) {
      endPoll();
    }
  });

  // Get poll history
  socket.on("get_poll_history", () => {
    socket.emit("poll_history", pollHistory);
  });

  // Chat functionality
  socket.on("send_chat_message", ({ message, user, userType }) => {
    const chatMessage = {
      id: Date.now(),
      user,
      userType,
      message,
      timestamp: new Date(),
    };
    io.emit("chat_message", chatMessage);
  });

  // Get participants list
  socket.on("get_participants", () => {
    socket.emit("participants_update", Array.from(connectedUsers.values()));
  });

  // Kick user (teacher only)
  socket.on("kick_user", ({ targetUser }) => {
    const user = connectedUsers.get(socket.id);
    if (!user || user.type !== "teacher") return;

    for (const [socketId, userData] of connectedUsers.entries()) {
      if (userData.name === targetUser) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket) {
          targetSocket.emit("kicked_out");
          setTimeout(() => targetSocket.disconnect(true), 500);
        }
        break;
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.type} ${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      broadcastUserCount();
      io.emit("participants_update", Array.from(connectedUsers.values()));
    }
  });
});

// --- Helper Functions ---
function calculateResults() {
  if (!currentPoll) return null;
  const totalVotes = studentVotes.size;
  return currentPoll.options.map((option) => ({
    text: option.text,
    votes: option.votes,
    percentage:
      totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
  }));
}

function endPoll() {
  if (!currentPoll || !currentPoll.isActive) return;

  currentPoll.isActive = false;
  clearTimeout(pollTimer);

  const results = calculateResults();
  const totalVotes = studentVotes.size;

  savePollToHistory(currentPoll, results, totalVotes);

  io.emit("poll_ended", { poll: currentPoll, results, totalVotes });
  console.log(`Poll ended: ${currentPoll.question}`);
}

function savePollToHistory(poll, results, totalVotes) {
  pollHistory.push({
    id: poll.id,
    question: poll.question,
    options: results, // The 'results' array has the final vote counts and percentages
    totalVotes,
    completedAt: new Date(),
  });
}

function broadcastUserCount() {
  const users = Array.from(connectedUsers.values());
  const teachers = users.filter((u) => u.type === "teacher").length;
  const students = users.filter((u) => u.type === "student").length;
  io.emit("user_count_update", { teachers, students });
}

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  clearTimeout(pollTimer);
  server.close(() => process.exit(0));
});
