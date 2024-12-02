import {AfterViewInit, Component} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../services/dkg.service";

@Component({
  selector: '',
  templateUrl: './context-detail.component.html'
})
export class ContextDetailComponent{



  contextDetailForm = new FormGroup({
    context: new FormControl('', [Validators.required]),
    addClaimTopicForm: new FormGroup({
      issuer: new FormControl(null),
      claimTopic: new FormControl(null),
      claimTopics: new FormControl([])
    }),
    claimIssuers: new FormArray([])
  });

  get claimIssuers() {
    return this.contextDetailForm.get('claimIssuers') as FormArray
  }

  get newClaimTopics() {
    return this.contextDetailForm.get('addClaimTopicForm').get('claimTopics').value;
  }

  set newClaimTopics(value: number[]) {
    this.contextDetailForm.get('addClaimTopicForm').get('claimTopics').setValue(value);
  }

  get addClaimTopicForm() {
    return this.contextDetailForm.get('addClaimTopicForm');
  }

  extractIssuer() {
    return new FormGroup({
      issuer: new FormControl(this.addClaimTopicForm.get('issuer').value),
      claimTopics: new FormControl(this.addClaimTopicForm.get('claimTopics').value)
    })
  }

  // Add a new issuer
  addIssuer() {
    if (this.addClaimTopicForm.valid) {
      const newIssuerGroup = this.extractIssuer();
      this.addClaimTopicForm.get('issuer').setValue(null);
      this.addClaimTopicForm.get('claimTopic').setValue(null);
      this.addClaimTopicForm.get('claimTopics').setValue([]); // Reset claimTopics to an empty array
      this.claimIssuers.push(newIssuerGroup);
      console.log(this.claimIssuers);
    }
  }

  constructor(private dkgService: DkgService) { };

  addClaimTopic() {
    if (this.newClaimTopics && this.addClaimTopicForm.get('claimTopic').value != null) {
      const currentTopics = this.newClaimTopics.slice();
      currentTopics.push(this.addClaimTopicForm.get('claimTopic').value);
      this.newClaimTopics = currentTopics; // Update the FormControč
      this.addClaimTopicForm.get('claimTopic').setValue(null);
    }
  }

  deleteClaimTopic(claimTopic: number) {
    this.newClaimTopics = this.newClaimTopics.filter(x => x !== claimTopic);
  }

  async onSubmit() {
    const val = this.contextDetailForm.get('claimIssuers').value;
    const claimIssuers = Array.isArray(val) ? val : [val]
    await this.dkgService.deployContext(this.contextDetailForm.get('context').value, claimIssuers)
  }

  removeTrustedIssuer(index: number) {
    this.claimIssuers.removeAt(index);
  }
}
