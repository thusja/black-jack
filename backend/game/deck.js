// 카드 덱 생성/셔플

// 사용할 무늬 리스트 : 하트, 스페이스, 클로버, 다이아몬드
const SUITS = ['hearts', 'spades', 'clubs', 'diamonds'];

// 무늬를 심볼로 변환하는 객체 -> 카드 코드
const SUIT_SYMBOLS = {
  hearts: 'H',
  spades: 'S',
  clubs: 'C',
  diamonds: 'D'
};

// 카드 숫자 / 문자 값들
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 덱 전체 생성 함수
export function createDeck() {
  const deck = [];

  for(const suit of SUITS) {
    for(const value of VALUES) {
      // const fileValue = value === '10' ? '10' : value; // 10은 그대로, 나머진 A ~ K
      const filename = `${value}_of_${suit}.png`; // 대소문자 그대로 사용
      const code = value + SUIT_SYMBOLS[suit]; // 2H 10S 등...

      deck.push({
        value, // 숫자 or 문자
        suit, // 무늬
        code, // 축약 코드 
        image: `/assets/cards/${filename}` // 이미지경로
      });
    }
  }
  return deck;
}

// 셔플 함수
export function shuffle(deck) {
  for(let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지의 무작위 인덱스
    [deck[i], deck[j]] = [deck[j], deck[i]]; // 두카드 위치 교환
  }
  return deck;
}

// 셔플된 새 카드 덱 반환하는 헬퍼 함수
export function getShuffledDeck() {
  return shuffle(createDeck());
}
