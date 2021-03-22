const BatToken = artifacts.require('../contracts/BatToken.sol');

module.exports = function (deployer) {
  deployer.deploy(BatToken, 1000000);
};
