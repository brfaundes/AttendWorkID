import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: 'home', icon: 'home' },
    { title: 'Trabajadores', url: 'trabajadores', icon: 'hammer' },
    { title: 'Calendario', url: '/folder/favorites', icon: 'calendar' },
  ];

  public labels = [{title: 'Cerrar sesion', url: 'login', icon: 'exit'}];

  constructor() {}
}

