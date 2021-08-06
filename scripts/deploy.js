async function main() {
    // npx hardhat run scripts/deploy.js --network testnet
    const PrestigePoints = await ethers.getContractFactory("PrestigePoints");
    const prestigePoints = await PrestigePoints.deploy();
    
    const Minter = await ethers.getContractFactory("Minter");
    const minter = await Minter.deploy(prestigePoints.address, [50, 100, 250, 500]);

    const USDC = "0x2058a9d7613eee744279e3856ef0eada5fcbaa7e";
		await minter.setPaymentAllowed(USDC, true);
		await prestigePoints.setMinter(minter.address);

    console.log("Prestige Points deployed to:", prestigePoints.address);
    console.log("Minter deployed to:", minter.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

//Prestige Points deployed to: 0xF2494614843767C8B0BAbCE2eBab87e827D6e223
//Minter deployed to: 0x25817DA88A754a5f74646fb01e15b46aea43aA9A
