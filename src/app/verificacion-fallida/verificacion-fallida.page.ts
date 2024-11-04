import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router  } from '@angular/router';

@Component({
  selector: 'app-verificacion-fallida',
  templateUrl: './verificacion-fallida.page.html',
  styleUrls: ['./verificacion-fallida.page.scss'],
})
export class VerificacionFallidaPage implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
  }
  redirigirAlLogin() {
    this.router.navigate(['/login-rut']);
  }
}
