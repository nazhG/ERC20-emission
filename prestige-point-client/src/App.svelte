<script>
	import Notifications from 'svelte-notifications';
	import Connect_Button from './Connect_Button.svelte';
	import Wallet from './Wallet.svelte';
	import Tier from './Tier.svelte';
  	import { Router, Route, Link } from "svelte-navigator";
	import Modal from 'svelte-simple-modal';
	import { 
		TIERS, 
		TOKEN_SIMBOL, 
		REWARD_SIMBOL, 
		web3, 
		Account, 
		Minter_Address, 
		tx_OnGoing, 
		tx_Message, 
		User_funds, 
		User_time, 
		User_tier,
		User_reward, 
	} from './stores.js';
	import abi_minter from './abi/minter';
	
    window.refreshUserInfo = async () => {
		if(!$web3)
			return console.log('Can\'t refresh');
		let minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
        
		try {
			tx_OnGoing.set(true);
			tx_Message.set('Consulting Balance');
			let user = await minter.methods.investorFunds($Account).call();
			console.log('User funds: ', user.funds);
			User_funds.set(user.funds);

			console.log('User timestart: ', user.timeStart);
			User_time.set(user.timeStart);
			
			tx_Message.set('Consulting Tier');
			let user_tier = await minter.methods.getUserTier($Account).call();
			console.log('User tier: ', user_tier);
			User_tier.set(user_tier);
			
			tx_Message.set('Consulting Reward');
			let user_reward = await minter.methods.getCurrentReward($Account).call();
			console.log('User reward: ', user_reward);
			User_reward.set(user_reward);
		} finally {
			tx_OnGoing.set(false);
			tx_Message.set('');
		}

	};

	// window.testing(60 * 60 * 24 * 5) invest 5 days ago
	// this test is unfreezeable !!! (unless you transfers the USDC to the minter)
	// window.testing(0,-1) to reset the account funds
	window.testing = async (_days_ago, _tier) => {
		if(!$web3)
			return console.log('Can\'t refresh');
		let minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
        
        tx_OnGoing.set(true);
        tx_Message.set('Testing Balance');
        
		await minter.methods.setFunds($Account, {timeStart: parseInt(Date.now() / 1000) - _days_ago, funds: _tier<0?0:$TIERS[_tier].join_cost}).send({ from:$Account });

        tx_OnGoing.set(false);
        tx_Message.set('');
	};
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