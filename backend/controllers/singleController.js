// 싱글 게임 흐름

import { getShuffledDeck } from "../game/deck.js";
import { calculateScore, isBlackjack, isBust } from "../game/blackjack.js";

// 싱글 게임 상태 객체
let gameState = null;



// 게임 시작 핸들러
export function startNewGame(req, res) {
  const deck = getShuffledDeck();
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];

  const playerBlackjack = isBlackjack(playerHand);
  const dealerBlackjack = isBlackjack(dealerHand);

  gameState = {
    deck,
    playerHand,
    dealerHand,
    gameOver: false, // 게임 종료 여부
    message: '', // 게임 결과 메세지
  };

  // 블랙잭 판별 우선 처리 (isBlackjack 기준 사용)
  if(playerBlackjack && dealerBlackjack) {
    gameState.gameOver = true;
    gameState.message = "블랙잭 무승부";
  }else if(!playerBlackjack && dealerBlackjack) {
    gameState.gameOver = true;
    gameState.message = "딜러 블랙잭! 패배했습니다.";
  }else if(playerBlackjack && !dealerBlackjack) {
    gameState.gameOver = true;
    gameState.message = "블랙잭! 승리했습니다";
  }

  res.json(gameState); // 초기 상태 응답
}

// 히트 요청
export function hit(req, res) {
  if(!gameState || gameState.gameOver) return res.status(400).json({ error : "게임이 이미 끝났습니다." });

  gameState.playerHand.push(gameState.deck.pop()); // 카드 한 장 추가

  if (isBust(gameState.playerHand)) {
    gameState.gameOver = true;
    gameState.message = "버스트! 패배했습니다";
  } 
  
  res.json(gameState); // 현재 상태 반환
}

// 스탠드 요청
export function stand(req,res) {
  if(!gameState || gameState.gameOver) return res.status(400).json({ error: "게임이 이미 끝났습니다." });

  // soft 17 포함 딜러 전략: 점수 17 미만 또는 soft 17이면 히트
  let dealerScore = calculateScore(gameState.dealerHand);
  while (dealerScore < 17 || isSoft17(gameState.dealerHand)) {
    gameState.dealerHand.push(gameState.deck.pop());
    dealerScore = calculateScore(gameState.dealerHand); // 점수 갱신
  }

  const playerScore = calculateScore(gameState.playerHand);

  gameState.gameOver = true;

  if (dealerScore > 21) {
    gameState.message = "딜러가 버스트해서 승리했습니다!";
  } 
  else if (playerScore > dealerScore) {
    gameState.message = "승리";
  } 
  else if (playerScore === dealerScore) {
    gameState.message = "무승부";
  } 
  else {
    gameState.message = "패배";
  }

  res.json(gameState); // 최종 상태 응답
}

// soft 17 판별 함수 추가 (딜러 규칙 보완용)
function isSoft17(hand) {
  let score = 0;
  let aceCount = 0;

  for (const card of hand) {
    const value = card.value;
    if (value === 'A') {
      score += 11;
      aceCount++;
    } else if (['J', 'Q', 'K'].includes(value)) {
      score += 10;
    } else {
      score += Number(value);
    }
  }

  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }

  return score === 17 && aceCount > 0;
}
