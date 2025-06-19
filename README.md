# 🃏 BlackJack
> 블랙잭!

![preview](https://github.com/thusja/my-profile-page/blob/main/src/assets/HTML5/H5P03.PNG)


<br>

## 🔗 Links

- [🌐 사이트 바로가기](https://black-jack-xi-lovat.vercel.app/)
- [📘 발표 자료(노션)](https://rough-lime-f80.notion.site/HTML5-1d12d24c870d80a7be89cd0cc92f10b0)

---

## 📘 프로젝트 개요
- 기간: 2025.04.14 ~ 2025.04.23
- 목적: HTML5 기반 카드 게임인 블랙잭을 웹에서 구현
> 가벼운 카드게임 블랙잭을 즐겨보세요!

### 🛠 기술 스택
- **Frontend**: HTML5, CSS, JavaScript
- **Backend**: node.js, Express
- **Deployment**: Vercel(F), Render(B)
- **Version Control**: Git & GitHub

---

## ✨ 주요 기능

1. 모드 선택 - 싱글로 플레이 할지 멀티로 플레이할지 선택하세요.
2. 베팅 - 지급된 칩을 가지고 베팅을 해보세요.
3. 게임 시작 - 게임 시작 버튼을 눌러 시작해보세요.
4. 히트&스탠드 - 히트 & 스탠드를 통해 게임을 즐겨보세요.

---

### 📁 시스템 아키텍처

```
[Browser]
  │
  ├─> index.html / single.html
  │     └─> JS로 사용자 입력 처리
  │     └─> fetch()를 통해 백엔드 API 호출
  │
  ▼
[Frontend JS]
  ├── js/single/single.js         # 게임 흐름 처리
  └── js/utils/chip.js, sound.js  # 칩/사운드 관리
  │
  ▼
[API 요청]
  ├─ GET  /api/single/start       # 게임 시작
  ├─ POST /api/single/hit         # 히트
  └─ POST /api/single/stand       # 스탠드
  │
  ▼
[Backend]
  ├── routes/singleRoutes.js
  │     └─ singleController.js → 실제 로직 연결
  │
  ├── game/deck.js                # 카드 덱 생성/셔플
  └── game/blackjack.js           # 점수 계산 및 규칙 처리
```

---

## ✅ 추후 작업 및 이슈
- 현재 render(백엔드)를 무료로 사용을 하고 있어 많은 클라이언트가 접속해 이용할 시 bad request 오류가 생김
- 멀티 플레이 확장: 2~6명제한, 실시간 채팅 또는 이모티콘 기능으로 상호작용 강화, 닉네임 / 아바타 기능으로 시각 요소 추가
- 게임성 향상: 보험기능, 더블기능, 스플릿 등 추가적인 룰 확장, 칩 베팅 UI개선(드래그 엔 드롭 방식, 애니메이션을 통해 진짜 칩을 던져 베팅 하는 느낌의 인터페이스), 게임 기록보기
- 보안 및 계정연동: 로그인 시스템 도입, 서버 측 자산 관리(localStorage 대신 DB 연동으로 칩 조작 방지), 게임 조작 방지 로직(카드 강제 변경, 히트 무한 반복 등 서버에서 막기)
- 통계 및 리포트: 전체 유저 통계, 데일리 퀘스트 / 미션 시스템
