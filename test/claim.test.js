const Tier = artifacts.require("ERC20TransferTier")
const DummyERC20 = artifacts.require("DummyERC20");
const Claim = artifacts.require("Claim")
const { time, expectEvent } = require("@openzeppelin/test-helpers")
const { assert } = require("hardhat");

const { TIERS } = require("./token_address")

function calculateReward(_tierValue, _time) {
	const rewardPerBlock = Math.trunc(_tierValue / 1576800),
	multiplier = Math.trunc(((_time + 47304000) / 47304000) * 10e7); // final multiplier
	
	return ((rewardPerBlock * _time) * multiplier) / 10e7;
}

/// Claim test
contract("Mint and Reward Token", ([manager, silverUser, goldUser, bronzeUser]) => {
	let claimer, tier, payToken, // contracts
	reward;

	before(async function () {
		// ERC token used to pay in the test
    	payToken = await DummyERC20.new()
		await payToken.mint(toWei('100'), {from: manager})
		
		// giving balance to test users
		await payToken.transfer(silverUser, TIERS[2], {from: manager})
		await payToken.transfer(goldUser, TIERS[3], {from: manager})
		await payToken.transfer(bronzeUser, TIERS[3], {from: manager})

		// Deployed contracts
		tier = await Tier.new(payToken.address, TIERS, { from: manager })
		claimer = await Claim.new(tier.address, { from: manager })
	});

	it("Accumulating reward", async function () {
		await payToken.approve(tier.address, (await tier.tierValues())[2], {from: silverUser})
		await tier.setTier(silverUser, 2, [], {from: silverUser})

		const currentBlock = Number(await time.latestBlock()),
		blocksToAdvance = 4000 /** one month */,
		tierValue = Number((await tier.tierValues())[2]);

		reward = calculateReward(tierValue, blocksToAdvance);
		
		await time.advanceBlockTo(currentBlock + blocksToAdvance)
		
		assert.closeTo(Number(await claimer.getReward(silverUser)), reward, 0, 'There is not reward')
	});
		
	it("Claiming reward", async function () {
		const blocksToAdvance = 4000 /** one month */,
		tierValue = Number((await tier.tierValues())[2]);
		expectReward = calculateReward(tierValue, blocksToAdvance + 1);

		const tx = await claimer.claim({from: silverUser})
		
		await expectEvent.inTransaction(tx.tx, claimer, 'RedeemReward', { account: silverUser, amount: expectReward.toString() });

		assert.equal(Number(await claimer.getReward(silverUser)), 0, 'Reward no discount')
		assert.closeTo(Number(await claimer.balanceOf(silverUser)), expectReward, 10, 'Points claimed')
	});		

	it("When tier up", async function () {
		await payToken.approve(tier.address, (await tier.tierValues())[2], {from: goldUser})
		await tier.setTier(goldUser, 2, [], {from: goldUser})
		
		let blocksToAdvance = 1000;
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)
		
		await payToken.approve(tier.address, (await tier.tierValues())[3], {from: goldUser})
		await tier.setTier(goldUser, 3, [], {from: goldUser})
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)

		const  tierValue = Number((await tier.tierValues())[3]);
		reward = calculateReward(tierValue, blocksToAdvance);
		
		assert.closeTo(Number(await claimer.getReward(goldUser)), reward, 10, 'the reward is not what was expected')
		
		const tx = await claimer.claim({from: goldUser})
		
		assert.equal(Number(await claimer.getReward(goldUser)), 0, "reward not burn");		

	});

	it("When tier down", async function () {
		await payToken.approve(tier.address, (await tier.tierValues())[3], {from: bronzeUser})
		await tier.setTier(bronzeUser, 3, [], {from: bronzeUser})
		const blocksToAdvance = 1000;
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)
		
		await payToken.approve(tier.address, (await tier.tierValues())[1], {from: bronzeUser})
		await tier.setTier(bronzeUser, 1, [], {from: bronzeUser})
		await time.advanceBlockTo(Number(await time.latestBlock()) + blocksToAdvance)

		const  tierValue = Number((await tier.tierValues())[1]);
		reward = calculateReward(tierValue, (blocksToAdvance + 1) * 2);
		
		assert.closeTo(Number(await claimer.getReward(bronzeUser)), reward, 10, 'the reward is not what was expected')
	});

})