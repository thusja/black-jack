// 싱글 모드용 API
// 게임 시작, 히트, 스탠드 요청 처리하는 경로 정의
// 컨트롤러 함수와 라우터를 연결

import express from "express";
import { startNewGame, hit, stand } from "../controllers/singleController.js";

const router = express.Router();

router.get("/start", startNewGame);
router.post("/hit", hit);
router.post("/stand", stand);

export default router;
