const DKG = require("../index.js");

async function main2() {
    const dkg = new DKG({
        environment: 'development', // or devnet, testnet, mainnet
        endpoint: 'http://localhost',  // gateway node URI
        port: 8900,
        blockchain: {
            name: 'hardhat1:31337', // or otp:2043, base:8453, gnosis:100
            publicKey: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // not required in browser, metamask used instead
            privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // not required in browser, metamask used instead
        },
    });


    // const result1 = await dkg.identity.addKey('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', 'MANAGEMENT', '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc');
    //
    // console.log(result1);
    //
    // const result2 = await dkg.identity.getKeyByPurpose('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', null);
    // console.log(result2);

    // const result = await dkg.identity.addClaim('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', 1, 'test', '0x9c65f85425c619A6cB6D29fF8d57ef696323d188', 'http/test');
    // console.log(JSON.stringify(result));

    // const res = await dkg.context.createContext('test2');

    const res1 = await dkg.context.addClaimTopic('test2', 1);
    console.log(res1);
    const res = await dkg.context.getClaimTopics('test2');
    console.log(res);
}

async function main() {
    const nodeInfo = await dkg.node.info();
    console.log(nodeInfo);

    const publicAssertion = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "John Doe",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Main Street",
            "addressLocality": "Anytown",
            "addressRegion": "CA",
            "postalCode": "12345",
            "addressCountry": "USA"
        },
        "url": "https://www.johndoewebsite.com",
        "birthDate": "1990-01-01"
    }

    const publicAssertion2 = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "type": "Note",
        "name": "A simple note",
        "content": "This is a note about JSON-LD and context handling.",
        "published": "2024-10-24T12:34:56Z",
        "actor": {
            "type": "Person",
            "name": "Jan Krivec",
            "url": "https://example.com/jankrivec"
        }
    }




    const result = await dkg.asset.create({
            public: publicAssertion2,
        },
        { epochsNum: 2 }
    );

    console.log(result);
}

main2();
