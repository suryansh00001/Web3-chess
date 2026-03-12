/**
 * useChessGame Hook
 * 
 * This custom hook manages the chess game state using chess.js.
 * It provides methods to:
 * - Validate moves
 * - Update board position
 * - Track game status (check, checkmate, etc.)
 * - Handle piece selection and movement
 */

import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';

export const useChessGame = (initialFen = null) => {
  // Initialize chess.js instance
  const [game, setGame] = useState(() => {
    const newGame = new Chess();
    if (initialFen) {
      newGame.load(initialFen);
    }
    return newGame;
  });

  const [position, setPosition] = useState(game.fen());
  const [gameStatus, setGameStatus] = useState({
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    isStalemate: false,
    currentTurn: 'w',
    gameOver: false
  });

  /**
   * Update the game status based on current chess.js state
   */
  const updateGameStatus = useCallback((chessInstance) => {
    setGameStatus({
      isCheck: chessInstance.isCheck(),
      isCheckmate: chessInstance.isCheckmate(),
      isDraw: chessInstance.isDraw(),
      isStalemate: chessInstance.isStalemate(),
      currentTurn: chessInstance.turn(),
      gameOver: chessInstance.isGameOver()
    });
  }, []);

  /**
   * Update board position from FEN string
   * Used when receiving moves from server
   */
  const updatePosition = useCallback((fen) => {
    const newGame = new Chess(fen);
    setGame(newGame);
    setPosition(fen);
    updateGameStatus(newGame);
  }, [updateGameStatus]);

  /**
   * Validate if a move is legal
   * @param {Object} move - Move object { from, to, promotion? }
   * @returns {boolean} - True if move is legal
   */
  const isMoveLegal = useCallback((move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      return result !== null;
    } catch (error) {
      return false;
    }
  }, [game]);

  /**
   * Make a move (for local validation before sending to server)
   * @param {Object} move - Move object { from, to, promotion? }
   * @returns {Object|null} - Move result or null if invalid
   */
  const makeMove = useCallback((move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        setPosition(gameCopy.fen());
        updateGameStatus(gameCopy);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Move error:', error);
      return null;
    }
  }, [game, updateGameStatus]);

  /**
   * Get all legal moves for a square
   * @param {string} square - Square notation (e.g., 'e4')
   * @returns {Array} - Array of legal moves
   */
  const getLegalMoves = useCallback((square) => {
    const moves = game.moves({ square, verbose: true });
    return moves.map(move => move.to);
  }, [game]);

  /**
   * Reset the game to initial position
   */
  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    updateGameStatus(newGame);
  }, [updateGameStatus]);

  /**
   * Get piece at a specific square
   * @param {string} square - Square notation (e.g., 'e4')
   * @returns {Object|null} - Piece object or null
   */
  const getPiece = useCallback((square) => {
    return game.get(square);
  }, [game]);

  /**
   * Check if it's a specific color's turn
   * @param {string} color - 'w' or 'b'
   * @returns {boolean}
   */
  const isPlayerTurn = useCallback((color) => {
    return game.turn() === color;
  }, [game]);

  /**
   * Get current turn
   * @returns {string} - 'w' or 'b'
   */
  const getCurrentTurn = useCallback(() => {
    return game.turn();
  }, [game]);

  /**
   * Get game history
   * @returns {Array} - Array of moves in SAN notation
   */
  const getHistory = useCallback(() => {
    return game.history();
  }, [game]);

  /**
   * Get game board as 2D array
   * @returns {Array} - 8x8 array of pieces
   */
  const getBoard = useCallback(() => {
    return game.board();
  }, [game]);

  return {
    game,
    position,
    gameStatus,
    updatePosition,
    isMoveLegal,
    makeMove,
    getLegalMoves,
    resetGame,
    getPiece,
    isPlayerTurn,
    getCurrentTurn,
    getHistory,
    getBoard
  };
};
