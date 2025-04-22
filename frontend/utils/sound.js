const soundFiles = {
  coin: "/assets/sounds/coin.mp3",
  cardFlip: "/assets/sounds/cardFlip.mp3",
  cardOpen: "/assets/sounds/cardOpen.mp3",
  jackPot: "/assets/sounds/jackpot.mp3",
  win: "/assets/sounds/win.mp3",
  lose: "/assets/sounds/lose.mp3",
  draw: "/assets/sounds/draw.mp3",
};

// 항상 새로운 Audio() 생성
export default function playSound(name, volume = 0.8) {
  const src = soundFiles[name];
  if (!src) return;

  const audio = new Audio(src);
  audio.volume = volume;

  // 사운드 재생
  audio.play().catch((e) => {
    console.warn(`❗ [sound] '${name}' 재생 실패`, e);
  });
}
