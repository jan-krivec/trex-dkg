import { Component } from '@angular/core';
import {EthereumService} from "../../services/ethereum.service";
import {Key} from "@onchain-id/identity-sdk/dist/identity/Key.interface";
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from "@angular/platform-browser";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ClaimDTO, KeyDTO} from 'src/app/shared/identity.model';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DkgService} from "../../services/dkg.service";

const METAMASK_ICON =
  `
  <svg xmlns="http://www.w3.org/2000/svg" width="1.07em" height="1em" viewBox="0 0 256 240"><path fill="#e17726" d="M250.066 0L140.219 81.279l20.427-47.9z"/><path fill="#e27625" d="m6.191.096l89.181 33.289l19.396 48.528zM205.86 172.858l48.551.924l-16.968 57.642l-59.243-16.311zm-155.721 0l27.557 42.255l-59.143 16.312l-16.865-57.643z"/><path fill="#e27625" d="m112.131 69.552l1.984 64.083l-59.371-2.701l16.888-25.478l.214-.245zm31.123-.715l40.9 36.376l.212.244l16.888 25.478l-59.358 2.7zM79.435 173.044l32.418 25.259l-37.658 18.181zm97.136-.004l5.131 43.445l-37.553-18.184z"/><path fill="#d5bfb2" d="m144.978 195.922l38.107 18.452l-35.447 16.846l.368-11.134zm-33.967.008l-2.909 23.974l.239 11.303l-35.53-16.833z"/><path fill="#233447" d="m100.007 141.999l9.958 20.928l-33.903-9.932zm55.985.002l24.058 10.994l-34.014 9.929z"/><path fill="#cc6228" d="m82.026 172.83l-5.48 45.04l-29.373-44.055zm91.95.001l34.854.984l-29.483 44.057zm28.136-44.444l-25.365 25.851l-19.557-8.937l-9.363 19.684l-6.138-33.849zm-148.237 0l60.435 2.749l-6.139 33.849l-9.365-19.681l-19.453 8.935z"/><path fill="#e27525" d="m52.166 123.082l28.698 29.121l.994 28.749zm151.697-.052l-29.746 57.973l1.12-28.8zm-90.956 1.826l1.155 7.27l2.854 18.111l-1.835 55.625l-8.675-44.685l-.003-.462zm30.171-.101l6.521 35.96l-.003.462l-8.697 44.797l-.344-11.205l-1.357-44.862z"/><path fill="#f5841f" d="m177.788 151.046l-.971 24.978l-30.274 23.587l-6.12-4.324l6.86-35.335zm-99.471 0l30.399 8.906l6.86 35.335l-6.12 4.324l-30.275-23.589z"/><path fill="#c0ac9d" d="m67.018 208.858l38.732 18.352l-.164-7.837l3.241-2.845h38.334l3.358 2.835l-.248 7.831l38.487-18.29l-18.728 15.476l-22.645 15.553h-38.869l-22.63-15.617z"/><path fill="#161616" d="m142.204 193.479l5.476 3.869l3.209 25.604l-4.644-3.921h-36.476l-4.556 4l3.104-25.681l5.478-3.871z"/><path fill="#763e1a" d="M242.814 2.25L256 41.807l-8.235 39.997l5.864 4.523l-7.935 6.054l5.964 4.606l-7.897 7.191l4.848 3.511l-12.866 15.026l-52.77-15.365l-.457-.245l-38.027-32.078zm-229.628 0l98.326 72.777l-38.028 32.078l-.457.245l-52.77 15.365l-12.866-15.026l4.844-3.508l-7.892-7.194l5.952-4.601l-8.054-6.071l6.085-4.526L0 41.809z"/><path fill="#f5841f" d="m180.392 103.99l55.913 16.279l18.165 55.986h-47.924l-33.02.416l24.014-46.808zm-104.784 0l-17.151 25.873l24.017 46.808l-33.005-.416H1.631l18.063-55.985zm87.776-70.878l-15.639 42.239l-3.319 57.06l-1.27 17.885l-.101 45.688h-30.111l-.098-45.602l-1.274-17.986l-3.32-57.045l-15.637-42.239z"/></svg>
`;

@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['identity.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class IdentityComponent{
  isEditKey = false;
  isEditClaim = false;
  keyPurposes = ['MANAGEMENT', 'ACTION', 'CLAIM',]
  keyDTOS: KeyDTO[];
  claimDTOS: ClaimDTO[];
  expandedElement: ClaimDTO | null;
  displayedColumnsKey: string[] = ['key', 'keyType', 'purposes'];
  displayedColumnsClaim: string[] = ['id', 'topic', 'data'];
  displayedColumnsClaimExpanded: string[] = [... this.displayedColumnsClaim, 'expand'];


  viewKeyForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    keyType: new FormControl(null)
  })

  addKeyForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    ciaddress: new FormControl('', [Validators.required]),
    keyType: new FormControl(null, [Validators.required])
  })

  deleteKeyForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    ciaddress: new FormControl('', [Validators.required]),
    keyType: new FormControl(null, [Validators.required])
  })

  viewClaimForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    topic: new FormControl(null,[Validators.required])
  })

  addClaimForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    topic: new FormControl(null, [Validators.required]),
    data: new FormControl('', [Validators.required])
  })

  deleteClaimForm = new FormGroup({
    address: new FormControl('', [Validators.required]),
    claimId: new FormControl(null, [Validators.required])
  })


  constructor(private dkgService: DkgService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.dkgService.checkIsConected();
    iconRegistry.addSvgIconLiteral('metamask', sanitizer.bypassSecurityTrustHtml(METAMASK_ICON));
  }

  ngOnInit() {
  }

  async addKey() {
    // TODO: popravi onchainid
    await this.dkgService.addKey(this.addKeyForm.get('address').value, this.addKeyForm.get('ciaddress').value, this.addKeyForm.get('keyType').value);
  }

  async useOwnAddress(formGroup: FormGroup) {
    if (this.dkgService.isConnected) {
      formGroup.get('address').patchValue(await this.dkgService.account);
    }
  }

  async viewKeys() {
    const keys: KeyDTO[] = await this.dkgService.getKeyByPurpose(this.viewKeyForm.get('address').value, this.viewKeyForm.get('keyType').value);
    console.log(this.viewKeyForm.get('keyType').value);
    this.keyDTOS = keys;
  }

  async addClaim() {
    await this.dkgService.addClaim(this.addClaimForm.get('address').value, this.addClaimForm.get('topic').value, this.addClaimForm.get('data').value);
  }

  async viewClaims() {
    const claims: ClaimDTO[] = await this.dkgService.getClaimIdsByTopic(this.viewClaimForm.get('address').value, this.viewClaimForm.get('topic').value);
    this.claimDTOS = claims;
  }

  async removeClaim() {
    await this.dkgService.removeClaim(this.deleteClaimForm.get('address').value, this.deleteClaimForm.get('claimId').value)
  }

  async removeKey() {
    await this.dkgService.removeKey(this.deleteKeyForm.get('address').value, this.deleteKeyForm.get('ciaddress').value, this.deleteKeyForm.get('keyType').value);
  }
}
