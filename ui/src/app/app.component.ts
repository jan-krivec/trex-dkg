import {Component, OnInit, ViewChild} from '@angular/core';
import {NavItem} from "./shared/nav-item";
import {MatSidenav} from "@angular/material/sidenav";
import {EthereumService} from "./services/ethereum.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  _isExpanded: boolean = false;
  _ethereumService: EthereumService;

  @ViewChild('sidenav') sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

  ngOnInit() {
    this._ethereumService.checkIsConected();
  }

  get isConnected() {
    return this._ethereumService.isConnected;
  }

  connectMetamask() {
    this._ethereumService.requestAccountAccess();
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  constructor(ethereumService: EthereumService) {
    this._ethereumService = ethereumService;
  }


}
