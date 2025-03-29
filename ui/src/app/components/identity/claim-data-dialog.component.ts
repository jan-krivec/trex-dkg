import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ClaimDTO} from "../../shared/identity.model";

@Component({
  selector: 'claim-data-dialog',
  templateUrl: 'claim-data-dialog-component.html',
})
export class ClaimDataDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ClaimDTO) {}
}
