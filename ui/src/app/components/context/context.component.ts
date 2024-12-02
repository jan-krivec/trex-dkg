import {AfterViewInit, Component} from '@angular/core';
import {DkgService} from "../../services/dkg.service";

@Component({
  selector: '',
  templateUrl: './context.component.html'
})
export class ContextComponent implements AfterViewInit{
  public contexts: string[];

  constructor(private dkgService: DkgService) { };

  get selectedContext() {
    return this.dkgService.selectedContext;
  }

  set selectedContext(val) {
    this.dkgService.selectedContext = val;
  }

  async ngAfterViewInit() {
    this.refreshContextList();
  }

  async refreshContextList() {
    this.contexts = await this.dkgService.getContexts();
  }

}
