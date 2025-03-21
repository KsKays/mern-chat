import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

// io = input/output
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});

const userSocketMap = {}; //{userId: socketId}
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId; //เช็คว่ามี userId ไหม

  //ถ้ามี userId ให้เก็บ socketId ของ user นั้น
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap)); //ส่ง userSocketMap ไปทุกคนที่เชื่อมต่อ

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId]; //ลบ socketId ของ user ที่ disconnect
  });
});

export { app, server, io };
