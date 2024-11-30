import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import { extendEnvironment } from 'hardhat/config';
import { lazyObject } from 'hardhat/plugins';
import { HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';

import { Helpers } from './utils/helpers';
import { rpc } from './utils/network';

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  hre.helpers = lazyObject(() => new Helpers(hre));
});

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
    minter: 0,
  },
  networks: {
    localhost: {
      environment: 'development',
      url: 'http://0.0.0.0:8545',
      chainId: 1337,
    },
    hardhat: {
      environment: 'development',
      chainId: 31337,
      gas: 20_000_000,
      gasMultiplier: 1,
      blockGasLimit: 30_000_000,
      hardfork: 'london',
      accounts: { count: 200 },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      loggingEnabled: true,
      allowUnlimitedContractSize: true,
      saveDeployments: false,
      mining: {
        auto: true,
        interval: 5000,
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          evmVersion: 'london',
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              peephole: true,
              inliner: true,
              jumpdestRemover: true,
              orderLiterals: true,
              deduplicate: true,
              cse: true,
              constantOptimizer: true,
              yul: true,
              yulDetails: {
                stackAllocation: true,
              },
            },
          },
          viaIR: process.env.COVERAGE_REPORT ? false : true,
        },
      },
    ],
    overrides: {
      'contracts/v1/MultiSigWallet.sol': {
        version: '0.4.16',
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
