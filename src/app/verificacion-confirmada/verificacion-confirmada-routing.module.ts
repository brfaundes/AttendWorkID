import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerificacionConfirmadaPage } from './verificacion-confirmada.page';

const routes: Routes = [
  {
    path: '',
    component: VerificacionConfirmadaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificacionConfirmadaPageRoutingModule {}
