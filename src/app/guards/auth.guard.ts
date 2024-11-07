import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.loginService.isLoggedIn();
    if (!isAuthenticated) {
      this.router.navigate(['/login']); // Redirige al login si no está autenticado
    }
    return isAuthenticated;
  }
}
