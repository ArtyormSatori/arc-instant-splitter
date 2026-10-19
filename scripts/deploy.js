const hre = require("hardhat");

async function main() {
  console.log("Deploying ArcSplitter to network:", hre.network.name);

  const ArcSplitter = await hre.ethers.getContractFactory("ArcSplitter");
  const splitter = await ArcSplitter.deploy();

  await splitter.waitForDeployment();

  const address = await splitter.getAddress();
  console.log(" ArcSplitter deployed successfully!");
  console.log("Contract Address:", address);
  console.log("Explorer Link:", `https://explorer.arc.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
