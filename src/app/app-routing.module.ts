import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'trabajadores',
    loadChildren: () => import('./trabajadores/trabajadores.module').then(m => m.TrabajadoresPageModule),
    canActivate: [AuthGuard] // Solo para usuarios autenticados y administradores
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard] // Solo para administradores
  },
  {
    path: 'calendario',
    loadChildren: () => import('./calendario/calendario.module').then(m => m.CalendarioModule),
    canActivate: [AdminGuard] // Solo para administradores
  },
  {
    path: 'login-rut',
    loadChildren: () => import('./login-rut/login-rut.module').then(m => m.LoginRutPageModule)
  },
  {
    path: 'reconocimiento-facial',
    loadChildren: () => import('./reconocimiento-facial/reconocimiento-facial.module').then(m => m.ReconocimientoFacialPageModule),

  },
  {
    path: 'verificacion-confirmada',
    loadChildren: () => import('./verificacion-confirmada/verificacion-confirmada.module').then(m => m.VerificacionConfirmadaPageModule),

  },
  {
    path: 'verificacion-fallida',
    loadChildren: () => import('./verificacion-fallida/verificacion-fallida.module').then(m => m.VerificacionFallidaPageModule),

  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }