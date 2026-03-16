import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Trophy, TrendingUp, Users, Zap, Globe, ArrowLeft, ChevronRight } from 'lucide-react';

const StatsPage = () => {
  const globalStats = [
    { label: 'Active Players', value: '10,000+', icon: <Users className="w-6 h-6 text-blue-400" />, color: 'blue' },
    { label: 'Games Played', value: '250,000+', icon: <Trophy className="w-6 h-6 text-yellow-400" />, color: 'yellow' },
    { label: 'Avg Latency', value: '< 2ms', icon: <Zap className="w-6 h-6 text-green-400" />, color: 'green' },
    { label: 'Countries', value: '100+', icon: <Globe className="w-6 h-6 text-purple-400" />, color: 'purple' },
    { label: 'Uptime', value: '99.9%', icon: <TrendingUp className="w-6 h-6 text-cyan-400" />, color: 'cyan' },
    { label: 'Peak Concurrent', value: '1,200', icon: <Users className="w-6 h-6 text-pink-400" />, color: 'pink' },
  ];

  const leaderboard = [
    { rank: 1, name: 'MagnusByte', wins: 842, elo: 2850, flag: '🇳🇴' },
    { rank: 2, name: 'CryptoKnight', wins: 791, elo: 2740, flag: '🇺🇸' },
    { rank: 3, name: 'BlockchainBishop', wins: 763, elo: 2710, flag: '🇷🇺' },
    { rank: 4, name: 'SatoshiRook', wins: 698, elo: 2680, flag: '🇯🇵' },
    { rank: 5, name: 'DeFiQueenGambit', wins: 651, elo: 2650, flag: '🇰🇷' },
    { rank: 6, name: 'Web3Pawn', wins: 612, elo: 2620, flag: '🇩🇪' },
    { rank: 7, name: 'SmartContractKing', wins: 589, elo: 2590, flag: '🇬🇧' },
    { rank: 8, name: 'NakamotoGambit', wins: 564, elo: 2570, flag: '🇧🇷' },
  ];

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

  const activityData = [
    { day: 'Mon', games: 3200 },
    { day: 'Tue', games: 4100 },
    { day: 'Wed', games: 3800 },
    { day: 'Thu', games: 4600 },
    { day: 'Fri', games: 5200 },
    { day: 'Sat', games: 7800 },
    { day: 'Sun', games: 6900 },
  ];

  const maxGames = Math.max(...activityData.map(d => d.games));

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-yellow-600/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />

      {/* Nav */}
      <header className="relative z-20 container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter outfit-font italic">PROCHESS</span>
        </div>
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 space-y-20">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest">
            Platform Statistics
          </span>
          <h1 className="text-6xl md:text-7xl font-black outfit-font tracking-tight leading-none">
            LIVE <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">LEADERBOARD</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Real-time data from across the PROCHESS global network. Updated every minute.
          </p>
        </motion.div>

        {/* Global Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {globalStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="glass-panel p-5 text-center space-y-3"
            >
              <div className="mx-auto w-fit p-2 bg-white/5 rounded-xl">{stat.icon}</div>
              <p className="text-2xl font-black outfit-font">{stat.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="glass-panel p-8"
        >
          <h2 className="text-2xl font-black outfit-font mb-8">Weekly Activity</h2>
          <div className="flex items-end gap-3 h-40">
            {activityData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.games / maxGames) * 100}%` }}
                  transition={{ delay: 0.05 * i, duration: 0.8, ease: 'easeOut' }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-400/60 border-t-2 border-blue-400/50"
                  style={{ minHeight: '8px' }}
                />
                <p className="text-[10px] font-bold text-gray-500 uppercase">{d.day}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <h2 className="text-3xl font-black outfit-font mb-8">Top Players</h2>
          <div className="glass-panel overflow-hidden">
            <div className="grid grid-cols-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-center">Wins</span>
              <span className="text-right">ELO</span>
            </div>
            {leaderboard.map((player, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.07 * i }}
                className={`grid grid-cols-4 px-6 py-4 items-center hover:bg-white/5 transition-colors ${i !== leaderboard.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <span className={`text-xl font-black outfit-font ${rankColors[i] || 'text-gray-400'}`}>
                  #{player.rank}
                </span>
                <span className="font-bold flex items-center gap-2">
                  <span>{player.flag}</span>
                  <span className="text-sm">{player.name}</span>
                </span>
                <span className="text-center text-sm text-gray-300">{player.wins.toLocaleString()}</span>
                <span className="text-right font-bold text-blue-400">{player.elo}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <button className="btn-primary group px-10 py-5 text-lg rounded-2xl inline-flex items-center gap-3">
              Join the Rankings
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default StatsPage;
