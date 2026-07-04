export const CONTRACT_CONFIG = {
  chainId: import.meta.env.VITE_CHAIN_ID ? Number(import.meta.env.VITE_CHAIN_ID) : 31337,
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "challenger", "type": "address" }
      ],
      "name": "ClaimChallenged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "claimant", "type": "address" }
      ],
      "name": "ForfeitClaimOpened",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" }
      ],
      "name": "MatchCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "stakeAmount", "type": "uint256" }
      ],
      "name": "MatchCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "opponent", "type": "address" }
      ],
      "name": "MatchJoined",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256" }
      ],
      "name": "MatchSettled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "proposer", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "winner", "type": "address" }
      ],
      "name": "ResultProposed",
      "type": "event"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
      "name": "cancelOpenMatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "internalType": "bytes32", "name": "newerCheckpointHash", "type": "bytes32" },
        { "internalType": "bytes", "name": "creatorSig", "type": "bytes" },
        { "internalType": "bytes", "name": "opponentSig", "type": "bytes" }
      ],
      "name": "challengeClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
      "name": "claimPayout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "name": "claimablePayouts",
      "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "internalType": "uint64", "name": "moveTimeout", "type": "uint64" },
        { "internalType": "uint64", "name": "disputeWindow", "type": "uint64" }
      ],
      "name": "createMatch",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
      "name": "finalizeClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "matchId", "type": "uint256" } ],
      "name": "joinMatch",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
      "name": "matches",
      "outputs": [
        { "internalType": "address", "name": "creator", "type": "address" },
        { "internalType": "address", "name": "opponent", "type": "address" },
        { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
        { "internalType": "uint64", "name": "createdAt", "type": "uint64" },
        { "internalType": "uint64", "name": "startedAt", "type": "uint64" },
        { "internalType": "uint64", "name": "lastActionAt", "type": "uint64" },
        { "internalType": "uint64", "name": "claimOpenedAt", "type": "uint64" },
        { "internalType": "uint64", "name": "moveTimeout", "type": "uint64" },
        { "internalType": "uint64", "name": "disputeWindow", "type": "uint64" },
        { "internalType": "enum MatchEscrow.MatchStatus", "name": "status", "type": "uint8" },
        { "internalType": "address", "name": "winner", "type": "address" },
        { "internalType": "address", "name": "claimant", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "internalType": "bytes32", "name": "checkpointHash", "type": "bytes32" },
        { "internalType": "bytes", "name": "claimantSig", "type": "bytes" },
        { "internalType": "bytes", "name": "counterpartySig", "type": "bytes" }
      ],
      "name": "openForfeitClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "oracle",
      "outputs": [ { "internalType": "address", "name": "", "type": "address" } ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [ { "internalType": "address", "name": "", "type": "address" } ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "internalType": "address", "name": "winner", "type": "address" },
        { "internalType": "bytes32", "name": "checkpointHash", "type": "bytes32" },
        { "internalType": "bytes", "name": "creatorSig", "type": "bytes" },
        { "internalType": "bytes", "name": "opponentSig", "type": "bytes" }
      ],
      "name": "proposeResult",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [ { "internalType": "address", "name": "_oracle", "type": "address" } ],
      "name": "setOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "matchId", "type": "uint256" },
        { "internalType": "address", "name": "winner", "type": "address" },
        { "internalType": "bytes32", "name": "checkpointHash", "type": "bytes32" },
        { "internalType": "bytes", "name": "oracleSig", "type": "bytes" }
      ],
      "name": "settleWithOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "bytes32", "name": "", "type": "bytes32" }
      ],
      "name": "usedCheckpoints",
      "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};
