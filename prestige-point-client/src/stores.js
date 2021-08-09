import { writable } from 'svelte/store';
import { readable } from 'svelte/store';

const TIERS = readable([
    {
        tier_name: 'Bronze',
        join_cost: 500000, 
        tier_num: 0, 
    },
    {
        tier_name: 'Silver',
        join_cost: 1000000, 
        tier_num: 1, 
    },
    {
        tier_name: 'Gold',
        join_cost: 2500000, 
        tier_num: 2, 
    },
    {
        tier_name: 'Platinum',
        join_cost: 5000000, 
        tier_num: 3, 
    },
]), 
TOKEN_SIMBOL = readable('USDC'),
REWARD_SIMBOL = readable('TVP'),
Pay_Token_Address = readable('0x2058a9d7613eee744279e3856ef0eada5fcbaa7e'),
Prestige_Points_Address = readable('0x752DCd366327e31d675927c43548AE6D58860FED'),
Minter_Address = readable('0xb921e2Dc4F4804fB25b5d1C36F7E185b63CF076f'),
web3 = writable(null),
Logged = writable(false),
Account = writable(null),
User_funds = writable(0),
User_tier = writable(-1),
User_time = writable(0),
ChainId = writable(null), 
tx_OnGoing = writable(false);

export { 
    TIERS, 
    TOKEN_SIMBOL, 
    REWARD_SIMBOL,
    Pay_Token_Address,
    Prestige_Points_Address,
    Minter_Address, 
    web3, 
    Logged, 
    Account, 
    User_funds, 
    User_tier, 
    User_time, 
    ChainId, 
    tx_OnGoing, 
};