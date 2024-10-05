import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TrabajadoresPageRoutingModule } from './trabajadores-routing.module';
import { TrabajadoresPage } from './trabajadores.page';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // <-- Importa el módulo Firestore

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrabajadoresPageRoutingModule,
    AngularFirestoreModule // <-- Añádelo aquí
  ],
  declarations: [TrabajadoresPage]
})
export class TrabajadoresPageModule {}
