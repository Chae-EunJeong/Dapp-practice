const Web3 = require("web3");
const fs = require("fs");
const Tx = require("ethereumjs-tx").Transaction;

// 네트워크 기본 설정
const ssafyProvider = new Web3.providers.HttpProvider(
  "http://20.196.209.2:8545"
);
// const localProvider = new Web3.providers.HttpProvider("http://localhost:7545");
const web3 = new Web3(ssafyProvider);

// 내 지갑
const myWalletAddress = "0x2177a0dC22B2072e8ffFA2269a67E907784ef63b";
const myPrivateKey =
  "0x93bd1191b6feaea6755c4e3cc3eba0823ce51486b3a848d5f0ffa2a8ce52f00d";
const myBufPrivateKey = Buffer.from(
  "93bd1191b6feaea6755c4e3cc3eba0823ce51486b3a848d5f0ffa2a8ce52f00d",
  "hex"
);
const myWalletAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKey);

// 테스트용 - 정빈 지갑
const jbWalletAddress = "0x162560909C304f3de8F71B425C80B8a16251cf51";
const jbPrivateKey =
  "0x0aa0ac9c31365d81fa78a65063ce913568e65d9a4d43318b15c305bef81ab616";

const jbWalletAccount = web3.eth.accounts.privateKeyToAccount(jbPrivateKey);

/* ssafy token 잔액 확인 */
const { abi: ssafyTokenAbi } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SsafyToken.sol/SsafyToken.json")
);
const ssafyTokenAddr = "0x6C927304104cdaa5a8b3691E0ADE8a3ded41a333";

const ssafyTokenContract = new web3.eth.Contract(ssafyTokenAbi, ssafyTokenAddr);

async function getBalance(walletAddress) {
  const result = await ssafyTokenContract.methods
    .balanceOf(walletAddress)
    .call();

  console.log(result);
  return result;
}

// getBalance(myWalletAddress);
// getBalance(jbWalletAddress);

/* MintTicket 배포 확인 */
async function deploy() {
  const { abi: mintTicketAbi } = JSON.parse(
    fs.readFileSync("./artifacts/contracts/MintTicket.sol/MintTicket.json")
  );
  const { bytecode: mintTicketBytecode } = JSON.parse(
    fs.readFileSync("./artifacts/contracts/MintTicket.sol/MintTicket.json")
  );
  const resultContract = await new web3.eth.Contract(mintTicketAbi).deploy({
    data: mintTicketBytecode,
    arguments: [20],
  });
  console.log(resultContract.options.address);
  // const resultEncode = resultContract.encodeABI();
  // const gasEstimate = await resultContract.estimateGas({
  //   from: myWalletAddress,
  // });
  // const rawTx = {
  //   from: myWalletAddress,
  //   to: contractAddr,
  //   gas: gasEstimate,
  //   data: contractEncodedMethod,
  // };
}

deploy();
