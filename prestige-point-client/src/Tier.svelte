<script>
    export let tier_name, join_cost, tier_num, reward_token_symbol, pay_token_symbol;
  	import { getNotificationsContext } from "svelte-notifications";
	import abi_minter from './abi/minter';
	import IERC20 from './abi/IERC20';
	import {
		web3, 
		Logged, 
		Account, 
		User_tier, 
		User_time, 
		tx_OnGoing, 
		User_funds, 
		Minter_Address, 
		Pay_Token_Address, 
	} from './stores.js';

	const { addNotification } = getNotificationsContext();

	let pay_token, minter;

    async function handleJoin() {
		if ($Logged) {
			pay_token = new $web3.eth.Contract(IERC20, $Pay_Token_Address);
			minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
			
			if($User_funds == 0) {
				let success = false;
				tx_OnGoing.set(true);
				addNotification({
					text: 'Please confirm the approval',
					position: "top-right",
					type: "success",
					removeAfter: 10000,
				});	
				try {
					await pay_token.methods.approve($Minter_Address, join_cost).send({ from: $Account })
				} catch (err) {
					addNotification({
						text: 'Approve Pay error: ' + err.message,
						position: "top-right",
						type: "danger",
						removeAfter: 5000,
					})
				} finally {
					tx_OnGoing.set(false);
				}
				try {
					let success = false;
					addNotification({
						text: 'Please confirm in MetaMask and wait this could take a minute or less',
						position: "top-right",
						type: "success",
						removeAfter: 10000,
					});	
					success = await minter.methods.freeze($Pay_Token_Address, tier_num).send({ from: $Account })
				} catch (err) {
					addNotification({
						text: 'joining Tier error: ' + err.message,
						position: "top-right",
						type: "danger",
						removeAfter: 8000,
					})
				} finally {
					tx_OnGoing.set(false);
				}
				if (success) {
					let user_funds = (await minter.methods.investorFunds($Account).call()).funds
					console.log('User funds: ', user_funds);
					User_funds.set(user_funds);

					let user_time = (await minter.methods.investorFunds($Account).call()).timeStart
					console.log('User timestart: ', user_time);
					User_time.set(user_time);
					
					let user_tier = Number(await minter.methods.getUserTier($Account).call())
					console.log('User tier: ', user_tier);
					User_tier.set(user_tier);
				}
			} else {
				addNotification({
					text: 'you can only participate in one tier per account',
					position: "top-right",
					type: "warning",
					removeAfter: 8000,
				})
			}
		} else {
			addNotification({
				text: 'Connect wallet to join',
				position: "top-right",
				type: "danger",
				removeAfter: 2500,
			})
		}
		
    }
</script>

<div class="tier { tier_name }">
    <h2>{ tier_name }</h2>
    <div class="shine">
        <img src=".\img\{ tier_name }.jpg" alt="{ tier_name }">
        <span></span>
    </div>
    <button class="btn tooltip" on:click={() => handleJoin()} disabled={tier_name == 'Untier' || $tx_OnGoing}>
        { join_cost / 10**6 } { pay_token_symbol } 
		{#if $tx_OnGoing}
			<i class="fas fa-spinner fa-pulse"></i>
		{/if}
		<span class="tooltiptext">
			{#if $Logged}
				{#if $User_tier == tier_num}
					You are joined to this tier<br>
				{/if}
			{:else}
				Join tier <i>!!</i><br>
			{/if}
			Daily minimum reward { (join_cost / 10**6) * 0.1 } { reward_token_symbol }
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