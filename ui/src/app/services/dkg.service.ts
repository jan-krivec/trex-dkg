import {Injectable, OnDestroy} from "@angular/core";
import {EthereumService} from "./ethereum.service";
import {ErrorHandlerService} from "../shared/error/error-handler.service";
import {Subject, Subscription} from "rxjs";
import {Identity, IdentitySDK} from "@onchain-id/identity-sdk";
import {ClaimDTO} from "../shared/identity.model";
import {TrustedIssuerDTO} from "../components/context/trusted-issuers-registry/trusted-issuer.model";
import {AccountDTO} from "../components/account/account.model";


@Injectable({
  providedIn: 'root'
})
export class DkgService extends EthereumService implements OnDestroy {
  hub: any;

  subscription: Subscription;
  private _selectedContext: string = null;
  contextSubject: Subject<string> = new Subject<string>();

  get selectedContext() {
    return this._selectedContext;
  }

  set selectedContext(val) {
    this._selectedContext = val;
    this.contextSubject.next(val);
  }

  constructor(errorHandlerService: ErrorHandlerService) {
    super(errorHandlerService);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription.unsubscribe();
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
      const identityAddress = await this.dkg.identity.getIdentity(address);
      //
      return identityAddress;
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

  async isVerified(context, address: string) {
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

  async addClaim(address: string, topic: number, data: string) {
    if (this.writeProvider != null) {
      try {
        const signer = this.writeProvider.getSigner();
        const identityAddress = await this.dkg.identity.getIdentity(address);
        const identity = await Identity.at(identityAddress, signer);


        // prepare the claim
        const claim = new IdentitySDK.Claim({
          address: identityAddress,
          data: IdentitySDK.utils.toHex(data),
          issuer: '0x158d291D8b47F056751cfF47d1eEcd19FDF9B6f8',
          emissionDate: new Date(),
          scheme: 1,
          topic: topic,
          uri: ''
        });

        // sign the claim
        const customSigner = new IdentitySDK.SignerModule(signer);
        await claim.sign(customSigner);

        const tx = await identity.addClaim(claim.topic, claim.scheme, claim.issuer, claim.signature, claim.data, claim.uri, { signer });
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

        const tx = await identity.removeClaim(claimId, { signer });
        await tx.wait();

        console.log(`Removed claim at tx hash ${tx.hash}`);

      } catch (error) {
        this.errorHandlerService.displayError(error.message);
      }
    }
  }

  async getClaimIdsByTopic(address: string, topic: number) {
    const identityAddress = await this.dkg.identity.getIdentity(address);
    const identity = new IdentitySDK.Identity(identityAddress, this.writeProvider.getSigner());

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

      return txResponse;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async addClaimTopic(context: string, claimTopic: number) {
    try {
      const txResponse = await this.dkg.context.addClaimTopic(context, claimTopic);

      return;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async removeClaimTopic(context: string,claimTopic: number) {
    try {
      if (this.writeProvider) {
        const txResponse = await this.dkg.context.removeClaimTopic(context, claimTopic);

        await txResponse.wait();
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

      return;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async removeTrustedIssuer(context: string,address: string) {
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

  /****************************************
   ************ Assertions ****************
   ****************************************/

  async createAssertion(content: string) {

    try {
      const jsonContent= JSON.parse(content);

      const result = await this.dkg.asset.create({
          public: jsonContent,
        },
        { epochsNum: 2 }
      );

      return result;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async updateAssertion(ual: string, content: string) {
    try {
      const jsonContent= JSON.parse(content);

      const result = await this.dkg.asset.update(ual, {
          public: jsonContent,
        },
        { epochsNum: 2 }
      );

      return result;
    } catch (e) {
      this.errorHandlerService.displayError(e.data?.data?.reason ? e.data.data.reason : e.message);
    }
  }

  async readUal(ual: string ){
    try {
      const result = await this.dkg.asset.get(ual);
      return result
    } catch (e){
      console.log(e);
      return "";
    }
  }

  async querySparql(sparql: string ){
    try {
      const result = await this.dkg.asset.query(sparql);
      return result
    } catch (e){
      console.log(e);
      return "";
    }
  }
}
