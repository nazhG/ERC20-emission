<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";
  import detectEthereumProvider from '@metamask/detect-provider';
  import { getContext } from 'svelte';
  import Modal from './Modal.svelte';
  
  const { open } = getContext('simple-modal');
  const { addNotification } = getNotificationsContext();

  let logged = false,
	web3,
	account,
	chainId;

  onMount(async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      console.log('Provider: ', provider); // Initialize your app
    } else {
      open(Modal, { message: 'Please, install MetaMask!' });
      console.log('No provider found');
    }

    // if (provider !== window.ethereum) {
    //   console.error('Do you have multiple wallets installed?');
    // }

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    handleChainChanged(chainId);

    ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });
  });

ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  chainId = _chainId
  console.log('chain Id: ', parseInt(_chainId));
  if (chainId && parseInt(chainId) != 80001) {
    open(Modal, { message: 'Please, change the chain to mumbai',
      linkRef: 'https://docs.matic.network/docs/develop/metamask/testnet/',
      linkText: 'How add the chain to MetaMask?',
    });
  }
  // window.location.reload();
}

ethereum.on('accountsChanged', handleAccountsChanged);

async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    addNotification({
      text: 'Please connect to MetaMask.',
      position: "top-right",
      type: "danger",
      removeAfter: 5000,
    })
    logged = false;
    account = null;
  } else if (accounts[0] !== account) {
    logged = true;
    account = accounts[0];
    addNotification({
        text: 'Connected to ' + accountFilter(account),
        position: "top-right",
        type: "success",
        removeAfter: 3000,
      })
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    handleChainChanged(chainId);
  }
}

function handleConnect() {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      addNotification({
        text: 'Connection error: ' + err.message,
        position: "top-right",
        type: "danger",
        removeAfter: 5000,
      })
    });
}

const accountFilter = function(account) {
  let ac = String(account);
  return `${ac.substr(0, 6)}...${ac.substr(ac.length - 4, 4)}`;
}

</script>

<button
	class="btn btn-connect"
	on:click={handleConnect}
	disabled={logged}>
  {#if logged}
    { accountFilter(account) }
  {:else}
    Connect MetaMask
  {/if}
</button>
<style></style>
