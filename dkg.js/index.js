// managers
const AssertionOperationsManager = require('./managers/assertion-operations-manager.js');
const AssetOperationsManager = require('./managers/asset-operations-manager.js');
const BlockchainOperationsManager = require('./managers/blockchain-operations-manager');
const ContextOperationsManager = require('./managers/context-operations-manager');
const GraphOperationsManager = require('./managers/graph-operations-manager.js');
const IdentityOperationsManager = require('./managers/identity-operations-manager');
const NetworkOperationsManager = require('./managers/network-operations-manager.js');
const NodeOperationsManager = require('./managers/node-operations-manager.js');
const ParanetOperationsManager = require('./managers/paranet-operations-manager.js');

const BaseServiceManager = require('./services/base-service-manager.js');

class DkgClient {
    constructor(config) {
        const baseServiceManager = new BaseServiceManager(config);
        const services = baseServiceManager.getServices();

        this.assertion = new AssertionOperationsManager(services);
        this.asset = new AssetOperationsManager(services);
        this.blockchain = new BlockchainOperationsManager(services);
        this.node = new NodeOperationsManager(services);
        this.graph = new GraphOperationsManager(services);
        this.identity = new IdentityOperationsManager(services);
        this.context = new ContextOperationsManager(services);
        this.network = new NetworkOperationsManager(services);
        this.paranet = new ParanetOperationsManager(services);
    }
}
module.exports = DkgClient;
