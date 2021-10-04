<script>
    export let tier_name, join_cost, tier_num, reward_token_symbol, pay_token_symbol;
  	import { getNotificationsContext } from "svelte-notifications";
	import { Claimer, Tiers, Connection, User } from './stores.js';
	import IERC20 from './abi/IERC20';

	const { addNotification } = getNotificationsContext();

	$:tierRelativeCost = join_cost - Number($User.funds); //how much cost change to a tier

    async function handleJoin() {

		let connection = $Connection;

		if (!$Connection.logged) {
			addNotification({
				text: 'Connect wallet to join',
				position: "top-right",
				type: "danger",
				removeAfter: 2500,
			})
			// return false;
		}
		
		let success = false;
		connection.tx_OnGoing = true;
		Connection.set(connection); 

		let pay_token = new $Connection.web3.eth.Contract(IERC20, $Tiers.payment);
		const allowance = Number(await pay_token.methods.allowance(
			$Connection.account, 
			$Tiers.address
		).call());
		
		if (allowance >= tierRelativeCost) {
			console.log('User already set allowance: ', allowance);
			success = true
		} else {
			/// Set approvals to join in tier
			success = await pay_token.methods.approve(
				$Tiers.address, 
				tierRelativeCost
			).send({ from: $Connection.account })
			.once('sent', () => {
				connection.tx_Message = 'waiting for approval';
				Connection.set(connection); 
			})
			.once('transactionHash',  (hash) => {
				connection.tx_Message = 'transaction sent';
				Connection.set(connection); 
			})
			.on('error', err => 
				addNotification({
				text: 'Set USDC Approval error: ' + err.message,
				position: "top-right",
				type: "danger",
				removeAfter: 8000,
			}))
			.then(() => true)
			.catch(() => false)
			.finally(() => {
				connection.tx_Message = '';
				connection.tx_OnGoing = false;
				Connection.set(connection); 
			});
		}

		if(!success) return;
		connection.tx_OnGoing = true;
		Connection.set(connection); 
		console.log('Joining to tier');
		
		/// Join to tier
		await $Tiers.contract.methods.setTier($Connection.account, tier_num, []).send({ from: $Connection.account })
		.once('sent', () => {
				connection.tx_Message = 'waiting for approval';
				Connection.set(connection); 
		})
		.once('transactionHash',  (hash) => {
				connection.tx_Message = 'transaction sent';
				Connection.set(connection); 
		})
		.on('error', err => 
			addNotification({
			text: 'Joining to Tier error: ' + err.message,
			position: "top-right",
			type: "danger",
			removeAfter: 8000,
		}))
		.then(() => {})
		.catch(()=>{}) // this avoid a warning in console
		.finally(function(receipt){
			connection.tx_Message = '';
			connection.tx_OnGoing = false;
			Connection.set(connection); 
		});
		
		window.refreshUserInfo();
		
    }
</script>

<div class="tier { tier_name }">
    <h2>{ tier_name }</h2>
    <div class="shine">
        <img src=".\img\{ tier_name + '_tier' }.jpg" alt="{ tier_name }">
        <span></span>
    </div>
    <button class="btn tooltip" 
		on:click={() => handleJoin()} 
		disabled={
			tier_name == 'Untier' || 
			$Connection.tx_OnGoing || 
			$Connection.chainId != 80001 ||
			$User.tier == tier_num
		}>
		{#if $User.tier == tier_num}
			Joined
		{:else}
        	{ tierRelativeCost / 10**6 } { pay_token_symbol } 
		{/if}
		{#if $Connection.tx_OnGoing}
			<i class="fas fa-spinner fa-pulse"></i>
		{/if}
		<span class="tooltiptext">
			{#if $Connection.logged}
				{#if $Connection.chainId != 80001 }
					Worgn Chain, please change it [{ $Connection.chainId }]<br>
				{:else if $User.tier == tier_num}
					You are joined to this tier<br>
				{/if}
			{:else}
				Join tier <i>!!</i><br>
			{/if}
			Daily minimum reward { (join_cost / 10**6) * 0.1 } { reward_token_symbol } + Multiplier !
        </span>
    </button>
</div>

<style>
    
	.tier {
		width:20%;
		padding: 1em;
		border: 1px solid #eee;
		border-radius: 4px;
		margin: 0.2em;
	}

	.Bronze {
		background-color: #be5a2829;
	}

	.Silver {
		background-color: #b8bfc729;
	}

	.Gold {
		background-color: #f6dc6e30;
	}

	.Platinum {
		background-color: #d03b8b29;
	}

	img {
		width: 100%;
    	border-radius: 50%;
	}

	.shine {
		position: relative;
	}

	button{
		margin-block-start: 0.83em;
	}

	.shine span{
		position: absolute;
		display: block;
		top: 0;
		background: url(../img/shine.png) no-repeat;
		background-position: 300% 0px;
		height: 100%;
		width: 100%;
		background-size: cover;
		border-radius: 50%;
	}

	.shine:hover span{
		background-position: 300px 0px;
		-webkit-transition-property: all;
		-webkit-transition-duration: 1.5s;
		transition-property: all;
		opacity: 0.1;
		transition-duration: 1.5s;
	}

</style>