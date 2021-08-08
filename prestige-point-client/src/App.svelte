<script>
	import Notifications from 'svelte-notifications';
	import Connect_Button from './Connect_Button.svelte';
	import Tier from './Tier.svelte';
	import Modal from 'svelte-simple-modal';
	import { BRONZE, SILVER, GOLD, PLATINUM, TOKEN_SIMBOL, REWARD_SIMBOL } from './stores.js';
	
	const tiers = [
		{
			tier_name: 'Bronze',
			join_cost: $BRONZE 
		},
		{
			tier_name: 'Silver',
			join_cost: $SILVER
		},
		{
			tier_name: 'Gold',
			join_cost: $GOLD
		},
		{
			tier_name: 'Platinum',
			join_cost: $PLATINUM
		},
	]

</script>

<main>
	<Modal>
	<Notifications>
		<div class="head-bar">
			<img class="logo" src=".\img\terra.png" alt="Terra Logo">
			<span>Prestige Points</span>
			<Connect_Button />
		</div>
		<br>
		<h1>Join tiers to earn <i>Rewards</i>.</h1>
		<div class="medals-bar">
			{#each tiers as tier}
				<Tier
					tier_name = { tier.tier_name }
					join_cost = { tier.join_cost }
					reward_token_symbol = { $REWARD_SIMBOL } 
					pay_token_symbol = { $TOKEN_SIMBOL }
				 />
			{/each}
		</div>
		<p>
			Invest to get a daily reward token, or hold it to get the max multiplier <i>!</i><br>
			connect your wallet and start earning <i>Prestige Token</i> changebles for a NFT Reward in <a href="https://terravirtua.io/marketplace">Terra virtua</a>.
		</p>
		<footer>
			<p>&copy; Copyright 2021.</p>
		</footer>
	</Notifications>
	</Modal>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	.head-bar {
		background-color: #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30px;
		border-radius: 4px;
	}

	.head-bar span {
		font-size: 2.5rem;
		font-weight: bold;
	}

	.logo {
		width: 4em;
	}

	.medals-bar {
		display: flex;
    	justify-content: space-around;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	
</style>