import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";

const PollCreation: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const { socket } = useSocket();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleCreatePoll = () => {
    if (!question.trim() || !socket) return;

    const validOptions = options
      .filter((opt) => opt.trim())
      .map((opt) => opt.trim());
    if (validOptions.length < 2) return;

    setIsCreating(true);

    socket.emit("create_poll", {
      question: question.trim(),
      options: validOptions,
      timeLimit,
    });

    // Reset form
    setQuestion("");
    setOptions(["", ""]);
    setTimeLimit(60);
    setIsCreating(false);
  };

  const isValid =
    question.trim() && options.filter((opt) => opt.trim()).length >= 2;

  return (
    <div className="card">
      <h2
        style={{
          fontSize: "var(--font-size-h2)",
          fontWeight: 600,
          marginBottom: "var(--spacing-lg)",
          color: "var(--text-dark)",
        }}
      >
        Let's Get Started
      </h2>

      <p
        style={{
          color: "var(--text-light)",
          marginBottom: "var(--spacing-xl)",
          lineHeight: 1.6,
        }}
      >
        You'll have the ability to create and manage polls, ask questions, and
        monitor your students' responses in real-time.
      </p>

      {/* Question Input */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <label
          style={{
            display: "block",
            fontWeight: 500,
            marginBottom: "var(--spacing-sm)",
            color: "var(--text-dark)",
          }}
        >
          Enter your question
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-md)",
          }}
        >
          <input
            type="text"
            className="input-field"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Which planet is known as the Red Planet?"
            style={{ flex: 1 }}
            maxLength={200}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                border: "2px solid var(--border-gray)",
                borderRadius: "var(--radius-md)",
                background: "white",
              }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
              <option value={120}>2 minutes</option>
            </select>
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: "var(--font-size-small)",
            color: "var(--text-light)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          {question.length}/200
        </div>
      </div>

      {/* Options Section */}
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--spacing-md)",
          }}
        >
          <h3 style={{ fontWeight: 500, color: "var(--text-dark)" }}>
            Edit Options
          </h3>
          <span
            style={{
              fontSize: "var(--font-size-small)",
              color: "var(--text-light)",
            }}
          >
            Is it Correct?
          </span>
        </div>

        {options.map((option, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-md)",
              marginBottom: "var(--spacing-md)",
            }}
          >
            {/* Option Indicator */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "var(--primary-purple)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {String.fromCharCode(65 + index)}
            </div>

            {/* Option Input */}
            <input
              type="text"
              className="input-field"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              style={{ flex: 1 }}
              maxLength={100}
            />

            {/* Correct Answer Radio Buttons */}
            <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-xs)",
                }}
              >
                <input type="radio" name="correct" value={index} />
                <span style={{ fontSize: "var(--font-size-small)" }}>Yes</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-xs)",
                }}
              >
                <input type="radio" name="correct" value={-1} defaultChecked />
                <span style={{ fontSize: "var(--font-size-small)" }}>No</span>
              </label>
            </div>

            {/* Remove Option Button */}
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--error-red)",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "var(--spacing-xs)",
                }}
                title="Remove option"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add More Option Button */}
        {options.length < 6 && (
          <button
            onClick={addOption}
            style={{
              background: "none",
              border: "2px dashed var(--border-gray)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-md)",
              width: "100%",
              color: "var(--text-light)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--primary-purple)";
              e.currentTarget.style.color = "var(--primary-purple)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-gray)";
              e.currentTarget.style.color = "var(--text-light)";
            }}
          >
            + Add More option
          </button>
        )}
      </div>

      {/* Create Poll Button */}
      <div style={{ textAlign: "center" }}>
        <button
          className="btn-primary"
          onClick={handleCreatePoll}
          disabled={!isValid || isCreating}
          style={{ minWidth: "200px", padding: "14px 32px" }}
        >
          {isCreating ? (
            <>
              <div
                className="loading-spinner"
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
              />
              Creating...
            </>
          ) : (
            "Ask Question"
          )}
        </button>
      </div>
    </div>
  );
};

export default PollCreation;