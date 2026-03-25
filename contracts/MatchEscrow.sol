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
        uint64 moveTimeout;
        uint64 disputeWindow;
        MatchStatus status;
        address winner;
    }

    mapping(uint256 => Match) public matches;

    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 stakeAmount);
    event MatchJoined(uint256 indexed matchId, address indexed opponent);
    event ResultProposed(uint256 indexed matchId, address indexed proposer, address indexed winner);
    event ForfeitClaimOpened(uint256 indexed matchId, address indexed claimant);
    event ClaimChallenged(uint256 indexed matchId, address indexed challenger);
    event MatchSettled(uint256 indexed matchId, address indexed winner, uint256 payout);
    event MatchCancelled(uint256 indexed matchId);

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
            moveTimeout: moveTimeout,
            disputeWindow: disputeWindow,
            status : MatchStatus.OPEN,
            winner: address(0)
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
        revert("Not implemented");
    }

    function openForfeitClaim(
        uint256 matchId,
        bytes32 checkpointHash,
        bytes calldata claimantSig,
        bytes calldata counterpartySig
    ) external {
        revert("Not implemented");
    }

    function challengeClaim(
        uint256 matchId,
        bytes32 newerCheckpointHash,
        bytes calldata creatorSig,
        bytes calldata opponentSig
    ) external {
        revert("Not implemented");
    }

    function finalizeClaim(uint256 matchId) external {
        revert("Not implemented");
    }

    function claimPayout(uint256 matchId) external {
        revert("Not implemented");
    }

    function cancelOpenMatch(uint256 matchId) external {
        revert("Not implemented");
    }
}
