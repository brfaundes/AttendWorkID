import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { AlertController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  rutEmpleado: string = ''; // RUT del usuario para el login
  contrasena: string = '';  // Contraseña del usuario

  constructor(
    private router: Router,
    private loginService: LoginService,
    private alertController: AlertController,
    private menuController: MenuController
  ) {}

  ngOnInit() {
    this.menuController.enable(false); // Deshabilitar el menú en la página de login
  }

  // Método para manejar el login
  login() {
    this.loginService.loginWithRutAndPassword(this.rutEmpleado, this.contrasena).subscribe(
      (trabajadores: any[]) => {
        const trabajador = trabajadores[0]; // Se espera que haya un solo trabajador que coincida

        if (trabajador) {
          // Guardar la información del usuario en localStorage, incluyendo su cargo
          localStorage.setItem('user', JSON.stringify(trabajador));

          // Verificar si el usuario es administrador
          if (trabajador.cargo === 'administrador') {
            // Si es administrador, redirigir a la página de administración completa
            this.router.navigate(['/trabajadores']); // Aquí puedes ajustar la ruta si es diferente
          } else {
            // Si no es administrador, redirigir a una vista con acceso limitado
            this.router.navigate(['/trabajadores']); // También puedes usar una página limitada si tienes una
          }

          // Habilitar el menú
          this.menuController.enable(true);
        } else {
          this.showAlert('Error', 'RUT o contraseña incorrectos.');
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.showAlert('Error', 'Ocurrió un error al iniciar sesión.');
      }
    );
  }

  // Mostrar una alerta en caso de error
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
