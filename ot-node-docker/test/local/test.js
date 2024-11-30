import DKG from 'dkg.js';

const dkg = new DKG({
    environment: 'development', // or devnet, testnet, mainnet
    endpoint: 'http://localhost',  // gateway node URI
    port: 8900,
    blockchain: {
        name: 'hardhat1:31337', // or otp:2043, base:8453, gnosis:100
        rpc: 'http://localhost:8545',
        publicKey: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // not required in browser, metamask used instead
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // not required in browser, metamask used instead
    },
});

const nodeInfo = await dkg.node.info();
console.log(nodeInfo);

const publicAssertion = {
    '@context': 'https://schema.org',
    '@id': 'https://tesla.modelX/2321',
    '@type': 'Car',
    'name': 'Tesla Model X',
    'brand': {
        '@type': 'Brand',
        'name': 'Tesla'
    },
    'model': 'Model X',
    'manufacturer': {
        '@type': 'Organization',
        'name': 'Tesla, Inc.'
    },
    'fuelType': 'Electric',
    'numberOfDoors': 5,
    'vehicleEngine': {
        '@type': 'EngineSpecification',
        'engineType': 'Electric motor',
        'enginePower': {
            '@type': 'QuantitativeValue',
            'value': '416',
            'unitCode': 'BHP'
        }
    },
    'driveWheelConfiguration': 'AWD',
    'speed': {
        '@type': 'QuantitativeValue',
        'value': '250',
        'unitCode': 'KMH'
    },
}


const result = await dkg.asset.create({
        public: publicAssertion,
    },
    { epochsNum: 2 }
);

console.log(result);