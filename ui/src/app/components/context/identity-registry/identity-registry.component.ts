import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../../services/dkg.service";
import {ContextComponent} from "../context.component";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-identity-registry',
  templateUrl: './identity-registry.component.html'
})
export class IdentityRegistryComponent implements OnInit{

  checkGroup = new FormGroup({
    check: new FormControl('', [Validators.required])
  })

  getGroup = new FormGroup({
    get: new FormControl('', [Validators.required])
  })

  isVerifiedGroup = new FormGroup({
    isVerified: new FormControl('', [Validators.required])
  })

  registerIdentiyGroup = new FormGroup({
    address: new FormControl('', [Validators.required])
  });

  deleteIdentiyGroup = new FormGroup({
    address: new FormControl('', [Validators.required])
  });

  subscription: Subscription;

  constructor(private parent: ContextComponent, private dkgService: DkgService) { };

  ngOnInit() {
    this.dkgService.checkIsConected();
  }

  get context() {
    return this.dkgService.selectedContext;
  }

  editAgentForm= new FormGroup({
    agentAddress: new FormControl('', [Validators.required]),
    agentType: new FormControl('', [Validators.required])
  });

  check() {
    this.dkgService.checkIfRegistered(this.checkGroup.get('check').value);
  }

  get() {
    this.dkgService.getIdentiy(this.getGroup.get('get').value);
  }

  isVerified() {
    if (this.context) {
      this.dkgService.isVerified(this.context, this.isVerifiedGroup.get('isVerified').value);
    }
  }

  registerIdentity() {
    this.dkgService.registerIdentity(this.registerIdentiyGroup.get('address').value);
  }

  deleteIdentity() {
    // this.dkgService.deleteIdentity(this.deleteIdentiyGroup.get('address').value);
  }

}
