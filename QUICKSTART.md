# Quick Start

## 1. Install

```powershell
cd client
npm install
```

## 2. Configure Firebase

Create `client/.env` from `client/.env.example` and fill your Firebase web app values.

Enable in Firebase Console:

1. Authentication -> Anonymous sign-in
2. Firestore Database
3. Firestore rules from `client/firestore.rules`

## 3. Run

```powershell
cd client
npm run dev
```

Open the URL shown by Vite.

## 4. Local Multiplayer

Use two separate browser sessions (for example normal + incognito), create a room in one, then join from the other.
