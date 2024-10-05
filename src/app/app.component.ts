import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { archive, heart, trash } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/folder/inbox', icon: 'home' },
    { title: 'Trabajadores', url: 'trabajadores', icon: 'hammer' },
    { title: 'Calendario', url: '/folder/favorites', icon: 'calendar' },
  ];

  public labels = [{title: 'Cerrar sesion', url: 'login', icon: 'exit'}];

  constructor() {addIcons({ archive, heart, trash });}
  
}

