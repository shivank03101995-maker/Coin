# USDS BEP20 Token

This project deploys a mintable and burnable BEP20 token named `USDS` on BNB Smart Chain.

Default token settings in this repo:

- Name: `USDS`
- Symbol: `USDS`
- Initial supply: `100000`
- Decimals: `18`
- Minting: enabled for the owner
- Burning: enabled for token holders and approved spenders

## How It Works

- The token contract is [contracts/USDS.sol](./contracts/USDS.sol).
- On deployment, the full initial supply is minted to the owner wallet.
- The owner can mint more tokens later by calling `mint(address to, uint256 amount)`.
- Standard ERC20 functions `transfer`, `approve`, and `transferFrom` are available through OpenZeppelin's `ERC20` base contract.
- Token holders can burn their own tokens with `burn(uint256 amount)`.
- Approved spenders can burn on behalf of another wallet with `burnFrom(address account, uint256 amount)`.
- Token amounts passed to the contract use whole-token units, and the contract converts them to 18-decimal base units internally.

## Project Structure

- `contracts/USDS.sol` - mintable BEP20 token contract
- `scripts/deploy.js` - deployment script for BSC mainnet or testnet
- `hardhat.config.js` - network and compiler config
- `web/logo.png` - token/project logo asset used by the frontend
- `metadata/usds.tokenlist.template.json` - token list template for wallets and dapps that support `logoURI`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` and set:

```bash
DEPLOYER_PRIVATE_KEY=your_private_key
BSC_RPC_URL=your_bsc_mainnet_rpc
BSC_TESTNET_RPC_URL=your_bsc_testnet_rpc
OWNER_ADDRESS=your_owner_wallet
INITIAL_SUPPLY=100000
```

## Compile

```bash
npm run compile
```

## Deploy To BSC Mainnet

```bash
npm run deploy:bsc
```

## Deploy To BSC Testnet

```bash
npm run deploy:bscTestnet
```

## What The Deploy Script Does

The deploy script:

- reads `OWNER_ADDRESS` and `INITIAL_SUPPLY` from `.env`
- deploys the `USDS` contract
- mints the initial supply to the owner
- prints the deployed address, name, symbol, decimals, and owner

## Owner Minting

After deployment, the owner can mint more tokens by calling:

```solidity
mint(address to, uint256 amount)
```

Example:

- `mint(0xReceiver..., 500)` mints `500` USDS tokens to that wallet

## Supported Token Functions

- `transfer(address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `mint(address to, uint256 amount)` - owner only
- `burn(uint256 amount)` - token holder burns own balance
- `burnFrom(address account, uint256 amount)` - burns from approved allowance

## Token Image Visibility

The token image is not stored inside the BEP20 contract itself. A deployed token contract can expose name, symbol, decimals, balances, and transfers, but wallet logo display usually depends on external metadata.

This repo already keeps the local branding image at:

- `web/logo.png`

To improve logo visibility after deployment:

1. Host `web/logo.png` on a public HTTPS URL such as `https://your-domain.com/logo.png`
2. Update `metadata/usds.tokenlist.template.json` with:
   - your deployed token address
   - the final public `logoURI`
3. Submit the token and logo to wallets, explorers, or token lists that support custom assets

Typical places that may use token metadata or logo submissions:

- Trust Wallet asset repository
- PancakeSwap-compatible token lists
- Your own token list JSON
- Your own project website

## Notes

- Wallets can show the token after you import the deployed token contract address.
- Wallets do not automatically read a logo from the contract, so image visibility depends on supported token lists or wallet asset submissions.
- Price display in wallets or other platforms is not automatic. That usually requires exchange listings, liquidity, and third-party indexers.
