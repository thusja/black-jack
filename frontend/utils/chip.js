const CHIP_KEY = "bj_chips";

// 현재 칩 불러오기
export function getChips() {
  return parseInt(localStorage.getItem(CHIP_KEY)) || 0;
}

// 칩 설정
export function setChips(amount) {
  localStorage.setItem(CHIP_KEY, amount);
}

// 칩 UI 업데이트
export function updateChipUI() {
  const chipSpan = document.getElementById("current-chips");
  const footerSpan = document.getElementById("current-chips-footer");

  if(chipSpan) {
    chipSpan.innerText = getChips();
  }

  if(footerSpan) {
    footerSpan.innerHTML = getChips();
  }
}

// 게임 결과 반영 (칩 정산)
export function applyGameResult(result, bet) {
  let chips = getChips();

  switch (result) {
    case "win":
      chips += bet * 1.5;
      break;
    case "blackjack":
      chips += bet * 2;
      break;
    case "draw":
      chips += bet;
      break;
    case "lose":
      break;
  }

  if (chips < 0) chips = 0;
  setChips(Math.floor(chips));
  updateChipUI();
}
