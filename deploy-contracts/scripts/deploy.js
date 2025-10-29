const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying ChainVote contract to Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ChainVote = await hre.ethers.getContractFactory("ChainVote");
  const chainVote = await ChainVote.deploy();

  await chainVote.waitForDeployment();

  const contractAddress = await chainVote.getAddress();
  console.log("\n✅ ChainVote deployed to:", contractAddress);

  // Get contract info
  const proposalFee = await chainVote.proposalFee();
  const admin = await chainVote.admin();
  const proposalCounter = await chainVote.proposalCounter();

  console.log("\nContract Info:");
  console.log("- Admin:", admin);
  console.log("- Proposal Fee:", hre.ethers.formatEther(proposalFee), "ETH");
  console.log("- Proposal Counter:", proposalCounter.toString());
  console.log("- Deployer:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    admin: admin,
    proposalFee: proposalFee.toString(),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Update the contract address in:");
  console.log("   ../src/config/contracts.ts");
  console.log(`   ChainVote: "${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
