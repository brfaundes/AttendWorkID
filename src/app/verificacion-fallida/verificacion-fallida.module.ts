import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificacionFallidaPageRoutingModule } from './verificacion-fallida-routing.module';

import { VerificacionFallidaPage } from './verificacion-fallida.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificacionFallidaPageRoutingModule
  ],
  declarations: [VerificacionFallidaPage]
})
export class VerificacionFallidaPageModule {}
