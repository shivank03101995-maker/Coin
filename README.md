# BEP20 USDT Payment Receiver (1 USDT = $1)

This project implements a legitimate USDT payment workflow on BNB Smart Chain (BEP20):

- Uses the official USDT BEP20 contract by default: `0x55d398326f99059fF775485246999027B3197955`
- Invoice-based business logic (owner creates invoice, payer pays exact amount)
- Fixed pricing rule: **1 USDT = $1**
- Web UI includes your provided logo

## Business Logic

- Only one token is accepted by design: the USDT contract passed at deployment (default official BEP20 USDT).
- Owner creates invoices in **USD cents** (e.g. `2599` = `$25.99`).
- Contract converts USD cents to token units using token decimals.
- Payer can only pay active and unpaid invoices.
- Payment transfers USDT directly to treasury wallet.
- Invoice becomes immutable paid state after success.

## Project Structure

- `contracts/UsdtPaymentReceiver.sol` - core smart contract
- `scripts/deploy.js` - deployment script
- `scripts/createInvoice.js` - owner invoice creation
- `web/` - static payment UI (`logo.png`, `index.html`, `app.js`, `style.css`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Fill `.env`:

- `DEPLOYER_PRIVATE_KEY` - deployer key
- `BSC_RPC_URL` - BSC mainnet RPC
- `TREASURY_ADDRESS` - business receiving wallet
- `OWNER_ADDRESS` - admin wallet for invoice creation
- Optional: `USDT_BEP20_ADDRESS` (defaults to official BEP20 USDT)

## Compile

```bash
npm run compile
```

## Deploy (BSC Mainnet)

```bash
npm run deploy:bsc
```

## Create Invoice

Add to `.env`:

- `PAYMENT_CONTRACT_ADDRESS=0x...`
- `INVOICE_TEXT_ID=INV-1001`
- `USD_CENTS=100` (for $1.00)
- `INVOICE_REFERENCE=optional_note`

Run:

```bash
npx hardhat run scripts/createInvoice.js --network bsc
```

## Run Payment UI

```bash
npm run serve:web
```

Open `http://localhost:4173` and:

- Connect MetaMask on BSC mainnet
- Enter deployed payment contract address
- Enter invoice text ID (same ID used at creation)
- Click `Approve + Pay Invoice`

## Custom Deployment Target

This setup is deployment-target agnostic:

- **VPS**: run with Node + Nginx (`web/` static files)
- **AWS**: deploy static `web/` to S3 + CloudFront; run scripts/ops from CI or EC2
- **Vercel/Netlify**: host `web/` as static site
- **Any custom infra**: use your preferred RPC, secrets manager, and CI pipeline

If you want, I can next add a production CI/CD pipeline for your exact custom environment (Docker, domain, SSL, wallet ops, and role separation).
