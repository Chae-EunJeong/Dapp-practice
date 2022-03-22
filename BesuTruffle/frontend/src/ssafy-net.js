const Web3 = require("web3");
const fs = require("fs");

console.log("hello world");
const contractAddr = "0xDe5d1E8ADd2F9bd685AD4955325520B3fd1592A4";
const { abi: contractABI } = JSON.parse(
  fs.readFileSync(
    "../../smart-contract/artifacts/contracts/MintAnimalToken.sol/MintAnimalToken.json"
  )
);
console.log(contractABI);
