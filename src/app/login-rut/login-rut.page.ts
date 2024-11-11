import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LoginService } from '../services/login.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login-rut',
  templateUrl: './login-rut.page.html',
  styleUrls: ['./login-rut.page.scss'],
})
export class LoginRutPage {
  rutEmpleado: string = ''; // RUT del usuario para el login

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
    this.loginService.loginWithRut(this.rutEmpleado).subscribe(
      (trabajadores: any[]) => {
        const trabajador = trabajadores[0]; // Se espera que haya un solo trabajador que coincida

        if (trabajador) {
          // Guardar la información del usuario en localStorage, incluyendo su cargo
          localStorage.setItem('user', JSON.stringify(trabajador));

          this.router.navigate(['/reconocimiento-facial'], 
            { queryParams: {  rut: this.rutEmpleado, 
                              fotoUrl: trabajador.fotoUrl,
                              nombre: trabajador.nombre,
                              apellido: trabajador.apellido } });

          // Habilitar el menú
          this.menuController.enable(true);
        } else {
          this.showAlert('Error', 'RUT incorrecto.');
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
  goBack() {
    this.router.navigate(['/home']); // Navega a la página principal
  }
}

