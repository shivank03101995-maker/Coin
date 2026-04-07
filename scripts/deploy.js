const { ethers } = require("hardhat");

async function main() {
  const officialUsdtBep20 = process.env.USDT_BEP20_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
  const treasury = process.env.TREASURY_ADDRESS;
  const owner = process.env.OWNER_ADDRESS;

  if (!treasury || !owner) {
    throw new Error("Set TREASURY_ADDRESS and OWNER_ADDRESS in .env");
  }

  const Factory = await ethers.getContractFactory("UsdtPaymentReceiver");
  const contract = await Factory.deploy(officialUsdtBep20, treasury, owner);
  await contract.waitForDeployment();

  console.log("UsdtPaymentReceiver deployed to:", await contract.getAddress());
  console.log("USDT token:", officialUsdtBep20);
  console.log("Treasury:", treasury);
  console.log("Owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
