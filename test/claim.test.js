const Tier = artifacts.require("ERC20TransferTier")
const Claim = artifacts.require("Claim")
const IERC20 = artifacts.require("IERC20")
const { time } = require("@openzeppelin/test-helpers")
const { assert } = require("hardhat");

const { USDC_ADDRESS, TIERS } = require("./token_address")

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser]) => {
	let claimer, tier, usdc, // contracts
	reward;

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
		tier = await Tier.new(USDC_ADDRESS, TIERS, { from: manager })
		claimer = await Claim.new(tier.address, 86400, { from: manager })
	});

	it("Joining tier", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[2]), {from: silverUser})
		await tier.setTier(silverUser, 2, [], {from: silverUser})
		assert.equal(Number(await claimer.getTier(silverUser)), 2, "tier not set")
	});

	it("Accumulating reward", async function () {
		const currentBlock = Number(await time.latestBlock()),
		tenPercent = Number((await tier.tierValues())[2]) * 0.1, // user earn ten percent of the tier
		daysNum = 300,
		dailyMul = 0.0009, // daily multiplier
		multiplier = daysNum * dailyMul + 1; // final multiplier
		reward = Math.floor(tenPercent * daysNum * multiplier);
		
		await time.advanceBlockTo(currentBlock + daysNum)
		
		assert.equal(Number(await claimer.getReward(silverUser)), reward, 'There is not reward')
		await claimer.setShowConsole(false);
	});
		
	it("Claiming reward", async function () {
		await claimer.claim({from: silverUser})

		assert.equal(Number(await claimer.getReward(silverUser)), 0, 'Reward no discount')
		assert.isAbove(Number(await claimer.balanceOf(silverUser)), reward, 'Points claimed')
	});

})