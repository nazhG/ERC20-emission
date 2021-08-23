// const TVK     = "0x5667dcc0ab74d1b1355c3b2061893399331b57e2" 
const USDC_ADDRESS     = "0x2058a9d7613eee744279e3856ef0eada5fcbaa7e", 
USDC = 10e6, // number of Decimales of ERC20 used
BRONZE = .5*USDC,
SILVER = 1*USDC,
GOLD = 2.5*USDC,
PLATINUM = 5*USDC, 
TIERS = [
  BRONZE, 
  SILVER, 
  GOLD, 
  PLATINUM, 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
]

module.exports = {
  USDC_ADDRESS, 
  USDC, 
  TIERS, 
}
