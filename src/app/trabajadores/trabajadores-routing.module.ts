import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrabajadoresPage } from './trabajadores.page';

const routes: Routes = [
  {
    path: '',
    component: TrabajadoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrabajadoresPageRoutingModule {}
