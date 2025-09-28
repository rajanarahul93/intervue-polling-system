import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAppSelector, useAppDispatch } from "../store";
import VotingInterface from "./VotingInterface";
import PollResults from "./PollResults";
import ChatSidebar from "./ChatSidebar";

const StudentDashboard: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const { socket, joinRoom, isConnected } = useSocket();
  const { currentPoll, hasVoted, userCounts } = useAppSelector(
    (state) => state.poll
  );

  useEffect(() => {
    if (name && isConnected && socket) {
      joinRoom(name, "student");
    }
  }, [name, isConnected, socket, joinRoom]);

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
              {/* User Avatars */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--background-white)",
                    border: "2px solid var(--border-gray)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "var(--font-size-small)",
                    fontWeight: 500,
                  }}
                >
                  👥 {userCounts.students}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Active Poll - Voting Interface */}
          {currentPoll && currentPoll.isActive && !hasVoted && (
            <VotingInterface />
          )}

          {/* Active Poll - Results After Voting */}
          {currentPoll && currentPoll.isActive && hasVoted && <PollResults />}

          {/* Ended Poll - Results */}
          {currentPoll && !currentPoll.isActive && <PollResults />}

          {/* No Poll State */}
          {!currentPoll && (
            <div className="flex-center" style={{ minHeight: "400px" }}>
              <div className="text-center">
                <div
                  className="brand-badge"
                  style={{ marginBottom: "var(--spacing-lg)" }}
                >
                  🗳️ Intervue Poll
                </div>

                {/* Loading Animation */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    margin: "0 auto var(--spacing-lg)",
                    borderRadius: "50%",
                    border: "3px solid var(--border-gray)",
                    borderTop: "3px solid var(--primary-purple)",
                    animation: "spin 2s linear infinite",
                  }}
                />

                <h2
                  style={{
                    fontSize: "var(--font-size-h2)",
                    fontWeight: 600,
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  Wait for the teacher to ask questions..
                </h2>

                <p style={{ color: "var(--text-light)" }}>
                  You'll be able to participate once a poll is created
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={showChatSidebar}
        onClose={() => setShowChatSidebar(false)}
        userType="student"
      />

      {/* Chat Toggle Button */}
      <button className="chat-toggle" onClick={() => setShowChatSidebar(true)}>
        💬
      </button>
    </div>
  );
};

export default StudentDashboard;