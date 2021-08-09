import { writable } from 'svelte/store';
import { readable } from 'svelte/store';

const BRONZE = readable(50),
SILVER = readable(100),
GOLD = readable(250),
PLATINUM = readable(500),
TOKEN_SIMBOL = readable('USDC'),
REWARD_SIMBOL = readable('TVP'),
Pay_Token_Address = readable('0x2058a9d7613eee744279e3856ef0eada5fcbaa7e'),
Prestige_Points_Address = readable('0xF2494614843767C8B0BAbCE2eBab87e827D6e223'),
Minter_Address = readable('0x25817DA88A754a5f74646fb01e15b46aea43aA9A'),
web3 = writable(null),
Logged = writable(false),
Account = writable(null),
ChainId = writable(null);

export { 
    BRONZE, 
    SILVER, 
    GOLD, 
    PLATINUM, 
    TOKEN_SIMBOL, 
    REWARD_SIMBOL,
    Pay_Token_Address,
    Prestige_Points_Address,
    Minter_Address, 
    web3, 
    Logged, 
    Account, 
    ChainId, 
};