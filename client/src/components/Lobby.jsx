import React, { useState } from 'react';

export default function Lobby({ socket, onJoined }) {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // Listeners for lobby events
  React.useEffect(() => {
    socket.on('room_created', ({ roomId, color }) => {
      onJoined(roomId, color);
    });

    socket.on('room_joined', ({ roomId, color }) => {
      onJoined(roomId, color);
    });

    socket.on('error', (msg) => {
      setError(msg);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
    };
  }, [socket, onJoined]);

  const handleCreateRoom = () => {
    setError('');
    socket.emit('create_room');
  };

  const handleJoinRoom = () => {
    setError('');
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    socket.emit('join_room', joinCode.trim().toUpperCase());
  };

  return (
    <div className="lobby-container">
      <div className="glass-panel lobby-box">
        <h1>Web3 Chess</h1>
        <h2>Premium Decentralized Experience</h2>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <button className="btn" onClick={handleCreateRoom}>
          Create New Game
        </button>

        <div className="divider">or</div>

        <div className="input-group">
          <input 
            type="text" 
            placeholder="Enter Room Code" 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            maxLength={4}
            style={{ textTransform: 'uppercase' }}
          />
          <button className="btn btn-secondary" onClick={handleJoinRoom}>
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
