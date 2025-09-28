const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io with CORS configuration for development
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// In-memory storage (replace with database in production)
let currentPoll = null;
let pollTimer = null;
let connectedUsers = new Map(); // socketId -> { name, type: 'teacher'|'student' }
let studentVotes = new Map(); // studentName -> optionIndex

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// Get current poll status
app.get("/api/poll/current", (req, res) => {
  res.json({
    poll: currentPoll,
    totalVotes: studentVotes.size,
    results: currentPoll ? calculateResults() : null,
  });
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining as teacher or student
  socket.on("join", ({ name, userType }) => {
    connectedUsers.set(socket.id, { name, type: userType });

    if (userType === "teacher") {
      socket.join("teachers");
      console.log(`Teacher ${name} joined`);
    } else {
      socket.join("students");
      console.log(`Student ${name} joined`);
    }

    // Send current poll state to newly joined user
    socket.emit("poll_state", {
      poll: currentPoll,
      hasVoted: userType === "student" ? studentVotes.has(name) : false,
      results: currentPoll ? calculateResults() : null,
    });

    // Update user count for all clients
    broadcastUserCount();
  });

  // Teacher creates a new poll
  socket.on("create_poll", ({ question, options, timeLimit = 60 }) => {
    const user = connectedUsers.get(socket.id);

    if (!user || user.type !== "teacher") {
      socket.emit("error", { message: "Only teachers can create polls" });
      return;
    }

    // Check if all students have voted or no active poll
    const totalStudents = Array.from(connectedUsers.values()).filter(
      (u) => u.type === "student"
    ).length;

    if (currentPoll && studentVotes.size < totalStudents) {
      socket.emit("error", {
        message: "Cannot create new poll. Current poll is still active.",
      });
      return;
    }

    // Clear previous poll data
    studentVotes.clear();
    clearTimeout(pollTimer);

    // Create new poll
    currentPoll = {
      id: Date.now(),
      question,
      options: options.map((option) => ({ text: option, votes: 0 })),
      timeLimit,
      createdAt: new Date(),
      isActive: true,
    };

    // Broadcast new poll to all users
    io.emit("new_poll", currentPoll);

    // Set timer for poll expiration
    pollTimer = setTimeout(() => {
      endPoll();
    }, timeLimit * 1000);

    console.log(`Poll created: ${question}`);
  });

  // Student submits vote
  socket.on("submit_vote", ({ optionIndex }) => {
    const user = connectedUsers.get(socket.id);

    if (!user || user.type !== "student") {
      socket.emit("error", { message: "Only students can vote" });
      return;
    }

    if (!currentPoll || !currentPoll.isActive) {
      socket.emit("error", { message: "No active poll available" });
      return;
    }

    if (studentVotes.has(user.name)) {
      socket.emit("error", { message: "You have already voted" });
      return;
    }

    if (optionIndex < 0 || optionIndex >= currentPoll.options.length) {
      socket.emit("error", { message: "Invalid option selected" });
      return;
    }

    // Record vote
    studentVotes.set(user.name, optionIndex);
    currentPoll.options[optionIndex].votes++;

    console.log(`Vote received from ${user.name} for option ${optionIndex}`);

    // Send vote confirmation to student
    socket.emit("vote_confirmed", { optionIndex });

    // Calculate and broadcast results
    const results = calculateResults();
    io.emit("poll_update", {
      totalVotes: studentVotes.size,
      results,
    });

    // Check if all students have voted
    const totalStudents = Array.from(connectedUsers.values()).filter(
      (u) => u.type === "student"
    ).length;

    if (studentVotes.size >= totalStudents && totalStudents > 0) {
      endPoll();
    }
  });

  // Get poll results (for teachers)
  socket.on("get_results", () => {
    const user = connectedUsers.get(socket.id);

    if (user && user.type === "teacher") {
      socket.emit("poll_results", {
        poll: currentPoll,
        results: currentPoll ? calculateResults() : null,
        totalVotes: studentVotes.size,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.type} ${user.name} disconnected`);
      connectedUsers.delete(socket.id);
      broadcastUserCount();
    }
  });
});

// Helper Functions
function calculateResults() {
  if (!currentPoll) return null;

  const totalVotes = studentVotes.size;
  return currentPoll.options.map((option, index) => ({
    text: option.text,
    votes: option.votes,
    percentage:
      totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
  }));
}

function endPoll() {
  if (!currentPoll) return;

  currentPoll.isActive = false;
  clearTimeout(pollTimer);

  const results = calculateResults();

  // Broadcast final results to all users
  io.emit("poll_ended", {
    poll: currentPoll,
    results,
    totalVotes: studentVotes.size,
  });

  console.log(`Poll ended: ${currentPoll.question}`);
}

function broadcastUserCount() {
  const teachers = Array.from(connectedUsers.values()).filter(
    (u) => u.type === "teacher"
  ).length;
  const students = Array.from(connectedUsers.values()).filter(
    (u) => u.type === "student"
  ).length;

  io.emit("user_count_update", { teachers, students });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend should connect to http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down server...");
  clearTimeout(pollTimer);
  server.close(() => {
    process.exit(0);
  });
});