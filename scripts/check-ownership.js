const hre = require("hardhat");
const { getSavedContractAddresses, saveContractAddress, saveContractAbis } = require('./utils');
const { ethers, web3, upgrades } = hre;
const BigNumber = ethers.BigNumber;
let c = require('../deployments/deploymentConfig.json');

async function main() {
    const tokensFarmArtifact = await hre.artifacts.readArtifact("TokensFarm");
    const farms = [
        '0xd10B535C0019C06a37CAB485B300b85C438fd8b3', // FEAR
        '0x53c8e7F26692d374aFC63474dD69411a7D883373' // HORD
    ];

    for (const farmAddress of farms) {
        console.log('Farm address: ', farmAddress);
        let tokensFarm = await hre.ethers.getContractAt(tokensFarmArtifact.abi, farmAddress);
        const owner = await tokensFarm.owner();
        console.log('Farm owner: ', owner);
        console.log('------------------------------------------')
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
