import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReconocimientoFacialPage } from './reconocimiento-facial.page';

const routes: Routes = [
  {
    path: '',
    component: ReconocimientoFacialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReconocimientoFacialPageRoutingModule {}
