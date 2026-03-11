const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Chess } = require('chess.js');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// Store rooms and authoritative game state
// Key: roomId, Value: { players: { white: socketId, black: socketId }, game: ChessInstance }
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', () => {
    // Generate a simple 4-character room code
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms.set(roomId, {
      players: {
        white: socket.id,
        black: null
      },
      game: new Chess() // Authoritative server-side game state
    });
    
    socket.join(roomId);
    socket.emit('room_created', { roomId, color: 'white' });
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  socket.on('join_room', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      if (!room.players.black) {
        room.players.black = socket.id;
        socket.join(roomId);
        socket.emit('room_joined', { roomId, color: 'black' });
        // Send the current FEN in case they joined an aborted/re-joined game (future proofing)
        io.to(roomId).emit('game_start', { message: 'Opponent connected. Game starts!', fen: room.game.fen() });
        console.log(`User ${socket.id} joined room ${roomId}`);
      } else {
        socket.emit('error', 'Room is full');
      }
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('move', ({ roomId, move }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Verify it's actually this player's turn to prevent spoofing
    const turnColor = room.game.turn() === 'w' ? room.players.white : room.players.black;
    if (socket.id !== turnColor) {
      console.warn(`[SECURITY] User ${socket.id} attempted to move out of turn in room ${roomId}`);
      socket.emit('error', 'Not your turn / Invalid move');
      return;
    }

    try {
      // Attempt to apply the move to the server's authoritative state
      const result = room.game.move(move);
      
      if (result) {
        // The move was valid according to chess.js rules
        // Broadcast the validated move to the opponent
        socket.to(roomId).emit('opponent_moved', move);
      } else {
        // Technically chess.js throws an error on invalid moves, but if it returns null:
        console.warn(`[SECURITY] Invalid move rejected from ${socket.id} in room ${roomId}:`, move);
        socket.emit('error', 'Illegal move rejected by server.');
      }
    } catch (e) {
      // Illegal moves cause chess.js to throw an Error
      console.warn(`[SECURITY] Invalid move rejected from ${socket.id} in room ${roomId}:`, move);
      socket.emit('error', 'Illegal move rejected by server.');
    }
  });

  socket.on('leave_room', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.leave(roomId);
      socket.to(roomId).emit('opponent_disconnected', 'Your opponent left the game.');
      rooms.delete(roomId);
      console.log(`User ${socket.id} explicitly left room ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.white === socket.id || room.players.black === socket.id) {
        io.to(roomId).emit('opponent_disconnected', 'Your opponent disconnected.');
        rooms.delete(roomId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Secure Server listening on port ${PORT}`);
});
