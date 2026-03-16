import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Swords, Clock, Users, ChevronRight, ArrowLeft, Zap, Shield, Brain } from 'lucide-react';

const GameplayPage = () => {
  const modes = [
    {
      icon: <Swords className="w-8 h-8 text-blue-400" />,
      title: 'Classic Match',
      desc: 'The traditional chess experience. Two players, one board, infinite strategy. Standard FIDE rules apply.',
      badge: 'Available',
      badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      icon: <Clock className="w-8 h-8 text-yellow-400" />,
      title: 'Blitz & Bullet',
      desc: 'Race the clock. Modes from 1-minute bullet to 10-minute blitz. Fast decisions, maximum adrenaline.',
      badge: 'Available',
      badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: 'Private Room',
      desc: 'Create a private arena and challenge a friend. Share your room ID and battle head-to-head.',
      badge: 'Available',
      badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      icon: <Brain className="w-8 h-8 text-orange-400" />,
      title: 'AI Opponent',
      desc: 'Train against an intelligent AI. Multiple difficulty levels to sharpen your skills and tactics.',
      badge: 'Coming Soon',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
  ];

  const rules = [
    { step: '01', title: 'Create or Join a Room', desc: 'Generate a unique room ID or enter one shared by your opponent.' },
    { step: '02', title: 'Choose Your Side', desc: 'White moves first. Sides are assigned automatically for fairness.' },
    { step: '03', title: 'Play & Strategize', desc: 'Drag and drop pieces on the live board. Move syncs in real-time.' },
    { step: '04', title: 'Win by Checkmate', desc: 'Trap the enemy king. Standard chess win conditions apply.' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

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

      <main className="relative z-10 container mx-auto px-6 py-12 space-y-24">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            Game Modes & Rules
          </span>
          <h1 className="text-6xl md:text-7xl font-black outfit-font tracking-tight leading-none">
            HOW TO <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">PLAY</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            PROCHESS offers multiple game modes built on real-time WebSocket communication. Every move is synced instantly across the globe.
          </p>
        </motion.div>

        {/* Game Modes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-black outfit-font text-center mb-10">Game Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-panel p-6 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-xl">{mode.icon}</div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${mode.badgeColor}`}>
                    {mode.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rules flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-black outfit-font text-center mb-10">How a Match Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rules.map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i }}
                className="glass-panel p-6 text-center space-y-3 relative"
              >
                <p className="text-5xl font-black outfit-font text-white/5 absolute top-4 right-4">{rule.step}</p>
                <p className="text-4xl font-black outfit-font text-blue-400/50">{rule.step}</p>
                <h3 className="text-lg font-bold">{rule.title}</h3>
                <p className="text-gray-400 text-sm">{rule.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <button className="btn-primary group px-10 py-5 text-lg rounded-2xl inline-flex items-center gap-3">
              Start Playing Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default GameplayPage;
