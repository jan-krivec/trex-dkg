import {EventEmitter, Injectable, OnDestroy, OnInit} from '@angular/core';
import {ethers} from 'ethers';
import {Identity, IdentitySDK} from "@onchain-id/identity-sdk";
import DKG from "dkg.js";
import {ErrorHandlerService} from "../shared/error/error-handler.service";
import {Subject} from "rxjs";


declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class EthereumService implements OnInit, OnDestroy {
  web3: any;
  dkg: any;

  private _writeProvider: ethers.providers.Web3Provider | undefined;
  private _readProvider: ethers.providers.JsonRpcProvider | undefined;
  identity: Identity | null = null;

  get writeProvider() {
    return this._writeProvider;
  }

  set writeProvider(val) {
    this._writeProvider = val;
  }

  get readProvider() {
    return this._readProvider;
  }

  private _account: string | null = null;

  get account() {
    return this._account;
  }

  set account(val) {
    if (val !== null) {
      this.writeProvider = new ethers.providers.Web3Provider(window.ethereum);
    }
    this._account = val;
    this.isConnected = val !== null;
    this.setIdentity();
  }

  async setIdentity() {
    if (this.isConnected) {
      const provider = this.readProvider;

      const identityAddress = await this.dkg.identity.getIdentity();

      this.identity = await Identity.at(identityAddress, provider.getSigner());

    }
  }

  get onchainId() {
    if (this.isConnected) {
      return this.identity?.address;
    }
    return null;
  }

  //
  public isConnectedEvent = new Subject<boolean>();
  event$ = this.isConnectedEvent.asObservable();

  private _isConnected: boolean = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  //
  set isConnected(val: boolean) {
    this._isConnected = val;
    this.isConnectedEvent.next(val);
  }

  constructor(public errorHandlerService: ErrorHandlerService) {
    this._readProvider = new ethers.providers.JsonRpcProvider('https://193.2.72.90/evm1');
    this.dkg = new DKG({
      environment: 'development', // or devnet, testnet, mainnet
      endpoint: 'https://193.2.72.90/node',  // gateway node URI
      blockchain: {
        name: 'hardhat1:31337', // or otp:2043, base:8453, gnosis:100
        rpc: 'https://193.2.72.90/evm1'
      },
    });
  }

  ngOnInit() {
    if (window.ethereum !== 'undefined') {
      window.ethereum.addListener('accountsChanged', this.handleAccountsChanged);
    }
  }

  ngOnDestroy() {
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
  }

  async checkMetaMask(): Promise<boolean> {
    return typeof window.ethereum !== 'undefined';
  }

  async requestAccountAccess(): Promise<string[]> {
    if (await this.checkMetaMask()) {
      try {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        if (accounts?.length > 0) {
          this.account = accounts[0]
        } else {
          this.account = null;
        }
        return accounts;
      } catch (error) {
        this.account = null;
        throw new Error('User denied account access');
      }
    } else {
      this.account = null;
      throw new Error('MetaMask is not installed');
    }
  }

  async checkIsConected(): Promise<boolean> {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({method: 'eth_accounts'});
      if (accounts.length > 0) {
        this.account = accounts[0];
        return true;
      }
    }
    this.account = null;
    return false;
  }

  handleAccountsChanged(accounts: Array<string>) {
    this.account = accounts?.length > 0 ? accounts[0] : null;
  }


  mapKeyToPurpose(val: number) {
    switch (val) {
      case 1:
        return 'MANAGEMENT';
      case 2:
        return 'ACTION';
      default:
        return 'CLAIM';
    }
  }

  mapPurposeToKey(keyPurpose: string) {
    switch (keyPurpose) {
      case 'MANAGEMENT':
        return IdentitySDK.utils.enums.KeyPurpose.MANAGEMENT;
        break;
      case 'ACTION':
        return IdentitySDK.utils.enums.KeyPurpose.ACTION;
        break;
      default:
        return IdentitySDK.utils.enums.KeyPurpose.CLAIM;
        break;
    }
  }

  mapKeyToType(val: number) {
    switch (val) {
      case 1:
        return 'ECDSA';
      default:
        return 'RSA';
    }
  }
}
