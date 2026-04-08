Converted the repo into a mintable BEP20 token project for USDS with symbol USDS, 100000 initial supply, and 18 decimals. The new token contract is USDS.sol, the deploy flow now targets that contract in deploy.js, and I updated the package metadata plus docs in package.json, hardhat.config.js, and README.md.

The contract mints the full initial supply to OWNER_ADDRESS at deployment and keeps owner-only minting enabled for future supply increases. I also hardened the Hardhat config so an incomplete DEPLOYER_PRIVATE_KEY in .env won’t break local compile. Verification passed with npm run compile.

To deploy, set OWNER_ADDRESS, DEPLOYER_PRIVATE_KEY, and your RPC URL in Coin/.env, then run npm run deploy:bsc or npm run deploy:bscTestnet from Coin. One important note: this gives you a real token contract, but wallet price display and broad platform visibility still depend on token import, liquidity, listings, and external indexers.


11:27 AM
5 files changed
+85
-71
Undo

Review
README.md
USDS.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDS is ERC20, Ownable {
    uint8 private immutable tokenDecimals;

    constructor(address initialOwner, uint256 initialSupply) ERC20("USDS", "USDS") Ownable(initialOwner) {
        require(initialOwner != address(0), "Initial owner is required");
        tokenDecimals = 18;
        _mint(initialOwner, initialSupply * (10 ** uint256(tokenDecimals)));
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient is required");
        _mint(to, amount * (10 ** uint256(tokenDecimals)));
    }

    function decimals() public view override returns (uint8) {
        return tokenDecimals;
    }
}
hardhat.config.js
package.json
deploy.js
const { ethers } = require("hardhat");

