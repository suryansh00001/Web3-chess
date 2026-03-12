/**
 * useSocket Hook
 * 
 * This custom hook provides socket methods using the shared socket context.
 * It provides methods to:
 * - Create a room
 * - Join an existing room
 * - Make moves
 * - Handle all socket event listeners
 */

import { useSocketContext } from '../context/SocketContext';

export const useSocket = () => {
  const { socket, isConnected, error } = useSocketContext();

  /**
   * Create a new game room
   * @param {Function} callback - Called with { roomId, color, fen }
   */
  const createRoom = (callback) => {
    if (!socket) return;
    
    socket.emit('CREATE_ROOM');
    
    socket.once('ROOM_CREATED', (data) => {
      console.log('Room created:', data);
      callback(data);
    });
  };

  /**
   * Join an existing room
   * @param {string} roomId - The room ID to join
   * @param {Function} callback - Called with { roomId, color, fen }
   * @param {Function} errorCallback - Called if join fails
   */
  const joinRoom = (roomId, callback, errorCallback) => {
    if (!socket) return;

    socket.emit('JOIN_ROOM', roomId);

    socket.once('ROOM_JOINED', (data) => {
      console.log('Room joined:', data);
      callback(data);
    });

    socket.once('ERROR', (error) => {
      console.error('Join room error:', error);
      errorCallback(error.message);
    });
  };

  /**
   * Make a chess move
   * @param {string} roomId - The room ID
   * @param {Object} move - The move object { from, to, promotion? }
   */
  const makeMove = (roomId, move) => {
    if (!socket) return;
    
    console.log('Emitting move:', move);
    socket.emit('MAKE_MOVE', { roomId, move });
  };

  /**
   * Subscribe to game start event
   * @param {Function} callback - Called when game starts with player info
   */
  const onGameStart = (callback) => {
    if (!socket) return () => {};

    socket.on('GAME_START', callback);

    return () => {
      socket.off('GAME_START', callback);
    };
  };

  /**
   * Subscribe to move made event
   * @param {Function} callback - Called when a move is made
   */
  const onMoveMade = (callback) => {
    if (!socket) return () => {};

    socket.on('MOVE_MADE', callback);

    return () => {
      socket.off('MOVE_MADE', callback);
    };
  };

  /**
   * Subscribe to invalid move event
   * @param {Function} callback - Called when an invalid move is attempted
   */
  const onInvalidMove = (callback) => {
    if (!socket) return () => {};

    socket.on('INVALID_MOVE', callback);

    return () => {
      socket.off('INVALID_MOVE', callback);
    };
  };

  /**
   * Subscribe to player disconnected event
   * @param {Function} callback - Called when opponent disconnects
   */
  const onPlayerDisconnected = (callback) => {
    if (!socket) return () => {};

    socket.on('PLAYER_DISCONNECTED', callback);

    return () => {
      socket.off('PLAYER_DISCONNECTED', callback);
    };
  };

  /**
   * Subscribe to error events
   * @param {Function} callback - Called on error
   */
  const onError = (callback) => {
    if (!socket) return () => {};

    socket.on('ERROR', callback);

    return () => {
      socket.off('ERROR', callback);
    };
  };

  /**
   * Request current game state
   * @param {string} roomId - The room ID
   * @param {Function} callback - Called with game state
   */
  const getGameState = (roomId, callback) => {
    if (!socket) return;

    socket.emit('GET_GAME_STATE', roomId);
    
    socket.once('GAME_STATE', callback);
  };

  return {
    socket,
    isConnected,
    error,
    createRoom,
    joinRoom,
    makeMove,
    onGameStart,
    onMoveMade,
    onInvalidMove,
    onPlayerDisconnected,
    onError,
    getGameState
  };
};
