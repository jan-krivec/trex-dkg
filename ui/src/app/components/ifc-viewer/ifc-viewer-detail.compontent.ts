import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";
import {DkgService} from "../../services/dkg.service";

export interface DialogData {
  expressId: string;
}

@Component({
  selector: 'ifc-viewer-detail.compontent',
  templateUrl: 'ifc-viewer-detail.compontent.html',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
  ],
})
export class IfcViewerDetailCompontent {

  _selectedFormGroup: FormGroup = null;
  selectedOption = null;

  expressId = null;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: [null]
  })

  get selectedFormGroup() {
    return this._selectedFormGroup ? this._selectedFormGroup : new FormGroup<any>({});
  }

  set selectedFormGroup(val) {
    this._selectedFormGroup = val;
  }

  options = ['Alarm', 'Sensor', 'Camera', 'HVAC Equipment']

  sensorFormGroup = this._formBuilder.group({
    Type: [{value: null, type: 'select', options: ['Air_Quality_Sensor', 'Fire_Sensor', 'Temperature_Sensor']}, Validators.required],
    Value: [null, Validators.required],
    Comment: [null]
  });

  cameraFormGroup = this._formBuilder.group({
    Label: [null, Validators.required],
    Latitude: [0.0, Validators.required],
    Longitude: [0.0, Validators.required],
    Comment: [null]
  });

  alarmFormGroup = this._formBuilder.group({
    Type: [{value: null, type: 'select', options: ['Air_Alarm', 'Smoke_Alarm', 'Temperature_Alarm']}, Validators.required],
    Quantity: [null],
    Comment: [null]
  });

  equipmentFromGroup = this._formBuilder.group({
    Type: [{value: null, type: 'select', options: ['Boiler', 'Damper', 'Fan', 'Filter', 'Pump']}, Validators.required],
    ModelNumber: [null, Validators.required],
    Value: [null, Validators.required]
  });

  constructor(
    public dialogRef: MatDialogRef<IfcViewerDetailCompontent>,
    private _formBuilder: FormBuilder,
    private dkgService: DkgService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.expressId = data.expressId;
  }

  selectType(value) {
    this.selectedOption = value;
    switch (value) {
      case 'Alarm':
        this.selectedFormGroup = this.alarmFormGroup;
        break;
      case 'Sensor':
        this.selectedFormGroup = this.sensorFormGroup;
        break
      case 'Camera':
        this.selectedFormGroup = this.cameraFormGroup;
        break;
      case 'HVAC Equipment':
        this.selectedFormGroup = this.equipmentFromGroup;
        break;
    }
  }

  getFormControls(): string[] {
    return this.selectedFormGroup ? Object.keys(this.selectedFormGroup?.controls) : [];
  }

  isSelectControl(control: AbstractControl | null): boolean {
    if (!control) return false;
    return control.value && typeof control.value === 'object' && control.value.type === 'select';
  }

  getControl(controlName: string) {
    return this.selectedFormGroup ? this.selectedFormGroup.controls[controlName] : null;
  }

  async addAlarm() {
    await this.dkgService.addAlarm(this.expressId, this.selectedFormGroup.controls['Type'].value, this.selectedFormGroup.controls['Quantity'].value, this.selectedFormGroup.controls['Comment'].value);
  }
}
