import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

// Define types for better type safety
interface PollOption {
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: number | string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

interface PollHistoryProps {
  onClose: () => void;
}

const PollHistory: React.FC<PollHistoryProps> = ({ onClose }) => {
  const [pollHistory, setPollHistory] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for poll history from the server
    socket.on("poll_history", (history: Poll[]) => {
      setPollHistory(history);
      setLoading(false);
    });

    // Request the poll history when the component mounts
    socket.emit("get_poll_history");

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("poll_history");
    };
  }, [socket]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-xl)",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--spacing-xl)",
              borderBottom: "1px solid var(--border-gray)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-h2)", fontWeight: 600 }}>
              View Poll History
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text-light)",
                padding: "var(--spacing-sm)",
              }}
            >
              ✕
            </button>
          </div>

          {/* Poll History List with Loading/Empty States */}
          <div>
            {loading ? (
              <div
                className="text-center"
                style={{ padding: "var(--spacing-xl)" }}
              >
                {/* You would create a CSS class for loading-spinner */}
                <div className="loading-spinner" />
                <p>Loading poll history...</p>
              </div>
            ) : pollHistory.length === 0 ? (
              <div
                className="text-center"
                style={{ padding: "var(--spacing-xl)" }}
              >
                <p style={{ color: "var(--text-light)" }}>
                  No polls have been conducted yet.
                </p>
              </div>
            ) : (
              pollHistory.map((poll, pollIndex) => (
                <div
                  key={poll.id}
                  style={{ marginBottom: "var(--spacing-2xl)" }}
                >
                  <h3
                    style={{
                      fontSize: "var(--font-size-body)",
                      fontWeight: 600,
                      marginBottom: "var(--spacing-md)",
                      color: "var(--text-dark)",
                    }}
                  >
                    Question {pollIndex + 1}
                  </h3>

                  {/* Question */}
                  <div
                    style={{
                      background: "var(--text-dark)",
                      color: "white",
                      padding: "var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "var(--spacing-lg)",
                      fontWeight: 500,
                    }}
                  >
                    {poll.question}
                  </div>

                  {/* Results */}
                  {poll.options.map((option, index) => (
                    <div
                      key={index}
                      style={{ marginBottom: "var(--spacing-sm)" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "var(--spacing-xs)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-sm)",
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "var(--primary-purple)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "10px",
                              fontWeight: 500,
                            }}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: "var(--font-size-small)",
                            }}
                          >
                            {option.text}
                          </span>
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "var(--font-size-small)",
                          }}
                        >
                          {option.percentage}%
                        </span>
                      </div>

                      <div
                        className="progress-container"
                        style={{ height: "24px" }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${option.percentage}%`,
                            fontSize: "var(--font-size-small)",
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-light)",
                      fontSize: "var(--font-size-small)",
                      marginTop: "var(--spacing-md)",
                    }}
                  >
                    Total Responses: {poll.totalVotes}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PollHistory;
