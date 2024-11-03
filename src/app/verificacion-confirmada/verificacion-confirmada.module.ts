import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerificacionConfirmadaPageRoutingModule } from './verificacion-confirmada-routing.module';

import { VerificacionConfirmadaPage } from './verificacion-confirmada.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerificacionConfirmadaPageRoutingModule
  ],
  declarations: [VerificacionConfirmadaPage]
})
export class VerificacionConfirmadaPageModule {}
