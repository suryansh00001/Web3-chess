import { useState, useEffect, useRef } from 'react';

const ChessTimer = ({ initialTime, isActive, onTimeUp, label, color }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  // Sync with prop changes (e.g., when server sends a fresh sync)
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(timerRef.current);
            onTimeUp && onTimeUp();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 60000; // Less than 1 minute

  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      isActive 
        ? 'border-chess-secondary bg-chess-secondary/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
        : 'border-white/5 bg-white/5'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color === 'w' ? 'bg-white' : 'bg-gray-800 border border-gray-600'}`} />
            <p className="text-sm font-medium text-gray-200">{color === 'w' ? 'White' : 'Black'}</p>
          </div>
        </div>
        <div className={`text-3xl font-mono font-bold outfit-font ${
          isLowTime && isActive ? 'text-red-500 animate-pulse' : 'text-white'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};

export default ChessTimer;
