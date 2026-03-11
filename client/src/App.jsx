import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';

// Connect to local socket server
const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState('lobby'); // 'lobby' | 'game'
  const [roomId, setRoomId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);

  const handleJoined = useCallback((room, color) => {
    setRoomId(room);
    setPlayerColor(color);
    setGameState('game');
  }, []);

  const handleLeave = useCallback(() => {
    socket.emit('leave_room', roomId);
    setGameState('lobby');
    setRoomId(null);
    setPlayerColor(null);
  }, [roomId]);

  return (
    <>
      {gameState === 'lobby' ? (
        <Lobby socket={socket} onJoined={handleJoined} />
      ) : (
        <Game socket={socket} roomId={roomId} color={playerColor} onLeave={handleLeave} />
      )}
    </>
  );
}

export default App;
