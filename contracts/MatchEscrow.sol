// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MatchEscrow {
    enum MatchStatus {
        NONE,
        OPEN,
        ACTIVE,
        RESULT_PROPOSED,
        DISPUTE,
        SETTLED,
        CANCELLED
    }

    struct Match {
        address creator;
        address opponent;
        uint256 stakeAmount;
        uint64 createdAt;
        uint64 startedAt;
        uint64 lastActionAt;
        uint64 claimOpenedAt;
        uint64 moveTimeout;
        uint64 disputeWindow;
        MatchStatus status;
        address winner;
        address claimant;
    }

    mapping(uint256 => Match) public matches;
    mapping(uint256 => mapping(bytes32 => bool)) public usedCheckpoints;
    mapping(uint256 => mapping(address => uint256)) public claimablePayouts;

    uint256 private _locked;

    bytes32 private constant ACTION_PROPOSE_RESULT = keccak256("PROPOSE_RESULT");
    bytes32 private constant ACTION_OPEN_FORFEIT = keccak256("OPEN_FORFEIT");
    bytes32 private constant ACTION_CHALLENGE_CLAIM = keccak256("CHALLENGE_CLAIM");

    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 stakeAmount);
    event MatchJoined(uint256 indexed matchId, address indexed opponent);
    event ResultProposed(uint256 indexed matchId, address indexed proposer, address indexed winner);
    event ForfeitClaimOpened(uint256 indexed matchId, address indexed claimant);
    event ClaimChallenged(uint256 indexed matchId, address indexed challenger);
    event MatchSettled(uint256 indexed matchId, address indexed winner, uint256 payout);
    event MatchCancelled(uint256 indexed matchId);

    modifier nonReentrant() {
        require(_locked == 0, "Reentrancy");
        _locked = 1;
        _;
        _locked = 0;
    }

    function createMatch(
        uint256 matchId,
        uint64 moveTimeout,
        uint64 disputeWindow
    ) external payable {
        require(matchId!=0 , "Invalid");
        require(matches[matchId].status== MatchStatus.NONE, "Match exists already");
        require (msg.value>0, "Put some stake");
        require(moveTimeout > 0, "Invalid moveTimeout");
        require(disputeWindow>0 , "Invalid");

        matches[matchId]= Match({
            creator: msg.sender,
            opponent: address(0),
            stakeAmount: msg.value,
            createdAt: uint64(block.timestamp),
            startedAt: 0,
            lastActionAt: uint64(block.timestamp),
            claimOpenedAt: 0,
            moveTimeout: moveTimeout,
            disputeWindow: disputeWindow,
            status : MatchStatus.OPEN,
            winner: address(0),
            claimant: address(0)
        });

        emit MatchCreated(matchId, msg.sender, msg.value);
    }

    function joinMatch(uint256 matchId) external payable {
        Match storage m = matches[matchId];
        require(matchId!=0, "invalid matchid");
        require(m.status == MatchStatus.OPEN, "Not open");
        require(msg.sender != m.creator, "creator cant join");
        require(m.opponent == address(0), "already joined ");
        require( msg.value== m.stakeAmount, "stake mismatch");

        m.opponent = msg.sender;
        m.status = MatchStatus.ACTIVE;
        m.startedAt = uint64(block.timestamp);
        m.lastActionAt= uint64(block.timestamp);

        emit MatchJoined(matchId, msg.sender);
    }

    function proposeResult(
        uint256 matchId,
        address winner,
        bytes32 checkpointHash,
        bytes calldata creatorSig,
        bytes calldata opponentSig
    ) external {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.ACTIVE || m.status == MatchStatus.RESULT_PROPOSED || m.status == MatchStatus.DISPUTE, "Bad state");
        require(_isParticipant(m, msg.sender), "Not participant");
        require(winner == m.creator || winner == m.opponent, "Bad winner");
        require(!usedCheckpoints[matchId][checkpointHash], "Checkpoint used");

        bytes32 digest = _signedMessageHash(
            keccak256(
                abi.encode(
                    ACTION_PROPOSE_RESULT,
                    address(this),
                    block.chainid,
                    matchId,
                    winner,
                    checkpointHash
                )
            )
        );

        require(_recoverSigner(digest, creatorSig) == m.creator, "Bad creator sig");
        require(_recoverSigner(digest, opponentSig) == m.opponent, "Bad opponent sig");

        usedCheckpoints[matchId][checkpointHash] = true;

        emit ResultProposed(matchId, msg.sender, winner);
        _settleMatch(matchId, winner);
    }

    function openForfeitClaim(
        uint256 matchId,
        bytes32 checkpointHash,
        bytes calldata claimantSig,
        bytes calldata counterpartySig
    ) external {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.ACTIVE, "Bad state");
        require(_isParticipant(m, msg.sender), "Not participant");
        require(block.timestamp >= uint256(m.lastActionAt) + uint256(m.moveTimeout), "Move timeout not reached");
        require(!usedCheckpoints[matchId][checkpointHash], "Checkpoint used");

        address counterparty = msg.sender == m.creator ? m.opponent : m.creator;

        bytes32 digest = _signedMessageHash(
            keccak256(
                abi.encode(
                    ACTION_OPEN_FORFEIT,
                    address(this),
                    block.chainid,
                    matchId,
                    msg.sender,
                    checkpointHash
                )
            )
        );

        require(_recoverSigner(digest, claimantSig) == msg.sender, "Bad claimant sig");
        require(_recoverSigner(digest, counterpartySig) == counterparty, "Bad counterparty sig");

        usedCheckpoints[matchId][checkpointHash] = true;
        m.status = MatchStatus.RESULT_PROPOSED;
        m.claimant = msg.sender;
        m.winner = msg.sender;
        m.claimOpenedAt = uint64(block.timestamp);
        m.lastActionAt = uint64(block.timestamp);

        emit ForfeitClaimOpened(matchId, msg.sender);
    }

    function challengeClaim(
        uint256 matchId,
        bytes32 newerCheckpointHash,
        bytes calldata creatorSig,
        bytes calldata opponentSig
    ) external {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.RESULT_PROPOSED, "No active claim");
        require(_isParticipant(m, msg.sender), "Not participant");
        require(msg.sender != m.claimant, "Claimant cannot challenge");
        require(block.timestamp < uint256(m.claimOpenedAt) + uint256(m.disputeWindow), "Dispute window closed");
        require(!usedCheckpoints[matchId][newerCheckpointHash], "Checkpoint used");

        bytes32 digest = _signedMessageHash(
            keccak256(
                abi.encode(
                    ACTION_CHALLENGE_CLAIM,
                    address(this),
                    block.chainid,
                    matchId,
                    newerCheckpointHash
                )
            )
        );

        require(_recoverSigner(digest, creatorSig) == m.creator, "Bad creator sig");
        require(_recoverSigner(digest, opponentSig) == m.opponent, "Bad opponent sig");

        usedCheckpoints[matchId][newerCheckpointHash] = true;
        m.status = MatchStatus.DISPUTE;
        m.lastActionAt = uint64(block.timestamp);

        emit ClaimChallenged(matchId, msg.sender);
    }

    function finalizeClaim(uint256 matchId) external {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.RESULT_PROPOSED, "No claim");
        require(block.timestamp >= uint256(m.claimOpenedAt) + uint256(m.disputeWindow), "Dispute window active");
        require(m.claimant != address(0), "No claimant");

        _settleMatch(matchId, m.claimant);
    }

    function claimPayout(uint256 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.SETTLED || m.status == MatchStatus.CANCELLED, "Not claimable");

        uint256 amount = claimablePayouts[matchId][msg.sender];
        require(amount > 0, "Nothing to claim");

        claimablePayouts[matchId][msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");
    }

    function cancelOpenMatch(uint256 matchId) external {
        Match storage m = matches[matchId];
        require(m.status == MatchStatus.OPEN, "Not open");
        require(msg.sender == m.creator, "Only creator");

        m.status = MatchStatus.CANCELLED;
        m.lastActionAt = uint64(block.timestamp);
        claimablePayouts[matchId][m.creator] = m.stakeAmount;

        emit MatchCancelled(matchId);
    }

    function _settleMatch(uint256 matchId, address winner) internal {
        Match storage m = matches[matchId];
        require(m.status != MatchStatus.SETTLED && m.status != MatchStatus.CANCELLED, "Finalized");

        uint256 payout = m.stakeAmount * 2;

        m.winner = winner;
        m.status = MatchStatus.SETTLED;
        m.lastActionAt = uint64(block.timestamp);
        m.claimOpenedAt = 0;
        m.claimant = address(0);

        claimablePayouts[matchId][winner] += payout;

        emit MatchSettled(matchId, winner, payout);
    }

    function _isParticipant(Match storage m, address user) internal view returns (bool) {
        return user == m.creator || user == m.opponent;
    }

    function _signedMessageHash(bytes32 dataHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));
    }

    function _recoverSigner(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        require(sig.length == 65, "Bad sig length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }

        if (v < 27) {
            v += 27;
        }
        require(v == 27 || v == 28, "Bad v");

        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "Bad sig");
        return signer;
    }
}
