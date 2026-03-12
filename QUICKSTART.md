# Quick Start Guide

## Setup and Run

### 1. Install Dependencies

**Server:**
```powershell
cd server
npm install
```

**Client:**
```powershell
cd client
npm install
```

### 2. Start the Application

Open **two separate PowerShell terminals**:

**Terminal 1 - Backend Server:**
```powershell
cd server
npm run dev
```
✅ Server should start on `http://localhost:3001`

**Terminal 2 - Frontend Client:**
```powershell
cd client
npm run dev
```
✅ Client should start on `http://localhost:5173`

### 3. Play the Game

1. Open `http://localhost:5173` in your browser
2. Click "Create New Game" to get a Room ID
3. Open another browser tab/window (or share with a friend)
4. Click "Join Existing Game" and enter the Room ID
5. Play chess! ♟️

## Testing Locally

To test multiplayer on a single computer:
1. Open two browser windows
2. Create a room in window 1
3. Join that room in window 2
4. Play against yourself!

## Architecture Overview

### Backend (`server/index.js`)
- Express server with Socket.io
- Manages game rooms and player connections
- Validates all chess moves using chess.js
- Broadcasts moves to both players

### Frontend (`client/src/`)

**Components:**
- `App.jsx` - Main app container
- `RoomSetup.jsx` - Create/join room interface
- `ChessGame.jsx` - Main game component with board
- `GameStatus.jsx` - Status message display
- `GameInfo.jsx` - Game info panel (Room ID, color, etc.)

**Hooks:**
- `useSocket.js` - Manages Socket.io connection and events
- `useChessGame.js` - Manages chess.js game state and logic

### Key Libraries
- `chess.js` - Chess rules and move validation
- `react-chessboard` - Chess board UI component
- `socket.io` - Real-time bidirectional communication
- `tailwindcss` - Styling

## Socket Event Flow

```
Player 1                    Server                    Player 2
   |                          |                          |
   |----CREATE_ROOM---------->|                          |
   |<---ROOM_CREATED----------|                          |
   |                          |                          |
   |                          |<----JOIN_ROOM------------|
   |                          |-----ROOM_JOINED--------->|
   |<---GAME_START------------|-----GAME_START---------->|
   |                          |                          |
   |----MAKE_MOVE------------>|                          |
   |                          |---validate move---       |
   |<---MOVE_MADE-------------|-----MOVE_MADE---------->|
   |                          |                          |
```

## Troubleshooting

**Server won't start:**
- Make sure port 3001 is not already in use
- Run `npm install` in the server directory

**Client won't start:**
- Make sure port 5173 is not already in use
- Run `npm install` in the client directory
- Clear node_modules and reinstall if needed

**Can't connect:**
- Ensure both server and client are running
- Check browser console for errors
- Verify Socket.io connection in Network tab

**Moves not working:**
- Check if it's your turn
- Ensure the move is legal (chess.js validation)
- Check browser console for move validation errors

## Next Steps

- Read the full README.md for detailed documentation
- Explore the commented code to understand the architecture
- Customize the styling in `client/src/index.css`
- Add features like move history, timers, or chat!

Enjoy building your Web3 chess DApp! ♟️
