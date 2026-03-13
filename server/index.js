/**
 * Web3 Chess DApp - Phase 1 Backend Server
 * 
 * This server handles:
 * - Room creation and management
 * - Player connections and color assignment
 * - Real-time move validation and broadcasting
 * - Game state synchronization
 * - Timer (Clock) management
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS for local development
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Timer constants
const INITIAL_TIME_MS = 10 * 60 * 1000; // 10 minutes

// In-memory storage for game rooms
// Structure: { roomId: { players: {}, gameState: Chess instance, playerColors: {}, timers: {}, lastMoveTime: number, interval: Timer } }
const rooms = new Map();

/**
 * Generate a unique 6-character room ID
 */
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Randomly assign colors to players
 * @returns {Object} { creator: 'w' or 'b', joiner: opposite }
 */
function assignColors() {
  const creatorColor = Math.random() < 0.5 ? 'w' : 'b';
  const joinerColor = creatorColor === 'w' ? 'b' : 'w';
  return { creator: creatorColor, joiner: joinerColor };
}

/**
 * Check if game is over and return the result
 */
function getGameResult(chess) {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    return { isOver: true, result: 'checkmate', winner };
  }
  if (chess.isDraw()) {
    return { isOver: true, result: 'draw', winner: null };
  }
  if (chess.isStalemate()) {
    return { isOver: true, result: 'stalemate', winner: null };
  }
  if (chess.isThreefoldRepetition()) {
    return { isOver: true, result: 'repetition', winner: null };
  }
  if (chess.isInsufficientMaterial()) {
    return { isOver: true, result: 'insufficient_material', winner: null };
  }
  return { isOver: false };
}

/**
 * Start or resume the timer interval for a room
 */
function startTimerInterval(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.interval) return;

  room.lastMoveTime = Date.now();
  
  room.interval = setInterval(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom) return;

    const currentTurn = currentRoom.gameState.turn();
    const now = Date.now();
    const elapsed = now - currentRoom.lastMoveTime;
    
    currentRoom.timers[currentTurn] -= elapsed;
    currentRoom.lastMoveTime = now;

    // Check for timeout
    if (currentRoom.timers[currentTurn] <= 0) {
      currentRoom.timers[currentTurn] = 0;
      clearInterval(currentRoom.interval);
      currentRoom.interval = null;

      const winnerColor = currentTurn === 'w' ? 'Black' : 'White';
      
      console.log(`Time up in room ${roomId}. ${winnerColor} wins.`);
      
      io.to(roomId).emit('TIME_UP', {
        winner: winnerColor,
        isOver: true,
        result: 'timeout',
        timers: currentRoom.timers
      });

      // Cleanup
      setTimeout(() => {
        rooms.delete(roomId);
        console.log(`Room ${roomId} cleaned up after timeout`);
      }, 300000);
    }
  }, 1000); // Check every second
}

/**
 * Stop the timer interval for a room
 */
