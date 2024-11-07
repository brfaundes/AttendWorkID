import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { AlertController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  rutEmpleado: string = '';
  contrasena: string = '';

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
    console.log('Intentando iniciar sesión...');

    this.loginService.loginWithRutAndPassword(this.rutEmpleado, this.contrasena).subscribe(
      (trabajador) => {
        console.log('Resultado del login:', trabajador);
        if (trabajador) {
          localStorage.setItem('user', JSON.stringify(trabajador));
          this.menuController.enable(true);
          if (trabajador.cargo === 'administrador') {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/trabajadores']);
          }
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
