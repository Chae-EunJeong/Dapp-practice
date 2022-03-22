const Web3 = require("web3");
const fs = require("fs");

// 네트워크 기본 설정
const ssafyProvider = new Web3.providers.HttpProvider(
  "http://20.196.209.2:8545"
);
const web3 = new Web3(ssafyProvider);
const walletAddress = "0x2177a0dC22B2072e8ffFA2269a67E907784ef63b";
const privateKey =
  "0x93bd1191b6feaea6755c4e3cc3eba0823ce51486b3a848d5f0ffa2a8ce52f00d";

const walletAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
const { address: contractAddr } = JSON.parse(
  fs.readFileSync("./contracts/SsafyNFT-address.json")
);
const { abi: contractABI } = JSON.parse(
  fs.readFileSync("./contracts/SsafyNFT.json")
);
const contractInstance = new web3.eth.Contract(contractABI, contractAddr);
// 3. 실행할 메소드 정보
const tokenURI = "token uri test";
const contractMethod = contractInstance.methods.create(walletAddress, tokenURI);

const contractEncodedMethod = contractMethod.encodeABI();
(async () => {
  try {
    const gasEstimate = await contractMethod.estimateGas({
      from: walletAddress,
    });

    const rawTx = {
      from: walletAddress,
      to: contractAddr,
      gas: gasEstimate,
      data: contractEncodedMethod,
    };
    walletAccount
      .signTransaction(rawTx)
      .then((signedTx) => {
        if (signedTx == null) throw new Error("TransactionSignFailedException");

        let tran = web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        tran.on("transactionHash", (txhash) => {
          console.log("Tx Hash: " + txhash);
          tran.off("transactionHash");
        });
        // tran.on('receipt', (receipt) => console.log("Receipt: " + receipt));
        tran.on("confirmation", async (confirmationNumber, receipt) => {
          try {
            // 3회 이상 컨펌시 더이상 Confirmation 이벤트 추적 안함
            if (confirmationNumber > 2) {
              tran.off("confirmation");
              throw new Error("ConfirmCompletedException");
            }

            console.log("Confirm #" + confirmationNumber);
            // console.log("Confirm Receipt: " + receipt);
          } catch (err) {
            if (err instanceof TypeError) console.error("예외: 타입 에러", err);
            if (err instanceof Error) {
              if (err.message == "ConfirmCompletedException")
                console.error("예외: 컨펌 완료");
              else console.error("예외: 알 수 없는 에러", err);
            }
          }
        });
        tran.on("error", (error, receipt) => {
          if (receipt) throw new Error("OutOfGasException");
          else new Error("UnknownErrorException");
        });
      })
      .catch((err) => {
        throw err;
      });
    console.log(rawTx);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message == "TransactionSignFailedException")
        console.error("예외: 트랜잭션 서명 실패", err);
      if (err.message == "OutOfGasException")
        console.error("예외: 가스 부족", err);
      if (err.message == "UnknownErrorException")
        console.error("예외: 알 수 없는 에러", err);
      else console.error("예외: 알 수 없는 에러", err);
    }
  }
})();
