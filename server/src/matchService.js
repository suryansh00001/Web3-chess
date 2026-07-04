const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider;
let wallet;
let contract;

function init({ rpcUrl, privateKey, contractAddress, abi }) {
  if (!rpcUrl || !privateKey || !contractAddress || !abi) return;
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  wallet = new ethers.Wallet(privateKey, provider);
  contract = new ethers.Contract(contractAddress, abi, wallet);
}

async function createMatch(matchId, stakeWei, moveTimeout, disputeWindow) {
  if (!contract) throw new Error('Contract not initialized');
  const tx = await contract.createMatch(matchId, moveTimeout, disputeWindow, { value: stakeWei });
  return tx.wait();
}

async function joinMatch(matchId, stakeWei) {
  if (!contract) throw new Error('Contract not initialized');
  const tx = await contract.joinMatch(matchId, { value: stakeWei });
  return tx.wait();
}

async function signOracleResult(matchIdStr, winnerAddress, checkpointHashHex) {
  if (!wallet || !contract) throw new Error('Match service not initialized');
  
  const matchId = ethers.BigNumber.from(matchIdStr);
  const chainId = (await provider.getNetwork()).chainId;
  
  const actionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_SETTLE"));
  
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'address', 'bytes32'],
    [actionHash, contract.address, chainId, matchId, winnerAddress, checkpointHashHex]
  );
  
  const innerHash = ethers.utils.keccak256(encoded);
  
  const signature = await wallet.signMessage(ethers.utils.arrayify(innerHash));
  return signature;
}

module.exports = { init, createMatch, joinMatch, signOracleResult };
