import * as fs from 'fs';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const deployerSigner = await hre.ethers.getSigner(deployer);

  const hubControllerAddress = hre.helpers.contractDeployments.contracts['HubController'].evmAddress;
  const HubController = await hre.ethers.getContractAt('HubController', hubControllerAddress, deployer);

  const agent = new hre.ethers.Wallet(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    hre.ethers.provider,
  );

  const IdFactoryAddress = hre.helpers.contractDeployments.contracts['IdFactory'].evmAddress;
  const IdFactory = await hre.ethers.getContractAt('IdFactory', IdFactoryAddress, agent);

  const claimIssuerPk = [
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba', // account 5
    '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e', // account 6
    '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356', // account 7
  ];

  let claimIssuer1;

  for (const i in claimIssuerPk) {
    const wallet = new hre.ethers.Wallet(claimIssuerPk[i]);
    const claimIssuer = await hre.deployments.deploy('ClaimIssuer', {
      from: deployer,
      args: [wallet.address],
      log: true,
    });
    if (claimIssuer1 === undefined) {
      claimIssuer1 = claimIssuer;
    }

    await IdFactory.registerClaimIssuer(wallet.address, claimIssuer.address);

    console.log(`Deployed Claim Issuer for wallet ${wallet.address} at address ${claimIssuer.address} !`);
    console.log('--------------------------------------------------');
  }

  console.log('Agent address', agent.address);

  const trexFactoryAddress = hre.helpers.contractDeployments.contracts['TREXFactory'].evmAddress;
  console.log('TREXFactory Address: ' + trexFactoryAddress);
  const trexFactory = await hre.ethers.getContractAt('TREXFactory', trexFactoryAddress, agent);

  console.log('Deploying context');

  await trexFactory.deployContext(
    'https://schema.org',
    { complianceModules: [], complianceSettings: [] },
    { claimTopics: [1], issuers: [claimIssuer1.address], issuerClaims: [[1]] },
  );

  console.log('Context 1 deployed');

  console.log('IdFactory address:', IdFactory.address);

  const adresses = [
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
    '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
    '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
    '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
    '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
    '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
    '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
    '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  ];

  for (const i in adresses) {
    const identity = await IdFactory.createIdentity(adresses[i], adresses[i]);
    console.log('Created identity for address ' + adresses[i]);
    await trexFactory.registerIdentity(adresses[i]);
  }

  // const mnemonic = 'test test test test test test test test test test test junk';
  //
  // const accounts = await hre.ethers.provider.listAccounts();
  // const accountKeyMap: Record<string, string> = {};
  //
  // accounts.forEach((account, index) => {
  //   const wallet = hre.ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${index}`);
  //   accountKeyMap[account] = wallet.privateKey;
  // });
};

export default func;
func.tags = ['TREXFactory', 'v1'];
func.dependencies = ['Hub'];
