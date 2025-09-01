import {Injectable, OnDestroy, OnInit} from "@angular/core";
import {EthereumService} from "./ethereum.service";
import {ErrorHandlerService} from "../shared/error/error-handler.service";
import {Subject, Subscription} from "rxjs";
import {Identity, IdentitySDK} from "@onchain-id/identity-sdk";
import {ClaimDTO} from "../shared/identity.model";
import {TrustedIssuerDTO} from "../components/context/trusted-issuers-registry/trusted-issuer.model";
import {AccountDTO} from "../components/account/account.model";
import { v4 as uuidv4 } from "uuid";
const jsonld = require('jsonld');

type RDFGraph = {
  "@context": Record<string, string>;
  "@graph": RDFObject[];
};

type RDFObject = {
  "@id": string;
  [key: string]: any;
};


@Injectable({
  providedIn: 'root'
})
export class DkgService extends EthereumService implements OnInit, OnDestroy {
  hub: any;

  subscription: Subscription;
  private _selectedContext: string = null;
  contextSubject: Subject<string> = new Subject<string>();
  private _selectedType: string = null;
  typeSubject: Subject<string> = new Subject<string>();

  get selectedContext() {
    return this._selectedContext;
  }

  set selectedContext(val) {
    this._selectedContext = val;
    this.contextSubject.next(val);
  }

  get selectedType() {
    return this._selectedType;
  }

  set selectedType(val) {
    this._selectedType = val;
    this.typeSubject.next(val);
  }


  constructor(errorHandlerService: ErrorHandlerService) {
    super(errorHandlerService);
  }

