import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ContextComponent} from "./components/context/context.component";
import {IdentityComponent} from "./components/identity/identity.component";
import {IfcViewerComponent} from "./components/ifc-viewer/ifc-viewer.component";
import {AgentComponent} from "./components/agent/agent.component";
import {IdentityRegistryComponent} from "./components/context/identity-registry/identity-registry.component";
import {
  TrustedIssuersRegistryComponent
} from "./components/context/trusted-issuers-registry/trusted-issuers-registry.component";
import {ClaimTopicsRegistryComponent} from "./components/context/claim-topics-registry/claim-topics-registry.component";
import {ContextDetailComponent} from "./components/context-detail/context-detail.component";
import {TestComponent} from "./components/test/test.component";
import {AccountComponent} from "./components/account/account.component";

const routes: Routes = [
  {
    path: 'context',
    component: ContextComponent,
    children: [
      {
      path: 'identityRegistry',
      component: IdentityRegistryComponent
      },
      {
        path: 'issuersRegistry',
        component: TrustedIssuersRegistryComponent
      },
      {
        path: 'topicsRegistry',
        component: ClaimTopicsRegistryComponent
      }
    ]
  },
  {
    path: 'addContext',
    component: ContextDetailComponent,
  },
  {
    path: 'identity',
    component: IdentityComponent
  },
  {
    path: 'ifcViewer',
    component: IfcViewerComponent
  },
  {
    path: 'dkgAgent',
    component: AgentComponent
  },
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: 'account',
    component: AccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
