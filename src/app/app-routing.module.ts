import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartComponent} from "./start/start.component";
import {HintergrundinformationenComponent} from "./hintergrundinformationen/hintergrundinformationen.component";
import {VorueberlegungenComponent} from "./vorueberlegungen/vorueberlegungen.component";
import {EmpfehlungenComponent} from "./empfehlungen/empfehlungen.component";

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
