import {NgModule, SecurityContext} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

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
import {GebaeudeFeedbackEfficiencyComponent} from "./gebaeude/gebaeude-feedback-efficiency/gebaeude-feedback-efficiency.component";
import {GebaeudeFeedbackEinrohrComponent} from "./gebaeude/gebaeude-feedback-einrohr/gebaeude-feedback-einrohr.component";
import {GebaeudeFeedbackFlowTempComponent} from "./gebaeude/gebaeude-feedback-flow-temp/gebaeude-feedback-flow-temp.component";
import {GebaeudeFinalComponent} from "./gebaeude/gebaeude-final/gebaeude-final.component";
import {GebaeudeFeedbackFloorHeatingComponent} from "./gebaeude/gebaeude-feedback-floor-heating/gebaeude-feedback-floor-heating.component";
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
import {RaumDetailHeizflaechenComponent} from "./raeume/raum-detail-heizflaechen/raum-detail-heizflaechen.component";
import {RaumDetailHeizkoerperInfoComponent} from "./raeume/raum-detail-heizkoerper-info/raum-detail-heizkoerper-info.component";
import {RaumDetailErgebnisComponent} from "./raeume/raum-detail-ergebnis/raum-detail-ergebnis.component";

// Ergebnis (Results) Component
import {ErgebnisAssessmentComponent} from "./ergebnis/ergebnis-assessment/ergebnis-assessment.component";

// Shared Components
import {WizardTabsComponent} from "./shared/wizard-tabs/wizard-tabs.component";
import {BandTachoComponent} from "./shared/band-tacho/band-tacho.component";
import {HeaterFormComponent} from "./shared/heater-form/heater-form.component";
import {RoomListComponent} from "./shared/room-list/room-list.component";
import {DebugOverlayComponent} from "./shared/debug-overlay/debug-overlay.component";

// Markdown Support
import { MarkdownModule } from 'ngx-markdown';
import 'marked';

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
    GebaeudeFeedbackEfficiencyComponent,
    GebaeudeFeedbackEinrohrComponent,
    GebaeudeFeedbackFlowTempComponent,
    GebaeudeFinalComponent,
    GebaeudeFeedbackFloorHeatingComponent,
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
    RaumDetailHeizkoerperInfoComponent,
    RaumDetailHeizflaechenComponent,
    RaumDetailErgebnisComponent,

    // Ergebnis (Results) Component
    ErgebnisAssessmentComponent,

    // Shared Components
    WizardTabsComponent,
    BandTachoComponent,
    HeaterFormComponent,
    RoomListComponent,
    DebugOverlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.HTML
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
