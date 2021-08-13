<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";
  import detectEthereumProvider from '@metamask/detect-provider';
  import { getContext } from 'svelte';
  import { useNavigate, useLocation } from "svelte-navigator";
  import Modal from './Modal.svelte';
	import { 
    Prestige,
    PaymentToken,
    Reward,
    Connection,
    User,
} from './stores.js';
import abi_minter from './abi/prestige';

const { open } = getContext('simple-modal');
const { addNotification } = getNotificationsContext();

const navigate = useNavigate();
const location = useLocation();

let provider;

onMount(async () => {
  provider = await detectEthereumProvider();
  if (provider) {
    Connection.web3.set(new Web3(provider));
  } else {
    open(Modal, { message: 'To connect you will need MetaMask. 🦊',
    linkRef: 'https://metamask.io/download',
    linkText: 'How to download metaMask?', });
    console.log('No provider found');
  }

  handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));

  ethereum
    .request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      console.error(err);
  });

  ethereum.on('chainChanged', handleChainChanged);

  ethereum.on('accountsChanged', handleAccountsChanged);
});


const handleChainChanged = (_chainId) => {
  Connection.chainId.set(parseInt(_chainId)); // hex to dec
  console.log('chain Id: ', parseInt(_chainId));
  if ($Connection.chainId && $Connection.chainId != 80001) {
    open(Modal, { message: 'Please, change the chain to mumbai',
      linkRef: 'https://docs.matic.network/docs/develop/metamask/testnet/',
      linkText: 'How add the chain to MetaMask?',
    });
  }
  // window.location.reload();
}

const handleAccountsChanged = async (_accounts) => {
  if (_accounts.length === 0) {
    addNotification({
      text: 'Please connect to MetaMask.',
      position: "top-right",
      type: "danger",
      removeAfter: 5000,
    });
    Connection.logged.set(false);
    Connection.lccount.set(null);
    Connection.web3.set(null);
    User.funds.set(0);
    User.tier.set(-1);
    User.affiliation_date.set(0);
    User.reward.set(0);
  } else if (_accounts[0] !== $Connection.account) {
    Connection.logged.set(true);
    Connection.account.set(_accounts[0]);
    Connection.web3.set(new Web3(provider));

		window.refreshUserInfo();
    
    if ($User.tier >= 0) {
      navigate("/wallet", {
        state: { from: $location.pathname }
      });
    }

    addNotification({
      text: 'Connected to ' + accountFilter($Connection.account),
      position: "top-right",
      type: "success",
      removeAfter: 3000,
    });

    handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));
  }
}

const handleConnect = () => {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      addNotification({
        text: 'Connection error: ' + err.message,
        position: "top-right",
        type: "danger",
        removeAfter: 5000,
      });
    });
}

const accountFilter = (_account) => {
  let ac = String(_account);
  return `${ac.substr(0, 6)}...${ac.substr(ac.length - 4, 4)}`;
}

</script>

<button
	class="btn btn-connect tooltip { $Connection.logged ? ($Connection.chainId != 80001 ? 'warnig' : 'success') : '' }"
	on:click={handleConnect}
	disabled={$Connection.logged}>
  {#if $Connection.logged}
    { accountFilter($Connection.account) }
    <span class="tooltiptext">
			{#if $Connection.chainId != 80001}
        Wrong chain
			{:else}
        Connected
			{/if}
      </span>
    {#if $Connection.tx_Message}
      <br><i class="fas fa-spinner fa-pulse"></i>&nbsp;{ $Connection.tx_Message }
    {/if}
  {:else}
    Connect MetaMask
  {/if}
</button>

<style>

  .warnig {
    color: white;
    background-color: #ffb900;
  }
  
  .success {
    color: white;
    background-color: #22ce6c;
  }

  .tooltip .tooltiptext {
    bottom: 110% !important;
    max-width: 300px;
  }

</style>
