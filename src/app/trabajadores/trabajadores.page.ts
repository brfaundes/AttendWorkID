import { Component} from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})

export class TrabajadoresPage {

  trabajador={
        email:"123123",
        contrasena:"",
        rut_empleado:"",
        nombre:"aaa",
        apellido:"",
        telefono:"",
        cargo:""

  }

  constructor(private database:DatabaseService) { }

  agregarTrabajador(){
    this.database.create('trabajador',this.trabajador);
  }


}