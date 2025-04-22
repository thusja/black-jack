// WebSocket 서버 세팅

import { Server } from "socket.io";
import {
  handleCreateRoom,
  handleJoinRoom,
  handleStartGame,
  handleHit,
  handleStand,
  handleDisconnect
} from "./controllers/multiController.js";
import { roomManager } from "./game/roomManager.js";

export default function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] 연결됨: ${socket.id}`);

    socket.on("createRoom", ({ roomId, playerId }) => {
      const created = handleCreateRoom(roomId, playerId, socket);
      if (created) {
        io.to(roomId).emit("roomUpdated", roomManager.getRoom(roomId));
      } else {
        socket.emit("error", "Room already exists");
      }
    });

    socket.on("joinRoom", ({ roomId, playerId }) => {
      const joined = handleJoinRoom(roomId, playerId, socket);
      if (joined) {
        io.to(roomId).emit("roomUpdated", roomManager.getRoom(roomId));
      } else {
        socket.emit("error", "Failed to join room");
      }
    });

    socket.on("startGame", (roomId) => {
      const room = handleStartGame(roomId);
      io.to(roomId).emit("gameStarted", room);
    });

    socket.on("hit", ({ roomId, socketId }) => {
      const room = handleHit(roomId, socketId);
      io.to(roomId).emit("roomUpdated", room);
    });

    socket.on("stand", (roomId) => {
      const { nextPlayer, results } = handleStand(roomId);

      if (nextPlayer) {
        io.to(roomId).emit("nextTurn", nextPlayer.id);
      } else {
        io.to(roomId).emit("gameResult", results);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] 연결 종료: ${socket.id}`);
      const updatedRooms = handleDisconnect(socket.id);
      for (const roomId of updatedRooms) {
        io.to(roomId).emit("roomUpdated", roomManager.getRoom(roomId));
      }
    });
  });
}
