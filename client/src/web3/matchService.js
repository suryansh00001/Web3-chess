import { CONTRACT_CONFIG } from "./contractConfig";

export async function createMatchTx(_walletClient, _matchId, _stakeWei, _moveTimeoutSec, _disputeWindowSec) {
  throw new Error("Not implemented");
}

export async function joinMatchTx(_walletClient, _matchId, _stakeWei) {
  throw new Error("Not implemented");
}

export async function proposeResultTx(_walletClient, _matchId, _winner, _checkpointHash, _creatorSig, _opponentSig) {
  throw new Error("Not implemented");
}

export async function openForfeitClaimTx(_walletClient, _matchId, _checkpointHash, _claimantSig, _counterpartySig) {
  throw new Error("Not implemented");
}

export async function challengeClaimTx(_walletClient, _matchId, _newerCheckpointHash, _creatorSig, _opponentSig) {
  throw new Error("Not implemented");
}

export async function finalizeClaimTx(_walletClient, _matchId) {
  throw new Error("Not implemented");
}

export async function claimPayoutTx(_walletClient, _matchId) {
  throw new Error("Not implemented");
}

export async function cancelOpenMatchTx(_walletClient, _matchId) {
  throw new Error("Not implemented");
}

export function validateWeb3Config() {
  if (!CONTRACT_CONFIG.contractAddress || CONTRACT_CONFIG.contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set contract address in contractConfig.js");
  }

  if (!Array.isArray(CONTRACT_CONFIG.abi) || CONTRACT_CONFIG.abi.length === 0) {
    throw new Error("Set contract ABI in contractConfig.js");
  }
}
