import { web3 } from "./ssafyConfig.js";
import fs from "fs";

const { abi: mintTicketAbi } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/MintTicket.sol/MintTicket.json")
);
const { bytecode: mintTicketBytecode } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/MintTicket.sol/MintTicket.json")
);

const { abi: saleTicketAbi } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SaleTicket.sol/SaleTicket.json")
);
const { bytecode: saleTicketBytecode } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SaleTicket.sol/SaleTicket.json")
);

const myWalletAddress = "0x2177a0dC22B2072e8ffFA2269a67E907784ef63b";
const myPrivateKey =
  "0x93bd1191b6feaea6755c4e3cc3eba0823ce51486b3a848d5f0ffa2a8ce52f00d";
// 테스트용 - 정빈 지갑
const jbWalletAddress = "0x162560909C304f3de8F71B425C80B8a16251cf51";
const jbPrivateKey =
  "0x0aa0ac9c31365d81fa78a65063ce913568e65d9a4d43318b15c305bef81ab616";

const jbWalletAccount = web3.eth.accounts.privateKeyToAccount(jbPrivateKey);
const { abi: ssafyTokenAbi } = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SsafyToken.sol/SsafyToken.json")
);
const ssafyTokenAddr = "0x6C927304104cdaa5a8b3691E0ADE8a3ded41a333";
export const ssafyTokenContract = new web3.eth.Contract(
  ssafyTokenAbi,
  ssafyTokenAddr
);

export async function mintDeploy(price) {
  const mintContractInstance = new web3.eth.Contract(mintTicketAbi);
  const mintDeployedContract = mintContractInstance.deploy({
    data: mintTicketBytecode,
    arguments: [myWalletAddress, price, ssafyTokenAddr],
  });
  const mintGasEstimate = await mintDeployedContract.estimateGas({
    from: myWalletAddress,
  });
  const mintResultEncode = mintDeployedContract.encodeABI();
  var tx = {
    data: mintResultEncode,
    gas: mintGasEstimate,
  };

  const mintTest = await web3.eth.accounts.signTransaction(tx, myPrivateKey);

  return await web3.eth.sendSignedTransaction(mintTest.rawTransaction);
}

export async function saleDeploy(mintAddr) {
  const saleContractInstance = new web3.eth.Contract(saleTicketAbi, mintAddr);
  const saleDeployedContract = saleContractInstance.deploy({
    data: saleTicketBytecode,
    arguments: [mintAddr],
  });
  const saleGasEstimate = await saleDeployedContract.estimateGas({
    from: myWalletAddress,
  });
  const saleResultEncode = saleDeployedContract.encodeABI();
  var tx = {
    data: saleResultEncode,
    gas: saleGasEstimate,
  };
  const saleTest = await web3.eth.accounts.signTransaction(tx, myPrivateKey);

  return await web3.eth.sendSignedTransaction(saleTest.rawTransaction);
}

(async () => {
  const mintContract = await mintDeploy(20);
  const mintContractAddr = mintContract.contractAddress;
  console.log(mintContractAddr);
  const saleContract = await saleDeploy(mintContractAddr);
  const saleContractAddr = saleContract.contractAddress;
  console.log(saleContractAddr);

  const mintContractTest = new web3.eth.Contract(
    mintTicketAbi,
    mintContractAddr
  );

  //console.log(mintContractTest.methods);
  const senderBalance = await mintContractTest.methods
    .getCurrencyAmount()
    .call({ from: jbWalletAddress });
  console.log(senderBalance);

  const admin = await mintContractTest.methods.owner().call();
  console.log(admin);
  /* 티켓 구매  */
  // 1.mintTicket contract가 구매자의 SSAFY 토큰을 상대방에게 전송할 수 있는 권한을 부여합니다.
  // 2. 정상 호출 후, Sale 컨트랙트의 purchase() 함수를 호출합니다.
  const nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  console.log(nonce);
  let tx = {};
  tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  tx.from = jbWalletAddress;
  tx.to = mintContractAddr;
  tx.data = mintContractTest.methods.buyTicket(jbWalletAddress).encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  let signedTx = await web3.eth.accounts.signTransaction(
    tx,
    jbWalletAccount.privateKey
  );
  console.log(signedTx);
  
  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(receipt);
  
  // const test = await ssafyTokenContract.methods
  //   .transfer(myWalletAddress, 20)
  //   .call({ from: jbWalletAddress });
  // console.log(test);

  
  /* 보유 티켓 조회 */
  try {
    const getTickets = await mintContractTest.methods
      .getTicketList(jbWalletAccount.address)
      .call();
    console.log(getTickets);
  } catch (err) {
    console.error();
  }
})();
