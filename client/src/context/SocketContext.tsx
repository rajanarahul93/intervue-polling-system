import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  User,
} from "../types/socket";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: SocketType | null;
  isConnected: boolean;
  user: User | null;
  setUser: (user: User) => void;
  joinRoom: (name: string, userType: "teacher" | "student") => void;
  error: string | null;
  clearError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket: SocketType = io(
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
      {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Connected to server:", newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔥 Connection error:", error);
      setError("Failed to connect to server. Please try again.");
    });

    // Error handling
    newSocket.on("error", ({ message }) => {
      console.error("Server error:", message);
      setError(message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = useCallback(
    (name: string, userType: "teacher" | "student") => {
      if (socket && isConnected) {
        const userData: User = { name, type: userType };
        setUser(userData);
        socket.emit("join", { name, userType });
        console.log(`🚀 Joined as ${userType}: ${name}`);
      }
    },
    [socket, isConnected]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    user,
    setUser,
    joinRoom,
    error,
    clearError,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};