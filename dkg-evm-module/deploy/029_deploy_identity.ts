import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  await hre.helpers.deploy({
    newContractName: 'DkgIdentity',
  });
};

export default func;
func.tags = ['Identity', 'v1'];
func.dependencies = ['Hub', 'IdentityStorage'];
