# PROCHESS Backend

This service provides a production-ready Socket.IO + Express backend with Firebase Admin for persistence and authentication, chess move validation (chess.js), and hooks to interact with the on-chain `MatchEscrow` contract via ethers.

Quick start (development):

1. Copy service account and env vars:

```powershell
copy server\.env.example server\.env
# set FIREBASE_SERVICE_ACCOUNT, RPC_URL, DEPLOYER_PRIVATE_KEY, CONTRACT_ADDRESS
```

2. Install and run locally:

```powershell
cd server
npm install
npm run dev
```

3. Or with Docker Compose:

```powershell
docker compose -f docker-compose.backend.yml up --build
```

Files of interest:
- `src/index.js` — main server and Socket.IO handlers
- `src/gameController.js` — move validation + Firestore helpers
- `src/matchService.js` — on-chain match interactions (create/join stubs)
