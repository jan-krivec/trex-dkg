const {Identity, IdentitySDK} =  require("@onchain-id/identity-sdk");


class IdentityOperationsManager {
    constructor(services) {
        this.nodeApiService = services.nodeApiService;
        this.blockchainService = services.blockchainService;
        this.inputService = services.inputService;
    }

    /**
     * Gets the identity address.
     * @async
     * @param {string} address - The addressof the identity to be created
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async getIdentity(address= null, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);
        const identity = await this.blockchainService.getIdentity(blockchain, address);
        return identity;
    }

    /**
     * Creates a new identity.
     * @async
     * @param {string} address - The addressof the identity to be created
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async createIdentity(address, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const receipt = await this.blockchainService.executeContractFunction(
            'IdFactory',
            'createIdentity',
            [address, address],
            blockchain
        )

        const registerReceipt = await this.blockchainService.executeContractFunction(
            'TREXFactory',
            'registerIdentity',
            [address],
            blockchain
        )

        return {
            operation: registerReceipt,
            transactionHash: registerReceipt.transactionHash,
            status: registerReceipt.status,
        };
    }

    /**
     * Adds key.
     * @async
     * @param {string} address - The addressof the identity to be created
     * @param {number} key - Key to add
     * @param {string} keyAddress - Address to add
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async addKey(address, key, keyAddress, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const identityAddress = await this.getIdentity(address);
        const purpose = this.mapPurposeToKey(key);
        const registerReceipt = await this.blockchainService.executeContractFunction(
            'Identity',
            'addKey',
            [IdentitySDK.utils.encodeAndHash(['address'], [keyAddress]), purpose, IdentitySDK.utils.enums.KeyType.ECDSA],
            blockchain,
            identityAddress
        )

        return {
            operation: registerReceipt,
            transactionHash: registerReceipt.transactionHash,
            status: registerReceipt.status,
        };
    }

    /**
     * Removes key.
     * @async
     * @param {string} address - The addressof the identity to be created
     * @param {number} key - Key to add
     * @param {string} keyAddress - Address to add
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async removeKey(address, key, keyAddress, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const identityAddress = await this.getIdentity(address);
        const purpose = this.mapPurposeToKey(key);

        const registerReceipt = await this.blockchainService.executeContractFunction(
            'Identity',
            'removeKey',
            [IdentitySDK.utils.encodeAndHash(['address'], [keyAddress]), purpose],
            blockchain,
            identityAddress
        )

        return {
            operation: registerReceipt,
            transactionHash: registerReceipt.transactionHash,
            status: registerReceipt.status,
        };
    }

    /**
     * Creates a new identity.
     * @async
     * @param {string} address - The address of the wallet, for whichs identity a key will be added
     * @param {string} keyType - Keytype to create
     * @param {Object} [options={}] - Additional options for asset creation.
     * @returns {Object}
     */
    async getKeysByPurpose(address, keyType, options = {}) {
        const blockchain = this.inputService.getBlockchain(options);

        const identityAddress = await this.getIdentity(address);

        let keyTypes;

        if (keyType == null) {
            keyTypes = [IdentitySDK.utils.enums.KeyPurpose.MANAGEMENT, IdentitySDK.utils.enums.KeyPurpose.ACTION, IdentitySDK.utils.enums.KeyPurpose.CLAIM];
        } else {
            keyTypes = [this.mapPurposeToKey(keyType)];
        }

        let keys = [];

        for (const p in keyTypes) {
            const purpose = keyTypes[p];
            // eslint-disable-next-line no-await-in-loop
            const klist = await this.blockchainService.callContractFunction(
                'Identity',
                'getKeysByPurpose',
                [purpose],
                blockchain,
                identityAddress
            )

            for (const k in klist) {
                // eslint-disable-next-line no-await-in-loop
                const key = await this.blockchainService.callContractFunction(
                    'Identity',
                    'getKey',
                    [klist[k]],
                    blockchain,
                    identityAddress
                );

                keys = keys.concat(key);
            }


        }

        return keys.map(k => ({key: k.key, type: this.mapKeyToType(k.keyType), purpose:k.purposes.map(this.mapKeyToPurpose)}));
    }


    mapPurposeToKey(keyPurpose) {
        switch (keyPurpose) {
            case "MANAGEMENT":
                return IdentitySDK.utils.enums.KeyPurpose.MANAGEMENT;
            case "ACTION":
                return IdentitySDK.utils.enums.KeyPurpose.ACTION;
            default:
                return IdentitySDK.utils.enums.KeyPurpose.CLAIM;
        }
    }

    mapKeyToType(val) {
        switch (val) {
            case "1":
                return 'ECDSA';
            default:
                return 'RSA';
        }
    }

    mapKeyToPurpose(val) {
        switch (val) {
            case "1":
                return 'MANAGEMENT';
            case "2":
                return 'ACTION';
            default:
                return 'CLAIM';
        }
    }

}

module.exports = IdentityOperationsManager;