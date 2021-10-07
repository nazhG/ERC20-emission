const Tier = artifacts.require("ERC20TransferTier")
const DummyERC20 = artifacts.require("DummyERC20");
const Claim = artifacts.require("Claim")
const { time, expectEvent } = require("@openzeppelin/test-helpers")
const { assert } = require("hardhat");

const { USDC_ADDRESS, TIERS } = require("./token_address")

function calculateReward(_tierValue, _time) {
	const rewardPerBlock = _tierValue / 155520000,
	multiplier = ((_time * 2) / 46656000) + 1; // final multiplier
	
	return (rewardPerBlock * _time) * multiplier
}

/// Test of draft for the ERC20 emissions
contract("Mint and Reward Token", ([manager, silverUser, goldUser, bronzeUser]) => {
	let claimer, tier, payToken, // contracts
	reward;

	before(async function () {
		// ERC token used to pay in the test
    	payToken = await DummyERC20.new()
		await payToken.mint(toWei('100'), {from: manager})
		
		await payToken.transfer(silverUser, TIERS[2], {from: manager})
		await payToken.transfer(goldUser, TIERS[3], {from: manager})
		await payToken.transfer(bronzeUser, TIERS[3], {from: manager})


		// Deployed contracts
		tier = await Tier.new(payToken.address, TIERS, { from: manager })
		claimer = await Claim.new(tier.address, { from: manager })
		
	});

	it("Joining tier", async function () {
		await payToken.approve(tier.address, (await tier.tierValues())[2], {from: silverUser})
		
		await tier.setTier(silverUser, 2, [], {from: silverUser})
		// assert.equal(Number(await claimer.getTier(silverUser)), 2, "tier not set")
	});

	//more test, with peson that change tiers+
	it("Accumulating reward", async function () {
		const currentBlock = Number(await time.latestBlock()),
		blocksToAdvance = 4000 /** one month */,
		tierValue = Number((await tier.tierValues())[2]);
		reward = calculateReward(tierValue, blocksToAdvance);
		
		await time.advanceBlockTo(currentBlock + blocksToAdvance)
		
		assert.closeTo(Number(await claimer.getReward(silverUser)), reward, 1e12, 'There is not reward')
	});
		
	it("Claiming reward", async function () {
		const expectReward = Number(await claimer.getReward(silverUser));
		const tx = await claimer.claim({from: silverUser})
		
		// await expectEvent.inTransaction(tx.tx, claimer, '_claim', { account: silverUser, data_: expectReward.toString() });

		assert.equal(Number(await claimer.getReward(silverUser)), 0, 'Reward no discount')
		assert.closeTo(Number(await claimer.balanceOf(silverUser)), expectReward, 1e12, 'Points claimed')
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
		reward = calculateReward(tierValue, ++blocksToAdvance);
		
		assert.closeTo(Number(await claimer.getReward(goldUser)), reward, 1e12, 'the reward is not what was expected')
		
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
		reward = calculateReward(tierValue, blocksToAdvance * 2);
		
		assert.closeTo(Number(await claimer.getReward(bronzeUser)), reward, 1e12, 'the reward is not what was expected')
	});

})