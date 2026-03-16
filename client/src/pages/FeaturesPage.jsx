import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Zap, Shield, Globe, Lock, Cpu, Radio, ChevronRight, ArrowLeft, Eye, Trophy } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: <Radio className="w-7 h-7 text-green-400" />,
      title: 'Real-Time Sync',
      desc: 'Every move is transmitted via WebSockets with sub-10ms latency. Experience chess that feels truly live.',
      glow: 'group-hover:shadow-green-500/10',
      accentBorder: 'group-hover:border-green-500/30',
    },
    {
      icon: <Shield className="w-7 h-7 text-blue-400" />,
      title: 'Anti-Cheat Engine',
      desc: 'Server-side move validation using chess.js ensures every move is legal. No external engines can interfere.',
      glow: 'group-hover:shadow-blue-500/10',
      accentBorder: 'group-hover:border-blue-500/30',
    },
    {
      icon: <Zap className="w-7 h-7 text-yellow-400" />,
      title: 'Ultra-Low Latency',
      desc: 'Optimized Node.js backend with Socket.IO ensures your moves arrive at your opponent instantly.',
      glow: 'group-hover:shadow-yellow-500/10',
      accentBorder: 'group-hover:border-yellow-500/30',
    },
    {
      icon: <Lock className="w-7 h-7 text-purple-400" />,
      title: 'Private Rooms',
      desc: 'Generate a unique encrypted room ID and share it only with who you want. Full control over your game.',
      glow: 'group-hover:shadow-purple-500/10',
      accentBorder: 'group-hover:border-purple-500/30',
    },
    {
      icon: <Globe className="w-7 h-7 text-cyan-400" />,
      title: 'Global Network',
      desc: 'Play from anywhere in the world. Cross-region matches work seamlessly with our global relay system.',
      glow: 'group-hover:shadow-cyan-500/10',
      accentBorder: 'group-hover:border-cyan-500/30',
    },
    {
      icon: <Eye className="w-7 h-7 text-pink-400" />,
      title: 'Premium UI',
      desc: 'A breathtaking dark interface with glass-morphism, smooth animations, and a responsive layout for all devices.',
      glow: 'group-hover:shadow-pink-500/10',
      accentBorder: 'group-hover:border-pink-500/30',
    },
    {
      icon: <Cpu className="w-7 h-7 text-orange-400" />,
      title: 'Web3 Layer',
      desc: 'Designed to integrate with blockchain for on-chain game records, NFT rewards, and token staking.',
      glow: 'group-hover:shadow-orange-500/10',
      accentBorder: 'group-hover:border-orange-500/30',
    },
    {
      icon: <Trophy className="w-7 h-7 text-amber-400" />,
      title: 'Ranked System',
      desc: 'Compete in ranked leagues from Novice to Grandmaster. Climb the ladder and prove your dominance.',
      glow: 'group-hover:shadow-amber-500/10',
      accentBorder: 'group-hover:border-amber-500/30',
    },
  ];

  const techStack = [
    { label: 'Frontend', value: 'React + Vite + Framer Motion' },
    { label: 'Styling', value: 'Tailwind CSS + Custom Design System' },
    { label: 'Backend', value: 'Node.js + Express + Socket.IO' },
    { label: 'Game Engine', value: 'chess.js (FIDE-rules compliant)' },
    { label: 'Board', value: 'react-chessboard' },
    { label: 'Web3 Layer', value: 'Ethereum / EVM Compatible (planned)' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />

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
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            Platform Features
          </span>
          <h1 className="text-6xl md:text-7xl font-black outfit-font tracking-tight leading-none">
            BUILT FOR <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">EXCELLENCE</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Every detail of PROCHESS is engineered for performance, security, and an unforgettable user experience.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * i }}
                className={`glass-panel p-6 group transition-all shadow-xl ${f.accentBorder} ${f.glow}`}
              >
                <div className="p-3 bg-white/5 rounded-xl w-fit mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-black outfit-font text-center mb-10">Tech Stack</h2>
          <div className="glass-panel p-2 overflow-hidden">
            {techStack.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${i !== techStack.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
              >
                <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <button className="btn-primary group px-10 py-5 text-lg rounded-2xl inline-flex items-center gap-3">
              Experience It Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default FeaturesPage;
