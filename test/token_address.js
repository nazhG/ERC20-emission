// const TVK     = "0x5667dcc0ab74d1b1355c3b2061893399331b57e2" 
toWei = (num) => web3.utils.toWei(num);

const USDC_ADDRESS     = "0x2058a9d7613eee744279e3856ef0eada5fcbaa7e", 
BRONZE = '.5',
SILVER = '1',
GOLD = '2.5',
PLATINUM = '5', 
TIERS = [
  toWei(BRONZE), 
  toWei(SILVER), 
  toWei(GOLD), 
  toWei(PLATINUM), 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 
]

module.exports = {
  USDC_ADDRESS, 
  TIERS, 
}