async function main() {
  const officialUsdtBep20 = process.env.USDT_BEP20_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
  const treasury = process.env.TREASURY_ADDRESS;
  const owner = process.env.OWNER_ADDRESS;
  const initialSupply = process.env.INITIAL_SUPPLY || "100000";

  if (!treasury || !owner) {
    throw new Error("Set TREASURY_ADDRESS and OWNER_ADDRESS in .env");
  if (!owner) {
    throw new Error("Set OWNER_ADDRESS in .env");
  }

  const Factory = await ethers.getContractFactory("UsdtPaymentReceiver");
  const contract = await Factory.deploy(officialUsdtBep20, treasury, owner);
  const Factory = await ethers.getContractFactory("USDS");
  const contract = await Factory.deploy(owner, initialSupply);
  await contract.waitForDeployment();

  console.log("UsdtPaymentReceiver deployed to:", await contract.getAddress());
  console.log("USDT token:", officialUsdtBep20);
  console.log("Treasury:", treasury);
  console.log("USDS deployed to:", await contract.getAddress());
  console.log("Name:", await contract.name());
  console.log("Symbol:", await contract.symbol());
  console.log("Decimals:", await contract.decimals());
  console.log("Initial supply:", initialSupply);
  console.log("Owner:", owner);
}

Add these features to contract:
transfer
approve
transferFrom
mint
burn
11:28 AM



Worked for 31s
Added the requested token features in USDS.sol. transfer, approve, and transferFrom were already present because the contract inherits OpenZeppelin ERC20; mint was already owner-only; and I added burn support by inheriting ERC20Burnable, which gives you burn(uint256) and burnFrom(address,uint256).

I also updated README.md to list the supported functions clearly. Verification passed with npm run compile.

Current contract feature set:

transfer
approve
transferFrom
mint
burn
burnFrom
One small detail: mint in this contract uses whole-token amounts, so mint(to, 500) creates 500 USDS, not raw 18-decimal base units.


11:28 AM
2 files changed
+16
-2
Undo

Review
README.md
USDS.sol
Before deploy this I want to add usds coin image so that image is visible
11:36 AM



Worked for 39s
Added a token metadata template at metadata/usds.tokenlist.template.json and documented the logo flow in README.md. Your image asset is already in web/logo.png.

The important part is this: a BEP20 contract cannot store a wallet logo by itself. So deploying the contract alone will not make the image automatically appear everywhere. For the logo to be visible in wallets or dapps, you usually need:

a public HTTPS image URL
a token list or metadata entry with logoURI
sometimes a manual wallet/explorer asset submission
Next steps:

Keep or replace web/logo.png with your final coin image.
After deployment, put the deployed token address into metadata/usds.tokenlist.template.json.
Host the image publicly and replace https://your-domain.com/logo.png with the real URL.
Submit that logo/metadata to the wallets or platforms you care about.
One more thing I noticed: your contract currently says ERC20("USDT", "USDT") in USDS.sol, while the repo docs say USDS. If you want, I can fix that next so the deployed token name/symbol matches your intended branding before you deploy.


11:37 AM
2 files changed
+45
-0
Undo

Review
README.md
usds.tokenlist.template.json
Host the image publicly and replace https://your-domain.com/logo.png with the real URL.
Submit that logo/metadata to the wallets or platforms you care about.

Explain these two steps in details
11:45 AM



Here’s what those two steps really mean in practice.

1. Host the image publicly

Wallets and token lists usually need a direct internet URL to your token image, not a local file from your computer. So web/logo.png needs to be uploaded somewhere public and stable.

What “publicly hosted” means:

anyone can open the image in a browser without logging in
it uses https://...
the URL is permanent or at least long-lived
the file is the final token logo you want platforms to use
Good places to host it:

your own website, like https://yourdomain.com/logo.png
GitHub Pages
Cloudflare R2 / S3 + CloudFront
a static hosting service like Netlify or Vercel
Example:

local file: web/logo.png
public URL after upload: https://myproject.com/assets/usds-logo.png
Then update usds.tokenlist.template.json:

{
  "name": "USDS Token List",
  "timestamp": "2026-04-08T00:00:00.000Z",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "tokens": [
    {
      "chainId": 56,
      "address": "0xYourRealTokenAddress",
      "name": "USDS",
      "symbol": "USDS",
      "decimals": 18,
      "logoURI": "https://myproject.com/assets/usds-logo.png"
    }
  ]
}
A few practical tips:

use PNG
square image is best, like 256x256 or 512x512
keep the file size small
do not change the URL after people start using it
2. Submit the logo/metadata to wallets or platforms

After your token is deployed, wallets still may not show the logo automatically. Many wallets and dapps rely on external token metadata sources, token lists, or manual review systems.

This means you usually need to give platforms:

your token contract address
token name
symbol
decimals
chain/network
logo URL
sometimes project website, social links, and description
Common submission paths:

wallet asset/logo submission systems
explorer token update forms
DEX token lists
your own hosted token list JSON
What happens after submission:

the platform reviews the token data
if accepted, it may show your logo beside the token
some platforms may also display name/symbol more cleanly
this does not create a market price by itself
Important distinction:

logo visibility = branding metadata
price visibility = usually needs liquidity, trading activity, and indexers
deploying the contract alone does not guarantee either
Recommended order

Finalize your logo file.
Deploy the token contract.
Copy the deployed contract address.
Update usds.tokenlist.template.json.
Host both the logo and, if needed, the token list JSON publicly.
Submit the token info to wallets/platforms you care about.
What you need ready before submission

deployed token address
BNB Smart Chain network info
final logo URL
project website URL if you have one
symbol and decimals confirmed in the contract
One important note: I also noticed USDS.sol currently says USDT as the on-chain name/symbol. If you want your token to appear as USDS, that should be corrected before deployment.

If you want, I can do either of these next:

fix the contract name/symbol to match USDS
prepare the final token list JSON for your deployed address format
help you choose a simple free way to host the image publicly

11:45 AM

====================================================================================================

I fixed the project so testnet deployment is now pointed at the right token contract:

contracts/USDS.sol now defines USDS with on-chain name/symbol USDS
scripts/deploy.js now deploys USDS instead of USDT
I also verified the code compiles successfully with npm run compile.

When I reran the deploy on April 8, 2026 with npm run deploy:bscTestnet, it failed because the sandbox could not resolve the BSC testnet RPC hostname:
getaddrinfo EAI_AGAIN data-seed-prebsc-1-s1.binance.org

I requested network access to rerun the exact same deploy command, but that approval was rejected, so I couldn’t complete the live deployment from here.

You can deploy now from your terminal with:
=========================================================================================

<!-- ###BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
DEPLOYER_PRIVATE_KEY=0b4d6561b581f53d97dcbf5ac9e419fbe31334793a24e2466d743e9bc7748c56

OWNER_ADDRESS=0xb8eb450762361D92E264C34CC0ef8FC8cE62c2ca
INITIAL_SUPPLY=100000

PAYMENT_CONTRACT_ADDRESS=0xb8eb450762361D92E264C34CC0ef8FC8cE62c2ca
INVOICE_TEXT_ID=INV-1001
USD_CENTS=100
INVOICE_REFERENCE=Order_1001 -->
====================================================================================================
npm run deploy:bscTestnet
If you want me to finish the on-chain deploy for you in this session, approve the network-enabled rerun and I’ll pick it up immediately.


2 files changed
+4
-4
Undo

Review
contracts/USDS.sol
scripts/deploy.js
shivank@shivank-Inspiron-7415-2-in-1:~/Desktop/Project$ npm run deploy:bscTestnet

> usds-bep20-token@1.0.0 deploy:bscTestnet
> hardhat run scripts/deploy.js --network bscTestnet

WARNING: You are currently using Node.js v18.19.1, which is not supported by Hardhat. This can lead to unexpected behavior. See https://v2.hardhat.org/nodejs-versions


USDS deployed to: 0x8dfBA515773Dd05c13Ba6609B3f5b0172f335766
Name: USDS
Symbol: USDS
Decimals: 18n
Initial supply: 100000
Owner: 0xb8eb450762361D92E264C34CC0ef8FC8cE62c2ca

please deploy usdt instead of usds




Worked for 1m 4s
The token is now deployed on BSC testnet as USDT.

Deployment result:

Contract: 0x787311dD6b36e54EdE526d1782EBaEB10b169C69
Name: USDT
Symbol: USDT
Decimals: 18
Initial supply: 100000
Owner: 0xb8eb450762361D92E264C34CC0ef8FC8cE62c2ca
I updated contracts/USDS.sol so the contract class and token metadata are USDT, and updated scripts/deploy.js to deploy that contract. I also recompiled successfully before deploying.

Your earlier testnet deployment at 0x8dfBA515773Dd05c13Ba6609B3f5b0172f335766 is the old USDS token. If you want, I can next update the README, package description, and token-list template so the repo consistently says USDT everywhere.


================================================================================

