const Tier = artifacts.require("ERC20TransferTier")
const Claim = artifacts.require("Claim")
const IERC20 = artifacts.require("IERC20")
const { time, expectEvent } = require("@openzeppelin/test-helpers")
const { assert } = require("hardhat");

const { USDC_ADDRESS, TIERS } = require("./token_address")

function calculateReward(_tierValue, _time) {
	const rewardPerBlock = _tierValue / 15552000,
	multiplier = (_time / 46656000) + 1; // final multiplier
	
	return Math.floor(rewardPerBlock * _time * multiplier)
}

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([silverUser, goldUser, bronzeUser]) => {
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
		await usdc.transfer(silverUser, TIERS[2], {from: manager})
		await usdc.transfer(goldUser, TIERS[3], {from: manager})
		await usdc.transfer(bronzeUser, TIERS[3], {from: manager})


		// Deployed contracts
		tier = await Tier.new(USDC_ADDRESS, TIERS, { from: manager })
		claimer = await Claim.new(tier.address, { from: manager })
		
	});

	it("Joining tier", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[2]), {from: silverUser})
		await tier.setTier(silverUser, 2, [], {from: silverUser})
		assert.equal(Number(await claimer.getTier(silverUser)), 2, "tier not set")
	});

	//more test, with peson that change tiers+
	it("Accumulating reward", async function () {
		const currentBlock = Number(await time.latestBlock()),
		blocksToAdvance = 4000 /** one month */,
		tierValue = Number((await tier.tierValues())[2]);
		reward = calculateReward(tierValue, blocksToAdvance);
		await time.advanceBlockTo(currentBlock + blocksToAdvance)
		
		assert.closeTo(Number(await claimer.getReward(silverUser)), reward, 3, 'There is not reward')
	});
		
	it("Claiming reward", async function () {
		const expectReward = Number(await claimer.getReward(silverUser)) + 1;
		const tx = await claimer.claim({from: silverUser})
		
		await expectEvent.inTransaction(tx.tx, claimer, '_claim', { account: silverUser, data_: expectReward.toString() });

		assert.equal(Number(await claimer.getReward(silverUser)), 0, 'Reward no discount')
		assert.closeTo(Number(await claimer.balanceOf(silverUser)), expectReward, 3, 'Points claimed')
	});		

	it("When tier up", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[2]), {from: goldUser})
		await tier.setTier(goldUser, 2, [], {from: goldUser})
		
		let blocksToAdvance = 1000;
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)
		
		await usdc.approve(tier.address, Number((await tier.tierValues())[3]), {from: goldUser})
		await tier.setTier(goldUser, 3, [], {from: goldUser})
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)

		const  tierValue = Number((await tier.tierValues())[3]);
		reward = calculateReward(tierValue, ++blocksToAdvance);
		
		assert.closeTo(Number(await claimer.getReward(goldUser)), reward, 3, 'the reward is not what was expected')
		
		const tx = await claimer.claim({from: goldUser})
		
		assert.equal(Number(await claimer.getReward(goldUser)), 0, "reward not burn");		

	});

	it("When tier down", async function () {
		await usdc.approve(tier.address, Number((await tier.tierValues())[3]), {from: bronzeUser})
		await tier.setTier(bronzeUser, 3, [], {from: bronzeUser})
		const blocksToAdvance = 1000;
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)
		
		await usdc.approve(tier.address, Number((await tier.tierValues())[1]), {from: bronzeUser})
		await tier.setTier(bronzeUser, 1, [], {from: bronzeUser})
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)

		const  tierValue = Number((await tier.tierValues())[1]);
		reward = calculateReward(tierValue, blocksToAdvance * 2);
		
		assert.closeTo(Number(await claimer.getReward(bronzeUser)), reward, 3, 'the reward is not what was expected')
	});

})