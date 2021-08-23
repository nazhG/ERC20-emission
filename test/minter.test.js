const Tier = artifacts.require("Tier")
const Minter = artifacts.require("Minter")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert } = require("hardhat");

const { USDC_ADDRESS, USDC, TIERS, } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser, goldUser]) => {
	let prestigePoints, minter , usdc;


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
		tier = await Tier.new(TIERS, { from: manager })
		minter = await Minter.new(prestigePoints.address, USDC_ADDRESS, tier.address, { from: manager })

		// Set address for the contract allowed to mint reward token
		await prestigePoints.setMinter(minter.address, { from: manager })
	});

	it("Is all setup", async function () {
		// Does users have ERC20 balance ?
		await usdc.transfer(silverUser, TIERS[1])
		const balanceSilverUser = Number(await usdc.balanceOf(silverUser));
		assert.ok(balanceSilverUser, "User balance")
		await usdc.transfer(goldUser, TIERS[2])
		const balanceGoldUser = Number(await usdc.balanceOf(goldUser));
		assert.ok(balanceGoldUser, "User balance")
		
		// Does the reward token have the minter contract address assigned ?
		assert.equal(await minter.tokenAddress(), prestigePoints.address, "Token reward is not set in the minter")

		// Does the minter have the reward token contract address assigned ?
		assert.equal(await prestigePoints.minter(), minter.address, "Minter is not set in the reward token")
	});

	it("Should invest in the minter", async function () {
		const investment = 1*USDC
		await usdc.approve(minter.address, investment, { from:silverUser })
		await minter.freeze(investment, { from:silverUser })
		
		assert.isNotOk(
			Boolean(await minter.isTier(silverUser, 0)),
			"User is not un tier"
		)

		const userFunds = Number((await minter.investorFunds(silverUser)).funds)
		
		// We check that minter store balances freezed by the silverUser 
		assert.equal(
			investment,
			userFunds,
			"User is not silver tier"
		)

		const userTier = Boolean(await minter.isTier(silverUser, 1))
		assert.ok(
			userTier,
			"User can not freeze funds"
		)
	});

	it("Should claim rewards", async function () {
		// advance time
		await time.increase(time.duration.days(45));

		const stimatedReward = Number(await minter.getCurrentReward(silverUser))

		await minter.claimReward({ from:silverUser })

		const silverUserReward = Number(await prestigePoints.balanceOf(silverUser))
		
		const tenPercent = TIERS[1] * 0.1, // user earn ten percent of the tier
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

	it("Should unfrezze", async function () {
		// advance time
		// await time.increase(time.duration.days(10));
		
		const userInitialFunds = Number((await minter.investorFunds(silverUser)).funds)
		const inicialUsdcBalance = Number(await usdc.balanceOf(silverUser))
		
		await minter.unfreeze({ from:silverUser })
		
		const userFinalFunds = Number((await minter.investorFunds(silverUser)).funds)
		const finalBalance = Number(await usdc.balanceOf(silverUser))
		assert.equal(
			userFinalFunds,
			0,
			"Contract funds are not updated"
		)
		assert.equal(
			inicialUsdcBalance + userInitialFunds,
			finalBalance,
			"Contract do not transfer back to the user"
		)
		// console.log(await minter.isTier(silverUser, 1))
		// assert.isNotOk(
		// 	Boolean(await minter.isTier(silverUser, 1)),
		// 	"User is not un tier"
		// )
	});
	
	it("Should use the test function", async function () {
		await minter.setFunds(
			goldUser, 
			{
				timeStart: Number(await time.latest()) - time.duration.days(45), 
				funds: TIERS[2]
			}
		);
		assert.ok(
			Number(await minter.getCurrentReward(goldUser)) > 0,
			"Test function do not assign funds"
		)
	})

});