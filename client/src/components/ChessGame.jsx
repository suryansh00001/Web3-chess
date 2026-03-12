/**
 * ChessGame Component
 * 
 * Main game component that integrates:
 * - chess.js for game logic
 * - react-chessboard for UI
 * - Socket.io for real-time multiplayer
 * 
 * This component handles:
 * - Board rendering and orientation
 * - Drag-and-drop piece movement
 * - Real-time move synchronization
 * - Game state display
 * - Turn management
 */

import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useSocket } from '../hooks/useSocket';
import { useChessGame } from '../hooks/useChessGame';
import GameStatus from './GameStatus';
import GameInfo from './GameInfo';

const ChessGame = ({ roomId, playerColor, onLeaveRoom }) => {
  // Custom hooks
  const socket = useSocket();
  const chessGame = useChessGame();

  // Local state
  const [gameState, setGameState] = useState({
    status: 'waiting', // 'waiting' | 'playing' | 'finished'
    message: 'Waiting for opponent to join...',
    opponentConnected: false,
    currentTurn: 'w',
    isCheck: false,
    gameResult: null
  });

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState({});

  /**
   * Check if it's the current player's turn
   */
  const isMyTurn = useCallback(() => {
    return chessGame.getCurrentTurn() === playerColor;
  }, [chessGame, playerColor]);

  /**
   * Handle game start event from server
   * Both players receive this when the second player joins
   */
  useEffect(() => {
    const unsubscribe = socket.onGameStart((data) => {
      console.log('Game started:', data);
      setGameState({
        status: 'playing',
        message: `Game Started! You are playing ${playerColor === 'w' ? 'White' : 'Black'}.`,
        opponentConnected: true,
        currentTurn: data.currentTurn,
        isCheck: false,
        gameResult: null
      });
      
      // Update board position
      chessGame.updatePosition(data.fen);
    });

    return unsubscribe;
  }, [socket, chessGame, playerColor]);

  /**
   * Handle move made event from server
   * Updates the board when any player makes a move
   */
  useEffect(() => {
    const unsubscribe = socket.onMoveMade((data) => {
      console.log('Move received:', data);
      
      // Update the board position from server
      chessGame.updatePosition(data.fen);

      // Update game state
      const newGameState = {
        status: data.gameOver.isOver ? 'finished' : 'playing',
        opponentConnected: true,
        currentTurn: data.currentTurn,
        isCheck: data.isCheck,
        gameResult: data.gameOver.isOver ? data.gameOver : null
      };

      // Set appropriate message based on game state
      if (data.gameOver.isOver) {
        // Game over
        if (data.gameOver.result === 'checkmate') {
          newGameState.message = `Checkmate! ${data.gameOver.winner} wins! 🎉`;
        } else if (data.gameOver.result === 'draw') {
          newGameState.message = 'Game drawn! 🤝';
        } else if (data.gameOver.result === 'stalemate') {
          newGameState.message = 'Stalemate! 🤝';
        } else {
          newGameState.message = `Game Over: ${data.gameOver.result}`;
        }
      } else if (data.isCheck) {
        // Check
        const checkedPlayer = data.currentTurn === 'w' ? 'White' : 'Black';
        newGameState.message = `Check! ${checkedPlayer} is in check!`;
      } else {
        // Normal turn
        const currentPlayer = data.currentTurn === playerColor;
        newGameState.message = currentPlayer 
          ? "It's your turn!" 
          : "Opponent's turn...";
      }

      setGameState(newGameState);
      
      // Clear any highlighted squares
      setHighlightedSquares({});
      setSelectedSquare(null);
    });

    return unsubscribe;
  }, [socket, chessGame, playerColor]);

  /**
   * Handle invalid move event from server
   */
  useEffect(() => {
    const unsubscribe = socket.onInvalidMove((data) => {
      console.warn('Invalid move:', data.message);
      
      // Reset board to server state
      chessGame.updatePosition(data.fen);
      
      // Show error message temporarily
      setGameState(prev => ({
        ...prev,
        message: `Invalid move: ${data.message}`
      }));

      // Reset message after 2 seconds
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          message: isMyTurn() ? "It's your turn!" : "Opponent's turn..."
        }));
      }, 2000);
    });

    return unsubscribe;
  }, [socket, chessGame, isMyTurn]);

  /**
   * Handle player disconnected event
   */
  useEffect(() => {
    const unsubscribe = socket.onPlayerDisconnected((data) => {
      console.log('Opponent disconnected');
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        message: 'Opponent disconnected. Game ended.',
        opponentConnected: false
      }));
    });

    return unsubscribe;
  }, [socket]);

  /**
   * Handle piece drop (drag and drop move)
   * This is called by react-chessboard when a piece is dropped
   */
  const onPieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    // Check if it's player's turn
    if (!isMyTurn()) {
      console.log('Not your turn!');
      return false; // Snap back
    }

    // Check if game is still playing
    if (gameState.status !== 'playing') {
      return false; // Snap back
    }

    // Construct the move object
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen for simplicity
    };

    // Validate move locally first
    if (!chessGame.isMoveLegal(move)) {
      console.log('Illegal move');
      return false; // Snap back
    }

    // Make the move locally (optimistic update)
    const moveResult = chessGame.makeMove(move);
    
    if (moveResult) {
      // Send move to server
      socket.makeMove(roomId, move);
      
      // Clear highlights
      setHighlightedSquares({});
      setSelectedSquare(null);
      
      return true; // Move accepted
    }

    return false; // Snap back
  }, [isMyTurn, gameState.status, chessGame, socket, roomId]);

  /**
   * Handle square click (for mobile or click-to-move)
   */
  const onSquareClick = useCallback((square) => {
    // Only allow clicks during active game
    if (gameState.status !== 'playing' || !isMyTurn()) {
      return;
    }

    const piece = chessGame.getPiece(square);

    // If no piece is selected
    if (!selectedSquare) {
      // Check if clicked square has a piece of the player's color
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        
        // Highlight legal moves
        const legalMoves = chessGame.getLegalMoves(square);
        const highlights = {};
        legalMoves.forEach(move => {
          highlights[move] = {
            background: 'radial-gradient(circle, rgba(118, 150, 86, 0.5) 25%, transparent 25%)',
            borderRadius: '50%'
          };
        });
        setHighlightedSquares(highlights);
      }
    } else {
      // A piece is already selected, try to move
      if (square === selectedSquare) {
        // Deselect if clicking same square
        setSelectedSquare(null);
        setHighlightedSquares({});
      } else {
        // Try to make the move
        const move = {
          from: selectedSquare,
          to: square,
          promotion: 'q'
        };

        if (chessGame.isMoveLegal(move)) {
          const moveResult = chessGame.makeMove(move);
          if (moveResult) {
            socket.makeMove(roomId, move);
          }
        }

        // Clear selection
        setSelectedSquare(null);
        setHighlightedSquares({});
      }
    }
  }, [gameState.status, isMyTurn, selectedSquare, chessGame, playerColor, socket, roomId]);

  /**
   * Custom square styles for highlighting
   */
  const customSquareStyles = {
    ...highlightedSquares,
    ...(selectedSquare && {
      [selectedSquare]: {
        background: 'rgba(255, 255, 0, 0.4)'
      }
    })
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Info Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <GameInfo
            roomId={roomId}
            playerColor={playerColor}
            gameState={gameState}
            isConnected={socket.isConnected}
            onLeaveRoom={onLeaveRoom}
          />
        </div>

        {/* Chess Board */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="card">
            {/* Status Message */}
            <GameStatus
              message={gameState.message}
              status={gameState.status}
              isCheck={gameState.isCheck}
            />

            {/* Chessboard */}
            <div className="mt-6 mx-auto" style={{ maxWidth: '600px' }}>
              <Chessboard
                position={chessGame.position}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                customSquareStyles={customSquareStyles}
                boardWidth={600}
                animationDuration={200}
                arePiecesDraggable={gameState.status === 'playing' && isMyTurn()}
              />
            </div>

            {/* Turn Indicator */}
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                isMyTurn() && gameState.status === 'playing'
                  ? 'bg-green-600 animate-pulse'
                  : 'bg-gray-700'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  chessGame.getCurrentTurn() === 'w' ? 'bg-white' : 'bg-gray-900'
                }`} />
                <span className="font-bold">
                  {chessGame.getCurrentTurn() === 'w' ? "White's Turn" : "Black's Turn"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
