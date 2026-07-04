import { Copy, Check, LogOut, Info, ShieldCheck, Globe, Coins, ShieldAlert, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ethers } from 'ethers';
import { createMatchTx, cancelOpenMatchTx, claimPayoutTx } from '../web3/matchService';
import { CONTRACT_CONFIG } from '../web3/contractConfig';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

const GameInfo = ({ roomId, playerColor, gameState, isConnected, onLeaveRoom }) => {
  const [isCopied, setIsCopied] = useState(false);
  const wallet = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [claimableBalance, setClaimableBalance] = useState(ethers.BigNumber.from(0));
  const [errorMsg, setErrorMsg] = useState('');

  // Subscribe to room doc changes
  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setRoomData(snap.data());
      }
    });
    return unsubscribe;
  }, [roomId]);

  // Query claimable balance from smart contract
  useEffect(() => {
    if (!wallet.address || !roomData?.onchain?.matchId) return;
    const checkClaimable = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_CONFIG.contractAddress,
          CONTRACT_CONFIG.abi,
          provider
        );
        const matchId = ethers.BigNumber.from(roomData.onchain.matchId);
        const amount = await contract.claimablePayouts(matchId, wallet.address);
        setClaimableBalance(amount);
      } catch (e) {
        console.error('Error checking claimable:', e);
      }
    };

    checkClaimable();
    const interval = setInterval(checkClaimable, 10000);
    return () => clearInterval(interval);
  }, [wallet.address, roomData?.onchain?.matchId]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isCreator = roomData?.creatorId === auth?.currentUser?.uid;

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

        {/* Web3 / Escrow Control Panel */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              On-Chain Wager
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              roomData?.onchain?.matchId
                ? (roomData?.onchain?.opponentTx ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20')
                : 'bg-white/5 text-gray-500'
            }`}>
              {roomData?.onchain?.matchId
                ? (roomData?.onchain?.opponentTx ? 'ACTIVE MATCH' : 'CREATOR STAKED')
                : 'OFF-CHAIN PLAY'}
            </span>
          </div>

          {roomData?.onchain?.matchId ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Match ID:</span>
                <span className="font-mono text-gray-300 select-all">{roomData.onchain.matchId.slice(0, 8)}...{roomData.onchain.matchId.slice(-8)}</span>
              </div>
              
              {/* If claimable payouts exist */}
              {claimableBalance.gt(0) && (
                <button
                  onClick={async () => {
                    try {
                      setIsDeploying(true);
                      const matchId = ethers.BigNumber.from(roomData.onchain.matchId);
                      await claimPayoutTx(null, matchId);
                      alert('Payout claimed successfully!');
                      setClaimableBalance(ethers.BigNumber.from(0));
                    } catch (e) {
                      console.error(e);
                      alert('Claim failed: ' + (e.message || e));
                    } finally {
                      setIsDeploying(false);
                    }
                  }}
                  disabled={isDeploying}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 animate-bounce"
                >
                  <Award className="w-4 h-4" />
                  CLAIM PAYOUT ({ethers.utils.formatEther(claimableBalance)} ETH)
                </button>
              )}

              {/* Cancel open match button (only for creator if opponent hasn't joined yet) */}
              {!roomData.onchain.opponentTx && isCreator && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to cancel the match and retrieve your refund?')) return;
                    try {
                      setIsDeploying(true);
                      const matchId = ethers.BigNumber.from(roomData.onchain.matchId);
                      await cancelOpenMatchTx(null, matchId);
                      alert('Match cancelled on-chain.');
                    } catch (e) {
                      console.error(e);
                      alert('Cancel failed: ' + (e.message || e));
                    } finally {
                      setIsDeploying(false);
                    }
                  }}
                  disabled={isDeploying}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium rounded-lg transition-all"
                >
                  CANCEL ON-CHAIN MATCH
                </button>
              )}
            </div>
          ) : (
            <div>
              {isCreator ? (
                <button
                  onClick={async () => {
                    try {
                      if (!wallet.address) return alert('Connect wallet first');
                      const stake = prompt('Enter stake in ETH (e.g. 0.01):', '0.01');
                      if (!stake) return;
                      const stakeWei = ethers.utils.parseEther(stake);
                      setIsDeploying(true);
                      
                      const idHash = ethers.utils.id(roomId);
                      const matchId = ethers.BigNumber.from(idHash);
                      
                      setErrorMsg('Confirming staking transaction...');
                      const receipt = await createMatchTx(null, matchId, stakeWei, 300, 3600);
                      setErrorMsg('');

                      const roomRef = doc(db, 'rooms', roomId);
                      await updateDoc(roomRef, {
                        onchain: {
                          matchId: idHash,
                          creatorTx: receipt.transactionHash
                        }
                      });
                      alert('On-chain match created: ' + receipt.transactionHash);
                    } catch (e) {
                      console.error(e);
                      alert('On-chain create failed: ' + (e.message || e));
                      setErrorMsg('');
                    } finally {
                      setIsDeploying(false);
                    }
                  }}
                  disabled={isDeploying}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  CREATE ON-CHAIN MATCH
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  Off-chain match. Waiting for host to create an on-chain wager.
                </p>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="text-[10px] text-yellow-400 bg-yellow-500/5 border border-yellow-500/10 p-2 rounded-lg text-center">
              {errorMsg}
            </p>
          )}
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
