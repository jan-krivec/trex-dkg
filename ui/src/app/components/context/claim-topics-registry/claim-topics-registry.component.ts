import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DkgService} from "../../../services/dkg.service";
import {Subscription} from "rxjs";
import {FlatTreeControl} from "@angular/cdk/tree";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";

interface TypeClaimTopics {
  typeName: string;
  claimTopics: number[];
}

interface TypeClaimTopicsNode {
  name: string;
  children?: TypeClaimTopicsNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-claim-topics-registry',
  templateUrl: './claim-topics-registry.component.html'
})
export class ClaimTopicsRegistryComponent implements OnInit, OnDestroy{
  subscription: Subscription;
  claimTopics: number[] = [];
  claimTopicsTypes: TypeClaimTopics[] = [];


  constructor(private dkgService: DkgService) { };

  get context() {
    return this.dkgService.selectedContext;
  }

  get type() {
    return this.dkgService.selectedType;
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
      this.claimTopicsTypes = await this.dkgService.getTypesClaimTopics(this.context);
    }
  }

  async addClaimTopic() {
    if (this.context) {
      await this.dkgService.addClaimTopic(this.context, this.type, this.addTopicForm.get('topic').value);
      this.getClaimTopics();
    }
  }

  async removeClaimTopic() {
    if (this.context) {
      await this.dkgService.removeClaimTopic(this.context, this.type, this.removeTopicForm.get('topic').value);
      this.getClaimTopics();
    }
  }
}
