import { NgModule, CUSTOM_ELEMENTS_SCHEMA   } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {ContextComponent} from "./components/context/context.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EthereumService} from "./services/ethereum.service";
import {IdentityComponent} from "./components/identity/identity.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatNativeDateModule} from "@angular/material/core";
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from '@angular/material/grid-list';
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from '@angular/material/tabs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from "@angular/material/dialog";
import {ErrorDialogComponent} from "./shared/error/error-dialog.component";
import {ErrorHandlerService} from "./shared/error/error-handler.service";
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {AgentComponent} from "./components/agent/agent.component";
import {IdentityRegistryComponent} from "./components/context/identity-registry/identity-registry.component";
import {
  ClaimTopicsRegistryComponent
} from "./components/context/claim-topics-registry/claim-topics-registry.component";
import {DkgService} from "./services/dkg.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {
  TrustedIssuersRegistryComponent
} from "./components/context/trusted-issuers-registry/trusted-issuers-registry.component";
import {IfcViewerComponent} from "./components/ifc-viewer/ifc-viewer.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import { LayoutModule } from '@angular/cdk/layout';
import {ContextDetailComponent} from "./components/context-detail/context-detail.component";
import {TestComponent} from "./components/test/test.component";
import {AceModule} from "ngx-ace-wrapper";
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
import {AccountComponent} from "./components/account/account.component";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatTooltipModule} from "@angular/material/tooltip";

const DEFAULT_ACE_CONFIG: AceConfigInterface = {
};

@NgModule({
  declarations: [
    AppComponent,
    ContextComponent,
    IdentityComponent,
    ErrorDialogComponent,
    AgentComponent,
    IdentityRegistryComponent,
    ClaimTopicsRegistryComponent,
    TrustedIssuersRegistryComponent,
    IfcViewerComponent,
    ContextDetailComponent,
    TestComponent,
    AccountComponent
  ],
  imports: [
    AceModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    MatListModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSidenavModule,
    LayoutModule,
    ClipboardModule,
    MatTooltipModule
  ],
  providers: [EthereumService,
              ErrorHandlerService,
              DkgService,
              {
                provide: ACE_CONFIG,
                useValue: DEFAULT_ACE_CONFIG
              },
              {
                provide: 'Window',
                useValue: window
              },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
