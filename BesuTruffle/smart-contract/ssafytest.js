import { web3 } from "./ssafyConfig.js";
import fs from "fs";

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
async function deploy(price) {
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

  const mintContractInstance = new web3.eth.Contract(mintTicketAbi);
  const mintDeployedContract = mintContractInstance.deploy({
    data: mintTicketBytecode,
    arguments: [price],
  });
  const gasEstimate = await mintDeployedContract.estimateGas({
    from: myWalletAddress,
  });
  const resultEncode = mintDeployedContract.encodeABI();
  var tx = {
    data: resultEncode,
    gas: gasEstimate,
  };
  web3.eth.accounts.signTransaction(tx, myPrivateKey).then((signed) => {
    web3.eth
      .sendSignedTransaction(signed.rawTransaction)
      .on("receipt", async (receipt) => {
        console.log(receipt.contractAddress);
        const saleContractInstance = await new web3.eth.Contract(
          saleTicketAbi,
          receipt.contractAddress
        );
        const saleDeployedContract = await saleContractInstance.deploy({
          data: saleTicketBytecode,
          arguments: [receipt.contractAddress],
        });
        const saleGasEstimate = await saleDeployedContract.estimateGas({
          from: myWalletAddress,
        });
        const saleResultEncode = saleDeployedContract.encodeABI();
        var tx = {
          data: saleResultEncode,
          gas: saleGasEstimate,
        };
        web3.eth.accounts.signTransaction(tx, myPrivateKey).then((signed) => {
          web3.eth
            .sendSignedTransaction(signed.rawTransaction)
            .on("receipt", async (receipt) => {
              // const length =
              //   await saleDeployedContract.methods.getOnSaleTicketArrayLength.call();
              // console.log(length);
              console.log(receipt.contractAddress);
            });
        });
      });
  });

  //console.log(await deployedContract._parent.methods.name().call());
  // console.log(deployedContract._parent._address);
}

async function run() {
  const addr = await deploy(20);
  console.log(addr);
}
run();
