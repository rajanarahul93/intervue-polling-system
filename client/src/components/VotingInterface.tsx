import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAppSelector } from "../store";

const VotingInterface: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket } = useSocket();
  const { currentPoll, userCounts } = useAppSelector((state) => state.poll);

  useEffect(() => {
    if (!currentPoll) return;

    const startTime = new Date(currentPoll.createdAt).getTime();
    const endTime = startTime + currentPoll.timeLimit * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPoll]);

  const handleSubmit = () => {
    if (selectedOption === null || !socket) return;

    setIsSubmitting(true);
    socket.emit("submit_vote", { optionIndex: selectedOption });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!currentPoll) return null;

  return (
    <div className="card">
      {/* Header with Timer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        <h2 style={{ fontSize: "var(--font-size-h2)", fontWeight: 600 }}>
          Question 1
        </h2>
        {timeLeft > 0 && <div className="timer">{formatTime(timeLeft)}</div>}
      </div>

      {/* Question */}
      <div
        style={{
          background: "var(--text-dark)",
          color: "white",
          padding: "var(--spacing-md)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--spacing-xl)",
          fontWeight: 500,
        }}
      >
        {currentPoll.question}
      </div>

      {/* Options */}
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        {currentPoll.options.map((option, index) => (
          <div
            key={index}
            className={`card ${selectedOption === index ? "selected" : ""}`}
            style={{
              marginBottom: "var(--spacing-md)",
              cursor: "pointer",
              padding: "var(--spacing-md)",
              border:
                selectedOption === index
                  ? "2px solid var(--primary-purple)"
                  : "2px solid var(--border-gray)",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
              transition: "all 0.2s ease",
            }}
            onClick={() => setSelectedOption(index)}
          >
            {/* Radio Button */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: `2px solid ${
                  selectedOption === index
                    ? "var(--primary-purple)"
                    : "var(--border-gray)"
                }`,
                background:
                  selectedOption === index ? "var(--primary-purple)" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selectedOption === index && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                />
              )}
            </div>

            {/* Option Text */}
            <span
              style={{
                fontWeight: 500,
                color:
                  selectedOption === index
                    ? "var(--primary-purple)"
                    : "var(--text-dark)",
              }}
            >
              {option.text}
            </span>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: "center" }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting || timeLeft <= 0}
          style={{
            minWidth: "200px",
            padding: "14px 32px",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          {isSubmitting ? (
            <>
              <div
                className="loading-spinner"
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
              />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {/* Time's Up Message */}
      {timeLeft <= 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "var(--spacing-lg)",
            padding: "var(--spacing-md)",
            background: "#FEF2F2",
            borderRadius: "var(--radius-md)",
            color: "var(--error-red)",
          }}
        >
          Time's up! Results will be shown automatically.
        </div>
      )}
    </div>
  );
};

export default VotingInterface;