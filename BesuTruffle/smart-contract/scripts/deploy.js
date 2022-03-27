const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  //   const Token = await ethers.getContractFactory("Token");
  //   const token = await Token.deploy();

  //   console.log("Token address:", token.address);

  const SsafyNFT = await ethers.getContractFactory("SsafyNFT");
  const ssafyNFT = await SsafyNFT.deploy("SSAFY", "SSF");
  console.log("SsafyNFT address: ", ssafyNFT.address);

  const MintAnimalToken = await ethers.getContractFactory("MintAnimalToken");
  const mintAnimalToken = await MintAnimalToken.deploy();
  console.log("MintAnimalToken address: ", mintAnimalToken.address);

  const MintTicket = await ethers.getContractFactory("MintTicket");
  const mintTicket = await MintTicket.deploy(20);
  console.log("MintTicket address: ", mintTicket.address);

  const SaleTicket = await ethers.getContractFactory("SaleTicket");
  const saleTicket = await SaleTicket.deploy(mintTicket.address);
  console.log("SaleTicket address: ", saleTicket.address);

  saveFrontendFiles(mintTicket, "MintTicket");
  saveFrontendFiles(saleTicket, "SaleTicket");
}

function saveFrontendFiles(token, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: token.address }, undefined, 2)
  );
  const TokenArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
