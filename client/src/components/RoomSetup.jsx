/**
 * RoomSetup Component
 * 
 * Allows users to:
 * - Create a new game room
 * - Join an existing room by entering a room ID
 * 
 * This is the entry point before the chess game starts.
 */

import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const RoomSetup = ({ onJoinRoom }) => {
  const socket = useSocket();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [roomInput, setRoomInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle creating a new room
   */
  const handleCreateRoom = () => {
    if (!socket.isConnected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.createRoom((data) => {
      setIsLoading(false);
      console.log('Room created successfully:', data);
      onJoinRoom(data.roomId, data.color);
    });
  };

  /**
   * Handle joining an existing room
   */
  const handleJoinRoom = () => {
    if (!socket.isConnected) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    if (!roomInput.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsLoading(true);
    setError('');

    socket.joinRoom(
      roomInput.trim().toUpperCase(),
      (data) => {
        setIsLoading(false);
        console.log('Joined room successfully:', data);
        onJoinRoom(data.roomId, data.color);
      },
      (errorMessage) => {
        setIsLoading(false);
        setError(errorMessage);
      }
    );
  };

  /**
   * Reset to mode selection
   */
  const handleBack = () => {
    setMode(null);
    setRoomInput('');
    setError('');
  };

  // Show connection status
  if (!socket.isConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-chess-secondary border-t-transparent rounded-full" />
            <p className="text-xl text-gray-300">Connecting to server...</p>
            {socket.error && (
              <p className="text-red-400 text-sm">{socket.error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">
            Choose Game Mode
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode('create')}
              className="btn-primary text-lg py-4"
            >
              🎮 Create New Game
            </button>

            <button
              onClick={() => setMode('join')}
              className="btn-secondary text-lg py-4"
            >
              🔗 Join Existing Game
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300 text-center">
              <span className="font-bold">How to play:</span>
              <br />
              Create a room to get a unique Room ID, then share it with your opponent.
              Or join a friend's game using their Room ID.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Create room screen
  if (mode === 'create') {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
            Create New Game
          </h2>

          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-600">
              <p className="text-gray-300 mb-4">
                Click the button below to create a new game room. You'll receive a unique 
                <span className="font-bold text-chess-secondary"> Room ID</span> that you can share with your opponent.
              </p>
              <p className="text-sm text-gray-400">
                💡 You will be randomly assigned White or Black
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Creating Room...
                </span>
              ) : (
                '🎮 Create Room'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join room screen
  if (mode === 'join') {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">
            Join Game
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">
                Enter Room ID
              </label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="input-field text-center text-2xl tracking-wider uppercase"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-400 mt-2 text-center">
                Room IDs are 6 characters long
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomInput.trim()}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Joining Room...
                </span>
              ) : (
                '🔗 Join Room'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RoomSetup;
