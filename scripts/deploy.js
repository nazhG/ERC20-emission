const { USDC_ADDRESS, TIERS } = require("../test/token_address")

async function main() {
    // npx hardhat run scripts/deploy.js --network testnet
    const Tier = await ethers.getContractFactory("ERC20TransferTier");
    const Claimer = await ethers.getContractFactory("Claim");
    
		tier = await Tier.deploy(USDC_ADDRESS, TIERS)
		claimer = await Claimer.deploy(tier.address)

    console.log("Claimer deployed to:", claimer.address);
    console.log("Tier deployed to:", tier.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
    
// Claimer to: 0x0CA7Ec7b831305DCA0bfCF8E62f959A50c4121A6
// Dummy to: 0xAeeF3dE727E4a4ecAa7b7Ff648c7167C5329ec4B