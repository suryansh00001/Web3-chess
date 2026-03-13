import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, XCircle, Home, RotateCcw } from 'lucide-react';

const GameOverModal = ({ isVisible, result, winner, onRestart, onLeave }) => {
  if (!isVisible) return null;

  const isWin = winner && winner.toLowerCase() !== 'draw';
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={onLeave}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md glass-panel p-8 text-center space-y-8 overflow-hidden"
        >
          {/* Decorative Background Orb */}
          <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] -z-10 ${
            isWin ? 'bg-yellow-500/20' : 'bg-blue-500/20'
          }`} />

          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl transform rotate-3">
              {result === 'timeout' ? (
                <Clock className="w-12 h-12 text-blue-400" />
              ) : isWin ? (
                <Trophy className="w-12 h-12 text-yellow-500" />
              ) : (
                <XCircle className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <h2 className="text-4xl font-black outfit-font tracking-tight">
              {result === 'timeout' ? 'TIME UP!' : 'GAME OVER'}
            </h2>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">
              {result === 'checkmate' ? 'DEFEATED BY CHECKMATE' : result.toUpperCase()}
            </p>
          </div>

          <div className="py-6 border-y border-white/5">
            {winner ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-500 uppercase">Victor</p>
                <p className="text-3xl font-black text-white outfit-font underline decoration-blue-500 underline-offset-8">
                  {winner.toUpperCase()}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold outfit-font">STALEMATE</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={onRestart}
              className="btn-primary py-4 rounded-xl flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              NEW MATCH
            </button>
            <button
              onClick={onLeave}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              BACK TO BASE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameOverModal;
