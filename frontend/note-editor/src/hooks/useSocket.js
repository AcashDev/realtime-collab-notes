import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL_LOCAL = "http://localhost:4000"
export const useSocket = () => {
  const [data, setData] = useState(null);
  const socketRef = useRef(null); // Store the socket instance
  const token=JSON.parse(localStorage.getItem('jwt'))
  // Define the handleData function outside to avoid re-creation on every eventName change
  // const handleData = (data) => {
  //   setData(data);
  // };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_SERVER_URL_LOCAL, { transports: ["websocket", "polling"],  query: { token }});
      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from WebSocket");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null; // Cleanup reference
      }
    };
  }, [token]); // Runs only once to initialize the socket

  // useEffect(() => {
  //   if (!eventName || !socketRef.current) return;

  //   socketRef.current.on(eventName, handleData);

  //   return () => {
  //     if (socketRef.current && eventName) {
  //       socketRef.current.off(eventName, handleData); // Remove the listener on cleanup
  //     }
  //   };
  // }, [eventName]); // Re-run when eventName changes

  const emitEvent = (event, payload) => {
    if (socketRef.current) {
      socketRef.current.emit(event, payload);
    }
  };

  return { socket: socketRef.current, emitEvent };
};
