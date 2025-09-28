import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "../styles/globalStyles.css";

const LandingPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "teacher" | null
  >(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { joinRoom, isConnected, error } = useSocket();

  const handleContinue = async () => {
    if (!selectedRole || !name.trim() || !isConnected) return;

    setIsLoading(true);

    try {
      // Join socket room
      joinRoom(name.trim(), selectedRole);

      // Navigate to appropriate dashboard
      const route =
        selectedRole === "teacher"
          ? `/teacher/${name.trim()}`
          : `/student/${name.trim()}`;
      navigate(route);
    } catch (error) {
      console.error("Failed to join:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: "student" | "teacher") => {
    setSelectedRole(role);
  };

  return (
    <div
      className="flex-center"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <div className="container" style={{ maxWidth: "600px" }}>
        {/* Brand Badge */}
        <div className="text-center">
          <div className="brand-badge">🗳️ Intervue Poll</div>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: "var(--font-size-h1)",
            fontWeight: 700,
            marginBottom: "var(--spacing-md)",
            textAlign: "center",
          }}
        >
          Welcome to the Live Polling System
        </h1>

        <p
          style={{
            color: "var(--text-light)",
            textAlign: "center",
            marginBottom: "var(--spacing-2xl)",
            fontSize: "var(--font-size-body)",
          }}
        >
          Please select the role that best describes you to begin using the live
          polling system
        </p>

        {/* Role Selection Cards */}
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          {/* Student Card */}
          <div
            className={`card ${selectedRole === "student" ? "selected" : ""}`}
            style={{
              flex: 1,
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => handleRoleSelect("student")}
          >
            <h3
              style={{
                marginBottom: "var(--spacing-md)",
                color: "var(--text-dark)",
              }}
            >
              I'm a Student
            </h3>
            <p
              style={{
                color: "var(--text-light)",
                fontSize: "var(--font-size-small)",
              }}
            >
              Submit answers and view live poll results in real-time
            </p>
          </div>

          {/* Teacher Card */}
          <div
            className={`card ${selectedRole === "teacher" ? "selected" : ""}`}
            style={{
              flex: 1,
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => handleRoleSelect("teacher")}
          >
            <h3
              style={{
                marginBottom: "var(--spacing-md)",
                color: "var(--text-dark)",
              }}
            >
              I'm a Teacher
            </h3>
            <p
              style={{
                color: "var(--text-light)",
                fontSize: "var(--font-size-small)",
              }}
            >
              Submit answers and view live poll results in real-time
            </p>
          </div>
        </div>

        {/* Name Input (appears after role selection) */}
        {selectedRole && (
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <label
              style={{
                display: "block",
                marginBottom: "var(--spacing-sm)",
                fontWeight: 500,
                color: "var(--text-dark)",
              }}
            >
              Enter your Name
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              maxLength={50}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              color: "var(--error-red)",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--spacing-lg)",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div
            style={{
              background: "#FEF3C7",
              color: "#D97706",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--spacing-lg)",
              textAlign: "center",
            }}
          >
            Connecting to server...
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={
              !selectedRole || !name.trim() || !isConnected || isLoading
            }
            style={{ minWidth: "200px" }}
          >
            {isLoading ? (
              <>
                <div
                  className="loading-spinner"
                  style={{ width: "20px", height: "20px", marginRight: "8px" }}
                />
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;