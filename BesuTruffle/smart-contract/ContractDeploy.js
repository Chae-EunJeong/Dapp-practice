import { web3 } from "./ssafyConfig.js";
import fs from "fs";
import { sign } from "crypto";

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
const myWalletAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKey);
// 테스트용 - 정빈 지갑
const jbWalletAddress = "0x162560909C304f3de8F71B425C80B8a16251cf51";
const jbPrivateKey =
  "0x0aa0ac9c31365d81fa78a65063ce913568e65d9a4d43318b15c305bef81ab616";

const jbWalletAccount = web3.eth.accounts.privateKeyToAccount(jbPrivateKey);

// 테스트용 - 창현 지갑
const chWalletAddress = "0xb2FF8d3Cb3759CD4F3841816Fc0e646C5A9AC40b";
const chPrivateKey =
  "0x2268d80094b1dcbfcb3785c0940d06ed14d941efe4a80145aced37037833cb7a";

const chWalletAccount = web3.eth.accounts.privateKeyToAccount(chPrivateKey);

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
    arguments: [mintAddr, ssafyTokenAddr],
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
  const saleContractTest = new web3.eth.Contract(
    saleTicketAbi,
    saleContractAddr
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
  // const nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  // console.log(nonce);
  // let tx = {};
  // tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  // tx.from = jbWalletAddress;
  // tx.to = mintContractAddr;
  // tx.data = mintContractTest.methods.buyTicket(jbWalletAddress).encodeABI();
  // // //tx.gas = await web3.eth.getGasPrice();
  // tx.gas = 300000;

  // let signedTx = await web3.eth.accounts.signTransaction(
  //   tx,
  //   jbWalletAccount.privateKey
  // );
  // console.log(signedTx);

  // var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  // console.log(receipt);

  // const test = await ssafyTokenContract.methods
  //   .transfer(myWalletAddress, 20)
  //   .call({ from: jbWalletAddress });
  // console.log(test);

  /* mintTicket 컨트랙트에 saleTicket 컨트랙트 주소 등록 (approve 권한 위해) */
  let tx = {};
  tx.nonce = await web3.eth.getTransactionCount(myWalletAddress);
  tx.from = myWalletAddress;
  tx.to = mintContractAddr;
  tx.data = mintContractTest.methods
    .setSaleTicket(saleContractAddr)
    .encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  let signedTx = await web3.eth.accounts.signTransaction(
    tx,
    myWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //console.log(receipt);

  /* erc20 토큰 전송을 위한 approve */
  tx = {};
  tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  tx.from = jbWalletAddress;
  tx.to = ssafyTokenAddr;
  tx.data = ssafyTokenContract.methods
    .approve(mintContractAddr, 20)
    .encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 3000000;

  signedTx = await web3.eth.accounts.signTransaction(
    tx,
    jbWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //console.log(receipt);

  /* buyticket 함수 호출 */
  console.log("========buyticket============");
  tx = {};
  tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  tx.from = jbWalletAddress;
  tx.to = mintContractAddr;
  tx.data = mintContractTest.methods.buyTicket("gitticket").encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  signedTx = await web3.eth.accounts.signTransaction(
    tx,
    jbWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  // console.log(receipt);

  /* 보유 티켓 조회 */
  const getTickets = await mintContractTest.methods
    .getTicketList(jbWalletAccount.address)
    .call();

  console.log(getTickets[0].tokenId);
  const getURI = await mintContractTest.methods
    .tokenURI(getTickets[0].tokenId)
    .call();
  console.log(getURI);

  const afterSenderBalance = await mintContractTest.methods
    .getCurrencyAmount()
    .call({ from: jbWalletAddress });
  console.log("after purchase ticket, balance : ", afterSenderBalance);

  /* 구매한 토큰 판매 등록 */
  tx = {};
  tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  tx.from = jbWalletAddress;
  tx.to = saleContractAddr;
  tx.data = saleContractTest.methods
    .setForSaleTicket(getTickets[0].tokenId, 21)
    .encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  signedTx = await web3.eth.accounts.signTransaction(
    tx,
    jbWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //console.log(receipt);

  /* 등록한 토큰의 가격 */
  const setTicketPrice = await saleContractTest.methods
    .getTicketPrice(getTickets[0].tokenId)
    .call();
  console.log("setting price: ", setTicketPrice);

  /* 창현 계좌로 정빈 토큰 구매 */
  tx = {};
  //tx.nonce = await web3.eth.getTransactionCount(chWalletAddress);
  tx.from = chWalletAccount.address;
  tx.to = saleContractAddr;
  tx.data = saleContractTest.methods
    .purchaseTicket(getTickets[0].tokenId)
    .encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  signedTx = await web3.eth.accounts.signTransaction(
    tx,
    chWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  // console.log(receipt);

  /* 구매한 티켓 조회 */
  const purchaseTicket = await mintContractTest.methods
    .getTicketList(chWalletAccount.address)
    .call();

  console.log(purchaseTicket);

  /* p2p 싸피토큰 거래 
  console.log("====transfer====")
  tx = {};
  tx.nonce = await web3.eth.getTransactionCount(jbWalletAddress);
  tx.from = jbWalletAddress;
  tx.to = ssafyTokenAddr;
  tx.data = ssafyTokenContract.methods
    .transfer(chWalletAddress, 3)
    .encodeABI();
  // //tx.gas = await web3.eth.getGasPrice();
  tx.gas = 300000;

  signedTx = await web3.eth.accounts.signTransaction(
    tx,
    jbWalletAccount.privateKey
  );

  var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(receipt);*/
})();
