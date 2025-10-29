const hre = require("hardhat");

async function main() {
  const contractAddress = "0xA51A41827dA62e60eBeA86291f587c502Ad791F7";

  console.log("Creating 3 test proposals on ChainVote...");
  console.log("Contract:", contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Creating with account:", deployer.address);

  const ChainVote = await hre.ethers.getContractAt("ChainVote", contractAddress);

  // Get proposal fee
  const proposalFee = await ChainVote.proposalFee();
  console.log("Proposal fee:", hre.ethers.formatEther(proposalFee), "ETH\n");

  // Get current timestamp
  const now = Math.floor(Date.now() / 1000);

  // Proposal 1: Active - Protocol Upgrade
  const proposal1 = {
    name: "Protocol Upgrade v2.0",
    details: "Should we implement the new consensus mechanism? This upgrade will improve transaction throughput by 3x and reduce gas costs by 40%.",
    choices: ["Approve", "Reject", "Need More Discussion"],
    votingStart: now + 60, // Starts in 1 minute
    votingEnd: now + 86400 * 7, // Ends in 7 days
  };

  console.log("Creating Proposal 1:", proposal1.name);
  const tx1 = await ChainVote.createProposal(
    proposal1.name,
    proposal1.details,
    proposal1.choices,
    proposal1.votingStart,
    proposal1.votingEnd,
    { value: proposalFee }
  );
  await tx1.wait();
  console.log("✅ Proposal 1 created - TX:", tx1.hash);

  // Proposal 2: Active - Treasury Allocation
  const proposal2 = {
    name: "Treasury Allocation Q4 2025",
    details: "How should we allocate the 1,000,000 tokens from the treasury for Q4 2025? This will fund development, marketing, and community initiatives.",
    choices: ["50% Development, 30% Marketing, 20% Community", "60% Development, 25% Marketing, 15% Community", "40% Development, 40% Marketing, 20% Community", "Keep in Reserve"],
    votingStart: now + 120, // Starts in 2 minutes
    votingEnd: now + 86400 * 5, // Ends in 5 days
  };

  console.log("\nCreating Proposal 2:", proposal2.name);
  const tx2 = await ChainVote.createProposal(
    proposal2.name,
    proposal2.details,
    proposal2.choices,
    proposal2.votingStart,
    proposal2.votingEnd,
    { value: proposalFee }
  );
  await tx2.wait();
  console.log("✅ Proposal 2 created - TX:", tx2.hash);

  // Proposal 3: Pending - Partnership Proposal
  const proposal3 = {
    name: "Partnership with DeFi Protocol X",
    details: "Should we partner with Protocol X to integrate their lending platform? This would provide additional utility for our token holders.",
    choices: ["Yes, Partner", "No, Reject", "Yes, but Negotiate Terms"],
    votingStart: now + 86400, // Starts in 1 day
    votingEnd: now + 86400 * 8, // Ends in 8 days
  };

  console.log("\nCreating Proposal 3:", proposal3.name);
  const tx3 = await ChainVote.createProposal(
    proposal3.name,
    proposal3.details,
    proposal3.choices,
    proposal3.votingStart,
    proposal3.votingEnd,
    { value: proposalFee }
  );
  await tx3.wait();
  console.log("✅ Proposal 3 created - TX:", tx3.hash);

  // Get final proposal count
  const proposalCount = await ChainVote.getProposalCount();
  console.log("\n📊 Total proposals:", proposalCount.toString());

  console.log("\n✅ All proposals created successfully!");
  console.log("You can now view them on the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
