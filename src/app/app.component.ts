import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, NgForm} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  newCars?: number = undefined;
  replacedCars?: number = undefined;
  publicTransport: string = '';
  bicycle: string = '';
  carPooling: string = '';
  carSharing: string = '';
  carRenting: string = '';

  onSubmit(form: NgForm) {
    console.log('Form data:', form.value);
  }
}
