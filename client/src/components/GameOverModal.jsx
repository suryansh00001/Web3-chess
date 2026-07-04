import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, XCircle, Home, RotateCcw } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { signProposeResult, proposeResultTx, settleWithOracleTx } from '../web3/matchService';
import { CONTRACT_CONFIG } from '../web3/contractConfig';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const GameOverModal = ({ isVisible, result, winner, onRestart, onLeave, roomId, fen, moveCount }) => {
  const [signatures, setSignatures] = useState({});
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const wallet = useWallet();

  useEffect(() => {
    if (!isVisible || !roomId) return;
    const ref = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
        setSignatures(data?.proposedSignatures || {});
      }
    });
    return unsubscribe;
  }, [isVisible, roomId]);

  if (!isVisible) return null;

  const isWin = winner && winner.toLowerCase() !== 'draw' && winner.toLowerCase() !== 'stalemate' && winner.toLowerCase() !== 'system';

  const checkpointHash = () => {
    // canonical representation: fen|moveCount
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${fen}|${moveCount || 0}`));
  };

  const getWinnerAddress = (room) => {
    if (!winner || winner.toLowerCase() === 'draw' || winner.toLowerCase() === 'stalemate' || winner.toLowerCase() === 'system') {
      return ethers.constants.AddressZero;
    }
    const winnerColor = winner.toLowerCase() === 'white' ? 'w' : (winner.toLowerCase() === 'black' ? 'b' : null);
    if (!winnerColor) return ethers.constants.AddressZero;
    
    // Find player UID for this color
    const playerUid = winnerColor === 'w' ? room?.players?.white : room?.players?.black;
    if (!playerUid) return ethers.constants.AddressZero;
    
    return room?.playerAddresses?.[playerUid] || ethers.constants.AddressZero;
  };

  const handleSign = async () => {
    if (!wallet.signer) return alert('Connect your wallet first');
    try {
      setLoading(true);
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const onchain = data?.onchain;
      if (!onchain?.matchId) return alert('No on-chain match found. Create on-chain match first from Arena Stats.');
      
      const matchId = ethers.BigNumber.from(onchain.matchId);
      const winnerAddr = getWinnerAddress(data);

      if (winnerAddr === ethers.constants.AddressZero && winner && winner.toLowerCase() !== 'draw' && winner.toLowerCase() !== 'stalemate') {
        return alert('Winner Ethereum address not registered in this room. Make sure both players connected their wallets.');
      }

      const sig = await signProposeResult(null, matchId, winnerAddr, checkpointHash());
      
      // Store signature under proposedSignatures.{address} = sig
      const existing = data.proposedSignatures || {};
      existing[wallet.address.toLowerCase()] = sig;
      await updateDoc(ref, { proposedSignatures: existing });
      setSignatures(existing);
      alert('Signature saved to room');
    } catch (e) {
      console.error(e);
      alert('Signing failed: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const handleProposeOnChain = async () => {
    try {
      setLoading(true);
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const onchain = data?.onchain;
      if (!onchain?.matchId) return alert('No on-chain match found for this room');
      const matchId = ethers.BigNumber.from(onchain.matchId);

      const sigs = data.proposedSignatures || {};
      
      // Match creator and opponent Ethereum addresses
      const creatorUid = data?.creatorId;
      const opponentUid = data?.players?.joiner;
      if (!creatorUid || !opponentUid) return alert('Both players must be in the room to propose');
      
      const creatorEth = data?.playerAddresses?.[creatorUid]?.toLowerCase();
      const opponentEth = data?.playerAddresses?.[opponentUid]?.toLowerCase();
      if (!creatorEth || !opponentEth) return alert('Ethereum addresses for both players not registered');
      
      const creatorSig = sigs[creatorEth];
      const opponentSig = sigs[opponentEth];
      
      if (!creatorSig || !opponentSig) {
        return alert('Both player signatures are required to propose. Ensure both click "SIGN RESULT".');
      }

      const winnerAddr = getWinnerAddress(data);
      const chk = checkpointHash();

      await proposeResultTx(null, matchId, winnerAddr, chk, creatorSig, opponentSig);
      alert('Propose tx sent successfully!');
    } catch (e) {
      console.error(e);
      alert('Propose failed: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const handleOracleSettle = async () => {
    try {
      setLoading(true);
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const onchain = data?.onchain;
      if (!onchain?.oracleSignature) {
        return alert('No oracle signature found yet. Please wait for the oracle server to sign the game outcome.');
      }
      const matchId = ethers.BigNumber.from(onchain.matchId);
      const winnerAddr = getWinnerAddress(data);
      const chk = checkpointHash();
      
      await settleWithOracleTx(null, matchId, winnerAddr, chk, onchain.oracleSignature);
      alert('Oracle settlement transaction sent successfully!');
    } catch (e) {
      console.error(e);
      alert('Oracle settlement failed: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

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
            {winner && winner.toLowerCase() !== 'draw' && winner.toLowerCase() !== 'stalemate' && winner.toLowerCase() !== 'system' ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-500 uppercase">Victor</p>
                <p className="text-3xl font-black text-white outfit-font underline decoration-blue-500 underline-offset-8">
                  {winner.toUpperCase()}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold outfit-font">STALEMATE / DRAW</p>
            )}
          </div>

          {roomData?.onchain?.matchId && (
            <div className="space-y-4">
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase">On-Chain Signatures</p>
                <div className="mt-2 grid gap-2">
                  {Object.keys(signatures).length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-2 bg-white/3 rounded-lg">No signatures yet.</div>
                  ) : Object.entries(signatures).map(([addr, s]) => (
                    <div key={addr} className="p-2 bg-white/3 rounded-lg flex items-center justify-between text-xs">
                      <div className="truncate font-mono">{addr}</div>
                      <div className="text-gray-400 font-mono">{s.slice(0,6)}...{s.slice(-6)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button onClick={handleSign} disabled={!wallet.address || loading} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold">
                    {wallet.address ? (loading ? 'SIGNING...' : 'SIGN RESULT') : 'CONNECT WALLET'}
                  </button>
                  <button onClick={handleProposeOnChain} disabled={loading || Object.keys(signatures).length < 2} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold flex-1 disabled:opacity-50 transition-all">
                    PROPOSE ON-CHAIN
                  </button>
                </div>
                {roomData?.onchain?.oracleSignature && (
                  <button onClick={handleOracleSettle} disabled={loading} className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 font-bold rounded-xl transition-all text-sm">
                    SETTLE VIA ORACLE (FALLBACK)
                  </button>
                )}
              </div>
            </div>
          )}

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
