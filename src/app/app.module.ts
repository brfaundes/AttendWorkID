import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { firebaseConfig } from '../environments/environment';

// Importar el módulo de trabajadores
import { TrabajadoresPageModule } from './trabajadores/trabajadores.module';

@NgModule({
  declarations: [
    AppComponent,
    // Si `TrabajadoresPage` no se usa directamente en el `AppModule`, no es necesario declararlo aquí.
  ],
  imports: [ 
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    TrabajadoresPageModule  // Asegúrate de importar este módulo
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
