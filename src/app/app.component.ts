import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {DataGrid, ISTLEER, ODER, UND, WAHR, WENNS} from "./data-grid";
import {Empfehlungslisten_data, Fragen_Prototyp_Einzelfahrzeug_data} from "./data";
import {debounceTime, filter} from "rxjs";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


}

