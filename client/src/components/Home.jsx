import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Shield, Globe2, ChevronRight } from 'lucide-react';

const Home = ({ onPlay }) => {
  return (
    <div className="min-h-screen bg-[#0d1117] relative overflow-hidden flex flex-col items-center justify-center p-4">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />

      <main className="z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-12">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 mb-4 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            V1.0 is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight outfit-font">
            Welcome to <br />
            <span className="text-gradient">Web3 Chess</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the world's oldest game reimagined. Fast, secure, and decentralized.
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={onPlay}
            className="btn-primary text-xl px-12 py-4 flex items-center justify-center gap-3 w-full sm:w-auto group"
          >
            Play Now
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            className="btn-secondary text-xl px-12 py-4 flex items-center justify-center gap-3 w-full sm:w-auto"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            Source Code
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16"
        >
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Real-Time Multiplayer"
            description="Ultra-low latency gameplay powered by WebSocket technology."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-400" />}
            title="Secure & Fair"
            description="Server-side move validation ensures a cheat-free environment."
          />
          <FeatureCard 
            icon={<Globe2 className="w-8 h-8 text-blue-400" />}
            title="Play Anywhere"
            description="Fully responsive design optimized for mobile and desktop."
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-gray-600 text-sm font-medium z-10">
        © {new Date().getFullYear()} Web3 Chess. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-8 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
    <div className="p-4 bg-white/5 rounded-2xl">
      {icon}
    </div>
    <h3 className="text-2xl font-bold outfit-font text-gray-100">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default Home;
