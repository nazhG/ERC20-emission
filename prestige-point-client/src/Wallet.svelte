<script>
	import Tier from './Tier.svelte';
	import {
        web3, 
        TIERS, 
        Account, 
        User_tier, 
        User_time, 
        tx_OnGoing, 
        User_funds, 
        TOKEN_SIMBOL, 
        REWARD_SIMBOL, 
        Minter_Address, 
        Pay_Token_Address, 
    } from './stores.js';
	import abi_minter from './abi/minter';
    import { getNotificationsContext } from "svelte-notifications";

	const { addNotification } = getNotificationsContext();

    let num_days = Math.floor((24*60*60) / (Date.now() - $User_time));

    async function handleUnfreeze() {
        console.log('unfreeze');
        let minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
        try {
            addNotification({
                text: 'Please confirm in MetaMask and wait this could take a minute or less',
                position: "top-right",
                type: "success",
                removeAfter: 10000,
            });
			tx_OnGoing.set(true);
            let success = await minter.methods.unfreeze($Pay_Token_Address).send({ from: $Account });
			tx_OnGoing.set(false);
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

                addNotification({
					text: 'Unfreeze funds',
					position: "top-right",
					type: "success",
					removeAfter: 8000,
				});
            } else {
                addNotification({
					text: 'Funds were not unfreezed',
					position: "top-right",
					type: "danger",
					removeAfter: 8000,
				});
            }
        } catch (error) {
            addNotification({
                text: 'Unfreze Error: ' + error.message,
                position: "top-right",
                type: "danger",
                removeAfter: 8000,
            });
        }
    }
</script>

<div class="wallet">
    {#if $User_tier >= 0}
        <Tier
            tier_name = { $TIERS[$User_tier].tier_name }
            join_cost = { $TIERS[$User_tier].join_cost }
            tier_num = { $TIERS[$User_tier].tier_num }
            reward_token_symbol = { $REWARD_SIMBOL } 
            pay_token_symbol = { $TOKEN_SIMBOL }
        />
    {:else}
        <Tier
            tier_name = 'Untier'
            join_cost = 0
            tier_num = '-1'
            reward_token_symbol = { $REWARD_SIMBOL } 
            pay_token_symbol = { $TOKEN_SIMBOL }
        />
    {/if}
    <div>
        <!-- auto add to metamask -->
        <p>Prestige points : 0 { $REWARD_SIMBOL }</p>
        <p>Frozen investment : { $User_funds } { $TOKEN_SIMBOL }</p>
        <p class="tooltip">
            Days since investment : { num_days }
            {#if $User_tier >= 0}
            <span class="tooltiptext tooltop-large">
                invested on { new Date($User_time * 1000) }
            </span>
            {/if}
        </p>
        <p>Current Reward : { $User_tier < 0 ? 0:Math.floor($TIERS[$User_tier].join_cost * 0.1 * num_days * ((0.0009 * num_days) + 1)) }</p>
        <button class="btn" disabled={ $User_funds < 0 || $tx_OnGoing } on:click={handleUnfreeze}>
            Unfreeze
            {#if $tx_OnGoing}
                <i class="fas fa-spinner fa-pulse"></i>
            {/if}
        </button>
    </div>
</div>

<style>
    
    .wallet {
        display: flex;
        justify-content: center;
    }
    
    .wallet>div {
        justify-content: space-evenly;
        display: flex;
        flex-direction: column;
        font-size: 1.2rem;
        padding-left: 1.5em;
    }
    
    .wallet p {
        align-self: flex-start;
    }
    
    .wallet .btn {
        align-self: center;
    }

</style>