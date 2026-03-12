/**
 * GameInfo Component
 * 
 * Displays game information panel including:
 * - Room ID
 * - Player color
 * - Connection status
 * - Leave game button
 */

const GameInfo = ({ roomId, playerColor, gameState, isConnected, onLeaveRoom }) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // Could add a toast notification here
  };

  return (
    <div className="card h-full">
      <h3 className="text-2xl font-bold mb-6 text-gray-100">Game Info</h3>

      <div className="space-y-4">
        {/* Room ID */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 mb-1">Room ID</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-2xl font-mono font-bold text-chess-secondary tracking-wider">
              {roomId}
            </p>
            <button
              onClick={copyRoomId}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              title="Copy Room ID"
            >
              📋
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this ID with your opponent
          </p>
        </div>

        {/* Player Color */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 mb-2">You are playing</p>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full border-2 ${
              playerColor === 'w' 
                ? 'bg-white border-gray-300' 
                : 'bg-gray-900 border-gray-700'
            }`} />
            <p className="text-xl font-bold text-gray-100">
              {playerColor === 'w' ? 'White' : 'Black'}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Server</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">Opponent</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                gameState.opponentConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`} />
              <span className={`text-sm font-medium ${
                gameState.opponentConnected ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {gameState.opponentConnected ? 'Connected' : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 mb-2">Game Status</p>
          <p className="text-lg font-medium text-gray-100">
            {gameState.status === 'waiting' && '⏳ Waiting'}
            {gameState.status === 'playing' && '🎮 In Progress'}
            {gameState.status === 'finished' && '🏁 Finished'}
          </p>
        </div>

        {/* How to Play */}
        {gameState.status === 'waiting' && (
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700">
            <p className="text-sm text-blue-300">
              💡 <span className="font-bold">Tip:</span> Share the Room ID above with your 
              opponent so they can join your game!
            </p>
          </div>
        )}

        {/* Game Rules Reminder */}
        {gameState.status === 'playing' && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="font-bold text-gray-300">Controls:</span>
              <br />
              • Drag pieces to move
              <br />
              • Click piece then destination
              <br />
              • Only valid moves allowed
              <br />
              • Illegal moves snap back
            </p>
          </div>
        )}

        {/* Leave Game Button */}
        <button
          onClick={onLeaveRoom}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
        >
          ← Leave Game
        </button>
      </div>
    </div>
  );
};

export default GameInfo;
