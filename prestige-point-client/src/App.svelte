<script>
	import Notifications from 'svelte-notifications';
	import Connect_Button from './Connect_Button.svelte';
	import Wallet from './Wallet.svelte';
	import Tier from './Tier.svelte';
  	import { Router, Route, Link } from "svelte-navigator";
	import Modal from 'svelte-simple-modal';
	import { Claimer, Tiers, Connection, User } from './stores.js';
	import abi_claim from './abi/Claim';
	import abi_tiers from './abi/ERC20TransferTier';
	
    window.refreshUserInfo = async () => {
		if(!$Connection.web3)
			return console.log('Can\'t refresh');

		let claimer = $Claimer;	
		claimer.contract = new $Connection.web3.eth.Contract(abi_claim, $Claimer.address);
		Claimer.set(claimer);
		let tiers = $Tiers;	
		tiers.contract = new $Connection.web3.eth.Contract(abi_tiers, $Tiers.address);
		Tiers.set(tiers);	
		
		let connection = $Connection;
		let user = $User;
        
		try {
			connection.tx_OnGoing = true;
			
			user.affiliation_date = await claimer.contract.methods.getGetJoinBlock($Connection.account).call();
			console.log('User affiliation_date: ', user.affiliation_date );
			User.set(user);
			
			connection.tx_Message = 'Consulting Tier';
			Connection.set(connection); 
			user.tier = await claimer.contract.methods.getTier($Connection.account).call();
			console.log('User tier: ', user.tier);
			
			connection.tx_Message = 'Consulting Tier Balance';
			Connection.set(connection); 
			user.funds = (await tiers.contract.methods.tierValues().call())[$User.tier-1]?
				(await tiers.contract.methods.tierValues().call())[$User.tier-1]:0;
			console.log('User funds: ', user.funds);
			User.set(user);
			
			connection.tx_Message = 'Consulting Prestige Balance';
			Connection.set(connection); 
			user.balance = Number(await $Claimer.contract.methods.balanceOf($Connection.account).call());
			console.log('User balance: ', user.balance);
			User.set(user);
			
			connection.tx_Message = 'Consulting Reward';
			Connection.set(connection); 
			
			user.reward = await claimer.contract.methods.getReward($Connection.account).call();
			console.log('User reward: ', user.reward);
			User.set(user);
		} catch (error) {
			console.log("Can\'t refresh", error);
			setTimeout(() => window.refreshUserInfo() , 3000);
		} finally {
			connection.tx_OnGoing = false;
			connection.tx_Message = '';
			Connection.set(connection); 
		}

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
				{#each $Claimer.tier as tier}
					<Tier
						tier_name = { tier.tier_name }
						join_cost = { tier.join_cost }
						tier_num = { tier.tier_num }
						reward_token_symbol = { $Claimer.simbol } 
						pay_token_symbol = { $Tiers.simbol }
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