import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AceComponent, AceConfigInterface, AceDirective} from "ngx-ace-wrapper";
import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import {DkgService} from "../../services/dkg.service";

interface HistoryOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {

  isEdit: boolean = false;
  response: string  = '';
  updateUal: string  = '';
  historical: boolean = false;
  historyOptions: HistoryOption[] = [
    {value: 'LATEST', viewValue: 'Latest'},
    {value: 'LATEST_FINALIZED', viewValue: 'Latest finalized'},
    {value: 'HISTORICAL', viewValue: 'Historical'},
  ]
  selHistoryOption = this.historyOptions[0].value;

  @ViewChild('edit', { static: false }) componentRef?: AceComponent;
  public content: string = "";

  public config: AceConfigInterface = {
    mode: 'javascript',
    theme: 'github',
    readOnly: false,
    showPrintMargin: false
  };

  public readConfig: AceConfigInterface = {
    mode: 'javascript',
    theme: 'github',
    readOnly: true,
    showPrintMargin: false
  }

  get ual() {
    return this.searchFormGroup.get('ual').value;
  }

  get sparql() {
    return this.searchFormGroup.get('sparql').value;
  }

  set sparql(val) {
    this.searchFormGroup.get('sparql').setValue(val);
  }

  public searchFormGroup = new FormGroup({
    ual: new FormControl(''),
    historyOption: new FormControl({value: '', disabled: true}),
    historical: new FormControl(false),
    queryType: new FormControl('SELECT', Validators.required),
    sparql: new FormControl(''),
  });

  constructor(private dkgService: DkgService) { };

  onSubmit(event: any) {
    console.log(event);
  }

  async createAssertion() {
    if (this.content != null) {
      const content = this.content.trim();
      if (content != "" ) {
        const res = await this.dkgService.createAssertion(content);
        this.response = JSON.stringify(res, null, 4);
      }
    }
  }

  async updateAssertion() {
    if (this.content != null && this.updateUal != null) {
      const content = this.content.trim();
      const updateUal = this.updateUal.trim();
      if (content != "") {
        const res = await this.dkgService.updateAssertion(updateUal, content);
        this.response = JSON.stringify(res, null, 4);
      }
    }
  }

  async readUal() {
    if (this.ual != null) {
      const ual = this.ual.trim();
      if (ual != "") {
          const state = ['LATEST', 'LATEST_FINALIZED'].includes(this.selHistoryOption) ? this.selHistoryOption : this.searchFormGroup.get('historyOption').value
          const res = await this.dkgService.readUal(ual, state);
          this.response = JSON.stringify(res, null, 4);
      }
    }
  }

  async querySparql() {
    if (this.sparql != null) {
      const sparql = this.sparql.trim();
      if (sparql != "") {
        const res = await this.dkgService.querySparql(sparql, this.searchFormGroup.get('queryType').value, this.searchFormGroup.get('historical').value);
        this.response = JSON.stringify(res, null, 4);
      }
    }
  }

  clear() {
    if (
      this.componentRef &&
      this.componentRef.directiveRef
    ) {
      this.componentRef.directiveRef.clear();
    }
  }

  onSelectionChange(event): void {
    if (['LATEST', 'LATEST_FINALIZED'].includes(this.selHistoryOption)) {
      this.searchFormGroup.get('historyOption')?.disable();
    } else {
      this.searchFormGroup.get('historyOption')?.enable();
    }
    this.searchFormGroup.get('historyOption')?.setValue(null);
  }

  addCarExample() {
    this.content = `{
"@context": "https://schema.org",
"@type": "Person",
"name": "John Doe",
"address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "Anytown",
    "addressRegion": "CA",
    "postalCode": "12345",
    "addressCountry": "USA"
},
"url": "https://www.johndoewebsite.com",
"birthDate": "1990-01-01"
}`;
  }

  addDocumentExample() {
    this.content = `{
"@context": "http://purl.org/dc/terms/",
"@type": "Text",
"title": "A Guide to JSON-LD",
"creator": "Jane Doe",
"date": "2024-11-01",
"format": "text/html"
}`
  }

  addWebpageExample() {
    this.content = `{
"@context": "http://ogp.me/ns#",
"og:title": "Introducing JSON-LD",
"og:type": "article",
"og:url": "http://example.com/json-ld",
"og:image": "http://example.com/thumbnail.jpg"
}`
  }

  addPersonExample() {
    this.content = `{
"@context": "https://json-ld.org/contexts/person.jsonld",
"@id": "http://dbpedia.org/resource/John_Lennon",
"name": "John Lennon",
"born": "1940-10-09",
"spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
}`
  }

  ClearResponse() {
    this.response = '';
  }
}
