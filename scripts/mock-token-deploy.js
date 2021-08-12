const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {

  const contracts = getSavedContractAddresses()[hre.network.name];

  const Hord = await hre.ethers.getContractFactory('ERC20Mock');
  console.log();
  const hordToken = await Hord.deploy("Hord Token", "Hord", 18, ethers.utils.parseEther("1000000000"));
  await hordToken.deployed();
  console.log('Hord deployed with address: ', hordToken.address);
  saveContractAddress(hre.network.name, 'Hord', hordToken.address);

  const SSS = await hre.ethers.getContractFactory('ERC20Mock');
  console.log();
  const sssToken = await SSS.deploy("3S Token", "3S", 18, ethers.utils.parseEther("1000000000"));
  await sssToken.deployed();
  console.log('SSS deployed with address: ', sssToken.address);
  saveContractAddress(hre.network.name, 'SSS', sssToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
