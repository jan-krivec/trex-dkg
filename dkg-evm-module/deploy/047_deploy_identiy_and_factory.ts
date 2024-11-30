import OnchainID from '@onchain-id/solidity';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const deployerSigner = await hre.ethers.getSigner(deployer);

  if (!hre.helpers.isDeployed('IdentityImplementation')) {
    const identityImplementation = await new hre.ethers.ContractFactory(
      OnchainID.contracts.Identity.abi,
      OnchainID.contracts.Identity.bytecode,
      deployerSigner,
    ).deploy(deployerSigner.address, true);

    const receipt = await identityImplementation.deployTransaction.wait();

    console.log(
      `Deployed identity implementation for wallet ${deployerSigner.address} at ${identityImplementation.address}`,
    );

    const identityImplementationAuthority = await new hre.ethers.ContractFactory(
      OnchainID.contracts.ImplementationAuthority.abi,
      OnchainID.contracts.ImplementationAuthority.bytecode,
      deployerSigner,
    ).deploy(identityImplementation.address);

    console.log(`Deployed implementation authority at ${identityImplementationAuthority.address}`);

    const idFactory = await hre.helpers.deploy({
      newContractName: 'IdFactory',
      additionalArgs: [identityImplementationAuthority.address],
    });

    console.log(`Deployed idFactory at ${idFactory.address}.`);

    const claimTopicsRegistryImplementation = await hre.helpers.deploy({
      newContractName: 'ClaimTopicsRegistry',
      passHubInConstructor: false,
    });
    console.log('Deployed claimTopicsRegistryImplementation');
    const trustedIssuersRegistryImplementation = await hre.helpers.deploy({
      newContractName: 'TrustedIssuersRegistry',
      passHubInConstructor: false,
    });
    console.log('Deployed trustedIssuersRegistryImplementation');
    const identityRegistryStorageImplementation = await hre.helpers.deploy({
      newContractName: 'IdentityRegistryStorage',
      passHubInConstructor: false,
    });
    console.log('Deployed identityRegistryStorageImplementation');
    const identityRegistryImplementation = await hre.helpers.deploy({
      newContractName: 'IdentityRegistry',
      passHubInConstructor: false,
    });
    console.log('Deployed identityRegistryImplementation');
    const modularComplianceImplementation = await hre.helpers.deploy({
      newContractName: 'ModularCompliance',
      passHubInConstructor: false,
    });
    console.log('Deployed modularComplianceImplementation');
    const contextImplementation = await hre.helpers.deploy({
      newContractName: 'Context',
      contract: 'contracts/TREX/context/Context.sol:Context',
      passHubInConstructor: false,
    });
    console.log('Deployed context Implementation');

    const trexImplementationAuthority = await hre.helpers.deploy({
      newContractName: 'TREXImplementationAuthority',
      passHubInConstructor: false,
      additionalArgs: [true, hre.ethers.constants.AddressZero, hre.ethers.constants.AddressZero],
    });

    console.log('deployed TREXImplementationAuthority');

    const versionStruct = {
      major: 4,
      minor: 1,
      patch: 0,
    };

    const contractsStruct = {
      contextImplementation: contextImplementation.address,
      ctrImplementation: claimTopicsRegistryImplementation.address,
      irImplementation: identityRegistryImplementation.address,
      irsImplementation: identityRegistryStorageImplementation.address,
      tirImplementation: trustedIssuersRegistryImplementation.address,
      mcImplementation: modularComplianceImplementation.address,
    };

    const txResponse = await trexImplementationAuthority.addAndUseTREXVersion(versionStruct, contractsStruct);
    console.log(`Applied version for TREX Implementation Authority  at ${trexImplementationAuthority.address}`);

    try {
      const trexFactory = await hre.helpers.deploy({
        newContractName: 'TREXFactory',
        passHubInConstructor: true,
        additionalArgs: [trexImplementationAuthority.address, idFactory.address],
      });
      console.log(`Deployed TREX Factory at ${trexFactory.address}`);

      const hubControllerAddress = hre.helpers.contractDeployments.contracts['HubController'].evmAddress;
      const HubController = await hre.ethers.getContractAt('HubController', hubControllerAddress, deployer);

      console.log(`Deployer: ${deployer}`);

      try {
        await HubController.setTrexFactory(trexFactory.address, { from: deployer });
      } catch (error) {
        console.error('Debug Script Error:', error);
      }

      console.log(`Set TREX Factory in the Hub`);
    } catch (e) {
      console.log(e);
    }
  }
};

export default func;
func.tags = ['TREXFactory', 'v1'];
func.dependencies = ['Hub'];
