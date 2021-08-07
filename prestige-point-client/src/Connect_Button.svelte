<script>
  import { getNotificationsContext } from "svelte-notifications";
  import { onMount } from "svelte";

  const { addNotification } = getNotificationsContext();

  let logged = false,
	web3,
	account,
	chain;

	const ConnectWeb3 = async () => {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
				return web3;
      } catch (error) {
				throw error;
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

	const getAccounts = function(callback) {
		if (account && logged) {
			logged = false;
		}
		web3.eth.getAccounts((error,result) => {
				if (error) {
					addNotification({
						text: "Can't get Metamask Account",
						position: "top-right",
						type: "danger",
						removeAfter: 3000,
					});
				} else {
					console.log('Account: ',result);
					callback(result);
				}
		});
	}

	const accountFilter = function(account) {
		let ac = String(account);
		return `${ac.substr(0, 6)}...${ac.substr(ac.length - 4, 4)}`;
	}

  onMount(async () => {
    if (ethereum) {
      ethereum.on("accountsChanged", (accounts) => {
        console.log("accounts: ", accounts);
        // Handle the new accounts, or lack thereof.
        // "accounts" will always be an array, but it can be empty.
      });

      ethereum.on("chainChanged", (chainId) => {
        console.log("Chain ID: ", chainId);
        window.location.reload();
      });

      ethereum.on("connect", (connectInfo) => {
        logged = true;
        console.log("connect: ", connectInfo);
      });

      ethereum.on("disconnect", (error) => {
        logged = false;
        console.log("disconnect: ", error);
      });
    }
  });

  function handleConnect() {
		ConnectWeb3().then((result) => {
			console.log('conected: ', result);
			logged = true;
			web3 = result;
			getAccounts((result) => account = result);
		}).catch( (error) => {
			addNotification({
				text: error.message,
				position: "top-right",
				type: "danger",
				removeAfter: 5000,
			})
		});
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
