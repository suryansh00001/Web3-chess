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

module.exports = { init, createMatch, joinMatch };
