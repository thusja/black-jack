// 멀티 WebSocket 핸들러

import { roomManager } from "../game/roomManager.js";

export function handleCreateRoom(roomId, playerId, socket) {
  const created = roomManager.createRoom(roomId);
  if (created) {
    roomManager.addPlayer(roomId, { id: playerId, socketId: socket.id });
    socket.join(roomId);
  }
  return created;
}

export function handleJoinRoom(roomId, playerId, socket) {
  const joined = roomManager.addPlayer(roomId, { id: playerId, socketId: socket.id });
  if (joined) {
    socket.join(roomId);
  }
  return joined;
}

export function handleStartGame(roomId) {
  roomManager.startGame(roomId);
  return roomManager.getRoom(roomId);
}

export function handleHit(roomId, socketId) {
  roomManager.dealCardToPlayer(roomId, socketId);
  return roomManager.getRoom(roomId);
}

export function handleStand(roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return { nextPlayer: null, results: null };

  const player = roomManager.getCurrentPlayer(roomId);
  if (player) player.status = "stand";

  const nextPlayer = roomManager.nextTurn(roomId);
  if (nextPlayer) {
    return { nextPlayer, results: null };
  } else {
    roomManager.revealDealer(roomId);
    const results = roomManager.getGameResult(roomId);
    return { nextPlayer: null, results };
  }
}

export function handleDisconnect(socketId) {
  const updates = [];

  for (const [roomId, room] of roomManager.rooms) {
    const before = room.players.length;
    roomManager.removePlayer(roomId, socketId);
    const after = roomManager.getRoom(roomId)?.players.length ?? 0;

    if (before !== after) {
      updates.push(roomId);
    }
  }

  return updates;
}
