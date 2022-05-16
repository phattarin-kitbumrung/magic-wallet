import { ethers } from "hardhat";

async function main() {
  const MagicWallet = await ethers.getContractFactory("MagicWallet");
  const magicWalletContract = await MagicWallet.deploy();
  await magicWalletContract.deployed();
  console.log("MagicWallet deployed to:", magicWalletContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});