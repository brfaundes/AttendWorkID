import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificacionFallidaPage } from './verificacion-fallida.page';

const routes: Routes = [
  {
    path: '',
    component: VerificacionFallidaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificacionFallidaPageRoutingModule {}
