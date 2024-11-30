/* eslint-disable no-await-in-loop */
const Web3 = require('web3');
const {IdentitySDK} = require("@onchain-id/identity-sdk");
const BlockchainServiceBase = require('../blockchain-service-base.js');
const { WEBSOCKET_PROVIDER_OPTIONS } = require('../../../constants.js');

class BrowserBlockchainService extends BlockchainServiceBase {
    constructor(config = {}) {
        super(config);
        this.config = config;
    }

    async initializeWeb3(blockchainName, blockchainRpc) {
        if (typeof window.web3 === 'undefined' || !window.web3) {
            // eslint-disable-next-line no-console
            console.error(
                'No web3 implementation injected, please inject your own Web3 implementation.',
            );
        }
        if (window.ethereum) {
            this[blockchainName].web3 = new Web3(window.ethereum);

            try {
                // Request account access if needed
                await window.ethereum.enable();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
            this[blockchainName].provider = window.ethereum;
        } else if (blockchainRpc.startsWith('ws')) {
            const provider = new Web3().providers.WebsocketProvider(
                blockchainRpc,
                WEBSOCKET_PROVIDER_OPTIONS,
            );
            this[blockchainName].web3 = new Web3(provider);
            this[blockchainName].provider = provider;
        } else {
            this[blockchainName].web3 = new Web3(blockchainRpc);
            this[blockchainName].provider = new Web3.providers.HttpProvider(blockchainRpc);
        }
    }

    async decodeEventLogs(receipt, eventName, blockchain) {
        await this.ensureBlockchainInfo(blockchain);
        const web3Instance = await this.getWeb3Instance(blockchain);
        let result;
        const { hash, inputs } = this.events[eventName];

        const logs = Object.values(receipt.events);
        for (const log of logs) {
            if (log.raw.topics && log.raw.topics.length > 0 && log.raw.topics[0] === hash) {
                result = web3Instance.eth.abi.decodeLog(
                    inputs,
                    log.raw.data,
                    log.raw.topics.slice(1),
                );
                break;
            }
        }
        return result;
    }

    async executeContractFunction(contractName, functionName, args, blockchain, contractAddress = null) {
        await this.ensureBlockchainInfo(blockchain);
        let contractInstance;
        if (contractAddress === null) {
            contractInstance = await this.getContractInstance(contractName, blockchain);   
        } else {
            contractInstance = await this.getContractInstanceWithAddress(contractName, blockchain, contractAddress);
        }
        let tx;
        try {
            tx = await this.prepareTransaction(contractInstance, functionName, args, blockchain);

            let receipt = await contractInstance.methods[functionName](...args).send(tx);
            if (blockchain.name.startsWith('otp') && blockchain.waitNeurowebTxFinalization) {
                receipt = await this.waitForTransactionFinalization(receipt, blockchain);
            }
            return receipt;
        } catch (error) {
            if (/revert|VM Exception/i.test(error.message)) {
                let status;
                try {
                    status = await contractInstance.methods.status().call();
                } catch (_) {
                    status = false;
                }

                if (!status) {
                    await this.updateContractInstance(contractName, blockchain, true);
                    contractInstance = await this.getContractInstance(contractName, blockchain);
                    const web3Instance = await this.getWeb3Instance(blockchain);

                    if (tx !== undefined) {
                        await web3Instance.eth.call({
                            to: contractInstance.options.address,
                            data: tx.data,
                            from: tx.from,
                        });

                        return contractInstance.methods[functionName](...args).send(tx);
                    }
                }
            }
            try {
                if (error && error.message) {
                    // Match for the specific error message pattern
                    const match = error.message.match(/reverted with reason string '(.*?)'/);
                    if (match && match[1]) {
                        // eslint-disable-next-line prefer-destructuring
                        error.message = match[1]
                    }
                }
            } catch (e) {
                console.log(e);
            }
            throw error;
        }
    }

    async getPublicKey() {
        return this.getAccount();
    }

    async getIdentity(blockchain, address) {
        const add = address !== null ? address : await this.getPublicKey();
        return this.callContractFunction(
            'IdFactory',
            'getIdentity',
            [add],
            blockchain
        )
    }

    async getAccount() {
        if (!this.account) {
            if (!window.ethereum) {
                throw Error('This operation can be performed only by using Metamask accounts.');
            }
            const accounts = await window.ethereum
                .request({
                    method: 'eth_requestAccounts',
                })
                // eslint-disable-next-line no-console
                .catch(() => console.error('There was an error fetching your accounts'));

            [this.account] = accounts;
        }
        return this.account;
    }

    getProvider(blockchain) {
        return this[blockchain.name].provider;
    }

    async transferAsset(tokenId, to, blockchain) {
        return this.executeContractFunction(
            'ContentAssetStorage',
            'transferFrom',
            [await this.getAccount(), to, tokenId],
            blockchain,
        );
    }
}
module.exports = BrowserBlockchainService;
