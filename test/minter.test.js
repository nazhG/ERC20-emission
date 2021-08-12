const Minter = artifacts.require("Minter")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert } = require("hardhat");

const { USDC_ADDRESS, BRONZE, SILVER, GOLD, PLATINUM, } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser, goldUser]) => {
	let prestigePoints, minter , usdc;
	
	TIERS = [
		{
			num: 0,
			value: BRONZE, 
			name: 'bronze', 
		},
		{
			num: 1,
			value: SILVER, 
			name: 'silver', 
		},
		{
			num: 2,
			value: GOLD, 
			name: 'gold', 
		},
		{
			num: 3,
			value: PLATINUM, 
			name: 'platinum', 
		}, 
	]

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
		minter = await Minter.new(prestigePoints.address, TIERS.map(i => i.value), { from: manager })

		// Set payment methods in minter contract
		await minter.setPaymentAllowed(USDC_ADDRESS , true, { from: manager })
		
		// Set address for the contract allowed to mint reward token
		await prestigePoints.setMinter(minter.address, { from: manager })
	});

	it("Is all setup", async function () {
		// Does users have ERC20 balance ?
		await usdc.transfer(silverUser, SILVER)
		const balanceSilverUser = Number(await usdc.balanceOf(silverUser));
		assert.ok(balanceSilverUser, "User balance")
		await usdc.transfer(goldUser, GOLD)
		const balanceGoldUser = Number(await usdc.balanceOf(goldUser));
		assert.ok(balanceGoldUser, "User balance")
		
		// Does the reward token have the minter contract address assigned ?
		assert.equal(await minter.tokenAddress(), prestigePoints.address, "Token reward is not set in the minter")

		// Does the minter have the reward token contract address assigned ?
		assert.equal(await prestigePoints.minter(), minter.address, "Minter is not set in the reward token")
	});

	it("Should invest in the minter", async function () {
		const silver_tier = TIERS[1]
		await usdc.approve(minter.address, silver_tier.value, { from:silverUser })
		await minter.freeze(usdc.address, silver_tier.num, { from:silverUser })

		const userFunds = Number((await minter.investorFunds(silverUser)).funds)
		
		// We check that minter store balances freezed by the silverUser 
		assert.equal(
			silver_tier.value,
			SILVER,
			"User is not silver tier"
		)

		const userTier = Number(await minter.getUserTier(silverUser))
		assert.equal(
			userTier,
			silver_tier.num,
			"User can not freeze funds"
		)
	});

	it("Should claim rewards", async function () {
		// advance time
		await time.increase(time.duration.days(45));

		const stimatedReward = Number(await minter.getCurrentReward(silverUser))

		await minter.claimReward({ from:silverUser })

		const silverUserReward = Number(await prestigePoints.balanceOf(silverUser))
		
		const tenPercent = SILVER * 0.1, // user earn ten percent of the tier
		daysNum = 45,
		dailyMul = 0.0009, // daily multiplier
		multiplier = daysNum * dailyMul + 1 // final multiplier
		reward = Math.floor(tenPercent * daysNum * multiplier)

		console.log('\tReward: ', reward)


		assert.equal(
			stimatedReward,
			silverUserReward,
			"User can not claim reward"

		)
		assert.equal(
			reward,
			silverUserReward,
			"User can not claim reward"

		)
	});

});