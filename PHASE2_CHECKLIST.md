# Phase 2 Checklist (Build-It-Yourself)

## Contract First

- [ ] Define final state machine and transitions
- [ ] Implement create/join flow with stake escrow
- [ ] Add cooperative settlement via signatures
- [ ] Add rage-quit flow (forfeit + dispute window)
- [ ] Add claim payout pull pattern
- [ ] Add cancel/refund for OPEN matches

## Security

- [ ] Add reentrancy protection where funds move
- [ ] Enforce strict caller/state guards
- [ ] Prevent replay with nonce or monotonic turn/checkpoint
- [ ] Ensure no double-claim/double-settle paths

## Frontend Integration

- [ ] Add wallet connect UI
- [ ] Add contract config (address, chainId, abi)
- [ ] Call create/join contract methods
- [ ] Keep chess moves in Firebase (off-chain)
- [ ] Trigger settlement at game end

## Tests

- [ ] Happy path: create -> join -> settle -> claim
- [ ] Unauthorized caller tests
- [ ] Invalid state transition tests
- [ ] Timeout/dispute tests
- [ ] Double-action tests (join/claim/settle)
