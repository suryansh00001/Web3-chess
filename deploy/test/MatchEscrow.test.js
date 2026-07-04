const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MatchEscrow", function () {
  let MatchEscrow;
  let escrow;
  let owner;
  let oracle;
  let creator;
  let opponent;
  let bystander;
  let chainId;

  const matchId = 12345;
  const stakeAmount = ethers.utils.parseEther("0.01");
  const moveTimeout = 300; // 5 minutes
  const disputeWindow = 3600; // 1 hour
  const checkpointStr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1|0";
  const checkpointHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(checkpointStr));

  beforeEach(async function () {
    [owner, oracle, creator, opponent, bystander] = await ethers.getSigners();
    
    // Deploy MatchEscrow
    MatchEscrow = await ethers.getContractFactory("MatchEscrow");
    escrow = await MatchEscrow.deploy();
    await escrow.deployed();

    // Set owner and oracle
    await escrow.connect(owner).setOracle(oracle.address);

    const network = await ethers.provider.getNetwork();
    chainId = network.chainId;
  });

  // Helpers to sign payloads
  async function signProposeResult(signer, mId, winner, cpHash) {
    const actionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PROPOSE_RESULT"));
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'address', 'uint256', 'uint256', 'address', 'bytes32'],
      [actionHash, escrow.address, chainId, mId, winner, cpHash]
    );
    const innerHash = ethers.utils.keccak256(encoded);
    return signer.signMessage(ethers.utils.arrayify(innerHash));
  }

  async function signOracleSettle(signer, mId, winner, cpHash) {
    const actionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_SETTLE"));
    const encoded = ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'address', 'uint256', 'uint256', 'address', 'bytes32'],
      [actionHash, escrow.address, chainId, mId, winner, cpHash]
    );
    const innerHash = ethers.utils.keccak256(encoded);
    return signer.signMessage(ethers.utils.arrayify(innerHash));
  }

  describe("setOracle", function () {
    it("should allow the owner to update the oracle", async function () {
      await escrow.connect(owner).setOracle(bystander.address);
      expect(await escrow.oracle()).to.equal(bystander.address);
    });

    it("should revert if setOracle is called by a non-owner", async function () {
      let failed = false;
      try {
        await escrow.connect(creator).setOracle(bystander.address);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Only owner");
      }
      expect(failed).to.be.true;
    });
  });

  describe("createMatch", function () {
    it("should allow a creator to stake and create a match", async function () {
      const tx = await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === "MatchCreated");
      expect(event).to.not.be.undefined;
      expect(event.args.matchId.toString()).to.equal(matchId.toString());
      expect(event.args.creator).to.equal(creator.address);
      expect(event.args.stakeAmount.toString()).to.equal(stakeAmount.toString());

      const m = await escrow.matches(matchId);
      expect(m.creator).to.equal(creator.address);
      expect(m.stakeAmount.toString()).to.equal(stakeAmount.toString());
      expect(m.status).to.equal(1); // MatchStatus.OPEN
    });

    it("should revert if creating a match with ID 0", async function () {
      let failed = false;
      try {
        await escrow.connect(creator).createMatch(0, moveTimeout, disputeWindow, { value: stakeAmount });
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Invalid");
      }
      expect(failed).to.be.true;
    });

    it("should revert if duplicate match is created", async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      let failed = false;
      try {
        await escrow.connect(opponent).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Match exists already");
      }
      expect(failed).to.be.true;
    });
  });

  describe("joinMatch", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
    });

    it("should allow an opponent to stake and join an open match", async function () {
      const tx = await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount });
      const receipt = await tx.wait();

      const event = receipt.events.find(e => e.event === "MatchJoined");
      expect(event).to.not.be.undefined;
      expect(event.args.matchId.toString()).to.equal(matchId.toString());
      expect(event.args.opponent).to.equal(opponent.address);

      const m = await escrow.matches(matchId);
      expect(m.opponent).to.equal(opponent.address);
      expect(m.status).to.equal(2); // MatchStatus.ACTIVE
    });

    it("should revert if joining match with incorrect stake", async function () {
      let failed = false;
      try {
        await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount.div(2) });
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("stake mismatch");
      }
      expect(failed).to.be.true;
    });

    it("should revert if creator tries to join their own match", async function () {
      let failed = false;
      try {
        await escrow.connect(creator).joinMatch(matchId, { value: stakeAmount });
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("creator cant join");
      }
      expect(failed).to.be.true;
    });
  });

  describe("proposeResult (Cooperative)", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount });
    });

    it("should settle and award all funds to creator on valid cooperative result signatures", async function () {
      const creatorSig = await signProposeResult(creator, matchId, creator.address, checkpointHash);
      const opponentSig = await signProposeResult(opponent, matchId, creator.address, checkpointHash);

      const tx = await escrow.connect(creator).proposeResult(matchId, creator.address, checkpointHash, creatorSig, opponentSig);
      const receipt = await tx.wait();

      const eventProposed = receipt.events.find(e => e.event === "ResultProposed");
      expect(eventProposed).to.not.be.undefined;
      expect(eventProposed.args.matchId.toString()).to.equal(matchId.toString());
      expect(eventProposed.args.winner).to.equal(creator.address);

      const eventSettled = receipt.events.find(e => e.event === "MatchSettled");
      expect(eventSettled).to.not.be.undefined;
      expect(eventSettled.args.winner).to.equal(creator.address);
      expect(eventSettled.args.payout.toString()).to.equal(stakeAmount.mul(2).toString());

      const m = await escrow.matches(matchId);
      expect(m.status).to.equal(5); // MatchStatus.SETTLED
      expect(m.winner).to.equal(creator.address);

      expect((await escrow.claimablePayouts(matchId, creator.address)).toString()).to.equal(stakeAmount.mul(2).toString());
    });

    it("should revert if wrong signatures are submitted", async function () {
      const creatorSig = await signProposeResult(creator, matchId, creator.address, checkpointHash);
      const invalidSig = await signProposeResult(bystander, matchId, creator.address, checkpointHash);

      let failed = false;
      try {
        await escrow.connect(creator).proposeResult(matchId, creator.address, checkpointHash, creatorSig, invalidSig);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Bad opponent sig");
      }
      expect(failed).to.be.true;
    });
  });

  describe("settleWithOracle", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount });
    });

    it("should allow settlement on a decisive outcome via oracle signature", async function () {
      const oracleSig = await signOracleSettle(oracle, matchId, opponent.address, checkpointHash);

      const tx = await escrow.connect(opponent).settleWithOracle(matchId, opponent.address, checkpointHash, oracleSig);
      const receipt = await tx.wait();

      const eventSettled = receipt.events.find(e => e.event === "MatchSettled");
      expect(eventSettled).to.not.be.undefined;
      expect(eventSettled.args.winner).to.equal(opponent.address);
      expect(eventSettled.args.payout.toString()).to.equal(stakeAmount.mul(2).toString());

      const m = await escrow.matches(matchId);
      expect(m.status).to.equal(5); // MatchStatus.SETTLED
      expect(m.winner).to.equal(opponent.address);
      expect((await escrow.claimablePayouts(matchId, opponent.address)).toString()).to.equal(stakeAmount.mul(2).toString());
    });

    it("should support draws by splitting payout equally between participants via oracle signature", async function () {
      const zeroAddress = ethers.constants.AddressZero;
      const oracleSig = await signOracleSettle(oracle, matchId, zeroAddress, checkpointHash);

      const tx = await escrow.connect(creator).settleWithOracle(matchId, zeroAddress, checkpointHash, oracleSig);
      const receipt = await tx.wait();

      const eventSettled = receipt.events.find(e => e.event === "MatchSettled");
      expect(eventSettled).to.not.be.undefined;
      expect(eventSettled.args.winner).to.equal(zeroAddress);
      expect(eventSettled.args.payout.toString()).to.equal(stakeAmount.toString());

      expect((await escrow.claimablePayouts(matchId, creator.address)).toString()).to.equal(stakeAmount.toString());
      expect((await escrow.claimablePayouts(matchId, opponent.address)).toString()).to.equal(stakeAmount.toString());
    });

    it("should revert if oracle signature is signed by a bystander", async function () {
      const invalidSig = await signOracleSettle(bystander, matchId, opponent.address, checkpointHash);
      let failed = false;
      try {
        await escrow.connect(opponent).settleWithOracle(matchId, opponent.address, checkpointHash, invalidSig);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Bad oracle signature");
      }
      expect(failed).to.be.true;
    });
  });

  describe("cancelOpenMatch", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
    });

    it("should allow creator to cancel an open match and claim refund", async function () {
      const tx = await escrow.connect(creator).cancelOpenMatch(matchId);
      const receipt = await tx.wait();

      const event = receipt.events.find(e => e.event === "MatchCancelled");
      expect(event).to.not.be.undefined;

      const m = await escrow.matches(matchId);
      expect(m.status).to.equal(6); // MatchStatus.CANCELLED
      expect((await escrow.claimablePayouts(matchId, creator.address)).toString()).to.equal(stakeAmount.toString());
    });

    it("should revert if non-creator tries to cancel match", async function () {
      let failed = false;
      try {
        await escrow.connect(opponent).cancelOpenMatch(matchId);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Only creator");
      }
      expect(failed).to.be.true;
    });

    it("should revert if trying to cancel after opponent joins", async function () {
      await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount });
      let failed = false;
      try {
        await escrow.connect(creator).cancelOpenMatch(matchId);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Not open");
      }
      expect(failed).to.be.true;
    });
  });

  describe("claimPayout", function () {
    beforeEach(async function () {
      await escrow.connect(creator).createMatch(matchId, moveTimeout, disputeWindow, { value: stakeAmount });
      await escrow.connect(opponent).joinMatch(matchId, { value: stakeAmount });
      
      const creatorSig = await signProposeResult(creator, matchId, creator.address, checkpointHash);
      const opponentSig = await signProposeResult(opponent, matchId, creator.address, checkpointHash);
      await escrow.connect(creator).proposeResult(matchId, creator.address, checkpointHash, creatorSig, opponentSig);
    });

    it("should allow the winner to successfully pull their payout and empty their balance", async function () {
      const initialBalance = await creator.getBalance();
      const payout = stakeAmount.mul(2);

      const tx = await escrow.connect(creator).claimPayout(matchId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(tx.gasPrice);

      const finalBalance = await creator.getBalance();
      expect(finalBalance.toString()).to.equal(initialBalance.add(payout).sub(gasUsed).toString());
      expect((await escrow.claimablePayouts(matchId, creator.address)).toString()).to.equal("0");
    });

    it("should revert if claiming twice", async function () {
      await escrow.connect(creator).claimPayout(matchId);
      let failed = false;
      try {
        await escrow.connect(creator).claimPayout(matchId);
      } catch (err) {
        failed = true;
        expect(err.message).to.contain("Nothing to claim");
      }
      expect(failed).to.be.true;
    });
  });
});
