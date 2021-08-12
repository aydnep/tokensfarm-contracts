const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress, saveContractAbis } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
  let contracts = getSavedContractAddresses()[hre.network.name];

  // deploy reward contract
  const Hord = await hre.ethers.getContractFactory('ERC20Mock');
  console.log();
  const hordToken = await Hord.deploy("Hord Token", "Hord", 18, ethers.utils.parseEther("1000000000"));
  await hordToken.deployed();
  console.log('Hord deployed with address: ', hordToken.address);
  saveContractAddress(hre.network.name, 'Hord', hordToken.address);

  let hordTokenArtifact = await hre.artifacts.readArtifact("ERC20Mock");
  saveContractAbis(hre.network.name, 'Hord', hordTokenArtifact.abi, hre.network.name);

  // deploy farm contract
  contracts = getSavedContractAddresses()[hre.network.name];

  let currentBlock = await web3.eth.getBlockNumber();
  currentBlock += 50; // 10 mins
  const rewardPerBlock = ethers.utils.parseEther("1.25"); //1.25 token per block

  const TokensFarm = await hre.ethers.getContractFactory('TokensFarm');
  console.log();
  const tokensFarm = await TokensFarm.deploy(contracts["Hord"], rewardPerBlock, currentBlock, 150, true); // min time to stake = 30 mins
  await tokensFarm.deployed();
  console.log('TokensFarm deployed with address: ', tokensFarm.address);
  saveContractAddress(hre.network.name, 'TokensFarm', tokensFarm.address);

  let tokensFarmArtifact = await hre.artifacts.readArtifact("TokensFarm");
  saveContractAbis(hre.network.name, 'TokensFarm', tokensFarmArtifact.abi, hre.network.name);

  // add pool
  await tokensFarm.addPool(contracts["Hord"], true);

  // fund rewards
  let totalRewards = ethers.utils.parseEther("5500")// 3 days approximately
  let tokenArtifiact = await hre.artifacts.readArtifact("ERC20Mock");
  const rewardToken = await hre.ethers.getContractAt(tokenArtifiact.abi, contracts["Hord"])
  await rewardToken.approve(tokensFarm.address, totalRewards);
  //-- delay --//
  let i;
  for (i = 0; i <= 100000; i++) {}
  console.log('Approved rewards token');

  console.log('Create new farming pool for reward token');
  await tokensFarm.fund(totalRewards);
  console.log('Farm funded properly.');

  // set penalty
  await tokensFarm.setEarlyWithdrawPenalty(0);
  console.log('Farm set penalty - BURN_REWARDS.');

  // transfer ownership
  //-- delay --//
  for (i = 0; i <= 100000; i++) {}
  
  await tokensFarm.transferOwnership(tokensFarm.address);
  console.log('Farm Owner = ', await tokensFarm.owner());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
