import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAppSelector, useAppDispatch } from "../store";
import PollCreation from "./PollCreation";
import PollResults from "./PollResults";
import PollHistory from "./PollHistory";
import ChatSidebar from "./ChatSidebar";

const TeacherDashboard: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [showPollHistory, setShowPollHistory] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const { socket, joinRoom, isConnected } = useSocket();
  const { currentPoll, userCounts } = useAppSelector((state) => state.poll);

  useEffect(() => {
    if (name && isConnected && socket) {
      joinRoom(name, "teacher");
    }
  }, [name, isConnected, socket, joinRoom]);

  const canCreateNewPoll = () => {
    if (!currentPoll) return true;
    if (!currentPoll.isActive) return true;
    // Check if all students have voted
    const totalStudents = userCounts.students;
    return totalStudents === 0; // Allow if no students connected
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid var(--border-gray)",
          padding: "var(--spacing-lg) 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                className="brand-badge"
                style={{ marginBottom: "var(--spacing-sm)" }}
              >
                🗳️ Intervue Poll
              </div>
              <h1 style={{ fontSize: "var(--font-size-h2)", fontWeight: 600 }}>
                Welcome, {name}!
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--spacing-md)",
                alignItems: "center",
              }}
            >
              {/* User Counts */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--spacing-sm)",
                  fontSize: "var(--font-size-small)",
                  color: "var(--text-light)",
                }}
              >
                <span>👨‍🏫 {userCounts.teachers}</span>
                <span>👨‍🎓 {userCounts.students}</span>
              </div>

              {/* View Poll History Button */}
              <button
                className="btn-secondary"
                onClick={() => setShowPollHistory(true)}
              >
                👁️ View Poll History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Poll Creation Section */}
          {canCreateNewPoll() && (
            <div style={{ marginBottom: "var(--spacing-2xl)" }}>
              <PollCreation />
            </div>
          )}

          {/* Current Poll Results */}
          {currentPoll && (
            <div>
              <PollResults />
            </div>
          )}

          {/* No Poll State */}
          {!currentPoll && (
            <div
              className="card text-center"
              style={{ padding: "var(--spacing-2xl)" }}
            >
              <h3
                style={{
                  marginBottom: "var(--spacing-md)",
                  color: "var(--text-light)",
                }}
              >
                No Active Poll
              </h3>
              <p style={{ color: "var(--text-light)" }}>
                Create your first poll to get started with live polling
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Poll History Modal */}
      {showPollHistory && (
        <PollHistory onClose={() => setShowPollHistory(false)} />
      )}

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={showChatSidebar}
        onClose={() => setShowChatSidebar(false)}
        userType="teacher"
      />

      {/* Chat Toggle Button */}
      <button className="chat-toggle" onClick={() => setShowChatSidebar(true)}>
        💬
      </button>
    </div>
  );
};

export default TeacherDashboard;