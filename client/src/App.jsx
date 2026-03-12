import { useState } from 'react'
import ChessGame from './components/ChessGame'
import RoomSetup from './components/RoomSetup'

function App() {
  const [gameState, setGameState] = useState({
    isInRoom: false,
    roomId: null,
    playerColor: null
  });

  const handleJoinRoom = (roomId, color) => {
    setGameState({
      isInRoom: true,
      roomId,
      playerColor: color
    });
  };

  const handleLeaveRoom = () => {
    setGameState({
      isInRoom: false,
      roomId: null,
      playerColor: null
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-chess-secondary to-chess-accent bg-clip-text text-transparent">
          ♔ Web3 Chess DApp ♚
        </h1>
        
        {!gameState.isInRoom ? (
          <RoomSetup onJoinRoom={handleJoinRoom} />
        ) : (
          <ChessGame 
            roomId={gameState.roomId}
            playerColor={gameState.playerColor}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </div>
    </div>
  )
}

export default App
