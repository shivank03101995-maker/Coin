const OFFICIAL_USDT = "0x55d398326f99059fF775485246999027B3197955".toLowerCase();
const BSC_CHAIN_ID_HEX = "0x38";

const PAYMENT_ABI = [
  "function getInvoice(bytes32 invoiceId) view returns (tuple(uint256 usdCents,uint256 usdtAmount,bool active,bool paid,address payer,uint256 createdAt,uint256 paidAt,string invoiceRef))",
  "function payInvoice(bytes32 invoiceId)"
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

let provider;
let signer;

const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");

function setStatus(message) {
  statusEl.textContent = message;
}

async function ensureBscNetwork() {
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current !== BSC_CHAIN_ID_HEX) {
    throw new Error("Switch wallet network to BNB Smart Chain (Mainnet).");
  }
}

function requireOfficialUsdt(addressInput) {
  if (addressInput.toLowerCase() !== OFFICIAL_USDT) {
    throw new Error("Only official BEP20 USDT contract is allowed.");
  }
}

async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask is required.");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  await ensureBscNetwork();
  const user = await signer.getAddress();
  setStatus(`Connected wallet: ${user}`);
}

async function approveAndPay() {
  if (!signer) throw new Error("Connect wallet first.");

  const contractAddress = document.getElementById("contractAddress").value.trim();
  const invoiceIdText = document.getElementById("invoiceIdText").value.trim();
  const usdtAddress = document.getElementById("usdtAddress").value.trim();

  if (!ethers.isAddress(contractAddress)) throw new Error("Invalid payment contract address.");
  if (!invoiceIdText) throw new Error("Invoice ID is required.");
  if (!ethers.isAddress(usdtAddress)) throw new Error("Invalid USDT contract address.");
  requireOfficialUsdt(usdtAddress);
  await ensureBscNetwork();

  const payment = new ethers.Contract(contractAddress, PAYMENT_ABI, signer);
  const usdt = new ethers.Contract(usdtAddress, ERC20_ABI, signer);

  const invoiceId = ethers.id(invoiceIdText);
  const invoice = await payment.getInvoice(invoiceId);

  if (!invoice.active || invoice.paid) throw new Error("Invoice is not payable.");

  const user = await signer.getAddress();
  const allowance = await usdt.allowance(user, contractAddress);
  const required = invoice.usdtAmount;

  if (allowance < required) {
    setStatus("Approving USDT...");
    const approveTx = await usdt.approve(contractAddress, required);
    await approveTx.wait();
  }

  setStatus("Paying invoice...");
  const payTx = await payment.payInvoice(invoiceId);
  const receipt = await payTx.wait();
  setStatus(`Payment successful.\nTx: ${receipt.hash}`);
}

connectBtn.addEventListener("click", async () => {
  try {
    await connectWallet();
  } catch (e) {
    setStatus(`Connect failed: ${e.message}`);
  }
});

payBtn.addEventListener("click", async () => {
  try {
    await approveAndPay();
  } catch (e) {
    setStatus(`Payment failed: ${e.message}`);
  }
});
