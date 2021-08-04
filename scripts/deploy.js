async function main() {
    // We get the contract to deploy
    const PrestigePoints = await ethers.getContractFactory("PrestigePoints");
    const prestigePoints = await PrestigePoints.deploy();
  
    console.log("Prestige Points deployed to:", prestigePoints.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });