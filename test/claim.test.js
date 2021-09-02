const Tier = artifacts.require("ERC20TransferTier")
const PrestigePoints = artifacts.require("PrestigePoints")
const {
	expectEvent,
	expectRevert,
	time,
  } = require("@openzeppelin/test-helpers")
const BN = require("bn.js");
const { assert, ethers, upgrades } = require("hardhat");

const { USDC_ADDRESS, BRONZE, SILVER, GOLD, PLATINUM, } = require("./token_address")
const IERC20 = artifacts.require("IERC20")

const toWei = (value) => web3.utils.toWei(String(value))

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser, goldUser]) => {
	let prestigePoints, claim, tier, usdc;
	
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
		{
			num: 4,
			value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
			name: 'dummy5', 
		}, 
		{
			num: 5,
			value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
			name: 'dummy6', 
		}, 
		{
			num: 6,
			value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
			name: 'dummy7', 
		}, 
		{
			num: 7,
			value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
			name: 'dummy8', 
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
		tier = await Tier.new(USDC_ADDRESS, TIERS.map(i => i.value), { from: manager })
		
		const Claim = await ethers.getContractFactory("Claim")
		claim = await upgrades.deployProxy(Claim, [prestigePoints.address, tier.address])
		await claim.deployed()
		prestigePoints.setMinter(claim.address, { from: manager })
	});

	it("Joining tier", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[2]), {from: silverUser})
		await tier.setTier(silverUser, 2, [], {from: silverUser})
		assert.equal(Number(await claim.getTier(silverUser)), 2, "tier not set")
	});

	it("Accumulating reward", async function () {
		const currentBlock = Number(await time.latestBlock())
		await time.advanceBlockTo(currentBlock + 300)
		assert.equal(Number(await claim.getReward(silverUser)), 300, 'There is not reward')
		await claim.claim({from: silverUser})
		assert.equal(Number(await claim.getReward(silverUser)), 0, 'Reward no discount')
		assert.equal(Number(await prestigePoints.balanceOf(silverUser)), 301, 'Points claimed')
	});

})