import { writable } from 'svelte/store';
import { readable } from 'svelte/store';

const BRONZE = readable(50),
SILVER = readable(100),
GOLD = readable(250),
PLATINUM = readable(500),
TOKEN_SIMBOL = readable('USDC'),
REWARD_SIMBOL = readable('TVP'),
Prestige_Points = readable('0xF2494614843767C8B0BAbCE2eBab87e827D6e223'),
Minter = readable('0x25817DA88A754a5f74646fb01e15b46aea43aA9A'),
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
    Prestige_Points,
    Minter, 
    Logged, 
    Account, 
    ChainId, 
};