function stopTimerInterval(roomId) {
  const room = rooms.get(roomId);
  if (room && room.interval) {
    clearInterval(room.interval);
    room.interval = null;
    
    // Final exact update before pause
    const currentTurn = room.gameState.turn();
    const now = Date.now();
    const elapsed = now - room.lastMoveTime;
    room.timers[currentTurn] -= elapsed;
  }
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  /**
   * CREATE_ROOM event
   * Player creates a new game room
   */
  socket.on('CREATE_ROOM', () => {
    const roomId = generateRoomId();
    const colors = assignColors();
    
    // Initialize new room WITH TIMERS
    rooms.set(roomId, {
      players: {
        creator: socket.id,
        joiner: null
      },
      gameState: new Chess(), // Initialize chess.js instance
      playerColors: {
        [socket.id]: colors.creator
      },
      creatorColor: colors.creator,
      timers: {
        w: INITIAL_TIME_MS,
        b: INITIAL_TIME_MS
      },
      lastMoveTime: null,
      interval: null
    });

    // Join the socket room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerRole = 'creator';

    console.log(`Room ${roomId} created by ${socket.id} (Color: ${colors.creator})`);

    // Send room info back to creator
    socket.emit('ROOM_CREATED', {
      roomId,
      color: colors.creator,
      fen: rooms.get(roomId).gameState.fen(),
      timers: rooms.get(roomId).timers
    });
  });

  /**
   * JOIN_ROOM event
   * Player joins an existing room
   */
  socket.on('JOIN_ROOM', (roomId) => {
    const room = rooms.get(roomId);

    // Validate room exists
    if (!room) {
      socket.emit('ERROR', { message: 'Room not found' });
      return;
    }

    // Check if room is full
    if (room.players.joiner) {
      socket.emit('ERROR', { message: 'Room is full' });
      return;
    }

    // Assign joiner to the room
    room.players.joiner = socket.id;
    const joinerColor = room.creatorColor === 'w' ? 'b' : 'w';
    room.playerColors[socket.id] = joinerColor;

    // Join the socket room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.playerRole = 'joiner';

    console.log(`Player ${socket.id} joined room ${roomId} (Color: ${joinerColor})`);

    // Notify joiner
    socket.emit('ROOM_JOINED', {
      roomId,
      color: joinerColor,
      fen: room.gameState.fen(),
      timers: room.timers
    });

    // Notify both players that game is starting AND start the timer
    io.to(roomId).emit('GAME_START', {
      players: {
        white: room.creatorColor === 'w' ? room.players.creator : room.players.joiner,
        black: room.creatorColor === 'b' ? room.players.creator : room.players.joiner
      },
      currentTurn: 'w',
      fen: room.gameState.fen(),
      timers: room.timers,
      timestamp: Date.now()
    });

    // Start timer interval for White
    startTimerInterval(roomId);
  });

  /**
   * MAKE_MOVE event
   * Player attempts to make a move
   */
  socket.on('MAKE_MOVE', ({ roomId, move }) => {
    const room = rooms.get(roomId);

    // Validate room exists
    if (!room) {
      socket.emit('ERROR', { message: 'Room not found' });
      return;
    }

    // Get player's color
    const playerColor = room.playerColors[socket.id];
    
    // Check if it's this player's turn
    if (room.gameState.turn() !== playerColor) {
      socket.emit('INVALID_MOVE', { 
        message: 'Not your turn',
        fen: room.gameState.fen(),
        timers: room.timers
      });
      return;
    }

    // Attempt to make the move using chess.js
    try {
      // Pause timer for accurate calculation before move
      stopTimerInterval(roomId);

      const result = room.gameState.move(move);
      
      if (result === null) {
        // Invalid move, restart timer for same player
        startTimerInterval(roomId);
        socket.emit('INVALID_MOVE', { 
          message: 'Invalid move',
          fen: room.gameState.fen(),
          timers: room.timers
        });
        return;
      }

      console.log(`Valid move in room ${roomId}: ${move.from} to ${move.to}`);

      // Get current game status
      const isInCheck = room.gameState.isCheck();
      const gameResult = getGameResult(room.gameState);

      // Broadcast the valid move to all players in room
      io.to(roomId).emit('MOVE_MADE', {
        move: result,
        fen: room.gameState.fen(),
        currentTurn: room.gameState.turn(),
        isCheck: isInCheck,
        gameOver: gameResult,
        timers: room.timers,
        timestamp: Date.now()
      });

      // If game is over, clean up room and DON'T restart timer
      if (gameResult.isOver) {
        console.log(`Game over in room ${roomId}: ${gameResult.result}`);
        // Keep room for 5 minutes before cleanup
        setTimeout(() => {
          rooms.delete(roomId);
          console.log(`Room ${roomId} cleaned up`);
        }, 300000);
      } else {
        // Switch turn logic handled by chess.js, start timer for next player
        startTimerInterval(roomId);
      }

    } catch (error) {
      console.error(`Error processing move: ${error.message}`);
      socket.emit('INVALID_MOVE', { 
        message: 'Error processing move',
        fen: room.gameState.fen(),
        timers: room.timers
      });
      startTimerInterval(roomId); // resume timer
    }
  });

  /**
   * DISCONNECT event
   * Player disconnects from the server
   */
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Find and handle room cleanup
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        stopTimerInterval(socket.roomId);
        
        // Notify other player
        io.to(socket.roomId).emit('PLAYER_DISCONNECTED', {
          message: 'Opponent disconnected'
        });

        // Clean up room after short delay
        setTimeout(() => {
          rooms.delete(socket.roomId);
          console.log(`Room ${socket.roomId} cleaned up after disconnect`);
        }, 5000);
      }
    }
  });

  /**
   * GET_GAME_STATE event
   * Player requests current game state (for reconnection scenarios)
   */
  socket.on('GET_GAME_STATE', (roomId) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('ERROR', { message: 'Room not found' });
      return;
    }

    // Force an exact timer sync if running
    if (room.interval) {
        stopTimerInterval(roomId);
        startTimerInterval(roomId);
    }

    socket.emit('GAME_STATE', {
      fen: room.gameState.fen(),
      currentTurn: room.gameState.turn(),
      isCheck: room.gameState.isCheck(),
      playerColor: room.playerColors[socket.id],
      timers: room.timers,
      gameOver: getGameResult(room.gameState),
      timestamp: Date.now()
    });
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎮 Chess server running on port ${PORT}`);
});

