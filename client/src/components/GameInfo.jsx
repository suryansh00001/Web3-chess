import { Copy, Check, LogOut, Info, ShieldCheck, Globe } from 'lucide-react';
import { useState } from 'react';

const GameInfo = ({ roomId, playerColor, gameState, isConnected, onLeaveRoom }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-black outfit-font tracking-tight">ARENA STATS</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isConnected ? 'NODE: ONLINE' : 'NODE: ERROR'}
            </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Arena ID */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/20 transition-colors group">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Arena ID</p>
            <button
              onClick={copyRoomId}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Copy ID"
            >
              {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-2xl font-black outfit-font text-blue-400 tracking-[0.1em]">
            {roomId}
          </p>
        </div>

        {/* Player Identity */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Identity</p>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-lg ${
              playerColor === 'w' 
                ? 'bg-white border-gray-200 text-slate-900' 
                : 'bg-slate-900 border-slate-700 text-white'
            }`}>
              <span className="font-bold">{playerColor?.toUpperCase()}</span>
            </div>
            <div>
                <p className="text-sm font-bold">{playerColor === 'w' ? 'WHITE FORCES' : 'BLACK FORCES'}</p>
                <p className="text-[10px] text-gray-500 font-medium">Player 01</p>
            </div>
          </div>
        </div>

        {/* System Monitoring */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400/50" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">VAC</span>
            </div>
            <span className="text-[10px] font-bold text-green-500/80">PROTECTED</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400/50" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Region</span>
            </div>
            <span className="text-[10px] font-bold text-gray-300">GLOBAL-IX</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onLeaveRoom}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          ABORT MISSION
        </button>
      </div>
    </div>
  );
};

export default GameInfo;
