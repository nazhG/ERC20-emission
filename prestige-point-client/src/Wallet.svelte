<script>
  import Tier from "./Tier.svelte";
  import IERC20 from "./abi/IERC20";
  import {
    web3,
    TIERS,
    Account,
    User_tier,
    User_time,
    tx_OnGoing,
    tx_Message,
    User_funds,
    User_reward,
    TOKEN_SIMBOL,
    REWARD_SIMBOL,
    Minter_Address,
    Pay_Token_Address,
    Prestige_Points_Address,
  } from "./stores.js";
  import abi_minter from "./abi/minter";
  import { getNotificationsContext } from "svelte-notifications";

  const { addNotification } = getNotificationsContext();

  $: num_days = 0;
  $: balance = 0;

  const handleUnfreeze = async () => {
    const minter = new $web3.eth.Contract(abi_minter, $Minter_Address);

    tx_OnGoing.set(true);
    console.log("Unfreezing");

    /// Join to tier
    await minter.methods.unfreeze($Pay_Token_Address).send({ from: $Account })
      .once("sent", () => tx_Message.set("waiting for approval"))
      .once("transactionHash", (hash) => tx_Message.set("transaction sent"))
      .on("error", (err) =>
        addNotification({
          text: "Unfreeze error: " + err.message,
          position: "top-right",
          type: "danger",
          removeAfter: 8000,
        })
      )
      .then(() =>
        addNotification({
          text: "Funds unfreezed",
          position: "top-right",
          type: "success",
          removeAfter: 8000,
        })
      )
      .catch(() => {}) // this avoid a warning in console
      .finally(function (receipt) {
        tx_Message.set("");
        tx_OnGoing.set(false);
      });

    window.refreshUserInfo();
  };

  const handleUnClaim = async () => {
    await handleRefesh();

    if ($User_reward > 0) {
      try {
        tx_OnGoing.set(true);
        tx_Message.set("Claiming reward");

        const minter = new $web3.eth.Contract(abi_minter, $Minter_Address);

		await minter.methods.claimReward().send({ from: $Account })
		.once('sent', () => tx_Message.set('waiting for approval'))
		.once('transactionHash',  (hash) => tx_Message.set('transaction sent'))
		.on('error', err => 
			addNotification({
			text: 'Can\'t mint reward: ' + err.message,
			position: "top-right",
			type: "danger",
			removeAfter: 8000,
		}))
		.then(() => 
            addNotification({
            text: 'Reward minted',
            position: "top-right",
            type: "success",
            removeAfter: 8000,
        }));

      } finally {
        tx_OnGoing.set(false);
        tx_Message.set("");
      }
    } else {
      addNotification({
        text: "Nothing to claim",
        position: "top-right",
        type: "warning",
        removeAfter: 8000,
      });
    }

    handleRefesh();
  };

  const handleRefesh = async () => {
    await window.refreshUserInfo();

    num_days = parseInt(
      // difference between investment day and now in days
      (new Date().getTime() - new Date($User_time * 1000).getTime()) /
        (1000 * 3600 * 24)
    );

    const pay_token = new $web3.eth.Contract(IERC20, $Prestige_Points_Address);
    balance = Number(await pay_token.methods.balanceOf($Account).call());
  };
</script>

<div class="wallet">
  {#if $User_tier >= 0}
    <Tier
      tier_name={$TIERS[$User_tier].tier_name}
      join_cost={$TIERS[$User_tier].join_cost}
      tier_num={$TIERS[$User_tier].tier_num}
      reward_token_symbol={$REWARD_SIMBOL}
      pay_token_symbol={$TOKEN_SIMBOL}
    />
  {:else}
    <Tier
      tier_name="Untier"
      join_cost="0"
      tier_num="-1"
      reward_token_symbol={$REWARD_SIMBOL}
      pay_token_symbol={$TOKEN_SIMBOL}
    />
  {/if}
  <div>
    <!-- auto add to metamask -->
    <p>Prestige points : {balance} {$REWARD_SIMBOL}</p>
    <p>Frozen investment : {$User_funds} {$TOKEN_SIMBOL}</p>
    <p class="tooltip">
      Days since investment : {$User_funds>0?num_days:0}
      {#if $User_tier >= 0}
        <span class="tooltiptext tooltop-large">
          invested on {new Date($User_time * 1000)}
        </span>
      {/if}
    </p>
    <p>Current Mintiable Reward : {$User_reward} {$REWARD_SIMBOL}</p>
    <div>
      <button
        class="btn tooltip"
        disabled={$User_funds <= 0 || $tx_OnGoing}
        on:click={handleUnfreeze}>
        Unfreeze
        {#if $tx_OnGoing}
          <i class="fas fa-spinner fa-pulse" />
        {/if}
        {#if $User_funds <= 0 }
            <span class="tooltiptext">
                Not funds to unfreeze
            </span>
        {/if}
      </button>
      <button
        class="btn tooltip"
        disabled={$User_reward <= 0 || $tx_OnGoing}
        on:click={handleUnClaim}>
        Claim
        {#if $tx_OnGoing}
          <i class="fas fa-spinner fa-pulse" />
        {/if}
		<span class="tooltiptext">
            {#if $User_reward <= 0 }
                Not reward to claim
            {/if}
        </span>
      </button>
      <button class="btn tooltip" disabled={$tx_OnGoing} on:click={handleRefesh}>
        {#if $tx_OnGoing}
          <i class="fas fa-sync fa-pulse" />
        {:else}
          <i class="fas fa-sync" />
        {/if}
		<span class="tooltiptext">
            Refresh
        </span>
      </button>
    </div>
  </div>
</div>

<style>
  .wallet {
    display: flex;
    justify-content: center;
  }

  .wallet > div {
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
