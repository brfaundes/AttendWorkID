import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRutPage } from './login-rut.page';

const routes: Routes = [
  {
    path: '',
    component: LoginRutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRutPageRoutingModule {}
