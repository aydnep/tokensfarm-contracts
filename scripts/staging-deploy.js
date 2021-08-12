const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress, saveContractAbis } = require('./utils')
const { ethers, web3, upgrades } = hre

async function main() {
  let contracts = getSavedContractAddresses()[hre.network.name];

  // deploy reward token contract
  const RewardToken = await hre.ethers.getContractFactory('ERC20Mock');
  console.log();
  let rewardToken = await RewardToken.deploy("Hord Token", "Hord", 18, ethers.utils.parseEther("1000000000"));
  await rewardToken.deployed();
  console.log('RewardToken deployed with address: ', rewardToken.address);
  saveContractAddress(hre.network.name, 'RewardToken', rewardToken.address);

  let rewardTokenArtifact = await hre.artifacts.readArtifact("ERC20Mock");
  saveContractAbis(hre.network.name, 'RewardToken', rewardTokenArtifact.abi, hre.network.name);


  // deploy LP token contract
  contracts = getSavedContractAddresses()[hre.network.name];

  const LPToken = await hre.ethers.getContractFactory('ERC20Mock');
  console.log();
  const lpToken = await LPToken.deploy("LP-Token", "LPT", 18, ethers.utils.parseEther("1000000000"));
  await lpToken.deployed();
  console.log('LPToken deployed with address: ', lpToken.address);
  saveContractAddress(hre.network.name, 'LP-Token', lpToken.address);

  let lpTokenArtifact = await hre.artifacts.readArtifact("ERC20Mock");
  saveContractAbis(hre.network.name, 'LP-Token', lpTokenArtifact.abi, hre.network.name);


  // deploy farm contract
  contracts = getSavedContractAddresses()[hre.network.name];
  
  let currentBlock = await web3.eth.getBlockNumber();
  currentBlock += 50; // 10 mins
  const rewardPerBlock = ethers.utils.parseEther("1.25"); //1.25 token per block
  
  const TokensFarm = await hre.ethers.getContractFactory('TokensFarm');
  console.log();
  const tokensFarm = await TokensFarm.deploy(contracts["RewardToken"], rewardPerBlock, currentBlock, 150, true); // min time to stake = 30 mins
  await tokensFarm.deployed();
  console.log('TokensFarm deployed with address: ', tokensFarm.address);
  saveContractAddress(hre.network.name, 'TokensFarm', tokensFarm.address);

  let tokensFarmArtifact = await hre.artifacts.readArtifact("TokensFarm");
  saveContractAbis(hre.network.name, 'TokensFarm', tokensFarmArtifact.abi, hre.network.name);

  // add pool and set LP token
  await tokensFarm.addPool(contracts["LP-Token"], true);

  // fund rewards
  let totalRewards = ethers.utils.parseEther("5500")// 3 days approximately
  let tokenArtifiact = await hre.artifacts.readArtifact("ERC20Mock");
  rewardToken = await hre.ethers.getContractAt(tokenArtifiact.abi, contracts["RewardToken"])
  await rewardToken.approve(tokensFarm.address, totalRewards);
  console.log('Approved rewards token');

  // console.log('Create new farming pool for reward token');
  // // tokensFarm = await hre.ethers.getContractAt(tokensFarmArtifact.abi, contracts["TokensFarm"]);
  // await tokensFarm.fund(totalRewards);
  // console.log('Farm funded properly.');

  // // set penalty
  // await tokensFarm.setEarlyWithdrawPenalty(0);
  // console.log('Farm set penalty - BURN_REWARDS.');

  // transfer ownership 
  // await tokensFarm.transferOwnership(tokensFarm.address);
  // console.log('Farm Owner = ', await tokensFarm.owner());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
