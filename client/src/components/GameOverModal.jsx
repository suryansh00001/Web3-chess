import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, XCircle, Home, RotateCcw } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { signProposeResult, proposeResultTx } from '../web3/matchService';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const GameOverModal = ({ isVisible, result, winner, onRestart, onLeave, roomId, fen, moveCount }) => {
  const [signatures, setSignatures] = useState({});
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (!isVisible || !roomId) return;
    const load = async () => {
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      setSignatures(data?.proposedSignatures || {});
    };
    load();
  }, [isVisible, roomId]);

  if (!isVisible) return null;

  const isWin = winner && winner.toLowerCase() !== 'draw';

  const checkpointHash = () => {
    // canonical representation: fen|moveCount
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${fen}|${moveCount || 0}`));
  };

  const handleSign = async () => {
    if (!wallet.signer) return alert('Connect your wallet first');
    try {
      setLoading(true);
      // ensure on-chain match exists for this room
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const onchain = data?.onchain;
      if (!onchain?.matchId) return alert('No on-chain match found. Create on-chain match first from Arena Stats.');
      const matchId = ethers.BigNumber.from(onchain.matchId);
      const sig = await signProposeResult(null, matchId, wallet.address, checkpointHash());
      // store signature in Firestore under proposedSignatures.{address} = sig
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
      // fetch room and onchain metadata
      const ref = doc(db, 'rooms', roomId);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const onchain = data?.onchain;
      if (!onchain?.matchId) return alert('No on-chain match found for this room');
      const matchId = ethers.BigNumber.from(onchain.matchId);
      // gather signatures
      const sigs = data.proposedSignatures || {};
      const sigEntries = Object.entries(sigs);
      if (sigEntries.length < 2) return alert('Need two signatures to propose result');

      // attempt to recover addresses from signatures and infer ordering
      const chk = checkpointHash();
      const digest = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([
        'bytes32','address','uint256','uint256','uint256','bytes32'
      ], [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('PROPOSE_RESULT')), /*contract*/ '0x0000000000000000000000000000000000000000', /*chain*/ 0, matchId, /*winner*/ wallet.address, chk]));
      // As a fallback, just grab two signatures and submit; order may matter but contract will revert if wrong
      const [addr1, sig1] = sigEntries[0];
      const [addr2, sig2] = sigEntries[1];
      // ask user to confirm winner address
      const winnerAddr = prompt('Enter winner address (one of the signers):', addr1);
      if (!winnerAddr) return;
      await proposeResultTx(null, matchId, winnerAddr, chk, sig1, sig2);
      alert('Propose tx sent');
    } catch (e) {
      console.error(e);
      alert('Propose failed: ' + (e.message || e));
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

          <div className="space-y-4">
            <div className="text-left">
              <p className="text-xs text-gray-400 uppercase">Signatures</p>
              <div className="mt-2 grid gap-2">
                {Object.keys(signatures).length === 0 ? (
                  <div className="text-sm text-gray-500">No signatures yet.</div>
                ) : Object.entries(signatures).map(([addr, s]) => (
                  <div key={addr} className="p-2 bg-white/3 rounded-lg flex items-center justify-between text-sm">
                    <div className="truncate">{addr}</div>
                    <div className="text-xs text-gray-400">{s.slice(0,8)}...{s.slice(-8)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSign} disabled={!wallet.address || loading} className="btn-primary flex-1 py-3 rounded-xl">
                {wallet.address ? (loading ? 'SIGNING...' : 'SIGN RESULT') : 'CONNECT WALLET TO SIGN'}
              </button>
              <button onClick={handleProposeOnChain} disabled={loading} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                PROPOSE ON-CHAIN
              </button>
            </div>
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
