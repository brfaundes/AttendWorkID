import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  trabajador = {
    email: '',
    contrasena: '',
    rut_empleado: '',
    nombre: '',
    apellido: '',
    telefono: '',
    cargo: ''
  }

  listaDeTrabajadores: any[] = [];

  constructor(private database: DatabaseService) { }

  async ngOnInit() {
    try {
      this.database.getAll('trabajador').subscribe(listaDeTrabajadoresRef => {
        this.listaDeTrabajadores = listaDeTrabajadoresRef.map(trabajadorRef => {
          return trabajadorRef; // Ya no es necesario manejar manualmente el id, Firebase lo agrega automáticamente
        });
        console.log(this.listaDeTrabajadores);
      });
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  agregarTrabajador() {
    this.database.create('trabajador', this.trabajador).then(() => {
      console.log('Trabajador agregado');
      this.resetFormulario(); // Limpiar el formulario después de agregar el trabajador
    }).catch(err => {
      console.log('Error al agregar trabajador:', err);
    });
  }

  

  eliminarTrabajador(id: string) {
    this.database.delete('trabajador', id).then(() => {
      console.log('Trabajador eliminado');
    }).catch(err => {
      console.log('Error al eliminar trabajador:', err);
    });
  }

  resetFormulario() {
    this.trabajador = {
      email: '',
      contrasena: '',
      rut_empleado: '',
      nombre: '',
      apellido: '',
      telefono: '',
      cargo: ''
    };
  }

}
