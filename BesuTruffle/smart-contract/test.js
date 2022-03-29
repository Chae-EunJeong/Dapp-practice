import { getBalance } from "./UserWallet.js";
import { web3 } from "./ssafyConfig.js";

// 테스트용 - 정빈 지갑
const jbWalletAddress = "0x162560909C304f3de8F71B425C80B8a16251cf51";
const jbPrivateKey =
  "0x0aa0ac9c31365d81fa78a65063ce913568e65d9a4d43318b15c305bef81ab616";

const jbWalletAccount = web3.eth.accounts.privateKeyToAccount(jbPrivateKey);
const test = await getBalance(jbWalletAddress);
console.log(test);
