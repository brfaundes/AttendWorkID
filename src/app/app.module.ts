import { LOCALE_ID,NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

// Importar el módulo de trabajadores
import { TrabajadoresPageModule } from './trabajadores/trabajadores.module';

import { AsignarTurnoModalComponent } from './modals/asignar-turno-modal/asignar-turno-modal.component';
import { EditShiftModalComponent } from './modals/edit-shift-modal/edit-shift-modal.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    AsignarTurnoModalComponent,
    EditShiftModalComponent,
  ],
  imports: [ 
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    TrabajadoresPageModule,
    FullCalendarModule,
    FormsModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy},{provide: LOCALE_ID, useValue: 'es'}],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
