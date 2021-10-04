import { writable } from "svelte/store";

const Claimer = writable({
    tier: [
      {
        tier_name: "Bronze",
        join_cost: .5 * 10e6,
        tier_num: 1,
      },
      {
        tier_name: "Silver",
        join_cost: 1 * 10e6,
        tier_num: 2,
      },
      {
        tier_name: "Gold",
        join_cost: 2.5 * 10e6,
        tier_num: 3,
      },
      {
        tier_name: "Platinum",
        join_cost: 5 * 10e6,
        tier_num: 4,
      },
    ],
    simbol: "TVP",
    address: "0x0CA7Ec7b831305DCA0bfCF8E62f959A50c4121A6",
    contract: null,
  }),
  Tiers = writable({
    address: "0xAeeF3dE727E4a4ecAa7b7Ff648c7167C5329ec4B",
    payment: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
    simbol: "USDC",
    contract: null,
  }),
  Connection = writable({
    web3: null,
    logged: false,
    account: null,
    chainId: null,
    tx_OnGoing: false,
    tx_Message: "",
  }),
  User = writable({
    balance: 0,
    affiliation_date: 0,
    funds: 0,
    tier: -1,
    reward: 0,
  });

export { Claimer, Tiers, Connection, User };
