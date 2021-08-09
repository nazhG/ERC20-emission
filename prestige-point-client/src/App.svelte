<script>
	import Notifications from 'svelte-notifications';
	import Connect_Button from './Connect_Button.svelte';
	import Wallet from './Wallet.svelte';
	import Tier from './Tier.svelte';
  	import { Router, Route, Link } from "svelte-navigator";
	import Modal from 'svelte-simple-modal';
	import { TIERS, TOKEN_SIMBOL, REWARD_SIMBOL } from './stores.js';
</script>

<Router>
<Modal>
<Notifications>
	<header>
		<img class="logo" src=".\img\terra.png" alt="Terra Logo">
		<span>Prestige Points</span>
		<nav>
			<Link to="/">
				<i class="fas fa-home"></i>
			</Link>
			<Link to="wallet">
				<i class="fas fa-wallet"></i>
			</Link>
		</nav>
		<Connect_Button />
	</header>
	<main>
		<br>
		<Route path="wallet">
			<Wallet />
		</Route>
		<Route path="/">
			<h1>Join tiers to earn <i>Rewards</i>.</h1>
			<div class="medals-bar">
				{#each $TIERS as tier}
					<Tier
						tier_name = { tier.tier_name }
						join_cost = { tier.join_cost }
						tier_num = { tier.tier_num }
						reward_token_symbol = { $REWARD_SIMBOL } 
						pay_token_symbol = { $TOKEN_SIMBOL }
						/>
				{/each}
			</div>
			<p>
				Invest to get a daily reward token, or hold it to get the max multiplier <i>!</i><br>
				connect your wallet and start earning <i>Prestige Token</i> changebles for a NFT Reward in <a href="https://terravirtua.io/marketplace">Terra virtua</a>.
			</p>
		</Route>
	</main>
	<footer>
		<p>&copy; Copyright 2021.</p>
	</footer>
</Notifications>
</Modal>
</Router>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	header {
		background-color: #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30px;
		border-radius: 4px;
	}

	header span {
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

	nav i {
		font-size: 1.6em;
		color: #333;
		padding: 4px;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	
</style>