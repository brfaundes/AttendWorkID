import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'trabajadores',
    loadChildren: () => import('./trabajadores/trabajadores.module').then( m => m.TrabajadoresPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'calendario',
    loadChildren: () => import('./calendario/calendario.module').then( m => m.CalendarioModule)
  },
  {
    path: 'login-rut',
    loadChildren: () => import('./login-rut/login-rut.module').then( m => m.LoginRutPageModule)
  },
  {
    path: 'reconocimiento-facial',
    loadChildren: () => import('./reconocimiento-facial/reconocimiento-facial.module').then( m => m.ReconocimientoFacialPageModule)
  },
  {
    path: 'verificacion-confirmada',
    loadChildren: () => import('./verificacion-confirmada/verificacion-confirmada.module').then( m => m.VerificacionConfirmadaPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
