import {Component, ViewChild} from '@angular/core';
import {NavItem} from "./shared/nav-item";
import {MatSidenav} from "@angular/material/sidenav";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  _isExpanded: boolean = false;

  @ViewChild('sidenav') sidenav: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

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

  navItems: NavItem[] = [
    {
      displayName: 'Identity',
      iconName: 'person',
      route: 'identity'
    },
    {
      displayName: 'Dkg Agents',
      iconName: 'recent_actors',
      route: 'dkgAgent'
    },
    {
      displayName: 'Add Context',
      iconName: 'library_add',
      route: 'addContext',
    },
    {
      displayName: 'Context',
      iconName: 'speaker_notes',
      route: 'context',
      children: [
        {
          displayName: 'Issuers Registry',
          iconName: 'recent_actors',
          route: 'context/issuersRegistry'
        },
        {
          displayName: 'Identity Registry',
          iconName: 'recent_actors',
          route: 'context/identityRegistry'
        },
        {
          displayName: "Topics Registry",
          iconName: 'recent_actors',
          route: 'context/topicsRegistry'
        },
      ]
    }
  ];

  constructor() {}
}
