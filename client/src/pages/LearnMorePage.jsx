import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Layers, ArrowLeft, ChevronRight, GitBranch, Coins, Code2, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

const LearnMorePage = () => {
  const phases = [
    {
      phase: 'Phase 01',
      title: 'Core Platform',
      status: 'Live',
      statusColor: 'text-green-400 bg-green-500/10 border-green-500/20',
      items: [
        'Real-time multiplayer chess via WebSockets',
        'Server-side move validation (anti-cheat)',
        'Private room creation & joining',
        'Chess timers (Blitz / Bullet modes)',
        'Premium glassmorphism UI',
      ],
    },
    {
      phase: 'Phase 02',
      title: 'Web3 Integration',
      status: 'In Progress',
      statusColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      items: [
        'Wallet connect (MetaMask / WalletConnect)',
        'On-chain game result recording',
        'Token staking for matched bets',
        'NFT reward system for ranked wins',
        'Smart contract escrow for tournaments',
      ],
    },
    {
      phase: 'Phase 03',
      title: 'Ecosystem Expansion',
      status: 'Planned',
      statusColor: 'text-gray-400 bg-white/5 border-white/10',
      items: [
        'AI opponent with difficulty levels',
        'Tournament brackets & prize pools',
        'Chess analytics & game review tools',
        'Mobile app (React Native)',
        'DAO governance for platform decisions',
      ],
    },
  ];

  const whyCards = [
    {
      icon: <Code2 className="w-6 h-6 text-blue-400" />,
      title: 'Open Architecture',
      desc: 'Built with React, Node.js, and Socket.IO — open, auditable, and extensible.',
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-400" />,
      title: 'Truly Decentralized',
      desc: 'No central entity controls your wins, payments, or game history once on-chain.',
    },
    {
      icon: <Coins className="w-6 h-6 text-yellow-400" />,
      title: 'Play-to-Earn Ready',
      desc: 'Designed from the ground up to support token rewards and staking mechanics.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-400" />,
      title: 'Premium Experience',
      desc: 'Chess should be beautiful. Every pixel is crafted for an unforgettable experience.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]" />

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
            Vision & Roadmap
          </span>
          <h1 className="text-6xl md:text-7xl font-black outfit-font tracking-tight leading-none">
            THE FUTURE OF <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">CHESS</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            PROCHESS is more than a game. It's a decentralized platform where grandmasters and casual players share the same borderless arena.
          </p>
        </motion.div>

        {/* Why PROCHESS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-black outfit-font text-center mb-10">Why PROCHESS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-panel p-6 space-y-3 hover:border-blue-500/30 transition-all"
              >
                <div className="p-3 bg-white/5 rounded-xl w-fit">{card.icon}</div>
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-black outfit-font text-center mb-10 flex items-center justify-center gap-3">
            <GitBranch className="w-7 h-7 text-blue-400" />
            Development Roadmap
          </h2>
          <div className="space-y-6">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="glass-panel p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{phase.phase}</p>
                    <h3 className="text-2xl font-black outfit-font">{phase.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-4 py-2 rounded-full border w-fit ${phase.statusColor}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${phase.status === 'Live' ? 'text-green-400' : phase.status === 'In Progress' ? 'text-yellow-400' : 'text-gray-600'}`} />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-10 text-center max-w-3xl mx-auto"
        >
          <Layers className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black outfit-font mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            To make competitive chess truly <span className="text-white font-bold">open, fair, and rewarding</span> by combining institutional-grade real-time infrastructure with the transparency and autonomy of Web3. Every player, regardless of location, deserves a level playing field.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <button className="btn-primary group px-10 py-5 text-lg rounded-2xl inline-flex items-center gap-3">
              Begin Your Journey
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default LearnMorePage;
