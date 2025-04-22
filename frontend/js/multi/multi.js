// js/multi/multi.js

import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import { getChips, setChips, updateChipUI } from "../../utils/chip.js";
import playSound from "../../utils/sound.js";

const socket = io(window.location.origin); // 현재 접속 주소 기준 자동 처리

let roomId = "";
let playerId = "";
let isMyTurn = false;
let turnTimer = null;

// DOM 요소
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const startBtn = document.getElementById("start-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const exitBtn = document.getElementById("exit-btn");
const turnMsg = document.getElementById("turn-message");
const resultMsg = document.getElementById("message");

const isReady = false;

document.addEventListener("DOMContentLoaded", () => {
  updateChipUI();

  if (!isReady) {
    setTimeout(() => {
      alert("⚠️ 멀티 플레이는 아직 준비 중입니다.\n메인 화면으로 돌아갑니다.");
      window.location.href = "index.html";
    }, 300);
  }

  // isReady가 true일 때만 실제 기능 연결
  if (isReady) {
    // 소켓 초기화 및 버튼 이벤트 연결 등 여기에 작성
  }
});

// 버튼 이벤트
createBtn.addEventListener("click", () => {
  roomId = document.getElementById("room-id").value.trim();
  playerId = document.getElementById("player-id").value.trim();
  if (!roomId || !playerId) return alert("방 ID / 플레이어 ID 입력");

  socket.emit("createRoom", { roomId, playerId });
});

joinBtn.addEventListener("click", () => {
  roomId = document.getElementById("room-id").value.trim();
  playerId = document.getElementById("player-id").value.trim();
  if (!roomId || !playerId) return alert("방 ID / 플레이어 ID 입력");

  socket.emit("joinRoom", { roomId, playerId });
});

startBtn.addEventListener("click", () => {
  socket.emit("startGame", roomId);
});

hitBtn.addEventListener("click", () => {
  if (isMyTurn) {
    clearTurnTimer();
    socket.emit("hit", { roomId, socketId: socket.id });
  }
});

standBtn.addEventListener("click", () => {
  if (isMyTurn) {
    clearTurnTimer();
    socket.emit("stand", roomId);
  }
});

exitBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ================== 소켓 이벤트 ==================
socket.on("roomUpdated", room => {
  renderPlayerArea(room.players);
  if (room.players.length >= 2) startBtn.disabled = false;
});

socket.on("gameStarted", room => {
  renderDealer(room.dealer.hand, false);
  renderPlayerCards(room.players);
  resultMsg.innerText = "";
  turnMsg.innerText = "게임 시작!";
  playSound("cardFlip");
});

socket.on("nextTurn", id => {
  isMyTurn = id === playerId;
  toggleButtons(isMyTurn);
  turnMsg.innerText = isMyTurn
    ? "당신의 턴입니다. 히트 또는 스탠드를 선택하세요."
    : `${id}님의 차례입니다. 기다려주세요.`;

  if (isMyTurn) {
    startTurnTimer(() => {
      turnMsg.innerText = "⏱️ 시간 초과! 자동으로 스탠드합니다...";
      socket.emit("stand", roomId);
    });
  }
});

socket.on("gameResult", results => {
  const result = results.find(r => r.playerId === playerId);
  if (result) {
    resultMsg.innerText = `👉 ${result.result.toUpperCase()} / 칩: ${result.chips}`;
    turnMsg.innerText = "게임 종료";

    if (result.result === "win") playSound("win");
    else if (result.result === "draw") playSound("draw");
    else if (result.result === "blackjack") playSound("jackPot");
    else playSound("lose");

    setChips(result.chips);
    updateChipUI();
  }

  toggleButtons(false);
  clearTurnTimer();

  if (getChips() < 100) {
    setTimeout(() => {
      alert("보유 칩이 부족하여 메인 화면으로 돌아갑니다.");
      window.location.href = "index.html";
    }, 500);
  }
});

// ================== 렌더 및 유틸 ==================

function renderPlayerArea(players) {
  const area = document.getElementById("player-area");
  area.innerHTML = "";

  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "card-row";
    div.innerHTML = `
      <h3>${p.id}</h3>
      <div id="hand-${p.id}" class="cards"></div>
      <div id="score-${p.id}" class="score-text"></div>
    `;
    area.appendChild(div);
  });
}

function renderPlayerCards(players) {
  players.forEach(p => {
    const hand = document.getElementById(`hand-${p.id}`);
    const scoreEl = document.getElementById(`score-${p.id}`);
    if (!hand || !scoreEl) return;

    hand.innerHTML = "";
    p.hand.forEach(card => {
      const img = document.createElement("img");
      img.src = card.image;
      img.className = "card";
      img.alt = card.code;
      hand.appendChild(img);
    });

    const score = calculateScore(p.hand);
    scoreEl.innerText = `합계: ${score}점`;
  });
}

function renderDealer(hand, reveal) {
  const dealerDiv = document.getElementById("dealer-cards");
  dealerDiv.innerHTML = "";

  hand.forEach((card, idx) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("card-wrapper");

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("img");
    front.classList.add("card-front");
    front.src = card.image;
    front.alt = card.code;

    const back = document.createElement("img");
    back.classList.add("card-back");
    back.src = "/assets/cards/back.png";
    back.alt = "back";

    inner.appendChild(front);
    inner.appendChild(back);
    wrapper.appendChild(inner);

    if (idx === 0 && !reveal) {
      wrapper.classList.add("card"); // 뒤집힌 상태
    } else {
      wrapper.classList.add("card", "flipped");
    }

    dealerDiv.appendChild(wrapper);
  });
}

function toggleButtons(enabled) {
  hitBtn.disabled = !enabled;
  standBtn.disabled = !enabled;
}

function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;

  for (const card of hand) {
    let value = card.value;
    if (value === 'A') {
      score += 11;
      aceCount++;
    } else if (['J', 'Q', 'K'].includes(value)) {
      score += 10;
    } else {
      score += parseInt(value);
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

function startTurnTimer(onTimeout, seconds = 10) {
  clearTurnTimer();
  turnTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      turnMsg.innerText = `⏳ ${seconds}초 내 선택해주세요!`;
    } else {
      clearTurnTimer();
      turnMsg.innerText = "🕐 시간이 초과되어 자동으로 스탠드합니다...";
      if (typeof onTimeout === 'function') onTimeout();
    }
  }, 1000);
}

function clearTurnTimer() {
  if (turnTimer) {
    clearInterval(turnTimer);
    turnTimer = null;
  }
}
