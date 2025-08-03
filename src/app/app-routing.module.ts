import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartComponent} from "./start/start.component";
import {ImpressumComponent} from "./impressum/impressum.component";
import {DatenschutzComponent} from "./datenschutz/datenschutz.component";
import {KontaktComponent} from "./kontakt/kontakt.component";

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
import {RaeumeListConsolidatedComponent} from "./raeume/raeume-list-consolidated/raeume-list-consolidated.component";
import {RaeumeIntroComponent} from "./raeume/raeume-intro/raeume-intro.component";
import {RaumDetailBasicComponent} from "./raeume/raum-detail-basic/raum-detail-basic.component";
import {RaumDetailWallsComponent} from "./raeume/raum-detail-walls/raum-detail-walls.component";
import {RaumDetailHeizflaechenComponent} from "./raeume/raum-detail-heizflaechen/raum-detail-heizflaechen.component";
import {RaumDetailHeizkoerperInfoComponent} from "./raeume/raum-detail-heizkoerper-info/raum-detail-heizkoerper-info.component";
import {RaumDetailErgebnisComponent} from "./raeume/raum-detail-ergebnis/raum-detail-ergebnis.component";

// Ergebnis (Results) Component
import {ErgebnisAssessmentComponent} from "./ergebnis/ergebnis-assessment/ergebnis-assessment.component";

const routes: Routes = [
  {
    path: '',
    component: StartComponent,
    pathMatch: 'full',
    title: 'Wärmepumpen'
  },
  // Building path with subroutes
  {
    path: 'gebaeude',
    children: [
      { path: '', component: GebaeudeIntroComponent, title: 'Gebäude-Einführung' },
      { path: 'basisdaten', component: GebaeudeBasicComponent, title: 'Gebäude-Basisdaten' },
      { path: 'feedback-early', component: GebaeudeFeedbackEarlyComponent, title: 'Gebäude-Feedback' },
      { path: 'feedback-efficiency', component: GebaeudeFeedbackEfficiencyComponent, title: 'Effizienzklasse-Feedback' },
      { path: 'feedback-einrohr', component: GebaeudeFeedbackEinrohrComponent, title: 'Einrohrheizung-Feedback' },
      { path: 'feedback-flow-temp', component: GebaeudeFeedbackFlowTempComponent, title: 'Vorlauftemperatur-Feedback' },
      { path: 'feedback-floor-heating', component: GebaeudeFeedbackFloorHeatingComponent, title: 'Fußbodenheizung-Feedback' },
      { path: 'modernisierung', component: GebaeudeRetrofittingComponent, title: 'Gebäude-Modernisierung' },
      { path: 'heizung', component: GebaeudeHeatingComponent, title: 'Gebäude-Heizung' },
      { path: 'feedback-heizung', component: GebaeudeFeedbackHeatingComponent, title: 'Heizung-Feedback' },
      { path: 'vorlauftemperatur', component: GebaeudeFlowTempComponent, title: 'Vorlauftemperatur' },
      { path: 'final', component: GebaeudeFinalComponent, title: 'Gebäudeerfassung Abschluss' },
      { path: 'transition', component: GebaeudeTransitionComponent, title: 'Übergang zu Räumen' }
    ]
  },
  // Rooms path with subroutes
  {
    path: 'raeume',
    children: [
      { path: 'liste', component: RaeumeListConsolidatedComponent, title: 'Räume erfassen' },
      { path: 'intro', component: RaeumeIntroComponent, title: 'Räume-Einführung' },
      { path: 'detail-basis', component: RaumDetailBasicComponent, title: 'Raum-Details' },
      { path: 'detail-wand', component: RaumDetailWallsComponent, title: 'Raum-Wände' },
      { path: 'detail-heizkoerper-info', component: RaumDetailHeizkoerperInfoComponent, title: 'Heizkörper-Info' },
      { path: 'detail-heizflaechen', component: RaumDetailHeizflaechenComponent, title: 'Raum-Heizflächen' },
      { path: 'detail-ergebnis', component: RaumDetailErgebnisComponent, title: 'Raum-Ergebnis' }
    ]
  },
  // Results route
  {
    path: 'ergebnis',
    component: ErgebnisAssessmentComponent,
    title: 'Ergebnis'
  },
  // Static pages
  {
    path: 'impressum',
    component: ImpressumComponent,
    title: 'Impressum'
  },
  {
    path: 'datenschutz',
    component: DatenschutzComponent,
    title: 'Datenschutzerklärung'
  },
  {
    path: 'kontakt',
    component: KontaktComponent,
    title: 'Kontakt'
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: "disabled",
    initialNavigation: 'enabledBlocking',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 196],
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
