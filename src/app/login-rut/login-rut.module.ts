import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginRutPageRoutingModule } from './login-rut-routing.module';

import { LoginRutPage } from './login-rut.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginRutPageRoutingModule
  ],
  declarations: [LoginRutPage]
})
export class LoginRutPageModule {}
