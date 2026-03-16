import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ChessGame from './components/ChessGame'
import RoomSetup from './components/RoomSetup'
import Home from './components/Home'
import GameplayPage from './pages/GameplayPage'
import FeaturesPage from './pages/FeaturesPage'
import StatsPage from './pages/StatsPage'
import LearnMorePage from './pages/LearnMorePage'

// Wrapper for the chess game flow (home → setup → game)
function ChessApp() {
  const [appState, setAppState] = useState('home'); // 'home' | 'setup' | 'game'
  const [gameState, setGameState] = useState({
    roomId: null,
    playerColor: null
  });

  const handlePlayNow = () => setAppState('setup');
  
  const handleJoinRoom = (roomId, color) => {
    setGameState({ roomId, playerColor: color });
    setAppState('game');
  };

  const handleLeaveRoom = () => {
    setGameState({ roomId: null, playerColor: null });
    setAppState('setup');
  };

  const handleBackToHome = () => setAppState('home');

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans">
      <AnimatePresence mode="wait">
        
        {appState === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home onPlay={handlePlayNow} />
          </motion.div>
        )}

        {appState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-12 relative z-10"
          >
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
            
            <button 
              onClick={handleBackToHome}
              className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
            >
              ← Back to Home
            </button>
            
            <div className="mt-8">
              <RoomSetup onJoinRoom={handleJoinRoom} />
            </div>
          </motion.div>
        )}

        {appState === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8 relative z-10"
          >
             <ChessGame 
                roomId={gameState.roomId}
                playerColor={gameState.playerColor}
                onLeaveRoom={handleLeaveRoom}
              />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChessApp />} />
      <Route path="/gameplay" element={<GameplayPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/learn-more" element={<LearnMorePage />} />
    </Routes>
  )
}

export default App
