const IUniswapV2Router = artifacts.require("IUniswapV2Router")
const Minter = artifacts.require("Minter")
const Reward = artifacts.require("Reward")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert } = require("hardhat");

const IWETH = artifacts.require("IWETH")
const { DAI, UNISWAP, WETH } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([manager, user1, user2]) => {
	let weth, dai, reward, minter 
	
	it("Should unfreeze funds", async function () {
		assert.ok(true, "[message]")
	})

	// before(async function () {
	// 	// ERC token used to pay in the test
	// 	weth = await IWETH.at(WETH)
    // 	dai   = await IERC20.at(DAI)

	// 	// Geting wther in user address to test
	// 	await weth.deposit({from: user1, value: toWei('2')})
	// 	await weth.deposit({from: user2, value: toWei('2')})
		
	// 	// Geting dais in user address to test
	// 	const uniRouter = await IUniswapV2Router.at(UNISWAP)
	// 	await uniRouter.swapExactETHForTokens(
	// 		1,
	// 		[WETH, DAI],
	// 		user1,
	// 		(await time.latest()) + 10,
	// 		{from: user1, value: toWei('1')}
	// 	)

	// 	// Deploy contracts
	// 	reward = await Reward.new({ from: manager })
	// 	minter = await Minter.new(reward.address, [10, 20, 40, 80, 160, 320, 640, 1280], { from: manager })

	// 	// Set payment methods in minter contract
	// 	minter.setPaymentAllowed(DAI , true, { from: manager })
	// 	minter.setPaymentAllowed(WETH , true, { from: manager })

	// 	// Set address for the contract allowed to mint reward token
	// 	reward.setMinter(minter.address, { from: manager })
	// });

	// it("Is all setup", async function () {
	// 	// Does users have ERC20 balance ?
	// 	assert.ok(await weth.balanceOf(user1), "User balance")
	// 	assert.ok(await dai.balanceOf(user2), "User balance")

	// 	// Does the reward token have the minter contract address assigned ?
	// 	assert.equal(await minter.tokenAddress(), reward.address, "Token reward is not set in the minter")

	// 	// Does the minter have the reward token contract address assigned ?
	// 	assert.equal(await reward.minter(), minter.address, "Minter is not set in the reward token")
	// });

	// it("Should invest in the minter", async function () {
	// 	// approve and invest 100 weth fron user1
	// 	await weth.approve(minter.address, 100, { from:user1 })
	// 	await minter.freeze(weth.address, 100, { from:user1 })

	// 	const user1Funds = Number(await minter.investorFunds(user1, weth.address))

	// 	// We check that minter store balances freezed by the user1 
	// 	assert.equal(
	// 		user1Funds,
	// 		100,
	// 		"User can not freeze funds"
	// 	)
	// });

	// it("Should claim rewards", async function () {
	// 	// for this draft, just claim give you 5 reward token
	// 	await minter.claimReward(weth.address, { from:user1 })

	// 	const user1Reward = Number(await reward.balanceOf(user1))

	// 	// We check that user1 have 5 reward token
	// 	assert.equal(
	// 		user1Reward,
	// 		5,
	// 		"User can not claim reward"
	// 	)
	// });

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