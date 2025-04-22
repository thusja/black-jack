// 멀티 방 관리 로직

import { getShuffledDeck } from "./deck.js";

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId => roomData
  }

  createRoom(roomId) {
    if(this.rooms.has(roomId)) return false;

    const room = {
      players: [], // { id, socketId, hand, chips, status }
      dealer: { hand: [], hiddenCard: null },
      deck: getShuffledDeck(),
      turnIndex: 0,
      status: 'waiting', // waiting | playing | finished
    };

    this.rooms.set(roomId, room);
    return true;
  }

  addPlayer(roomId, player) {
    const room = this.rooms.get(roomId);
    if(!room || room.players.length >= 6) return false;

    room.players.push({
      id: player.id,
      socketId: player.socketId,
      hand: [],
      chips: 1000,
      status: 'waiting', // waiting | active | stand | bust
    });

    return true;
  }

  removePlayer(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.socketId !== socketId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if(!room) return;

    room.status = "playing";
    room.deck = getShuffledDeck();
    room.turnIndex = 0;
    room.dealer.hand = [];
    room.dealer.hiddenCard = null;

    for(const player of room.players) {
      player.hand = [room.deck.pop(), room.deck.pop()];
      player.status = "active";
    }

    room.dealer.hand.push(room.deck.pop());
    room.dealer.hiddenCard = room.deck.pop();
  }

  getCurrentPlayer(roomId) {
    const room = this.rooms.get(roomId);
    if(!room) return null;

    return room.players[room.turnIndex];
  }

  nextTurn(roomId) {
    const room = this.rooms.get(roomId);
    if(!room) return null;

    room.turnIndex += 1;

    if(room.turnIndex >= room.players.length) {
      return null; // 모든 플레이어 턴 끝
    }

    return room.players[room.turnIndex];
  }

  dealCardToPlayer(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if(!room) return;

    const player = this.room.players.find(p => p.socketId === socketId);
    if(player && player.status === "active") {
      player.hand.push(room.deck.pop());
    }
  }

  revealDealer(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.dealer.hand.push(room.dealer.hiddenCard);
    room.dealer.hiddenCard = null;

    while (this.calculateScore(room.dealer.hand) < 17) {
      room.dealer.hand.push(room.deck.pop());
    }
  }
  
  calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
        score += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  }

  getGameResult(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const dealerScore = this.calculateScore(room.dealer.hand);
    const results = [];

    for (const player of room.players) {
      const playerScore = this.calculateScore(player.hand);
      let result = 'lose';

      if (playerScore > 21) {
        result = 'bust';
      } else if (dealerScore > 21 || playerScore > dealerScore) {
        result = 'win';
        player.chips += 100;
      } else if (playerScore === dealerScore) {
        result = 'draw';
      } else {
        result = 'lose';
        player.chips -= 100;
      }

      results.push({
        playerId: player.id,
        result,
        playerScore,
        dealerScore,
        chips: player.chips
      });
    }

    room.status = 'finished';
    return results;
  }
}

export const roomManager = new RoomManager();
