import {ApplicationRef, Injector, NgModule, SecurityContext} from '@angular/core';
import {createCustomElement} from "@angular/elements";
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {TitleStrategy} from '@angular/router';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppTitleStrategy} from './app-title-strategy';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from "@angular/forms";
import {StartComponent} from './start/start.component';
import {ImpressumComponent} from './impressum/impressum.component';
import {DatenschutzComponent} from './datenschutz/datenschutz.component';
import {KontaktComponent} from './kontakt/kontakt.component';
import {GlossarComponent} from './glossar/glossar.component';

// Gebäude (Building) Components
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
import {RaeumeListConsolidatedComponent} from "./raeume/raeume-list-consolidated/raeume-list-consolidated.component";
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
import {DebugOverlayComponent} from "./shared/debug-overlay/debug-overlay.component";
import {NavigationFooterComponent} from "./shared/navigation-footer/navigation-footer.component";

// Markdown Support
import { MarkdownModule } from 'ngx-markdown';
import 'marked';

// SVG Icon Support
import { SvgIconComponent } from './shared/svg-icon/svg-icon.component';

import '@angular/common/locales/global/de';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutoSelectDirective } from './shared/auto-select.directive';
import { FaqComponent } from './faq/faq.component';
import { NextStepsComponent } from './shared/next-steps/next-steps.component';
import { DatenmanagementComponent } from './datenmanagement/datenmanagement.component';

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent,
    GlossarComponent,

    // Gebäude (Building) Components
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
    RaeumeListConsolidatedComponent,
    RaeumeIntroComponent,
    RaumDetailBasicComponent,
    RaumDetailWallsComponent,
    RaumDetailHeizkoerperInfoComponent,
    RaumDetailHeizflaechenComponent,
    RaumDetailErgebnisComponent,

    // Ergebnis (Results) Component
    ErgebnisAssessmentComponent,
    NextStepsComponent,

    // Shared Components
    WizardTabsComponent,
    BandTachoComponent,
    HeaterFormComponent,
    DebugOverlayComponent,
    NavigationFooterComponent,

    // Directives
    AutoSelectDirective,
    FaqComponent,
    DatenmanagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.HTML
    }),
    SvgIconComponent,
    NgbModule
  ],
  providers: [
    { provide: TitleStrategy, useClass: AppTitleStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
  }

  // override normal bootstrap and register component instead
  ngDoBootstrap(appRef: ApplicationRef): void {
    customElements.define('uba-waermepumpen', createCustomElement(AppComponent, {
      injector: this.injector
    }));
  }
}
