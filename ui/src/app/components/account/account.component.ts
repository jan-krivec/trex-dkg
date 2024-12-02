import {AfterViewInit, Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import accountJson from "../../../assets/accountKeyMap.json";
import {AccountDTO} from "./account.model";
import {HttpClient} from "@angular/common/http";
import {DkgService} from "../../services/dkg.service";

@Component({
  selector: 'app-agent',
  templateUrl: './account.component.html'
})
export class AccountComponent implements AfterViewInit{

  accounts: AccountDTO[] = [];
  claimIssuers: AccountDTO[] = [];

  constructor(private dkgService: DkgService) { };

  ngAfterViewInit() {
    this.getAccunts();
    this.getClaimIssuers();
  }

  editAgentForm= new FormGroup({
    agentAddress: new FormControl('', [Validators.required])
  });

  getAccunts() {
    try {
      let i = 0;
      this.accounts = Object.entries(accountJson).map(
        ([account, privateKey]) => {
          let role : string;
          if (i == 0) {
            role = 'Owner';
          } else {
            role = 'Account ' + i;
          }
          i ++;
          return new AccountDTO(account, privateKey, role)
        }
      );
    } catch {
      this.accounts = [];
    }
  }

  async getClaimIssuers() {
    this.claimIssuers = await this.dkgService.getClaimIssuers();
  }

}
