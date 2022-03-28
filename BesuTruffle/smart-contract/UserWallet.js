import { web3 } from "./ssafyConfig.js";
import fs from "fs";

const { abi: ssafyTokenAbi } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SsafyToken.sol/SsafyToken.json")
);
const ssafyTokenAddr = "0x6C927304104cdaa5a8b3691E0ADE8a3ded41a333";
export const ssafyTokenContract = new web3.eth.Contract(ssafyTokenAbi, ssafyTokenAddr);

/* ssafy token 잔액 확인 */
export async function getBalance(walletAddress) {
  const result = await ssafyTokenContract.methods
    .balanceOf(walletAddress)
    .call();

  console.log(result);
  return result;
}
