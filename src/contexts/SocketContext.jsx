// contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({});
const SOCKET_URL = "http://localhost:9001";

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const token = localStorage.getItem("token");
    
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    // Socket event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      socketInstance.emit("user:online", {
        userId: user._id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("users:online", (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on("user:status_change", ({ userId, status }) => {
      setOnlineUsers(prev => 
        prev.map(user => 
          user.userId === userId ? { ...user, status } : user
        )
      );
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      if (socketInstance.connected) {
        socketInstance.emit("user:offline", { userId: user._id });
        socketInstance.disconnect();
      }
    };
  }, [user]);

  // Emit location update
  const emitLocationUpdate = useCallback((locationData) => {
    if (socketRef.current?.connected && user?._id) {
      socketRef.current.emit("user:location_update", {
        userId: user._id,
        location: locationData,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  // Emit visit started
  const emitVisitStarted = useCallback((visitData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("visit:started", visitData);
    }
  }, []);

  // Emit visit completed
  const emitVisitCompleted = useCallback((visitData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("visit:completed", visitData);
    }
  }, []);

  // Emit punch in/out
  const emitAttendanceUpdate = useCallback((attendanceData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("attendance:update", attendanceData);
    }
  }, []);

  const value = {
    socket,
    onlineUsers,
    isConnected,
    emitLocationUpdate,
    emitVisitStarted,
    emitVisitCompleted,
    emitAttendanceUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;