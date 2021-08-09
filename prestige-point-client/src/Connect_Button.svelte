<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";
  import detectEthereumProvider from '@metamask/detect-provider';
  import { getContext } from 'svelte';
  import Modal from './Modal.svelte';
	import { web3, Logged, Account, ChainId } from './stores.js';
  
  const { open } = getContext('simple-modal');
  const { addNotification } = getNotificationsContext();

  onMount(async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      console.log('Provider: ', provider); // Initialize your app
      console.log('Web3: ', Web3);
      web3.set(new Web3(provider));
    } else {
      open(Modal, { message: 'Please, install MetaMask!' });
      console.log('No provider found');
    }

    // if (provider !== window.ethereum) {
    //   console.error('Do you have multiple wallets installed?');
    // }

    handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));

    ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });
  });

ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  ChainId.set(_chainId);
  console.log('chain Id: ', parseInt(_chainId));
  if ($ChainId && parseInt($ChainId) != 80001) {
    open(Modal, { message: 'Please, change the chain to mumbai',
      linkRef: 'https://docs.matic.network/docs/develop/metamask/testnet/',
      linkText: 'How add the chain to MetaMask?',
    });
  }
  // window.location.reload();
}

ethereum.on('accountsChanged', handleAccountsChanged);

async function handleAccountsChanged(_accounts) {
  if (_accounts.length === 0) {
    addNotification({
      text: 'Please connect to MetaMask.',
      position: "top-right",
      type: "danger",
      removeAfter: 5000,
    })
    Logged.set(false);
    Account.set(null);
  } else if (_accounts[0] !== $Account) {
    Logged.set(true);
    Account.set(_accounts[0]);
    addNotification({
        text: 'Connected to ' + accountFilter($Account),
        position: "top-right",
        type: "success",
        removeAfter: 3000,
      })
    handleChainChanged(await ethereum.request({ method: 'eth_chainId' }));
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

const accountFilter = function(_account) {
  let ac = String(_account);
  return `${ac.substr(0, 6)}...${ac.substr(ac.length - 4, 4)}`;
}

</script>

<button
	class="btn btn-connect"
	on:click={handleConnect}
	disabled={$Logged}>
  {#if $Logged}
    { accountFilter($Account) }
  {:else}
    Connect MetaMask
  {/if}
</button>
<style></style>
