// server

import express from "express";
import cors from "cors";
import path from "path";
// import http from "http";
import { fileURLToPath } from "url";
// import { Server } from "socket.io";

import singleRoutes from "./routes/singleRoutes.js";
// import setupWebSocket from "./websocket.js";

const app = express();
// const server = http.createServer(app);

// CORS 및 JSON 요청 처리 설정
app.use(cors());
app.use(express.json());

// 싱글플레이어 API 라우팅
app.use('/api/single', singleRoutes);

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 서빙 (배포 전)
// app.use(express.static(path.join(__dirname, '../frontend')));

// 🌐 WebSocket 서버 설정 (Socket.IO)
// const io = new Server(server, {
//   cors: {
//     origin: "*"
//   }
// });
// setupWebSocket(io); // 이벤트 연결 (multiController와 연결됨)

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server + WebSocket running at http://localhost:${PORT}`);
});
