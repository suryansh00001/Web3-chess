import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Game({ socket, roomId, color, onLeave }) {
  console.log('⚡ Game render - props:', { roomId, color, socketConnected: socket.connected });
  
  const [game, setGame] = useState(new Chess());
  const [status, setStatus] = useState(
    color === 'black' ? "White's turn" : 'Waiting for opponent...'
  );
  const [opponentConnected, setOpponentConnected] = useState(color === 'black');
  
  // Clocks state (in seconds)
  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  // Refs to avoid stale closures in onDrop and clock intervals
  const gameRef = useRef(game);
  const oppConnectedRef = useRef(opponentConnected);
  const myColorRef = useRef(color);
  
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    oppConnectedRef.current = opponentConnected;
  }, [opponentConnected]);

  // Timer logic
  useEffect(() => {
    if (!opponentConnected) return;

    const interval = setInterval(() => {
      const currentGame = gameRef.current;
      if (currentGame.isGameOver()) return;
      
      if (currentGame.turn() === 'w') {
        setWhiteTime((prev) => Math.max(0, prev - 1));
      } else {
        setBlackTime((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [opponentConnected]); // Remove 'game' dependency!

  // Sync clocks via socket
  useEffect(() => {
    const handleGameStart = (data) => {
      setOpponentConnected(true);
      if (data && data.fen) {
        setGame(new Chess(data.fen));
      }
      setStatus("Game started!");
    };

    const handleOpponentMoved = (move) => {
      setGame((prevGame) => {
        const gameCopy = new Chess(prevGame.fen());
        try {
          gameCopy.move(move);
          updateStatus(gameCopy, true);
          return gameCopy;
        } catch(e) {
          console.error("Invalid move received", e);
          return prevGame;
        }
      });
    };

    const handleDisconnect = (msg) => {
      setOpponentConnected(false);
      setStatus(msg);
    };

    socket.on('game_start', handleGameStart);
    socket.on('opponent_moved', handleOpponentMoved);
    socket.on('opponent_disconnected', handleDisconnect);

    return () => {
      socket.off('game_start', handleGameStart);
      socket.off('opponent_moved', handleOpponentMoved);
      socket.off('opponent_disconnected', handleDisconnect);
    };
  }, [socket]);

  const updateStatus = (gameInstance, oppConnected) => {
    if (!oppConnected) {
      setStatus('Waiting for opponent...');
      return;
    }

    if (gameInstance.isCheckmate()) {
      setStatus(`Checkmate! ${gameInstance.turn() === 'w' ? 'Black' : 'White'} wins.`);
    } else if (gameInstance.isDraw()) {
      setStatus('Draw!');
    } else {
      const turnColor = gameInstance.turn() === 'w' ? 'White' : 'Black';
      setStatus(`${turnColor}'s turn ${gameInstance.isCheck() ? '(Check)' : ''}`);
    }
  };

  function onDrop({ sourceSquare, targetSquare }) {
    alert('Drop fired! ' + sourceSquare + ' to ' + targetSquare);
    console.log('🎯 onDrop called:', { sourceSquare, targetSquare });
    console.log('🔍 Debug:', { 
      opponentConnected: oppConnectedRef.current, 
      myColor: myColorRef.current,
      currentTurn: gameRef.current.turn(),
      myTurnChar: myColorRef.current?.charAt(0)
    });
    
    // Read from REF to bypass any React stale closures
    if (!oppConnectedRef.current) {
      console.log('❌ Opponent not connected');
      return false;
    }
    
    const currentGame = gameRef.current;
    if (currentGame.turn() !== myColorRef.current.charAt(0)) {
      console.log('❌ Not your turn');
      return false;
    }

    const gameCopy = new Chess(currentGame.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      if (move === null) {
        console.log('❌ Invalid move (null)');
        return false;
      }

      console.log('✅ Move successful:', move);
      setGame(gameCopy);
      updateStatus(gameCopy, true);
      
      socket.emit('move', { roomId, move });
      return true;
    } catch (e) {
      console.log('❌ Move error:', e);
      return false;
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={onLeave}>
          Leave Game
        </button>
        <div className="room-badge">Room: {roomId}</div>
        <div className="room-badge" style={{ color: color === 'white'? '#f8fafc' : '#94a3b8' }}>
          Playing as {color}
        </div>
      </div>
      
      <div className="board-container">
        <div className="board-wrapper" style={{ position: 'relative' }}>
          {/* Opponent Clock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Opponent ({color === 'white' ? 'Black' : 'White'})</span>
            <span className="room-badge" style={{ padding: '0.2rem 0.8rem', fontSize: '1rem', background: 'var(--accent-blue)' }}>
              {color === 'white' ? formatTime(blackTime) : formatTime(whiteTime)}
            </span>
          </div>

          <button 
            onClick={() => alert('Button above board clicked!')} 
            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            TEST: Click me to verify clicks work
          </button>

          <Chessboard 
            id="BasicBoard" 
            position={game.fen()} 
            onPieceDrop={onDrop}
            onPieceDragBegin={(piece, sourceSquare) => {
              console.log('🟢 Drag BEGIN:', { piece, sourceSquare });
            }}
            onPieceDragEnd={(piece, sourceSquare) => {
              console.log('🔴 Drag END:', { piece, sourceSquare });
            }}
            onSquareClick={(square) => {
              console.log('🔵 Square clicked:', square);
            }}
            boardOrientation={color}
            arePiecesDraggable={true}
            customDarkSquareStyle={{ backgroundColor: '#475569' }}
            customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          />
          
          {/* My Clock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>You ({color})</span>
            <span className="room-badge" style={{ padding: '0.2rem 0.8rem', fontSize: '1rem', background: 'var(--accent-purple)' }}>
              {color === 'white' ? formatTime(whiteTime) : formatTime(blackTime)}
            </span>
          </div>

          <div className="status-text">{status}</div>
        </div>
      </div>
    </div>
  );
}
