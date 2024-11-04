import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';

@Component({
  selector: 'app-verificacion-confirmada',
  templateUrl: './verificacion-confirmada.page.html',
  styleUrls: ['./verificacion-confirmada.page.scss'],
})
export class VerificacionConfirmadaPage implements OnInit {
  nombre: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Obtiene el nombre del usuario de los parámetros de la URL solo una vez en ngOnInit
    this.route.queryParams.subscribe(params => {
      this.nombre = params['nombre'];
      
    });
  }

  redirigirAlLogin() {
    this.router.navigate(['/login-rut']);
  }
}
