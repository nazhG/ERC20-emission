const Tier = artifacts.require("ERC20TransferTier")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert, ethers, upgrades } = require("hardhat");

const { USDC_ADDRESS, TIERS, USDC } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser, goldUser]) => {
	let prestigePoints, claim, tier, usdc;

	manager = '0x5044531067a7605E68CE01b436837414e5623eEe' // account with USDC in Mumbai network

	before(async function () {
		// ERC token used to pay in the test
    	usdc = await IERC20.at(USDC_ADDRESS)
		
		// Geting USDC in user address to test
		await hre.network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [manager],
		});

		// Deployed contracts
		prestigePoints = await PrestigePoints.new({ from: manager })
		tier = await Tier.new(USDC_ADDRESS, TIERS, { from: manager })
		
		const Claim = await ethers.getContractFactory("Claim")
		claim = await upgrades.deployProxy(Claim, [prestigePoints.address, tier.address, 86400 /** difficulty for test = 1 day */])
		await claim.deployed()
		prestigePoints.setMinter(claim.address, { from: manager })
	});

	it("Joining tier", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[2]), {from: silverUser})
		await tier.setTier(silverUser, 2, [], {from: silverUser})
		assert.equal(Number(await claim.getTier(silverUser)), 2, "tier not set")
	});

	it("Accumulating reward", async function () {
		const currentBlock = Number(await time.latestBlock()),
			tenPercent = Number((await tier.tierValues())[2]) * 0.1, // user earn ten percent of the tier
			daysNum = 300,
			dailyMul = 0.0009, // daily multiplier
			multiplier = daysNum * dailyMul + 1, // final multiplier
			reward = Math.floor(tenPercent * daysNum * multiplier);

		await time.advanceBlockTo(currentBlock + daysNum)

		assert.equal(Number(await claim.getReward(silverUser)), reward, 'There is not reward')
		await claim.setShowConsole(false);

		await claim.claim({from: silverUser})

		assert.equal(Number(await claim.getReward(silverUser)), 0, 'Reward no discount')
		assert.isAbove(Number(await prestigePoints.balanceOf(silverUser)), reward, 'Points claimed')
	});

})