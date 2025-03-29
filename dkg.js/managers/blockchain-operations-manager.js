class BlockchainOperationsManager {
    constructor(services) {
        this.blockchainService = services.blockchainService;
        this.inputService = services.inputService;
    }

    /**
     * @async
     * @param {Object} [options={}]  - Optional parameters for blockchain service.
     * @returns {Promise<number>} - A promise that resolves to the chain id.
     */
    async getChainId(options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        return this.blockchainService.getChainId(blockchain);
    }

    /**
     * @async
     * @param {Object} [options={}]  - Optional parameters for blockchain service.
     * @returns {Promise<string[]>} - A promise that resolves to the chain id.
     */
    async getAgents(options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        return this.blockchainService.getAgents(blockchain);
    }

    /**
     * @async
     * @param {string} agent  - Agent address
     * @param {Object} [options={}]  - Optional parameters for blockchain service.
     */
    async addAgent(agent, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        const receipt = await this.blockchainService.addAgent(agent, blockchain);
        return receipt;
    }

    /**
     * @async
     * @param {string} agent  - Agent address
     * @param {Object} [options={}]  - Optional parameters for blockchain service.
     */
    async removeAgent(agent, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        const receipt = await this.blockchainService.removeAgent(agent, blockchain);
        return receipt;
    }


    /**
     * Retrieve the current gas price.
     * @async
     * @param {Object} [options={}]  - Optional parameters for blockchain service.
     * @returns {Promise<string>} - A promise that resolves to the current gas price.
     */
    async getGasPrice(options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        return this.blockchainService.getGasPrice(blockchain);
    }

    /**
     * Retrieve the wallet balances.
     * @async
     * @param {Object} [options={}] - Optional parameters for blockchain service.
     * @returns {Promise<Object>} - A promise that resolves to an object containing wallet balances.
     */
    async getWalletBalances(options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        return this.blockchainService.getWalletBalances(blockchain);
    }
}

module.exports = BlockchainOperationsManager;
