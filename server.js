// server.js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());

    // Echo back the same message
    ws.send(message.toString());
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });
});

console.log("🚀 WebSocket server running on ws://localhost:3001");
