import { CONTRACT_CONFIG } from "./contractConfig";
import { ethers } from 'ethers';

function _getProvider(externalWallet) {
  if (externalWallet) return new ethers.providers.Web3Provider(externalWallet);
  if (typeof window !== 'undefined' && window.ethereum) return new ethers.providers.Web3Provider(window.ethereum);
  throw new Error('No web3 provider found (window.ethereum)');
}

function _getSigner(externalWallet) {
  const provider = _getProvider(externalWallet);
  return provider.getSigner();
}

function _getContract(signerOrProvider) {
  if (!CONTRACT_CONFIG.contractAddress || !CONTRACT_CONFIG.abi) throw new Error('Contract not configured');
  return new ethers.Contract(CONTRACT_CONFIG.contractAddress, CONTRACT_CONFIG.abi, signerOrProvider);
}

async function _getChainId(provider) {
  const net = await provider.getNetwork();
  return net.chainId;
}

function _actionHash(actionStr) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(actionStr));
}

async function _signAction(signer, types, values) {
  // abi.encode(...) then keccak256, then signMessage on the 32-byte hash (ethers signs with the same prefix)
  const encoded = ethers.utils.defaultAbiCoder.encode(types, values);
  const inner = ethers.utils.keccak256(encoded);
  const sig = await signer.signMessage(ethers.utils.arrayify(inner));
  return sig;
}

export async function createMatchTx(_walletClient, _matchId, _stakeWei, _moveTimeoutSec, _disputeWindowSec) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.createMatch(_matchId, _moveTimeoutSec, _disputeWindowSec, { value: _stakeWei });
  return tx.wait();
}

export async function joinMatchTx(_walletClient, _matchId, _stakeWei) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.joinMatch(_matchId, { value: _stakeWei });
  return tx.wait();
}

export async function proposeResultTx(_walletClient, _matchId, _winner, _checkpointHash, _creatorSig, _opponentSig) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);

  if (!_creatorSig || !_opponentSig) {
    throw new Error('Both signatures required: creatorSig and opponentSig');
  }

  const tx = await contract.proposeResult(_matchId, _winner, _checkpointHash, _creatorSig, _opponentSig);
  return tx.wait();
}

export async function openForfeitClaimTx(_walletClient, _matchId, _checkpointHash, _claimantSig, _counterpartySig) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  if (!_claimantSig || !_counterpartySig) throw new Error('Both claimant and counterparty signatures required');
  const tx = await contract.openForfeitClaim(_matchId, _checkpointHash, _claimantSig, _counterpartySig);
  return tx.wait();
}

export async function challengeClaimTx(_walletClient, _matchId, _newerCheckpointHash, _creatorSig, _opponentSig) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  if (!_creatorSig || !_opponentSig) throw new Error('Both creator and opponent signatures required');
  const tx = await contract.challengeClaim(_matchId, _newerCheckpointHash, _creatorSig, _opponentSig);
  return tx.wait();
}

export async function finalizeClaimTx(_walletClient, _matchId) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.finalizeClaim(_matchId);
  return tx.wait();
}

export async function claimPayoutTx(_walletClient, _matchId) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.claimPayout(_matchId);
  return tx.wait();
}

export async function cancelOpenMatchTx(_walletClient, _matchId) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.cancelOpenMatch(_matchId);
  return tx.wait();
}

export async function settleWithOracleTx(_walletClient, _matchId, _winner, _checkpointHash, _oracleSig) {
  const signer = _getSigner(_walletClient);
  const contract = _getContract(signer);
  const tx = await contract.settleWithOracle(_matchId, _winner, _checkpointHash, _oracleSig);
  return tx.wait();
}

// Helpers to create signatures compatible with the Solidity contract
export async function signProposeResult(_walletClient, _matchId, _winner, _checkpointHash) {
  const provider = _getProvider(_walletClient);
  const signer = provider.getSigner();
  const chainId = await _getChainId(provider);
  const action = _actionHash('PROPOSE_RESULT');
  const types = ['bytes32', 'address', 'uint256', 'uint256', 'address', 'bytes32'];
  const values = [action, CONTRACT_CONFIG.contractAddress, chainId, _matchId, _winner, _checkpointHash];
  return _signAction(signer, types, values);
}

export async function signOpenForfeit(_walletClient, _matchId, _checkpointHash) {
  const provider = _getProvider(_walletClient);
  const signer = provider.getSigner();
  const chainId = await _getChainId(provider);
  const action = _actionHash('OPEN_FORFEIT');
  const types = ['bytes32', 'address', 'uint256', 'uint256', 'address', 'bytes32'];
  const signerAddress = await signer.getAddress();
  const values = [action, CONTRACT_CONFIG.contractAddress, chainId, _matchId, signerAddress, _checkpointHash];
  return _signAction(signer, types, values);
}

export async function signChallengeClaim(_walletClient, _matchId, _newerCheckpointHash) {
  const provider = _getProvider(_walletClient);
  const signer = provider.getSigner();
  const chainId = await _getChainId(provider);
  const action = _actionHash('CHALLENGE_CLAIM');
  const types = ['bytes32', 'address', 'uint256', 'uint256', 'bytes32'];
  const values = [action, CONTRACT_CONFIG.contractAddress, chainId, _matchId, _newerCheckpointHash];
  return _signAction(signer, types, values);
}

export function validateWeb3Config() {
  if (!CONTRACT_CONFIG.contractAddress || CONTRACT_CONFIG.contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set contract address in contractConfig.js");
  }

  if (!Array.isArray(CONTRACT_CONFIG.abi) || CONTRACT_CONFIG.abi.length === 0) {
    throw new Error("Set contract ABI in contractConfig.js");
  }
}
