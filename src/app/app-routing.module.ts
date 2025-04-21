import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartComponent} from "./start/start.component";
import {ImpressumComponent} from "./impressum/impressum.component";
import {DatenschutzComponent} from "./datenschutz/datenschutz.component";
import {KontaktComponent} from "./kontakt/kontakt.component";

const routes: Routes = [
  {
    path: '',
    component: StartComponent,
    pathMatch: 'full',
    title: 'Wärmepumpen'
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
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "disabled", initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
