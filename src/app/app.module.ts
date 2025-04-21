import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from "@angular/forms";
import {StartComponent} from './start/start.component';
import {ImpressumComponent} from './impressum/impressum.component';
import {DatenschutzComponent} from './datenschutz/datenschutz.component';
import {KontaktComponent} from './kontakt/kontakt.component';

// Gebäude (Building) Components
import {GebaeudeIntroComponent} from "./gebaeude/gebaeude-intro/gebaeude-intro.component";
import {GebaeudeBasicComponent} from "./gebaeude/gebaeude-basic/gebaeude-basic.component";
import {GebaeudeFeedbackEarlyComponent} from "./gebaeude/gebaeude-feedback-early/gebaeude-feedback-early.component";
import {GebaeudeRetrofittingComponent} from "./gebaeude/gebaeude-retrofitting/gebaeude-retrofitting.component";
import {GebaeudeHeatingComponent} from "./gebaeude/gebaeude-heating/gebaeude-heating.component";
import {GebaeudeFeedbackHeatingComponent} from "./gebaeude/gebaeude-feedback-heating/gebaeude-feedback-heating.component";
import {GebaeudeFlowTempComponent} from "./gebaeude/gebaeude-flow-temp/gebaeude-flow-temp.component";
import {GebaeudeTransitionComponent} from "./gebaeude/gebaeude-transition/gebaeude-transition.component";

// Räume (Rooms) Components
import {RaeumeListCriteriaOneComponent} from "./raeume/raeume-list-criteria-one/raeume-list-criteria-one.component";
import {RaeumeListCriteriaTwoComponent} from "./raeume/raeume-list-criteria-two/raeume-list-criteria-two.component";
import {RaeumeIntroComponent} from "./raeume/raeume-intro/raeume-intro.component";
import {RaumDetailBasicComponent} from "./raeume/raum-detail-basic/raum-detail-basic.component";
import {RaumDetailWallsComponent} from "./raeume/raum-detail-walls/raum-detail-walls.component";

// Ergebnis (Results) Component
import {ErgebnisAssessmentComponent} from "./ergebnis/ergebnis-assessment/ergebnis-assessment.component";

// Shared Components
import {WizardTabsComponent} from "./shared/wizard-tabs/wizard-tabs.component";

import '@angular/common/locales/global/de';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent,
    
    // Gebäude (Building) Components
    GebaeudeIntroComponent,
    GebaeudeBasicComponent,
    GebaeudeFeedbackEarlyComponent,
    GebaeudeRetrofittingComponent,
    GebaeudeHeatingComponent,
    GebaeudeFeedbackHeatingComponent,
    GebaeudeFlowTempComponent,
    GebaeudeTransitionComponent,
    
    // Räume (Rooms) Components
    RaeumeListCriteriaOneComponent,
    RaeumeListCriteriaTwoComponent,
    RaeumeIntroComponent,
    RaumDetailBasicComponent,
    RaumDetailWallsComponent,
    
    // Ergebnis (Results) Component
    ErgebnisAssessmentComponent,
    
    // Shared Components
    WizardTabsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
