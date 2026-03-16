import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Globe2, ChevronRight, Trophy, Users, Globe } from 'lucide-react';
import chessHeroImage from '../assets/chess_hero.png'; 

const Home = ({ onPlay }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      
      {/* Premium Hero Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `url(${chessHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-transparent to-[#020617] z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent z-0" />

      {/* Floating Particles/Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Navigation Header */}
      <header className="relative z-20 container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-chess-secondary to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter outfit-font italic">PROCHESS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/gameplay" className="hover:text-white transition-colors">Gameplay</Link>
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/stats" className="hover:text-white transition-colors">Stats</Link>
          <button 
            onClick={onPlay}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all"
          >
            Launch DApp
          </button>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Content */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              Next-Gen Chess Platform
            </span>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] outfit-font tracking-tight">
              MASTER THE <br />
              <span className="text-gradient drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">GRAND GAME</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Experience ultra-responsive real-time multiplayer chess with institutional-grade security and a breathtaking interface. Built for grandmasters, accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <button 
              onClick={onPlay}
              className="btn-primary group px-10 py-5 text-xl rounded-2xl flex items-center gap-4 shadow-[0_20px_50px_rgba(59,130,246,0.2)]"
            >
              Start Playing
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </button>
            <Link to="/learn-more">
              <button className="btn-secondary px-10 py-5 text-xl rounded-2xl">
                Learn More
              </button>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-12 grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0"
          >
            <div className="text-center lg:text-left">
              <p className="text-3xl font-bold outfit-font">10k+</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Active Players</p>
            </div>
            <div className="text-center lg:text-left border-x border-white/10 px-8">
              <p className="text-3xl font-bold outfit-font">2ms</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Avg Latency</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-3xl font-bold outfit-font">24/7</p>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Support</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex-1 relative hidden lg:block"
        >
          <div className="relative z-10 glass-panel p-2 rounded-[2.5rem] shadow-[0_0_100px_rgba(59,130,246,0.15)] bg-gradient-to-br from-white/10 to-transparent">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 aspect-square flex items-center justify-center p-8 border border-white/5">
                {/* Visual representation of a chess board/piece in a cool way */}
                <div className="relative">
                    <Crown className="w-48 h-48 text-white/10 absolute -top-12 -left-12 rotate-[-15deg]" />
                    <div className="relative z-10 bg-gradient-to-br from-chess-secondary to-blue-500 p-1 rounded-full shadow-2xl">
                        <div className="bg-slate-950 rounded-full p-12">
                            <Crown className="w-32 h-32 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
            

          </div>
        </motion.div>
      </main>

      {/* Benefits Section */}
      <section className="relative z-10 bg-white/[0.02] border-y border-white/5 py-24">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <BenefitItem 
                icon={<Trophy className="w-10 h-10 text-yellow-500" />}
                title="Ranked Leagues"
                desc="Ascend through the ranks from Novice to Grandmaster. Win exclusive badges and rewards."
            />
            <BenefitItem 
                icon={<Users className="w-10 h-10 text-blue-500" />}
                title="Global Rooms"
                desc="Connect with players worldwide instantly. Create private matches or join public lobby."
            />
            <BenefitItem 
                icon={<Globe className="w-10 h-10 text-purple-500" />}
                title="Decentralized"
                desc="Full transparency and control over your data and gaming history on the web3 stack."
            />
        </div>
      </section>

      <footer className="relative z-10 container mx-auto px-6 py-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-8 mb-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <p>© {new Date().getFullYear()} PROCHESS ENTERTAINMENT. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            {icon}
        </div>
        <h3 className="text-2xl font-bold outfit-font">{title}</h3>
        <p className="text-gray-400 leading-relaxed max-w-sm">{desc}</p>
    </div>
);

export default Home;
