import { Component, OnInit } from '@angular/core';
import { LoginService } from './services/login.service';
import { Trabajador } from './models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  trabajador: Trabajador | null = null;
  public appPages = [
    { title: 'Inicio', url: 'home', icon: 'home' },
    { title: 'Trabajadores', url: 'trabajadores', icon: 'hammer' },
  ];

  public labels = [{ title: 'Cerrar sesión', url: 'login', icon: 'exit' }];
  isAdmin: boolean = false;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit() {
    this.restoreSession(); // Restaurar la sesión si ya está activa
    this.subscribeToUserChanges();
  }

  private restoreSession() {
    // Verifica si hay un usuario almacenado en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.trabajador = JSON.parse(storedUser); // Carga el usuario
      this.isAdmin = this.trabajador?.cargo === 'administrador'; // Verifica si es admin
      this.updateAppPages(); // Actualiza las páginas del menú según el rol
      
      // Llama a setAuthenticatedUser solo si trabajador no es null
      if (this.trabajador) {
        this.loginService.setAuthenticatedUser(this.trabajador); // Restaura el usuario en el servicio de autenticación
      }
    }
  }

  private subscribeToUserChanges() {
    this.loginService.getCurrentUser().subscribe((trabajador) => {
      this.trabajador = trabajador;
      if (trabajador) {
        localStorage.setItem('user', JSON.stringify(trabajador)); // Guarda el usuario en localStorage
      }
      this.updateAppPages();
    });
  }

  logout() {
    this.loginService.logout();
    this.trabajador = null;
    this.isAdmin = false;

    // Restablece appPages al estado inicial
    this.appPages = [
      { title: 'Inicio', url: 'home', icon: 'home' },
      { title: 'Trabajadores', url: 'trabajadores', icon: 'hammer' }
    ];

    localStorage.removeItem('user'); // Elimina el usuario de localStorage
    this.router.navigate(['/login']);
  }

  private updateAppPages() {
    this.isAdmin = this.trabajador?.cargo === 'administrador';
    
    // Asegura que "Turnos" solo aparece para administradores
    if (this.isAdmin && !this.appPages.some(page => page.title === 'Turnos')) {
      this.appPages.push({ title: 'Turnos', url: 'calendario', icon: 'calendar' });
    } else if (!this.isAdmin) {
      this.appPages = this.appPages.filter(page => page.title !== 'Turnos');
    }
  }
}
