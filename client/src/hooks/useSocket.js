import { useCallback, useMemo, useRef } from 'react';
import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { Chess } from 'chess.js';
import { useSocketContext } from '../context/SocketContext';

const INITIAL_TIME_MS = 10 * 60 * 1000;

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function assignColors() {
  const creatorColor = Math.random() < 0.5 ? 'w' : 'b';
  return {
    creator: creatorColor,
    joiner: creatorColor === 'w' ? 'b' : 'w'
  };
}

function getGameResult(chess) {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    return { isOver: true, result: 'checkmate', winner };
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
  if (chess.isDraw()) {
    return { isOver: true, result: 'draw', winner: null };
  }
  return { isOver: false, result: null, winner: null };
}

export const useSocket = () => {
  const { db, user, isConnected, error } = useSocketContext();
  const invalidMoveListenersRef = useRef(new Set());
  const errorListenersRef = useRef(new Set());

  const emitInvalidMove = useCallback((payload) => {
    invalidMoveListenersRef.current.forEach((listener) => listener(payload));
  }, []);

  const emitError = useCallback((payload) => {
    errorListenersRef.current.forEach((listener) => listener(payload));
  }, []);

  const roomRef = useCallback((roomId) => doc(db, 'rooms', roomId), [db]);

  const createRoom = useCallback(async (callback) => {
    if (!db || !user) {
      const msg = 'Not connected to Firebase';
      emitError({ message: msg });
      throw new Error(msg);
    }

    const roomId = generateRoomId();
    const colors = assignColors();
    const chess = new Chess();
    const now = Date.now();

    const payload = {
      roomId,
      status: 'waiting',
      creatorId: user.uid,
      players: {
        creator: user.uid,
        joiner: null,
        white: colors.creator === 'w' ? user.uid : null,
        black: colors.creator === 'b' ? user.uid : null
      },
      playerColors: {
        [user.uid]: colors.creator
      },
      fen: chess.fen(),
      currentTurn: chess.turn(),
      isCheck: false,
      gameOver: { isOver: false, result: null, winner: null },
      moveCount: 0,
      lastMove: null,
      timers: { w: INITIAL_TIME_MS, b: INITIAL_TIME_MS },
      lastMoveTime: now,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(roomRef(roomId), payload);
      const result = { roomId, color: colors.creator, fen: chess.fen(), timers: payload.timers };
      callback?.(result);
      return result;
    } catch (err) {
      const details = err?.message || String(err);
      emitError({ message: 'Failed to create room', details });
      throw err;
    }
  }, [db, user, roomRef, emitError]);

  const joinRoom = useCallback(async (roomId, callback, errorCallback) => {
    if (!db || !user) {
      const message = 'Not connected to Firebase';
      errorCallback?.(message);
      emitError({ message });
      return;
    }

    try {
      const joinResult = await runTransaction(db, async (transaction) => {
        const ref = roomRef(roomId);
        const snapshot = await transaction.get(ref);

        if (!snapshot.exists()) {
          throw new Error('Room not found');
        }

        const room = snapshot.data();

        if (room.creatorId === user.uid) {
          throw new Error('You cannot join your own room from the same browser session. Open the room in an incognito window or another browser.');
        }

        const existingColor = room.playerColors?.[user.uid];
        if (existingColor) {
          throw new Error('This account is already assigned in this room. Use a different browser session for the second player.');
        }

        if (room.players?.joiner && room.players.joiner !== user.uid) {
          throw new Error('Room is full');
        }

        const creatorColor = room.playerColors?.[room.creatorId] || 'w';
        const joinerColor = creatorColor === 'w' ? 'b' : 'w';

        const nextPlayers = {
          ...room.players,
          joiner: user.uid,
          white: joinerColor === 'w' ? user.uid : room.players.white,
          black: joinerColor === 'b' ? user.uid : room.players.black
        };

        transaction.update(ref, {
          status: 'playing',
          players: nextPlayers,
          playerColors: {
            ...(room.playerColors || {}),
            [user.uid]: joinerColor
          },
          updatedAt: serverTimestamp(),
          lastMoveTime: Date.now()
        });

        return {
          color: joinerColor,
          fen: room.fen,
          timers: room.timers
        };
      });

      callback?.({ roomId, ...joinResult });
    } catch (err) {
      errorCallback?.(err.message);
    }
  }, [db, user, roomRef, emitError]);

  const makeMove = useCallback(async (roomId, move) => {
    if (!db || !user) {
      emitInvalidMove({ message: 'Not connected', fen: null, timers: null });
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const ref = roomRef(roomId);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) {
          throw new Error('Room not found');
        }

        const room = snapshot.data();
        const playerColor = room.playerColors?.[user.uid];

        if (!playerColor) {
          throw new Error('You are not part of this room');
        }

        if (room.status !== 'playing') {
          throw new Error('Game is not active');
        }

        const now = Date.now();
        const elapsed = Math.max(0, now - (room.lastMoveTime || now));
        const timers = { ...(room.timers || { w: INITIAL_TIME_MS, b: INITIAL_TIME_MS }) };
        const activeTurn = room.currentTurn || 'w';
        timers[activeTurn] = Math.max(0, timers[activeTurn] - elapsed);

        if (timers[activeTurn] <= 0) {
          const winner = activeTurn === 'w' ? 'Black' : 'White';
          transaction.update(ref, {
            status: 'finished',
            gameOver: { isOver: true, result: 'timeout', winner },
            timers,
            updatedAt: serverTimestamp(),
            lastMoveTime: now
          });
          return;
        }

        if (activeTurn !== playerColor) {
          throw new Error('Not your turn');
        }

        const chess = new Chess(room.fen);
        const moveResult = chess.move(move);

        if (!moveResult) {
          throw new Error('Invalid move');
        }

        const serializedMove = {
          color: moveResult.color,
          from: moveResult.from,
          to: moveResult.to,
          piece: moveResult.piece,
          captured: moveResult.captured || null,
          promotion: moveResult.promotion || null,
          flags: moveResult.flags,
          san: moveResult.san,
          lan: moveResult.lan,
          before: moveResult.before,
          after: moveResult.after
        };

        const gameOver = getGameResult(chess);

        transaction.update(ref, {
          fen: chess.fen(),
          currentTurn: chess.turn(),
          isCheck: chess.isCheck(),
          gameOver,
          status: gameOver.isOver ? 'finished' : 'playing',
          moveCount: (room.moveCount || 0) + 1,
          lastMove: serializedMove,
          timers,
          lastMoveTime: now,
          updatedAt: serverTimestamp()
        });
      });
    } catch (err) {
      const snapshot = await getDoc(roomRef(roomId));
      const room = snapshot.exists() ? snapshot.data() : null;
      emitInvalidMove({
        message: err.message,
        fen: room?.fen || null,
        timers: room?.timers || null
      });
    }
  }, [db, user, roomRef, emitInvalidMove]);

  const onGameStart = useCallback((roomId, callback) => {
    if (!db || !roomId) return () => {};

    let previousStatus = null;
    return onSnapshot(roomRef(roomId), (snapshot) => {
      if (!snapshot.exists()) return;
      const room = snapshot.data();

      if (room.status === 'playing' && previousStatus !== 'playing') {
        callback({
          players: room.players,
          currentTurn: room.currentTurn,
          fen: room.fen,
          timers: room.timers,
          timestamp: Date.now()
        });
      }

      previousStatus = room.status;
    }, () => {
      emitError({ message: 'Failed to subscribe to game start' });
    });
  }, [db, roomRef, emitError]);

  const onMoveMade = useCallback((roomId, callback) => {
    if (!db || !roomId) return () => {};

    let previousMoveCount = -1;
    return onSnapshot(roomRef(roomId), (snapshot) => {
      if (!snapshot.exists()) return;
      const room = snapshot.data();
      const moveCount = room.moveCount || 0;

      if (moveCount > previousMoveCount && previousMoveCount !== -1) {
        callback({
          move: room.lastMove,
          fen: room.fen,
          currentTurn: room.currentTurn,
          isCheck: room.isCheck,
          gameOver: room.gameOver || { isOver: false },
          timers: room.timers,
          timestamp: Date.now()
        });
      }

      previousMoveCount = moveCount;
    }, () => {
      emitError({ message: 'Failed to subscribe to moves' });
    });
  }, [db, roomRef, emitError]);

  const onInvalidMove = useCallback((_roomId, callback) => {
    invalidMoveListenersRef.current.add(callback);
    return () => invalidMoveListenersRef.current.delete(callback);
  }, []);

  const onPlayerDisconnected = useCallback((roomId, callback) => {
    if (!db || !roomId) return () => {};

    let previousStatus = null;
    return onSnapshot(roomRef(roomId), (snapshot) => {
      if (!snapshot.exists()) return;
      const room = snapshot.data();
      const gameOver = room.gameOver || {};
      if (
        room.status === 'finished' &&
        gameOver.result === 'opponent_left' &&
        previousStatus !== 'finished'
      ) {
        callback({ message: 'Opponent disconnected' });
      }
      previousStatus = room.status;
    });
  }, [db, roomRef]);

  const onError = useCallback((callback) => {
    errorListenersRef.current.add(callback);
    return () => errorListenersRef.current.delete(callback);
  }, []);

  const getGameState = useCallback(async (roomId, callback) => {
    if (!db || !user || !roomId) return;

    const snapshot = await getDoc(roomRef(roomId));
    if (!snapshot.exists()) {
      emitError({ message: 'Room not found' });
      return;
    }

    const room = snapshot.data();
    callback({
      fen: room.fen,
      currentTurn: room.currentTurn,
      isCheck: room.isCheck,
      playerColor: room.playerColors?.[user.uid],
      timers: room.timers,
      gameOver: room.gameOver,
      status: room.status,
      timestamp: Date.now()
    });
  }, [db, user, roomRef, emitError]);

  const onTimeUp = useCallback((roomId, callback) => {
    if (!db || !roomId) return () => {};

    let wasTimedOut = false;
    return onSnapshot(roomRef(roomId), (snapshot) => {
      if (!snapshot.exists()) return;
      const room = snapshot.data();
      const gameOver = room.gameOver || {};

      if (gameOver.result === 'timeout' && !wasTimedOut) {
        callback({
          winner: gameOver.winner,
          isOver: true,
          result: 'timeout',
          timers: room.timers
        });
      }

      wasTimedOut = gameOver.result === 'timeout';
    });
  }, [db, roomRef]);

  return useMemo(() => ({
    socket: null,
    isConnected,
    error,
    createRoom,
    joinRoom,
    makeMove,
    onGameStart,
    onMoveMade,
    onInvalidMove,
    onPlayerDisconnected,
    onTimeUp,
    onError,
    getGameState
  }), [
    isConnected,
    error,
    createRoom,
    joinRoom,
    makeMove,
    onGameStart,
    onMoveMade,
    onInvalidMove,
    onPlayerDisconnected,
    onTimeUp,
    onError,
    getGameState
  ]);
};

