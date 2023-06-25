import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
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
import {CustomStepperComponent, FinishButtonDirective, StepperGraphicDirective} from './stepper/stepper.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {CdkStepperModule} from "@angular/cdk/stepper";
import {UebersichtsgrafikComponent} from './vorueberlegungen/uebersichtsgrafik/uebersichtsgrafik.component';
import {ButtonToggleGroupComponent} from './empfehlungen/button-toggle-group/button-toggle-group.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {ArrowComponent} from './vorueberlegungen/arrow/arrow.component';
import {InfoCardComponent} from './hintergrundinformationen/info-card/info-card.component';
import {
  DialogTriggerDirective,
  InfoCardButtonComponent
} from './hintergrundinformationen/info-card/info-card-button.component';
import {MatTableModule} from "@angular/material/table";
import {MatMenuModule} from "@angular/material/menu";
import { ResizableCircleComponent } from './vorueberlegungen/resizable-circle/resizable-circle.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { KontaktComponent } from './kontakt/kontakt.component';
import { PopupPkwPoolingComponent } from './hintergrundinformationen/popup-pkw-pooling/popup-pkw-pooling.component';
import { PopupOEffentlicheVerkehrsmittelComponent } from './hintergrundinformationen/popup-oeffentliche-verkehrsmittel/popup-oeffentliche-verkehrsmittel.component';
import { PopupBahnFernbusComponent } from './hintergrundinformationen/popup-bahn-fernbus/popup-bahn-fernbus.component';
import { PopupOEPNVComponent } from './hintergrundinformationen/popup-oepnv/popup-oepnv.component';
import { PopupAboOEPNVComponent } from './hintergrundinformationen/popup-abo-oepnv/popup-abo-oepnv.component';
import { PopupBahncardComponent } from './hintergrundinformationen/popup-bahncard/popup-bahncard.component';
import { PopupFahrradSharingComponent } from './hintergrundinformationen/popup-fahrrad-sharing/popup-fahrrad-sharing.component';
import { PopupFahrradAboKaufLeasingComponent } from './hintergrundinformationen/popup-fahrrad-abo-kauf-leasing/popup-fahrrad-abo-kauf-leasing.component';
import { PopupEFahrradComponent } from './hintergrundinformationen/popup-efahrrad/popup-efahrrad.component';
import { PopupELastenradComponent } from './hintergrundinformationen/popup-elastenrad/popup-elastenrad.component';
import { PopupFahrradPoolingComponent } from './hintergrundinformationen/popup-fahrrad-pooling/popup-fahrrad-pooling.component';
import { PopupFahhradComponent } from './hintergrundinformationen/popup-fahhrad/popup-fahhrad.component';
import { PopupPkwComponent } from './hintergrundinformationen/popup-pkw/popup-pkw.component';
import { PopupMobilitaetsbudgetComponent } from './hintergrundinformationen/popup-mobilitaetsbudget/popup-mobilitaetsbudget.component';
import { PopupThgVergleichComponent } from './hintergrundinformationen/popup-thg-vergleich/popup-thg-vergleich.component';
import { PopupAntriebsartComponent } from './hintergrundinformationen/popup-antriebsart/popup-antriebsart.component';
import { PopupDimensionierungComponent } from './hintergrundinformationen/popup-dimensionierung/popup-dimensionierung.component';
import { PopupAusstattungComponent } from './hintergrundinformationen/popup-ausstattung/popup-ausstattung.component';
import { PopupFahrzeugsegmentComponent } from './hintergrundinformationen/popup-fahrzeugsegment/popup-fahrzeugsegment.component';
import { PopupPkwMietenComponent } from './hintergrundinformationen/popup-pkw-mieten/popup-pkw-mieten.component';
import { PopupPkwLeasingKaufComponent } from './hintergrundinformationen/popup-pkw-leasing-kauf/popup-pkw-leasing-kauf.component';
import { PopupPkwSharingComponent } from './hintergrundinformationen/popup-pkw-sharing/popup-pkw-sharing.component';
import {
  PopupUmweltanforderungenComponent
} from './empfehlungen/popup-umweltanforderungen/popup-umweltanforderungen.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";

import '@angular/common/locales/global/de';
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    HintergrundinformationenComponent,
    VorueberlegungenComponent,
    EmpfehlungenComponent,
    CustomStepperComponent,
    StepperGraphicDirective,
    FinishButtonDirective,
    UebersichtsgrafikComponent,
    ButtonToggleGroupComponent,
    ArrowComponent,
    InfoCardComponent,
    InfoCardButtonComponent,
    DialogTriggerDirective,
    ResizableCircleComponent,
    ImpressumComponent,
    DatenschutzComponent,
    KontaktComponent,
    PopupPkwPoolingComponent,
    PopupOEffentlicheVerkehrsmittelComponent,
    PopupBahnFernbusComponent,
    PopupOEPNVComponent,
    PopupAboOEPNVComponent,
    PopupBahncardComponent,
    PopupFahrradSharingComponent,
    PopupFahrradAboKaufLeasingComponent,
    PopupEFahrradComponent,
    PopupELastenradComponent,
    PopupFahrradPoolingComponent,
    PopupFahhradComponent,
    PopupPkwComponent,
    PopupMobilitaetsbudgetComponent,
    PopupThgVergleichComponent,
    PopupAntriebsartComponent,
    PopupDimensionierungComponent,
    PopupAusstattungComponent,
    PopupFahrzeugsegmentComponent,
    PopupPkwMietenComponent,
    PopupPkwLeasingKaufComponent,
    PopupPkwSharingComponent,
    PopupUmweltanforderungenComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatLineModule,
    MatProgressBarModule,
    MatStepperModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCardModule,
    MatExpansionModule,
    CdkStepperModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
