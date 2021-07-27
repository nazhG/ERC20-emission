const IUniswapV2Router = artifacts.require("IUniswapV2Router")
const Minter = artifacts.require("Minter")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");

const IWETH = artifacts.require("IWETH")
const { TVK, UNISWAP, WETH } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([manager, user1, silverUser]) => {
	let weth, prestigePoints, minter 
	const K = 1000,
	BRONCE = 5*K,
	SILVER = 10*K,
	GOLD = 25*K,
	PLATINUM = 50*K,
	TIERS_IN_CONTRACT = [BRONCE, SILVER, GOLD, PLATINUM],
	TIERS = {
		zero: 0,
		bronce: 1,
		silver: 2,
		gold: 3,
		platinum: 4 
	}



	before(async function () {
		// ERC token used to pay in the test
		weth = await IWETH.at(WETH)
    	tvk   = await IERC20.at(TVK)

		// Geting wther in user address to test
		await weth.deposit({from: silverUser, value: toWei('2')})
		
		// Geting TVK in user address to test
		const uniRouter = await IUniswapV2Router.at(UNISWAP)
		await uniRouter.swapExactETHForTokens(
			1,
			[WETH, TVK],
			silverUser,
			(await time.latest()) + 10,
			{from: user1, value: toWei('1')}
		)

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

	// it("Should unfreeze funds", async function () {
	// 	const user1initialBalance = Number(await weth.balanceOf(user1))
		
	// 	await minter.unfreeze(weth.address, { from:user1 })
		
	// 	const user1finalBalance = Number(await weth.balanceOf(user1))

	// 	// We check that the user has the same balance with which he started
	// 	assert.equal(
	// 		user1initialBalance,
	// 		user1finalBalance - 100,
	// 		"User can not unfreeze inicial invest"
	// 	)

	// 	const user1Funds = Number(await minter.investorFunds(user1, weth.address))

	// 	// We check that the contract decreases the stored balance after unfreezing the funds 
	// 	assert.equal(
	// 		user1Funds,
	// 		0,
	// 		"User can not freeze funds"
	// 	)
	// });

});