<script>
    export let tier_name, join_cost, tier_num, reward_token_symbol, pay_token_symbol;
  	import { getNotificationsContext } from "svelte-notifications";
	import abi_minter from './abi/minter';
	import IERC20 from './abi/IERC20';
	import { web3, Logged, Account, Minter_Address, Pay_Token_Address } from './stores.js';

	const { addNotification } = getNotificationsContext();

	let pay_token, minter;

    async function handleJoin() {
		if ($Logged) {
			pay_token = new $web3.eth.Contract(IERC20, $Pay_Token_Address);
			minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
			
			if(user_funds == 0) {
				try {
				} catch (error) {
					console.log(error);
				}
				await minter.methods.freeze($Pay_Token_Address, tier_num).send({ from: $Account })
			} else {
				addNotification({
					text: 'you can only participate in one tier per account',
					position: "top-right",
					type: "warning",
					removeAfter: 5000,
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
    <button class="btn tooltip" on:click={() => handleJoin()}>
        { join_cost } { pay_token_symbol }
        <span class="tooltiptext">
            Join tier <i>!!</i><br>
            Daily minimum reward { join_cost * 0.1 } { reward_token_symbol }
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