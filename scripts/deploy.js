const { ethers } = require("hardhat");

async function main() {
  const owner = process.env.OWNER_ADDRESS;
  const initialSupply = process.env.INITIAL_SUPPLY || "100000";

  if (!owner) {
    throw new Error("Set OWNER_ADDRESS in .env");
  }

  const Factory = await ethers.getContractFactory("USDT");
  const contract = await Factory.deploy(owner, initialSupply);
  await contract.waitForDeployment();

  console.log("USDT deployed to:", await contract.getAddress());
  console.log("Name:", await contract.name());
  console.log("Symbol:", await contract.symbol());
  console.log("Decimals:", await contract.decimals());
  console.log("Initial supply:", initialSupply);
  console.log("Owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
