const MintAnimalToken = artifacts.require("MintAnimalToken");
const SaleAnimalToken = artifacts.require("SaleAnimalToken");

module.exports = function (deployer) {
  deployer.deploy(MintAnimalToken);
};
