import {AfterViewInit, Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import accountJson from "../../../assets/accountKeyMap.json";
import {AccountDTO} from "./account.model";
import * as fs from "fs";
import * as path from "path";

@Component({
  selector: 'app-agent',
  templateUrl: './account.component.html'
})
export class AccountComponent implements AfterViewInit{

  accounts: AccountDTO[] = [];
  claimIssuers: AccountDTO[] = [];

  constructor() { };

  ngAfterViewInit() {
    this.getAccunts();
    this.getClaimIssuers();
  }

  editAgentForm= new FormGroup({
    agentAddress: new FormControl('', [Validators.required])
  });

  getAccunts() {
    try {
      this.accounts = Object.entries(accountJson).map(
        ([account, privateKey]) => new AccountDTO(account, privateKey)
      );
    } catch {
      this.accounts = [];
    }
  }

  getClaimIssuers() {
    try {
      const filePath = path.resolve(__dirname, '../../../assets', "claimIssuerMap.json");

      if (!fs.existsSync(filePath)) {
        console.log(`File not found at path: ${filePath}`);
        this.claimIssuers = [];
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const accountJson = JSON.parse(fileContent);


      const accountDTOs: AccountDTO[] = Object.entries(accountJson).map(
        ([account, privateKey]) => {
          // @ts-ignore
          return new AccountDTO(account, privateKey);
        }
      );

      this.claimIssuers = accountDTOs;
    } catch {
      this.claimIssuers = [];
    }
  }

}
