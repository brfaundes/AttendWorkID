import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { LoginService } from '../services/login.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  rutEmpleado: string = ''; // Cambiar a rutEmpleado para el login por RUT
  contrasena: string = '';  // Contraseña del usuario

  constructor(
    private router: Router,
    private databaseService: DatabaseService,
    private LoginService: LoginService,
    private alertController: AlertController
  ) {}

  // Método para manejar el login
  login() {
    this.LoginService.loginWithRutAndPassword(this.rutEmpleado, this.contrasena).subscribe(
      (trabajadores: any[]) => {
        const trabajador = trabajadores[0]; // Debe haber solo uno que coincida
  
        if (trabajador) {
          // Guardar la información del usuario en localStorage
          localStorage.setItem('user', JSON.stringify(trabajador));
  
          // Redirigir a la página de inicio
          this.router.navigate(['/home']);
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
