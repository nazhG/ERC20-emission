const Minter = artifacts.require("Minter")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert } = require("hardhat");

const { TVK, BRONCE, SILVER, GOLD, PLATINUM, } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([manager]) => {
	let prestigePoints, minter 
	
	TIERS_IN_CONTRACT = [BRONCE, SILVER, GOLD, PLATINUM],
	TIERS = {
		zero: 0,
		bronce: 1,
		silver: 2,
		gold: 3,
		platinum: 4 
	}

	silverUser = '0x71f1a8f947ba7fe5662fc84fa3979d7d52731ccc' // account TVK in matic network

	before(async function () {
		// ERC token used to pay in the test
    	tvk   = await IERC20.at(TVK)
		
		// Geting TVK in user address to test
		await hre.network.provider.request({
			method: "hardhat_impersonateAccount",
			params: [silverUser],
		});

		// Deploy contracts
		prestigePoints = await PrestigePoints.new({ from: manager })
		minter = await Minter.new(prestigePoints.address, TIERS_IN_CONTRACT, { from: manager })

		// Set payment methods in minter contract
		minter.setPaymentAllowed(TVK , true, { from: manager })

		// Set address for the contract allowed to mint reward token
		prestigePoints.setMinter(minter.address, { from: manager })
	});

	it("Is all setup", async function () {
		// Does users have ERC20 balance ?
		assert.ok(await tvk.balanceOf(silverUser), "User balance")

		// Does the reward token have the minter contract address assigned ?
		assert.equal(await minter.tokenAddress(), prestigePoints.address, "Token reward is not set in the minter")

		// Does the minter have the reward token contract address assigned ?
		assert.equal(await prestigePoints.minter(), minter.address, "Minter is not set in the reward token")
	});

	it("Should invest in the minter", async function () {
		await tvk.approve(minter.address, SILVER, { from:silverUser })
		await minter.freeze(tvk.address, SILVER, { from:silverUser })

		const userFunds = Number((await minter.investorFunds(silverUser)).funds)
		
		// We check that minter store balances freezed by the silverUser 
		assert.equal(
			userFunds,
			SILVER,
			"User is not silver tier"
		)

		const userTier = Number(await minter.getUserTier(silverUser))
		assert.equal(
			userTier,
			TIERS.silver,
			"User can not freeze funds"
		)
	});

	it("Should claim rewards", async function () {
		await time.increase(3888000 /** 45 days */);

		await minter.claimReward({ from:silverUser })

		const silverUserReward = Number(await prestigePoints.balanceOf(silverUser))

		// We check that user1 have 5 reward token
		assert.equal(
			silverUserReward,
			150,
			"User can not claim reward"
		)
	});

});