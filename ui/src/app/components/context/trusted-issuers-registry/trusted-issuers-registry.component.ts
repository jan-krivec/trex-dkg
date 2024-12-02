import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../../services/dkg.service";
import {ContextComponent} from "../context.component";
import {last, Subscription} from "rxjs";
import {TrustedIssuerDTO} from "./trusted-issuer.model";

@Component({
  selector: 'app-trusted-issuers-registry',
  templateUrl: './trusted-issuers-registry.component.html'
})
export class TrustedIssuersRegistryComponent implements OnInit{

  trustedIssuers: TrustedIssuerDTO[] = [];

  addTrustedIssuerGroup = new FormGroup({
    address: new FormControl('', [Validators.required]),
    addClaimTopic: new FormControl(null, [Validators.required]),
    claimTopics: new FormControl([], [Validators.required])
  });

  addTrustedIssuerForm= new FormGroup({
    topic: new FormControl(null, [Validators.required])
  });

  removeTrustedIssuerForm= new FormGroup({
    topic: new FormControl(null, [Validators.required])
  });

  subscription: Subscription;

  get context() {
    return this.dkgService.selectedContext;
  }

  get tiClaimTopics(): number[] {
    return this.addTrustedIssuerGroup.get('claimTopics').value
  }

  set tiClaimTopics(value: number[]) {
    this.addTrustedIssuerGroup.get('claimTopics').setValue(value);
  }

  constructor(private parent: ContextComponent, private dkgService: DkgService) { };

  ngOnInit() {
    this.dkgService.checkIsConected();
    this.subscription = this.dkgService.contextSubject.subscribe((context: string) => {
      this.getTrustedIssuers();
    });

    this.getTrustedIssuers();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addClaimTopic() {
    if (this.addTrustedIssuerGroup.get('addClaimTopic').value) {
      this.tiClaimTopics = [... this.tiClaimTopics, this.addTrustedIssuerGroup.get('addClaimTopic').value];
      this.addTrustedIssuerGroup.get('addClaimTopic').setValue(null);
    }
  }

  async getTrustedIssuers() {
    if (this.context) {
      this.trustedIssuers = await this.dkgService.getTrustedIssuers(this.context);
    }
  }

  async isTrustedIssuer(address: string) {
    await this.dkgService.isTrustedIssuer(this.context, address);
  }

  async getTrustedIssuerClaimTopics(context: string, address: string) {
    this.trustedIssuers = await this.dkgService.getTrustedIssuerClaimTopics(context, address);
  }

  async addTrustedIssuer() {
    await this.dkgService.addTrustedIssuer(this.context, this.addTrustedIssuerGroup.get('address').value, this.addTrustedIssuerGroup.get('claimTopics').value);
  }

  async removeTrustedIssuer(address: string) {
    await this.dkgService.removeTrustedIssuer(this.context, address);
  }

  deleteClaimTopic(claimTopic: number) {
    this.tiClaimTopics = this.tiClaimTopics.filter(x => x !== claimTopic);
  }

}