  ngOnInit() {
    if (typeof (window as any).ethereum !== 'undefined') {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Accounts changed event fired', accounts);
        this.handleAccountsChanged(accounts);
      });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
  }

  // Hub

  async getAgents() {
    try {
      const agents = this.dkg.blockchain.getAgents();

      return agents;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  addAgent(agent: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.dkg.blockchain.addAgent(agent);
        resolve();
      } catch (e) {
        this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
        reject(e);  // Reject with the error to propagate it if needed
      }
    });
  }

  removeAgent(agent: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.dkg.blockchain.removeAgent(agent);
        resolve();
      } catch (e) {
        this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
        reject(e);  // Reject with the error to propagate it if needed
      }
    });
  }


  // Identity Registry

  async checkIfRegistered(address: string) {

    // try {
    //   const txResponse = await this.identityRegistry.contains(address);
    //
    //   if (!txResponse) {
    //     this.errorHandlerService.showSnackBar('Not registered');
    //   } else {
    //     this.errorHandlerService.showSnackBar('Is registered');
    //   }
    // } catch (e) {
    //   this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    // }
  }

  async getIdentiy(address: string = null) {
    try {
      return await this.dkg.identity.getIdentity(address);
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getClaimIssuers() {
    try {
      const claimIssuerArray = await this.dkg.identity.getClaimIssuers();

      const claimIssuers = claimIssuerArray.map(x => {
        return new AccountDTO(x[0], x[1], null);
      })
      return claimIssuers;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getClaimIssuer(address: string) {
    try {
      const claimIssuer = await this.dkg.identity.getClaimIssuer(address);

      return claimIssuer;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async crateIdentiy(address: string) {
    try {
      const txResponse = await this.dkg.identity.createIdentity(address);

      this.errorHandlerService.showSnackBar(txResponse.toString());
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async addKey(address: string, claimIssuerAddr: string, keyType: string) {
    try {
      const addKeyTransaction = await this.dkg.identity.addKey(address, keyType, claimIssuerAddr);

      console.log(`Add purpose ${keyType} on identity of ${address} to ${claimIssuerAddr} tx mined: ${addKeyTransaction.hash}`);
    } catch (error) {
      this.errorHandlerService.displayError(error.message);
    }
  }

  async removeKey(address: string, claimIssuerAddr: string, keyType: string) {
    try {
      const removeKeyTransaction = await this.dkg.identity.removeKey(address, keyType, claimIssuerAddr);

      console.log(`Remove purpose ${keyType} on identity of ${address} to ${claimIssuerAddr}`);
    } catch (error) {
      this.errorHandlerService.displayError(error.message);
    }
  }

  async getKeyByPurpose(address: string, keyPurpose: string) {

    try {
      const keys = await this.dkg.identity.getKeysByPurpose(address, keyPurpose)
      return keys;
    } catch (error) {
      this.errorHandlerService.displayError(error.message);
      return [];
    }
  }

  async isVerified(context: string, type: string, address: string) {
    // try {
    //   const txResponse = await this.identityRegistry.isVerified(address);
    //
    //   if (!txResponse) {
    //     this.errorHandlerService.showSnackBar('Not verified');
    //   } else {
    //     this.errorHandlerService.showSnackBar('Is verfied');
    //   }
    // } catch (e) {
    //   this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    // }
  }

  async registerIdentity(address: string) {

    // try {
    //   if (this.writeProvider) {
    //     const idAddress = await this.factory.getIdentity(address);
    //
    //     const txResponse = await this.identityRegistry.connect(this.writeProvider.getSigner()).registerIdentity(address, idAddress);
    //
    //     await txResponse.wait();
    //   }
    // } catch (e) {
    //   this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    // }
  }

  // Claim Topics Registry

  async getClaimTopics(context: string) {
    try {
      const claimTopics = await this.dkg.context.getClaimTopics(context);
      return claimTopics;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getTypesClaimTopics(context: string) {
    try {
      const claimTopics = await this.dkg.context.getAllTypeClaimTopics(context);
      return claimTopics;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async addClaim(address: string, topic: number, data: string) {
    if (this.writeProvider != null) {
      try {
        const signer = this.writeProvider.getSigner();
        const identityAddress = await this.dkg.identity.getIdentity(address);
        const identity = await Identity.at(identityAddress, signer);

        const addr = await signer.getAddress();

        const issuerAdr = await this.getClaimIssuer(addr);


        // prepare the claim
        const claim = new IdentitySDK.Claim({
          address: identityAddress,
          data: IdentitySDK.utils.toHex(data),
          issuer: issuerAdr,
          emissionDate: new Date(),
          scheme: 1,
          topic: topic,
          uri: ''
        });

        // sign the claim
        const customSigner = new IdentitySDK.SignerModule(signer);
        await claim.sign(customSigner);

        const tx = await identity.addClaim(claim.topic, claim.scheme, claim.issuer, claim.signature, claim.data, claim.uri, {signer});
        await tx.wait();

        console.log(`Added claim at tx hash ${tx.hash}`);

      } catch (error) {
        this.errorHandlerService.displayError(error.message);
      }
    }
  }

  async removeClaim(onchainId: string, claimId: string) {
    if (this.writeProvider != null) {
      try {
        const signer = this.writeProvider.getSigner();
        const identity = await Identity.at(onchainId, signer);

        const tx = await identity.removeClaim(claimId, {signer});

        console.log(`Removed claim at tx hash ${tx.hash}`);

      } catch (error) {
        this.errorHandlerService.displayError(error.message);
      }
    }
  }

  async getClaimIdsByTopic(address: string, topic: number) {
    const identityAddress = await this.dkg.identity.getIdentity(address);
    const identity = new IdentitySDK.Identity(identityAddress, this.writeProvider.getSigner());

    console.log(await this.dkg.identity.getClaimsByTopic(address, 0));
    const claims = await identity.getClaimsByTopic(topic ? topic : 0);

    return claims.map(claim => {
      return new ClaimDTO(claim.id, claim.address, claim.topic, claim.issuer, claim.data, claim.signature, claim.uri);
    });
  }

  /* ********************************************
   * ***************** CONTEXT ******************
   * ********************************************/

  async deployContext(context: string, claimIssuers: any[]) {
    try {
      const txResponse = await this.dkg.context.deployContext(context, claimIssuers);

      this.errorHandlerService.showSnackBar("Context deployed");
      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async addClaimTopic(context: string, type: string, claimTopic: number) {
    try {
      const txResponse = await this.dkg.context.addClaimTopic(context, type, claimTopic);

      return;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async removeClaimTopic(context: string, type: string, claimTopic: number) {
    try {
      if (this.writeProvider) {
        const txResponse = await this.dkg.context.removeClaimTopic(context, type, claimTopic);

        return;
      }
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getTrustedIssuers(context: string) {
    try {
      const trustedIssuers = await this.dkg.context.getTrustedIssuers(context);
      const issuers = await Promise.all(
        trustedIssuers.map(async (address) => {
          const claimTopics = await this.dkg.context.getTrustedIssuerClaimTopics(context, address);
          return new TrustedIssuerDTO(address, claimTopics);
        })
      );

      return issuers;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
      return [];
    }
  }

  async isTrustedIssuer(context: string, address: string) {
    try {
      const isTrustedIssuer = await this.dkg.context.isTrustedIssuer(context, address);
      return isTrustedIssuer;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getTrustedIssuerClaimTopics(context: string, address: string) {
    try {
      const claimTopics = await this.dkg.context.getTrustedIssuerClaimTopics(context, address);
      return claimTopics;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async addTrustedIssuer(context: string, address: string, claimTopics: number[]) {
    try {
      const txResponse = await this.dkg.context.addTrustedIssuer(context, address, claimTopics);

      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async updateTrustedIssuer(context: string, address: string, claimTopics: number[]) {
    try {
      const txResponse = await this.dkg.context.updateTrustedIssuer(context, address, claimTopics);

      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async removeTrustedIssuer(context: string, address: string) {
    try {
      const txResponse = await this.dkg.context.removeTrustedIssuer(context, address);

      return;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getContexts() {
    return await this.dkg.context.getContextList();
  }

  async getTypes(context: string) {
    return await this.dkg.context.getContextTypes(context);
  }

  /****************************************
   ************ Assertions ****************
   ****************************************/

  async createAssertion(content: string) {

    try {
      const jsonContent = JSON.parse(content);

      const result = await this.dkg.asset.create({
          public: jsonContent,
        },
        {epochsNum: 2}
      );

      return result;
    } catch (e) {
      console.log(e);
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async updateAssertion(ual: string, content: string) {
    try {
      const jsonContent = JSON.parse(content);

      const result = await this.dkg.asset.update(ual, {
          public: jsonContent,
        },
        {epochsNum: 2}
      );

      return result;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async readUal(ual: string, state: string) {
    try {
      const parsedState = isNaN(parseInt(state, 10)) ? state : parseInt(state, 10);
      const result = await this.dkg.asset.get(ual, {state: parsedState});
      return result
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  async querySparql(sparql: string, type: string, historical: boolean) {
    try {
      let result;
      if (historical) {
        result = await this.dkg.graph.query(sparql, type, {graphState: 'HISTORICAL'});
      } else {
        result = await this.dkg.graph.query(sparql, type);
      }
      return result
    } catch (e) {
      console.log(e);
      return "";
    }
  }

  async queryExpressId(expressId) {
    const id = `<https://example.com/ifc/expressId/${expressId}>`
    const sparql = `
SELECT ?property ?value WHERE {
  ${id} ?property ?value.
}`
    const response = await this.dkg.graph.query(sparql, 'SELECT');
    const data = response.data;

    const object = {};
    for (const i in data) {
      const val = data [i];
      object[val['property']] = val['value'];
    }
    return object;
  }

  async queryExpressId2(expressId) {

    const id = `ifc:${expressId}`;

    const sparql = `
PREFIX brick: <https://brickschema.org/schema/Brick#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ifc: <https://example.com/ifc#>


CONSTRUCT {
  ?sub ?pred1 ${id} .
  ${id} ?pred2 ?sub .
  ?sub ?prop ?obj .
  ?point ?pointProp ?pointObj .
}
WHERE {
  {
    ?sub ?pred1 ${id} .
    ?sub ?prop ?obj .
    FILTER (?pred1 = brick:isPointOf ||
            ?pred1 = brick:isPartOf ||
		        ?pred1 = brick:isFedBy) .
  } UNION {
    ${id} ?pred2 ?sub .
    ?sub ?prop ?obj .
    FILTER (?pred2 = brick:hasPoint ||
            ?pred2 = brick:hasPart ||
		        ?pred2 = brick:feeds) .
  } UNION {
    ?sub ?pred1 ${id} .
	  ?sub ?predNext ?point .
	  ?point ?pointProp ?pointObj .
    FILTER ((?pred1 = brick:isPointOf ||
            ?pred1 = brick:isPartOf ||
		        ?pred1 = brick:isFedBy) &&
			      (?predNext = brick:hasPoint ||
             ?predNext = brick:hasPart ||
		         ?predNext = brick:feeds)) .
  } UNION {
    ?sub ?pred1 ${id} .
	  ?point ?predNext ?sub .
	  ?point ?pointProp ?pointObj .
    FILTER ((?pred1 = brick:isPointOf ||
            ?pred1 = brick:isPartOf ||
		        ?pred1 = brick:isFedBy) &&
			      (?predNext = brick:isPointOf ||
             ?predNext = brick:isPartOf ||
		         ?predNext = brick:isFedBy)) .
  } UNION {
    ${id} ?pred2 ?sub .
	  ?point ?predNext ?sub .
	  ?point ?pointProp ?pointObj .
    FILTER ((?pred2 = brick:hasPoint ||
            ?pred2 = brick:hasPart ||
		        ?pred2 = brick:feeds) &&
			      (?predNext = brick:isPointOf ||
             ?predNext = brick:isPartOf ||
		         ?predNext = brick:isFedBy)) .
  } UNION {
    ${id} ?pred2 ?sub .
	  ?sub ?predNext ?point .
	  ?point ?pointProp ?pointObj .
    FILTER ((?pred2 = brick:hasPoint ||
            ?pred2 = brick:hasPart ||
		        ?pred2 = brick:feeds) &&
			      (?predNext = brick:hasPoint ||
             ?predNext = brick:hasPart ||
		         ?predNext = brick:feeds)) .
  }

}
`
    const response = await this.dkg.graph.query(sparql, 'CONSTRUCT');
    const data = response.data;

    if (data.length == 0) return null;

    const context = {
      "brick": "https://brickschema.org/schema/Brick#",
      "bf": "https://brickschema.org/schema/BrickFrame#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "ifc": "https://example.com/ifc#"
    };


    // const [graph1, graph2] = this.splitPreds(data, "https://example.com/ifc#"+expressId)
    // const relations = await this.parseNTriplesToJsonLd(graph1, { "@context": context });
    const json = await this.parseNTriplesToJsonLd(data, { "@context": context });
    const mergedJson =  this.mergeRDFObjects(json);

    const extractedGraph = this.extractGraph(mergedJson);

    mergedJson["@graph"] = extractedGraph;
    return mergedJson;
    //   .then(jsonld => console.log(JSON.stringify(jsonld, null, 2)))
    // return object;
  }

  splitPreds(data: string, id: string): [string, string] {
    const lines = data.match(/[^\n]*\n?/g) || [];
    let lastIndex = -1;

    // Find the last block where `id` appears
    for (let i = 0; i<  lines.length; i++) {
      if (!lines[i].includes(id)) {
        lastIndex = i;
        break;
      }
    }

    if (lastIndex === -1) {
      throw new Error("ID not found in data");
    }

    // Split the data at the point where we stop finding `id`
    return [
      lines.slice(0, lastIndex).join(""), // Part before the last block with `id`
      lines.slice(lastIndex).join("")      // Part including and after the last block with `id`
    ];
  }

  extractGraph(jsonLd) {
    if (jsonLd == null) return null;
    if (!jsonLd["@graph"] || !Array.isArray(jsonLd["@graph"])) {
      throw new Error("Invalid JSON-LD: Missing @graph array");
    }

    // Find the first object that has "brick:hasPart"
    const hasPartEntity = jsonLd["@graph"].find(entry => entry["brick:hasPart"]);
    const hasPointEntity = jsonLd["@graph"].find(entry => entry["brick:hasPoint"]);
    const isFedByEntity = jsonLd["@graph"].find(entry => entry["brick:isFedBy"]);

    const graph = {}

    if (hasPartEntity != null || hasPartEntity != undefined) {
      graph["brick:hasPart"] = hasPartEntity["brick:hasPart"]
    }

    if (hasPointEntity != null || hasPointEntity != undefined) {
      graph["brick:hasPoint"] = hasPointEntity["brick:hasPoint"]
    }

    if (isFedByEntity != null || isFedByEntity != undefined) {
      graph["brick:isFedBy"] = isFedByEntity["brick:isFedBy"]
    }

    return graph;
  }

  async parseNTriplesToJsonLd(nTriples, context) {
    // First, parse N-Triples to expanded JSON-LD
    const doc = await jsonld.fromRDF(nTriples, {
      format: 'application/n-quads',
    });

    // Then compact it with our context
    const compacted = await jsonld.compact(doc, context);

    return compacted;
  }

  async addAlarm(expressId: string, type: string, quantity: string, comment: string) {
    const id = `ifc:${expressId}`;

    const content = `
{
  "@context": {
    "brick": "https://brickschema.org/schema/Brick#",
    "ifc": "https://www.example.com/ifc#"
  },
  "@id": "${id}",
  "@type": "brick:${type}",
  "brick:hasQuantity": "${quantity}"${quantity}"${comment != null || comment != '' ? ', \n' : ''}
  ${(comment != null || comment != '') ?? "\"brick:comment\": " + comment}
}
`
    const res = await this.createAssertion(content);
    const response = JSON.stringify(res, null, 4);
    console.log(response);
  }

  async addHvacEquipment(expressId: string, type: string, label: string, tags: string) {

    const partId = `ifc:${expressId}`;
    const id = `ifc:${uuidv4()}`;

    const list =  tags.includes(",") ? tags.split(",").map(item => item.trim()) : [tags.trim()];
    const tagList = JSON.stringify(list);

    const content = `
{
  "@context": {
    "brick": "https://brickschema.org/schema/Brick#",
    "bf": "https://brickschema.org/schema/BrickFrame#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "hvac": "https://example.com/hvac#",
    "ifc": "https://www.example.com/ifc#"
  },
  "@id": "${id}",
  "@type": "brick:${type}",
  "rdfs:label": "${label}",
  "brick:hasTag": ${tagList},
  "brick:isPartOf": {
    "@id": "${partId}"
  },
  "brick:hasPoint": [
    {
      "@id": "hvac:AHU-1_Temperature_Sensor",
      "@type": "brick:Temperature_Sensor",
      "brick:measures": "brick:Air_Temperature"
    },
    {
      "@id": "hvac:AHU-1_Fan",
      "@type": "brick:Fan",
      "brick:hasPoint": {
        "@id": "hvac:AHU-1_Fan_Status",
        "@type": "brick:Status"
      }
    }
  ]
}
`
  }

  mergeRDFObjects(rdfData: RDFGraph): Record<string, any> {
    const objectMap = new Map<string, RDFObject>();
    const referencedIds = new Set<string>();

    if (!rdfData["@graph"])
      return null;

    // Populate object map for quick lookup
    rdfData["@graph"].forEach(obj => {
      objectMap.set(obj["@id"], { ...obj });
    });

    function resolveReferences(obj: RDFObject, visited = new Set<string>()): RDFObject {
      if (visited.has(obj["@id"])) return obj;
      visited.add(obj["@id"]);

      const resolved: RDFObject = { ...obj };
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          resolved[key] = obj[key].map(item => {
            if (typeof item === 'object' && "@id" in item && objectMap.has(item["@id"])) {
              referencedIds.add(item["@id"]);
              return resolveReferences(objectMap.get(item["@id"])!, visited);
            }
            return item;
          });
        } else if (typeof obj[key] === 'object' && "@id" in obj[key] && objectMap.has(obj[key]["@id"])) {
          referencedIds.add(obj[key]["@id"]);
          resolved[key] = resolveReferences(objectMap.get(obj[key]["@id"])!, visited);
        }
      }
      return resolved;
    }

    return {
      "@context": rdfData["@context"],
      "@graph": rdfData["@graph"].map(obj => resolveReferences(obj)).filter(obj => !referencedIds.has(obj["@id"]))
    };
  }

  async addContextType(context: string, type: string, claimIssuers: any[]) {
    try {
      const txResponse = await this.dkg.context.addContextType(context, type, claimIssuers);

      this.errorHandlerService.showSnackBar("Type added");
      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async getTypesTrustedIssuers(context: string) {
    try {
      const txResponse = await this.dkg.context.getAllTypesTrustedIssuers(context);
      console.log(txResponse);
      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }
}
