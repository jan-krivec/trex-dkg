import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AceComponent, AceConfigInterface, AceDirective} from "ngx-ace-wrapper";
import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import {DkgService} from "../../services/dkg.service";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html'
})
export class TestComponent {

  @ViewChild(AceComponent, { static: false }) componentRef?: AceComponent;
  public content: string = "";

  public config: AceConfigInterface = {
    mode: 'javascript',
    theme: 'github',
    readOnly: false,
    showPrintMargin: false
  };

  constructor(private dkgService: DkgService) { };

  editAgentForm= new FormGroup({
    agentAddress: new FormControl('', [Validators.required])
  });

  onSubmit(event: any) {
    console.log(event);
  }

  async createAssertion() {
    if (this.content != null || this.content !== "") {
      await this.dkgService.createAssertion(this.content);
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
}
