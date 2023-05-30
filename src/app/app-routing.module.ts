import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartComponent} from "./start/start.component";
import {HintergrundinformationenComponent} from "./hintergrundinformationen/hintergrundinformationen.component";
import {VorueberlegungenComponent} from "./vorueberlegungen/vorueberlegungen.component";
import {EmpfehlungenComponent} from "./empfehlungen/empfehlungen.component";
import {ImpressumComponent} from "./impressum/impressum.component";
import {DatenschutzComponent} from "./datenschutz/datenschutz.component";
import {KontaktComponent} from "./kontakt/kontakt.component";

const routes: Routes = [
  {
    path: '',
    component: StartComponent,
    pathMatch: 'full',
  },
  {
    path: 'hintergrundinformationen',
    component: HintergrundinformationenComponent,
    title: 'Hintergrundinformationen'
  },
  {
    path: 'vorueberlegungen',
    component: VorueberlegungenComponent,
    title: 'Vorüberlegungen'
  },
  {
    path: 'empfehlungen',
    component: EmpfehlungenComponent,
    title: 'Empfehlungen'
  },
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
