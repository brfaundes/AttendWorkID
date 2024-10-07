import { Component, OnInit, ViewChild  } from '@angular/core';
import { ModalController, AlertController  } from '@ionic/angular'; // Importar ModalController
import { DatabaseService } from '../services/database.service';
import {Trabajador} from '../models';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  rutBusqueda: string = ''; // Variable para almacenar el RUT de búsqueda
  trabajadorEditandoId: string | null = null; // ID del trabajador que está siendo editado

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
  listaCompletaDeTrabajadores: Trabajador[] = []; // Lista completa de trabajadores sin filtrar


  constructor(
    private database: DatabaseService, 
    private modalController: ModalController,
    private alertController: AlertController  ) { }

    async ngOnInit() {
      try {
        this.database.getAll('trabajador').subscribe(listaDeTrabajadoresRef => {
          this.listaCompletaDeTrabajadores = listaDeTrabajadoresRef; // Carga la lista completa
          this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores]; // Inicialmente mostramos todos
        });
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    }

  async agregarTrabajador() {
    if (this.validarTrabajador()) {
      try {
        await this.database.create('trabajador', this.trabajador);
        console.log('Trabajador agregado');
        this.resetFormulario(); // Limpiamos el formulario después de agregar
        this.actualizarListaTrabajadores(); // Actualizamos la lista de trabajadores
        this.seguirAgregandoTrabajadores();
      } catch (err) {
        console.log('Error al agregar trabajador:', err);
      }
    } else {
      console.log('Por favor, completa todos los campos.');
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async editarTrabajador() {
    if (this.validarTrabajador() && this.trabajadorEditandoId) {
      try {
        await this.database.update('trabajador', this.trabajadorEditandoId, this.trabajador);
        console.log('Trabajador editado');
        this.resetFormulario(); // Limpiamos el formulario después de editar
        this.actualizarListaTrabajadores(); // Actualizamos la lista de trabajadores
        await this.modalController.dismiss();//cerrar modal al agregar trabajador

      } catch (err) {
        console.log('Error al editar trabajador:', err);
      }
    } else {
      console.log('Por favor, completa todos los campos o selecciona un trabajador para editar.');
    }
  }

  async confirmarEditarTrabajador() {
    const alert = await this.alertController.create({
      header: 'Confirmar edición',
      message: '¿Estás seguro de que deseas editar este trabajador?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Edición cancelada');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.editarTrabajador(); // Llamar a la función de editar si se confirma
            this.modalController.dismiss();//cerrar modal al agregar

          }
        }
      ]
    });
    await alert.present();
  }
///Seguir agregando trabajadores
  async seguirAgregandoTrabajadores() {
    const alert = await this.alertController.create({
      message: '¿Quiere agregar otro trabajador?',
      buttons: [
        {
          text: 'Si',
          role: 'cancel',
          handler: () => {
            console.log('agregar otro');
            this.resetFormulario(); // Limpiamos el formulario después de editar
          }
        },
        {
          text: 'No',
          handler: () => {
            this.modalController.dismiss();//cerrar modal al agregar

          }
        }
      ]
    });
    await alert.present();
  }
	
  // Método para cargar los datos del trabajador que se va a editar
  cargarTrabajadorParaEditar(trabajador: Trabajador) {
    this.trabajador = { ...trabajador }; // Cargamos los datos en el formulario
    this.trabajadorEditandoId = trabajador.id || null; // Guardamos el ID para la edición
  }

    // Método para actualizar la lista de trabajadores desde Firebase
    actualizarListaTrabajadores() {
      this.database.getAll('trabajador').subscribe(listaDeTrabajadoresRef => {
        this.listaDeTrabajadores = listaDeTrabajadoresRef;
        console.log(this.listaDeTrabajadores);
      }, error => {
        console.error('Error al obtener los trabajadores:', error);
      });
    }


    validarTrabajador() {
      const { email, contrasena, rut_empleado, nombre, apellido, telefono, cargo } = this.trabajador;
      return email && contrasena && rut_empleado && nombre && apellido && telefono && cargo;
    }
  
  
    buscarPorRut() {
      const query = this.rutBusqueda.trim();
      if (query) {
        // Filtrar la lista completa de trabajadores
        this.listaDeTrabajadores = this.listaCompletaDeTrabajadores.filter(trabajador =>
          trabajador.rut_empleado.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        // Si el campo de búsqueda está vacío, restaurar la lista completa
        this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores];
      }
    }

  eliminarTrabajador(id: string) {
    this.database.delete('trabajador', id).then(() => {
      console.log('Trabajador eliminado');
    }).catch(err => {
      console.log('Error al eliminar trabajador:', err);
    });
  }

    // Confirmación para eliminar un trabajador
    async confirmarEliminarTrabajador(id: string) {
      const alert = await this.alertController.create({
        header: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este trabajador?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación cancelada');
            }
          },
          {
            text: 'Eliminar',
            handler: () => {
              this.eliminarTrabajador(id); // Llamar a la función de eliminar si se confirma
            }
          }
        ]
      });
      await alert.present();
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
