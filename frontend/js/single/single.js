import { getChips, setChips, applyGameResult, updateChipUI } from "../../utils/chip.js";
import playSound from "../../utils/sound.js";

const API_BASE = "https://black-jack-evs5.onrender.com/api/single";
let turnTimer = null;  // 전역 타이머 ID 저장용
let standInProgress = false; // 중복 요청 방지
const MIN_BET = 100;
let currentBet = 0; // 기본 베팅 금액

// DOM 로드 시 초기 셋업
document.addEventListener("DOMContentLoaded", () => {
  // 나가기 버튼 핸들러 등록
  document.getElementById("exit-btn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  updateChipUI(); // 칩 정보 UI 반영
  setupBetting();
});

// 베팅 버튼 클릭 시 처리
function setupBetting() {
  const buttons = document.querySelectorAll(".chip-btn");
  const resetBtn = document.getElementById("reset-bet-btn");
  const betDisplay = document.getElementById("bet-amount");
  const startBtn = document.getElementById("start-btn");

  currentBet = 0;
  betDisplay.innerText = currentBet;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const add = parseInt(btn.dataset.amount);
      const chips = getChips();
      if (currentBet + add > chips) {
        alert("보유한 칩보다 많이 걸 수 없습니다.");
        return;
      }

      currentBet += add;
      betDisplay.innerText = currentBet;
      startBtn.disabled = currentBet < MIN_BET;
      playSound("coin");
    });
  });

  resetBtn.addEventListener("click", () => {
    currentBet = 0;
    betDisplay.innerText = 0;
    startBtn.disabled = true;
  });
}

// 게임시작 버튼 클릭 시 -> 서버에 요청 -> 초기 카드상태 받기 -> 렌더링
document.getElementById("start-btn").addEventListener("click", async () => {
  if (currentBet < MIN_BET) {
    alert(`최소 ${MIN_BET}칩 이상 베팅해주세요.`);
    return;
  }

  const chips = getChips();
  if (currentBet > chips) {
    alert("보유한 칩보다 많은 금액을 베팅할 수 없습니다.");
    return;
  }

  // 칩 차감
  setChips(chips - currentBet); // 게임 시작 시 베팅 칩 차감
  updateChipUI(); // 칩 UI 업데이트

  // 서버 게임 시작 요청
  const res = await fetch(`${API_BASE}/start`);
  const data = await res.json();
  renderGame(data); // 받은 상태를 화면에 표시

  // 게임 시작 시 결과 영역으로 스크롤 이동
  document.getElementById("dealer-cards")?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

// 히트 버튼 클릭 시 -> 서버에 POST 요청 -> 플레이어가 한장 더 받기
document.getElementById("hit-btn").addEventListener("click", async() => {
  clearTurnTimer(); // 타이머 중단
  
  const res = await fetch(`${API_BASE}/hit`, { method: "POST"});
  const data = await res.json();
  renderGame(data); // 상태 갱신

  // 21점이지만 블랙잭이 아닌 경우 (카드 3장 이상일 때)
  const score = calculateLocalScore(data.playerHand);
  if(score === 21 && data.playerHand.length > 2 && !data.gameOver) {
    const turnDiv = document.getElementById("turn-message");
    turnDiv.innerText = "21점! 딜러에게 턴을 넘깁니다...";

    // 버튼 비활성화 (클릭 방지)
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;

    // 1.5초 후 자동 딜러 턴
    setTimeout(async() => {
      triggerStand(); // 자동 스탠드 호출 함수
    }, 1500);
  }
});

// 스탠드 버튼 클릭 시 -> 서버에 POST 요청 -> 딜러 턴으로 넘기고 게임결과 반환
document.getElementById("stand-btn").addEventListener("click", triggerStand);

// 게임 상태 렌더링
function renderGame(state) {
  if (!state || !state.playerHand || !state.dealerHand) return; // 데이터 유효성 체크

  const playerDiv = document.getElementById("player-cards");
  const dealerDiv = document.getElementById("dealer-cards");
  const messageDiv = document.getElementById("message");
  const turnDiv = document.getElementById("turn-message");

  // 이전 카드들 제거
  playerDiv.innerHTML = "";
  dealerDiv.innerHTML = "";
  messageDiv.innerHTML = "";
  turnDiv.innerHTML = "";
  messageDiv.className = "";
  messageDiv.innerText = "";

  // 플레이어 카드 출력
  state.playerHand.forEach(card => {
    const img = document.createElement("img");
    img.src = card.image;
    img.alt = card.code;
    img.classList.add("card"); // 애니메이션용
    playerDiv.appendChild(img);
  });

  // 딜러 카드 출력
  state.dealerHand.forEach((card, idx) => {
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
  
    // 첫 번째 카드: 조건에 따라 flip
    if (idx === 0 && !state.gameOver) {
      wrapper.classList.add("card"); // 아직 flip 안 함 (가리기)
    } else {
      wrapper.classList.add("card", "flipped"); // flip 상태 (공개)
      playSound("cardOpen");
    }
  
    dealerDiv.appendChild(wrapper);
  });

  // 점수 출력 (게임 종료시에만)
  document.getElementById("player-score").innerText = state.gameOver
  ? `합계: ${calculateLocalScore(state.playerHand)}점`
  : "";

  document.getElementById("dealer-score").innerText = state.gameOver
  ? `합계: ${calculateLocalScore(state.dealerHand)}점`
  : "";

  // 게임 결과 메세지 출력
  if (state.message) {
    messageDiv.className = "result-message"; // 기본 클래스

    if (state.message.includes("블랙잭 무승부")) {
      messageDiv.classList.add("result-push");
      applyGameResult("draw", currentBet);
      playSound("draw");
    
    } else if (state.message.includes("블랙잭으로 승리")) {
      messageDiv.classList.add("result-win");
      applyGameResult("blackjack", currentBet);
      playSound("jackPot");
    
    } else if (state.message.includes("딜러 블랙잭")) {
      messageDiv.classList.add("result-lose");
      applyGameResult("lose", currentBet);
      playSound("jackPot");
    
    } else if (state.message.includes("승리")) {
      messageDiv.classList.add("result-win");
      applyGameResult("win", currentBet);
      playSound("win");
    
    } else if (state.message.includes("무승부")) {
      messageDiv.classList.add("result-push");
      applyGameResult("draw", currentBet);
      playSound("draw");
    
    } else if (state.message.includes("패배")) {
      messageDiv.classList.add("result-lose");
      applyGameResult("lose", currentBet);
      playSound("lose");
    }

    messageDiv.innerText = `👉 ${state.message}`;
  }

  // 턴 안내 메시지
  if (!state.gameOver) {
    turnDiv.innerText = "플레이어 차례입니다. 히트 또는 스탠드를 선택하세요.";

    document.querySelector(".chip-info-footer").style.display = "none";
    document.getElementById("reset-bet-btn").disabled = true;

    // 👉 타이머 시작: 시간 초과 시 자동 스탠드
    startTurnTimer(async () => {
      turnDiv.innerText = "⏱️ 시간 초과! 자동으로 스탠드합니다...";
      triggerStand(); // 자동 스탠드
    });
  } else {
    turnDiv.innerText = "게임 종료";
    clearTurnTimer(); // 안전하게 타이머 제거

    document.querySelector(".chip-info-footer").style.display = "block";
    document.getElementById("reset-bet-btn").disabled = false;

    // 베팅 금액 초기화
    currentBet = 0;
    document.getElementById("bet-amount").innerText = 0;

    document.getElementById("message")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    // 칩 부족 시 index로 이동
    if (getChips() < 100) {
      setTimeout(() => {
        alert("보유 칩이 부족하여 게임을 더 이상 진행할 수 없습니다.\n메인 화면으로 돌아갑니다.");
        window.location.href = "index.html";
      }, 300); // 약간의 딜레이로 UX 안정성 확보
    }
  }

  // 버튼 활성/비활성 처리
  document.getElementById("hit-btn").disabled = state.gameOver;
  document.getElementById("stand-btn").disabled = state.gameOver;
}

// 점수 계산 함수
function calculateLocalScore(hand) {
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
      score += Number(value);
    }
  }

  // 점수가 21 초과되면 에이스를 11 → 1로 조정
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score;
}

