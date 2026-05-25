const hre = require('hardhat');
const fs = require('fs');

async function main() {
  await hre.run('compile');

  const Match = await hre.ethers.getContractFactory('MatchEscrow');
  const match = await Match.deploy();
  await match.deployed();

  console.log('MatchEscrow deployed to:', match.address);

  const artifact = await hre.artifacts.readArtifact('MatchEscrow');
  const out = {
    address: match.address,
    abi: artifact.abi
  };

  fs.mkdirSync('deployed', { recursive: true });
  fs.writeFileSync('deployed/MatchEscrow.json', JSON.stringify(out, null, 2));
  console.log('Wrote deployed/MatchEscrow.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
