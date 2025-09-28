import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../store";
import { useSocket } from "../context/SocketContext";

// Define specific types for better safety and clarity
interface Message {
  user: string;
  message: string;
  userType: "teacher" | "student";
}

interface Participant {
  name: string;
  type: "teacher" | "student";
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "teacher" | "student";
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  userType,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { socket, user } = useSocket();
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Effect for socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming chat messages
    socket.on("chat_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for updates to the participant list
    socket.on("participants_update", (data: Participant[]) => {
      setParticipants(data);
    });

    // Request the current participant list on mount
    socket.emit("get_participants");

    // Clean up listeners on component unmount
    return () => {
      socket.off("chat_message");
      socket.off("participants_update");
    };
  }, [socket]);

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !socket || !user) return;

    socket.emit("send_chat_message", {
      message: message.trim(),
      user: user.name,
      userType: user.type,
    });
    setMessage("");
  };

  const handleKickUser = (participantName: string) => {
    if (!socket || userType !== "teacher") return;
    socket.emit("kick_user", { targetUser: participantName });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`chat-sidebar ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "380px",
          height: "100vh",
          background: "white",
          boxShadow: "var(--shadow-lg)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with Tabs */}
        <div
          style={{
            padding: "var(--spacing-lg)",
            borderBottom: "1px solid var(--border-gray)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "var(--spacing-lg)" }}>
            <button
              onClick={() => setActiveTab("chat")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--font-size-body)",
                padding: "var(--spacing-sm) 0",
                fontWeight: activeTab === "chat" ? 600 : 400,
                color:
                  activeTab === "chat"
                    ? "var(--primary-purple)"
                    : "var(--text-light)",
                borderBottom:
                  activeTab === "chat"
                    ? "2px solid var(--primary-purple)"
                    : "none",
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("participants")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--font-size-body)",
                padding: "var(--spacing-sm) 0",
                fontWeight: activeTab === "participants" ? 600 : 400,
                color:
                  activeTab === "participants"
                    ? "var(--primary-purple)"
                    : "var(--text-light)",
                borderBottom:
                  activeTab === "participants"
                    ? "2px solid var(--primary-purple)"
                    : "none",
              }}
            >
              Participants
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--text-light)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {activeTab === "chat" ? (
            <>
              {/* Messages */}
              <div
                ref={chatBodyRef}
                style={{
                  flex: 1,
                  padding: "var(--spacing-lg)",
                  overflowY: "auto",
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-light)",
                      marginTop: "var(--spacing-xl)",
                    }}
                  >
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{ marginBottom: "var(--spacing-md)" }}
                    >
                      <div
                        style={{
                          fontSize: "var(--font-size-small)",
                          color: "var(--text-light)",
                          marginBottom: "var(--spacing-xs)",
                        }}
                      >
                        {msg.user}
                      </div>
                      <div
                        style={{
                          background:
                            msg.user === user?.name
                              ? "var(--primary-purple)"
                              : "#F3F4F6",
                          color:
                            msg.user === user?.name
                              ? "white"
                              : "var(--text-dark)",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          borderRadius: "var(--radius-md)",
                          maxWidth: "80%",
                          marginLeft: msg.user === user?.name ? "auto" : "0",
                          fontSize: "var(--font-size-small)",
                          wordWrap: "break-word",
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div
                style={{
                  padding: "var(--spacing-lg)",
                  borderTop: "1px solid var(--border-gray)",
                }}
              >
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <input
                    type="text"
                    className="input-field"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    style={{ minWidth: "auto", padding: "8px 16px" }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Participants List */
            <div
              style={{
                flex: 1,
                padding: "var(--spacing-lg)",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "var(--font-size-small)",
                  color: "var(--text-light)",
                  marginBottom: "var(--spacing-lg)",
                  fontWeight: 500,
                }}
              >
                <span>Name</span>
                {userType === "teacher" && <span>Action</span>}
              </div>

              {participants.map((participant, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--spacing-md) 0",
                    borderBottom: "1px solid var(--border-gray)",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "var(--font-size-small)",
                        fontWeight: 500,
                      }}
                    >
                      {participant.name}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-small)",
                        color: "var(--text-light)",
                        marginLeft: "var(--spacing-sm)",
                      }}
                    >
                      ({participant.type})
                    </span>
                  </div>
                  {userType === "teacher" && participant.type === "student" && (
                    <button
                      onClick={() => handleKickUser(participant.name)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--error-red)",
                        fontSize: "var(--font-size-small)",
                        textDecoration: "underline",
                      }}
                    >
                      Kick out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