// 타이머 시작
function startTurnTimer() {
  clearTurnTimer(); // 기존 타이머 초기화

  let seconds = 10;
  const turnDiv = document.getElementById("turn-message");

  turnTimer = setInterval(async () => {
    seconds--;
    if (seconds > 0) {
      turnDiv.innerText = `⏳ ${seconds}초 내 선택해주세요!`;
    } else {
      clearTurnTimer();
      turnDiv.innerText = "🕐 시간이 초과되어 자동으로 스탠드합니다...";

      const res = await fetch(`${API_BASE}/stand`, { method: "POST" });
      const data = await res.json();
      renderGame(data);
    }
  }, 1000);
}

// 타이머 제거
function clearTurnTimer() {
  if (turnTimer) {
    clearInterval(turnTimer);
    turnTimer = null;
  }
}

// 함수 분리: 중복 스탠드 방지 & 에러 대응
async function triggerStand() {
  if (standInProgress) return;
  standInProgress = true;
  clearTurnTimer(); // 타이머 중단

  const turnDiv = document.getElementById("turn-message");
  turnDiv.innerText = "🃏 딜러의 첫 카드를 공개합니다...";

  // 👉 첫 카드 flip
  const firstDealerCard = document.querySelector("#dealer-cards .card:not(.flipped)");
  if (firstDealerCard) {
    firstDealerCard.classList.add("flipped");
  }

  // 1초 기다린 뒤 → 딜러 턴 서버 요청
  setTimeout(async () => {
    turnDiv.innerText = "🕐 딜러가 카드를 뽑는 중입니다...";

    const res = await fetch(`${API_BASE}/stand`, { method: "POST" });
    if (!res.ok) {
      console.warn("❗ 자동 스탠드 실패"); // !! 추가: 응답 실패 대응
      standInProgress = false;
      return;
    }

    const data = await res.json();
    renderGame(data); // 상태 갱신
    standInProgress = false;
  }, 2000); // flip 애니메이션 끝나고 진행
}
