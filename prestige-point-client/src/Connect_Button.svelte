<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";
  import detectEthereumProvider from '@metamask/detect-provider';
  import { getContext } from 'svelte';
  import { useNavigate, useLocation } from "svelte-navigator";
  import Modal from './Modal.svelte';
	import { web3, Logged, Account, User_funds, User_tier, User_time, ChainId, Minter_Address } from './stores.js';
	import abi_minter from './abi/minter';
  
  const { open } = getContext('simple-modal');
  const { addNotification } = getNotificationsContext();

  const navigate = useNavigate();
  const location = useLocation();
  
  onMount(async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      web3.set(new Web3(provider));
    } else {
      open(Modal, { message: 'To connect you will need MetaMask. 🦊',
      linkRef: 'https://metamask.io/download',
      linkText: 'How to download metaMask?', });
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

    ethereum.on('chainChanged', handleChainChanged);

    ethereum.on('accountsChanged', handleAccountsChanged);
  });


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
    User_funds.set(0);
    User_tier.set(-1);
    User_time.set(0);
  } else if (_accounts[0] !== $Account) {
    Logged.set(true);
    Account.set(_accounts[0]);
		let minter = new $web3.eth.Contract(abi_minter, $Minter_Address);
    
    let user_funds = (await minter.methods.investorFunds($Account).call()).funds
    console.log('User funds: ', user_funds);
    User_funds.set(user_funds);

    let user_time = (await minter.methods.investorFunds($Account).call()).timeStart
    console.log('User timestart: ', user_time);
    User_time.set(user_time);

    let user_tier = await minter.methods.getUserTier($Account).call()
    console.log('User tier: ', user_tier);
    User_tier.set(user_tier);

    if ($User_tier >= 0) {
      navigate("/wallet", {
        state: { from: $location.pathname }
      });
    }

    addNotification({
      text: 'Connected to ' + accountFilter($Account),
      position: "top-right",
      type: "success",
      removeAfter: 3000,
    });

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
