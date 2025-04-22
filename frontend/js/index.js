document.addEventListener("DOMContentLoaded", () => {
  const defaultChips = 10000;
  const minBet = 100;
  const chipsKey = "bj_chips";

  const subtitle = document.querySelector(".subtitle");
  const startButtons = document.querySelectorAll(".mode-buttons button");
  const container = document.querySelector(".container");

  // 1. 칩이 없으면 초기 지급
  let chips = localStorage.getItem(chipsKey);
  if (!chips) {
    chips = defaultChips;
    localStorage.setItem(chipsKey, chips);
    subtitle.innerHTML = `초기 자산 💰 <strong>${chips}칩</strong>이 지급되었습니다.`; // !!
  } else {
    chips = parseInt(chips);
    subtitle.innerHTML = `보유 자산 💰 <strong>${chips}칩</strong>`;
  }

  // 2. 파산 또는 최소 베팅 불가 확인
  if (chips <= 0 || chips < minBet) {
    startButtons.forEach(btn => btn.disabled = true);

    // 메시지 표시
    if (chips <= 0) {
      subtitle.innerHTML = `😢 보유 칩이 없습니다. 재충전 후 다시 시작하세요.`;
    } else {
      subtitle.innerHTML = `⚠️ 최소 베팅에 필요한 보유 칩이 부족합니다.<br>재충전이 필요합니다.`;
    }

    // 기존에 숨겨진 재충전 버튼을 표시
    const rechargeBtn = document.getElementById("recharge-btn");
    if (rechargeBtn) {
      rechargeBtn.style.display = "inline-block";
      rechargeBtn.addEventListener("click", () => {
        localStorage.setItem(chipsKey, defaultChips);
        location.reload();
      });
    }
  }

  // 싱글게임 및 멀티게임 버튼 기능
  const singleBtn = document.getElementById("single-btn");
  const multiBtn = document.getElementById("multi-btn");
  
  singleBtn?.addEventListener("click", () => {
    window.location.href = "single.html";
  });
  
  multiBtn?.addEventListener("click", () => {
    window.location.href = "multi.html";
  });
  

  // 모달 열기/닫기 기능
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");
  const ruleBtn = document.querySelector("#rule-btn");

  ruleBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });
  
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
