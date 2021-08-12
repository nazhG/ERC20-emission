async function main() {
    // npx hardhat run scripts/deploy.js --network testnet
    const PrestigePoints = await ethers.getContractFactory("PrestigePoints");
    const prestigePoints = await PrestigePoints.deploy();
    
    const Minter = await ethers.getContractFactory("Minter");
    const minter = await Minter.deploy(prestigePoints.address, [500000, 1000000, 2500000, 5000000]);

    const USDC = "0x2058a9d7613eee744279e3856ef0eada5fcbaa7e";
		await minter.setPaymentAllowed(USDC, true);
		await prestigePoints.setMinter(minter.address);

    console.log("Minter deployed to:", minter.address);
    console.log("Prestige Points deployed to:", prestigePoints.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


// Minter deployed to: 0xA8Bfd1D61e01A8e3Eca871f02867Ecd37B3Af9Dd
// Prestige Points deployed to: 0x9F40B3cB71fFa5D18Cf87393FDf04C1D3439EA10    