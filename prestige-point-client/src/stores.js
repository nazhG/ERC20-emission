import { writable } from 'svelte/store';
import { readable } from 'svelte/store';

const
Prestige    = {
    tier    : readable([
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
    address : readable('0xE408478799d71E4E5b17D41C973A4f05354fE5DF'),
    contract: writable(null),
},
PaymentToken= {
    simbol  : readable('USDC'),
    address : readable('0x2058a9d7613eee744279e3856ef0eada5fcbaa7e'),
    contract: writable(null),
},
Reward      = {
    simbol  : readable('TVP'),
    address : readable('0x2399B1e496adBAF056aC087a68Ff3056d14d4C4B'),
    contract: writable(null),
},
Connection  = {
    web3        : writable(null),
    logged      : writable(false),
    account     : writable(null),
    chainId     : writable(null), 
    tx_OnGoing  : writable(false),
    tx_Message  : writable(''),
},
User        = {
    affiliation_date : writable(0),
    funds  : writable(0),
    tuer   : writable(-1),
    reward : writable(0),
};

export { 
    Prestige,
    PaymentToken,
    Reward,
    Connection,
    User,
};