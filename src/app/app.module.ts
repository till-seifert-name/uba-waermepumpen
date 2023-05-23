import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatLineModule} from "@angular/material/core";
import {MatStepperModule} from "@angular/material/stepper";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatCardModule} from "@angular/material/card";
import {StartComponent} from './start/start.component';
import {HintergrundinformationenComponent} from './hintergrundinformationen/hintergrundinformationen.component';
import {VorueberlegungenComponent} from './vorueberlegungen/vorueberlegungen.component';
import {EmpfehlungenComponent} from './empfehlungen/empfehlungen.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {CustomStepperComponent, StepperGraphicDirective} from './stepper/stepper.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {CdkStepperModule} from "@angular/cdk/stepper";
import { UebersichtsgrafikComponent } from './vorueberlegungen/uebersichtsgrafik/uebersichtsgrafik.component';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    HintergrundinformationenComponent,
    VorueberlegungenComponent,
    EmpfehlungenComponent,
    CustomStepperComponent    ,
    StepperGraphicDirective,
    UebersichtsgrafikComponent    ,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatLineModule,
    MatProgressBarModule,
    MatStepperModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCardModule,
    MatExpansionModule,
    CdkStepperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
