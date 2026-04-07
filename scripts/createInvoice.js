const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.PAYMENT_CONTRACT_ADDRESS;
  const invoiceText = process.env.INVOICE_TEXT_ID;
  const usdCents = Number(process.env.USD_CENTS || "0");
  const reference = process.env.INVOICE_REFERENCE || "";

  if (!contractAddress || !invoiceText || !usdCents) {
    throw new Error("Set PAYMENT_CONTRACT_ADDRESS, INVOICE_TEXT_ID and USD_CENTS in .env");
  }

  const invoiceId = ethers.id(invoiceText);
  const payment = await ethers.getContractAt("UsdtPaymentReceiver", contractAddress);
  const tx = await payment.createInvoice(invoiceId, usdCents, reference);
  await tx.wait();

  console.log("Invoice created");
  console.log("Text ID:", invoiceText);
  console.log("bytes32 ID:", invoiceId);
  console.log("USD cents:", usdCents);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
