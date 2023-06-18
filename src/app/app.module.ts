import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {CustomMaskedInputComponent} from "./controls/custom-masked-input/custom-masked-input.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserFormComponent} from "./user-form/user-form.component";

@NgModule({
  declarations: [
    AppComponent,
    UserFormComponent,
    CustomMaskedInputComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
