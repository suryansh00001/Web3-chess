import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useWallet } from '../hooks/useWallet';
import { Plus, Users, ArrowLeft, RefreshCw, Copy, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RoomSetup = ({ onJoinRoom }) => {
  const socket = useSocket();
    const wallet = useWallet();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [roomInput, setRoomInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateRoom = () => {
        if (!socket.isConnected) {
            setError('Not connected to Firebase. Please refresh.');
            return;
        }
        setIsLoading(true);
        setError('');
        (async () => {
            try {
                const data = await socket.createRoom();
                setIsLoading(false);
                onJoinRoom(data.roomId, data.color);
            } catch (err) {
                setIsLoading(false);
                setError(err?.message || 'Failed to create room');
            }
        })();
  };

  const handleJoinRoom = () => {
    if (!socket.isConnected) {
            setError('Not connected to Firebase. Please refresh.');
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
        onJoinRoom(data.roomId, data.color);
      },
      (errorMessage) => {
        setIsLoading(false);
        setError(errorMessage);
      }
    );
  };

  const handleBack = () => {
    setMode(null);
    setRoomInput('');
    setError('');
  };

  if (!socket.isConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="glass-panel p-12 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <RefreshCw className="w-20 h-20 text-blue-400 animate-spin relative z-10" />
          </div>
          <p className="text-xl font-bold outfit-font text-gray-300">Establishing Connection...</p>
                    {socket.error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                            {socket.error}
                        </p>
                    )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
            {!mode ? (
                <motion.div 
                    key="mode-select"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-panel p-12 space-y-10"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black outfit-font tracking-tight">GAME LOBBY</h2>
                        <p className="text-gray-400 font-light">Create a new arena or join an existing battle</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            {wallet.address ? (
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
                                    {wallet.address.slice(0,6)}...{wallet.address.slice(-4)}
                                </div>
                            ) : (
                                <button onClick={async ()=>{ try { await wallet.connect(); } catch(e){ console.error(e); } }} className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold">Connect Wallet</button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setMode('create')}
                            className="glass-card hover:bg-white/5 p-8 flex flex-col items-center gap-4 group transition-all"
                        >
                            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                                <Plus className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold outfit-font">Create Game</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Host a new match</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            className="glass-card hover:bg-white/5 p-8 flex flex-col items-center gap-4 group transition-all"
                        >
                            <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                                <Users className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold outfit-font">Join Game</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Enter Room ID</p>
                            </div>
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-panel p-12 relative"
                >
                    <button
                        onClick={handleBack}
                        className="absolute top-8 left-8 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-6 pt-4">
                        <h2 className="text-4xl font-black outfit-font tracking-tight">
                            {mode === 'create' ? 'CREATE ARENA' : 'ENTER ARENA'}
                        </h2>
                        
                        {mode === 'create' ? (
                            <div className="space-y-8">
                                <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-left space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                        <p className="text-gray-300 leading-relaxed">
                                            Generating a secure room on the Web3 Chess network. You will be assigned a random color.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4 text-sm text-gray-400">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        <span>Standard 10-minute rapid clock will be applied.</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleCreateRoom}
                                    disabled={isLoading}
                                    className="btn-primary w-full py-5 text-xl rounded-2xl"
                                >
                                    {isLoading ? 'INITIATING...' : 'GENERATE ROOM'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Arena ID</label>
                                    <input
                                        type="text"
                                        value={roomInput}
                                        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                        onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                                        placeholder="E.G. XJ7A21"
                                        maxLength={6}
                                        className="input-field text-center text-4xl font-black outfit-font tracking-[0.3em] h-24"
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleJoinRoom}
                                    disabled={isLoading || !roomInput.trim()}
                                    className="btn-primary w-full py-5 text-xl rounded-2xl"
                                >
                                    {isLoading ? 'JOINING...' : 'JOIN ARENA'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};


export default RoomSetup;
