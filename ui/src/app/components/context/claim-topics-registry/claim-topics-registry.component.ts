import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../../services/dkg.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-claim-topics-registry',
  templateUrl: './claim-topics-registry.component.html'
})
export class ClaimTopicsRegistryComponent implements OnInit, OnDestroy{
  subscription: Subscription;
  claimTopics: number[] = [];

  constructor(private dkgService: DkgService) { };

  get context() {
    return this.dkgService.selectedContext;
  }

  addTopicForm= new FormGroup({
    topic: new FormControl(null, [Validators.required])
  });

  removeTopicForm= new FormGroup({
    topic: new FormControl(null, [Validators.required])
  });

  ngOnInit() {
    this.dkgService.checkIsConected();
    this.subscription = this.dkgService.contextSubject.subscribe((context: string) => {
      this.getClaimTopics();
    });

    this.getClaimTopics();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async getClaimTopics() {
    if (this.context) {
      this.claimTopics = await this.dkgService.getClaimTopics(this.context);
    }
  }

  async addClaimTopic() {
    if (this.context) {
      await this.dkgService.addClaimTopic(this.context, this.addTopicForm.get('topic').value);
      this.getClaimTopics();
    }
  }

  async removeClaimTopic() {
    if (this.context) {
      await this.dkgService.removeClaimTopic(this.context, this.removeTopicForm.get('topic').value);
      this.getClaimTopics();
    }
  }
}
