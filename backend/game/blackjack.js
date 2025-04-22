// 점수 계산, 승패 판정

export function getCardValue(card) {
  if(card.value === 'A') return 11; // A의 값 11
  if(['K', 'Q', 'J'].includes(card.value)) return 10; // K, Q, J 값 10
  return parseInt(card.value);
}

export function calculateScore(hand) {
  let score = 0;
  let aceCount = 0;

  for(const card of hand) {
    score += getCardValue(card);
    if(card.value === 'A') aceCount++; // Ace 개수 추적
  }

  // Ace를 11로 처리되어 21을 초과하면 하나씩 10을 빼서 1로 조정
  while(score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
}

// 핸드가 블랙잭인지 확인하는 함수 21점
export function isBlackjack(hand) {
  return hand.length === 2 && calculateScore(hand) === 21;
}

// 핸드가 버스트인지 확인하는 함수 21점 초과
export function isBust(hand) {
  return calculateScore(hand) > 21;
}
