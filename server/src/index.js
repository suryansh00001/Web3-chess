require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const winston = require('winston');

const { getFirestore } = require('firebase-admin/firestore');
const { isValidMove, getRoom, updateRoom } = require('./gameController');
const matchService = require('./matchService');

const PORT = process.env.PORT || 4000;

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
  const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  logger.info('Firebase Admin initialized from service account');
} else {
  try {
    admin.initializeApp();
    logger.info('Firebase Admin initialized with default credentials');
  } catch (e) {
    logger.warn('Firebase Admin not initialized (missing credentials)');
  }
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });

// Optional Redis adapter
if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.IO Redis adapter enabled');
}

// Initialize match service if configured
if (process.env.RPC_URL && process.env.DEPLOYER_PRIVATE_KEY && process.env.CONTRACT_ADDRESS) {
  const abiPath = path.join(__dirname, '..', 'deploy', 'deployed', 'MatchEscrow.json');
  let abi = null;
  if (fs.existsSync(abiPath)) {
    abi = require(abiPath).abi;
  }
  matchService.init({ rpcUrl: process.env.RPC_URL, privateKey: process.env.DEPLOYER_PRIVATE_KEY, contractAddress: process.env.CONTRACT_ADDRESS, abi });
  logger.info('Match service initialized');
}

io.use(async (socket, next) => {
  // optional: verify Firebase token passed via auth
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token && admin.apps.length) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      socket.user = decoded;
    } catch (err) {
      logger.warn('Invalid Firebase token');
    }
  }
  next();
});

io.on('connection', (socket) => {
  logger.info('Client connected', { id: socket.id, user: socket.user?.uid });

  socket.on('joinRoom', async ({ roomId }, cb) => {
    try {
      socket.join(roomId);
      const room = await getRoom(roomId);
      cb && cb(null, { room });
    } catch (err) {
      cb && cb(err.message);
    }
  });

  socket.on('makeMove', async ({ roomId, move }, cb) => {
    try {
      const room = await getRoom(roomId);
      if (!room) return cb && cb('Room not found');
      const res = isValidMove(room.fen, move);
      if (!res.valid) return cb && cb('Invalid move');

      // update room state (simple optimistic update)
      const updated = {
        fen: res.fen,
        lastMove: res.move,
        currentTurn: res.fen ? (res.fen.split(' ')[1] === 'w' ? 'w' : 'b') : null,
        lastMoveTime: Date.now(),
        updatedAt: Date.now()
      };
      await updateRoom(roomId, updated);

      io.to(roomId).emit('moveMade', { roomId, ...updated });
      cb && cb(null, updated);
    } catch (err) {
      logger.error('makeMove error', err);
      cb && cb(err.message);
    }
  });

  socket.on('getGameState', async ({ roomId }, cb) => {
    try {
      const room = await getRoom(roomId);
      cb && cb(null, room);
    } catch (err) {
      cb && cb(err.message);
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { id: socket.id });
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
