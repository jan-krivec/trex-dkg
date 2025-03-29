const TREXFactoryAbi = require('dkg-evm-module/abi/TREXFactory.json');
const { ethers } = require('ethers');

class ContextOperationsManager {
    constructor(services) {
        this.nodeApiService = services.nodeApiService;
        this.blockchainService = services.blockchainService;
        this.inputService = services.inputService;
    }

    /**
     * Gets all deployed contexts
     * @async
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async getContextList(options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const list = await this.blockchainService.callContractFunction(
            'TREXFactory',
            'getContextList',
            [],
            blockchain
        )

        return list;
    }

    /**
     * Creates a new context.
     * @async
     * @param {string} context - Context
     * @param {Object[]} claimIssuers - Claim details
     * @param {Object} contextDetails - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async deployContext(context,
                        claimIssuers = [],
                        contextDetails = { complianceModules: [], complianceSettings: [] },
                        options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const claimDetails = this.mapClaimIssuersToDetails(claimIssuers);

        const receipt = await this.blockchainService.executeContractFunction(
            'TREXFactory',
            'deployContext',
            [context,  contextDetails, claimDetails],
            blockchain
        )

        console.log("Transaction successful with receipt:", receipt);
        return receipt;
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {number[]}
     */
    async getClaimTopics(context, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = await this.blockchainService.getContextAddress(context, blockchain);

        const {claimTopicsRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        console.log(claimTopicsRegistry);

        const claimTopics = await this.blockchainService.callContractFunction(
            'ClaimTopicsRegistry',
            'getClaimTopics',
            [],
            blockchain,
            claimTopicsRegistry
        );

        return claimTopics;
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {number} claimTopic - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async addClaimTopic(context, claimTopic, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = await this.blockchainService.getContextAddress(context, blockchain);

        const {claimTopicsRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        console.log(claimTopicsRegistry);

        const res = await this.blockchainService.executeContractFunction(
            'ClaimTopicsRegistry',
            'addClaimTopic',
            [claimTopic],
            blockchain,
            claimTopicsRegistry
        )

        console.log(res);
    }


    /**
     * Removes claim topic from context.
     * @async
     * @param {string} context - Context
     * @param {number} claimTopic - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async removeClaimTopic(context, claimTopic, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = this.blockchainService.getContextAddress(context, blockchain);

        const {claimTopicsRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        await this.blockchainService.executeContractFunction(
            'ClaimTopicsRegistry',
            'removeClaimTopic',
            [claimTopic],
            blockchain,
            claimTopicsRegistry
        )
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {number} claimTopic - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async getTrustedIssuers(context, claimTopic, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = await this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        return this.blockchainService.callContractFunction(
            'TrustedIssuersRegistry',
            'getTrustedIssuers',
            [],
            blockchain,
            trustedIssuersRegistry
        );
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {string} claimIssuer - Claim issuer address
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async isTrustedIssuer(context, claimIssuer, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        return this.blockchainService.callContractFunction(
            'TrustedIssuersRegistry',
            'isTrustedIssuer',
            [claimIssuer],
            blockchain,
            trustedIssuersRegistry
        )
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {string} claimIssuer - Claim issuer address
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async getTrustedIssuerClaimTopics(context, claimIssuer, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = await this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        return this.blockchainService.callContractFunction(
            'TrustedIssuersRegistry',
            'getTrustedIssuerClaimTopics',
            [claimIssuer],
            blockchain,
            trustedIssuersRegistry
        )
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {string} claimIssuer - Claim issuer address
     * @param {number[]} claimTopic - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async addTrustedIssuer(context, claimIssuer, claimTopics, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        const receipt = await this.blockchainService.executeContractFunction(
            'TrustedIssuersRegistry',
            'addTrustedIssuer',
            [claimIssuer, claimTopics],
            blockchain,
            trustedIssuersRegistry
        )
        return receipt;
    }

    /**
     * Adds claim topic to context.
     * @async
     * @param {string} context - Context
     * @param {string} claimIssuer - Claim issuer address
     * @param {number[]} claimTopic - Context details
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async updateTrustedIssuer(context, claimIssuer, claimTopics, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        const receipt = await this.blockchainService.executeContractFunction(
            'TrustedIssuersRegistry',
            'updateTrustedIssuer',
            [claimIssuer, claimTopics],
            blockchain,
            trustedIssuersRegistry
        )
        return receipt;
    }

    /**
     * Remove trusted usszer.
     * @async
     * @param {string} context - Context
     * @param {string} claimIssuer - Claim issuer address
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async removeTrustedIssuer(context, claimIssuer, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const contextAddress = this.blockchainService.getContextAddress(context, blockchain);

        const {trustedIssuersRegistry} = await this.blockchainService.callContractFunction(
            'Context',
            'adresses',
            [],
            blockchain,
            contextAddress
        );

        const receipt = await this.blockchainService.executeContractFunction(
            'TrustedIssuersRegistry',
            'removeTrustedIssuer',
            [claimIssuer],
            blockchain,
            trustedIssuersRegistry
        )
        return receipt;
    }

    mapClaimIssuersToDetails(claimIssuers) {
        const claimDetails = {
            claimTopics: [],
            issuers: [],
            issuerClaims: []
        };

        const claimSet = new Set();

        claimIssuers.forEach(({ issuer, claimTopics }) => {
            // Add the issuer to the issuers array
            claimDetails.issuers.push(issuer);

            // Add each claim topic to the Set to ensure uniqueness
            claimTopics.forEach(value => claimSet.add(value));

            // Add the claim topics of this issuer to issuerClaims
            claimDetails.issuerClaims.push([...claimTopics]);
        });

        // Convert the Set to an array for unique claim topics
        claimDetails.claimTopics = Array.from(claimSet);

        return claimDetails;
    }

}

module.exports = ContextOperationsManager;