import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verificacion-confirmada',
  templateUrl: './verificacion-confirmada.page.html',
  styleUrls: ['./verificacion-confirmada.page.scss'],
})
export class VerificacionConfirmadaPage implements OnInit {
  nombreUsuario: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtiene el nombre del usuario de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.nombreUsuario = params['nombreUsuario'] || 'Usuario';
    });
  }
}
