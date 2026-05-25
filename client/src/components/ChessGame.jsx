import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useSocket } from '../hooks/useSocket';
import { useChessGame } from '../hooks/useChessGame';
import GameStatus from './GameStatus';
import GameInfo from './GameInfo';
import ChessTimer from './ChessTimer';
import GameOverModal from './GameOverModal';

const ChessGame = ({ roomId, playerColor, onLeaveRoom }) => {
  // Custom hooks
  const socket = useSocket();
  const chessGame = useChessGame();
  const { position, updatePosition, isMoveLegal, makeMove, getPiece, getLegalMoves } = chessGame;

  // Local state
  const [gameState, setGameState] = useState({
    status: 'waiting', // 'waiting' | 'playing' | 'finished'
    message: 'Waiting for opponent to join...',
    opponentConnected: false,
    currentTurn: 'w',
    isCheck: false,
    gameResult: null,
    timers: { w: 600000, b: 600000 }
  });

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState({});

  /**
   * Check if it's the current player's turn
   */
  const isMyTurn = useCallback(() => {
    return gameState.currentTurn === playerColor;
  }, [gameState.currentTurn, playerColor]);

  /**
   * Handle game start event from server
   */
  useEffect(() => {
    const unsubscribe = socket.onGameStart(roomId, (data) => {
      setGameState({
        status: 'playing',
        message: `Game Started! You are playing ${playerColor === 'w' ? 'White' : 'Black'}.`,
        opponentConnected: true,
        currentTurn: data.currentTurn,
        isCheck: false,
        gameResult: null,
        timers: data.timers || { w: 600000, b: 600000 }
      });
      
      // Update board position
      updatePosition(data.fen);
    });

    return unsubscribe;
  }, [socket, roomId, updatePosition, playerColor]);

  /**
   * Handle move made event from server
   */
  useEffect(() => {
    const unsubscribe = socket.onMoveMade(roomId, (data) => {
      updatePosition(data.fen);

      const newGameState = {
        status: data.gameOver.isOver ? 'finished' : 'playing',
        opponentConnected: true,
        currentTurn: data.currentTurn,
        isCheck: data.isCheck,
        gameResult: data.gameOver.isOver ? data.gameOver : null,
        timers: data.timers
      };

      if (data.gameOver.isOver) {
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
        const checkedPlayer = data.currentTurn === 'w' ? 'White' : 'Black';
        newGameState.message = `Check! ${checkedPlayer} is in check!`;
      } else {
        const currentPlayer = data.currentTurn === playerColor;
        newGameState.message = currentPlayer ? "It's your turn!" : "Opponent's turn...";
      }

      setGameState(newGameState);
      setHighlightedSquares({});
      setSelectedSquare(null);
    });

    return unsubscribe;
  }, [socket, roomId, updatePosition, playerColor]);

  /**
   * Handle time up event
   */
  useEffect(() => {
    const unsubscribe = socket.onTimeUp(roomId, (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        gameResult: data,
        message: `Time Up! ${data.winner} wins by timeout! ⏱️`,
        timers: data.timers
      }));
    });

    return unsubscribe;
  }, [socket, roomId]);

  /**
   * Handle invalid move
   */
  useEffect(() => {
    const unsubscribe = socket.onInvalidMove(roomId, (data) => {
      if (data.fen) {
        updatePosition(data.fen);
      }
      setGameState(prev => ({
        ...prev,
        message: `Invalid move: ${data.message}`,
        timers: data.timers || prev.timers
      }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          message: isMyTurn() ? "It's your turn!" : "Opponent's turn..."
        }));
      }, 2000);
    });

    return unsubscribe;
  }, [socket, roomId, updatePosition, isMyTurn]);

  /**
   * Handle generic backend errors
   */
  useEffect(() => {
    const unsubscribe = socket.onError((data) => {
      setGameState((prev) => ({
        ...prev,
        message: data?.message || 'An unexpected error occurred.'
      }));
    });

    return unsubscribe;
  }, [socket]);

  /**
   * Handle player disconnected
   */
  useEffect(() => {
    const unsubscribe = socket.onPlayerDisconnected(roomId, (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        message: 'Opponent disconnected. Game ended.',
        opponentConnected: false
      }));
    });

    return unsubscribe;
  }, [socket, roomId]);

  /**
   * Fetch game state on mount (for recon)
   */
  useEffect(() => {
    socket.getGameState(roomId, (data) => {
        updatePosition(data.fen);
        
      const isOver = data.gameOver?.isOver;
      const isWaiting = data.status === 'waiting';
        
        setGameState(prev => ({
            ...prev,
        // Do not downgrade from live play due a potentially stale initial fetch.
        status: prev.status === 'playing' && isWaiting ? 'playing' : (isWaiting ? 'waiting' : (isOver ? 'finished' : 'playing')),
        opponentConnected: prev.status === 'playing' && isWaiting ? true : !isWaiting,
            currentTurn: data.currentTurn,
            isCheck: data.isCheck,
            gameResult: data.gameOver || null,
            timers: data.timers || prev.timers,
        message: prev.status === 'playing' && isWaiting
          ? prev.message
          : isWaiting
          ? 'Waiting for opponent to join...'
          : isOver 
                ? `Game Over: ${data.gameOver.result === 'checkmate' ? `Checkmate! ${data.gameOver.winner} wins!` : data.gameOver.result}`
                : (data.currentTurn === playerColor ? "It's your turn!" : "Opponent's turn...")
        }));
    });
    // Only run once on mount to establish baseline state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket, playerColor, updatePosition]);

  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    if (!isMyTurn() || gameState.status !== 'playing') return false;

    const move = { from: sourceSquare, to: targetSquare, promotion: 'q' };
    if (!isMoveLegal(move)) return false;

    const moveResult = makeMove(move);
    if (moveResult) {
      socket.makeMove(roomId, move);
      setHighlightedSquares({});
      setSelectedSquare(null);
      return true;
    }
    return false;
  }, [isMyTurn, gameState.status, isMoveLegal, makeMove, socket, roomId]);

  const onSquareClick = useCallback((square) => {
    if (gameState.status !== 'playing' || !isMyTurn()) return;
    const piece = getPiece(square);

    if (!selectedSquare) {
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        const legalMoves = getLegalMoves(square);
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
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setHighlightedSquares({});
      } else {
        const move = { from: selectedSquare, to: square, promotion: 'q' };
        if (isMoveLegal(move)) {
          const moveResult = makeMove(move);
          if (moveResult) socket.makeMove(roomId, move);
        }
        setSelectedSquare(null);
        setHighlightedSquares({});
      }
    }
  }, [gameState.status, isMyTurn, selectedSquare, getPiece, playerColor, getLegalMoves, isMoveLegal, makeMove, socket, roomId]);

  const customSquareStyles = {
    ...highlightedSquares,
    ...(selectedSquare && { [selectedSquare]: { background: 'rgba(255, 255, 0, 0.4)' } })
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Game Over Modal */}
      <GameOverModal 
        isVisible={gameState.status === 'finished'}
        result={gameState.gameResult?.result || 'finished'}
        winner={gameState.gameResult?.winner || (gameState.message.includes('Opponent disconnected') ? 'SYSTEM' : null)}
        onRestart={() => window.location.reload()}
        onLeave={onLeaveRoom}
        roomId={roomId}
        fen={position}
        moveCount={gameState.moveCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Player Timers and Game Action */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <ChessTimer 
                label="Opponent"
                color={playerColor === 'w' ? 'b' : 'w'}
                initialTime={playerColor === 'w' ? gameState.timers.b : gameState.timers.w}
                isActive={gameState.status === 'playing' && !isMyTurn()}
            />
            
            <GameInfo
                roomId={roomId}
                playerColor={playerColor}
                gameState={gameState}
                isConnected={socket.isConnected}
                onLeaveRoom={onLeaveRoom}
            />

            <ChessTimer 
                label="You"
                color={playerColor}
                initialTime={playerColor === 'w' ? gameState.timers.w : gameState.timers.b}
                isActive={gameState.status === 'playing' && isMyTurn()}
            />
        </div>

        {/* Center/Right: Chess Board */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="glass-panel p-8">
            <GameStatus
              message={gameState.message}
              status={gameState.status}
              isCheck={gameState.isCheck}
            />

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-[650px] shadow-2xl rounded-lg overflow-hidden border-8 border-white/5">
                <Chessboard
                  position={position}
                  onPieceDrop={onPieceDrop}
                  onSquareClick={onSquareClick}
                  boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                  customSquareStyles={customSquareStyles}
                  animationDuration={300}
                  arePiecesDraggable={gameState.status === 'playing' && isMyTurn()}
                  customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
                  customLightSquareStyle={{ backgroundColor: '#475569' }}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                <div className={`px-8 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 ${
                     gameState.status === 'playing' && isMyTurn() 
                        ? 'bg-blue-600/20 border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110' 
                        : 'bg-white/5 border border-white/10 opacity-50'
                }`}>
                    <div className={`w-3 h-3 rounded-full ${isMyTurn() ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="font-bold outfit-font tracking-wide">
                        {isMyTurn() ? "THINKING..." : "WAITING FOR OPPONENT"}
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
