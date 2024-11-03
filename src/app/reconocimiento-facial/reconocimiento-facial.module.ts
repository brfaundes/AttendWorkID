import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReconocimientoFacialPageRoutingModule } from './reconocimiento-facial-routing.module';

import { ReconocimientoFacialPage } from './reconocimiento-facial.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReconocimientoFacialPageRoutingModule
  ],
  declarations: [ReconocimientoFacialPage]
})
export class ReconocimientoFacialPageModule {}
