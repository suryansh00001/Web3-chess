const { Chess } = require('chess.js');
const { getFirestore, serverTimestamp } = require('firebase-admin/firestore');

const firestore = getFirestore();

async function getRoom(roomId) {
  const ref = firestore.collection('rooms').doc(roomId);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

async function updateRoom(roomId, patch) {
  const ref = firestore.collection('rooms').doc(roomId);
  await ref.set({ ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

function isValidMove(fen, move) {
  const chess = new Chess(fen);
  const result = chess.move(move);
  return !!result ? { valid: true, fen: chess.fen(), move: result } : { valid: false };
}

module.exports = { getRoom, updateRoom, isValidMove };
