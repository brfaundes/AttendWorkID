import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular'; // Importar ModalController
import { DatabaseService } from '../services/database.service';
import { Trabajador } from '../models';
import {AngularFireStorage} from '@angular/fire/compat/storage';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {

  nombreTrabajador: string = ''; //variable para almacenar el nombre del trabajador
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
  };

  listaDeTrabajadores: any[] = [];
  listaCompletaDeTrabajadores: Trabajador[] = []; // Lista completa de trabajadores sin filtrar
  isAdmin: boolean = false; // Variable para verificar si el usuario es administrador

  constructor(
    private database: DatabaseService, 
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  // Método que se ejecuta al cargar la página
  async ngOnInit() {
    this.checkUserRole(); // Comprobar si el usuario es administrador
    try {
      this.database.getAll('trabajador').subscribe(listaDeTrabajadoresRef => {
        this.listaCompletaDeTrabajadores = listaDeTrabajadoresRef; // Carga la lista completa
        this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores]; // Inicialmente mostramos todos
      });
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  // Método para verificar si el usuario tiene el cargo de administrador
  checkUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.cargo === 'administrador') {
      this.isAdmin = true; // Usuario es administrador
    } else {
      this.isAdmin = false; // Usuario no es administrador
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
    }
  }

  async editarTrabajador() {
    if (this.validarTrabajador() && this.trabajadorEditandoId) {
      try {
        await this.database.update('trabajador', this.trabajadorEditandoId, this.trabajador);
        console.log('Trabajador editado');
        this.resetFormulario(); // Limpiamos el formulario después de editar
        this.actualizarListaTrabajadores(); // Actualizamos la lista de trabajadores
        await this.modalController.dismiss(); // Cerrar modal al agregar trabajador
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
          }
        }
      ]
    });
    await alert.present();
  }

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
            this.modalController.dismiss(); // Cerrar modal al agregar
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

  validarTrabajador(): boolean {
    const { email, rut_empleado, nombre } = this.trabajador;
  
    // Validar que todos los campos estén completos
    if (!email || !rut_empleado || !nombre) {
      this.mostrarAlerta('Error', 'Por favor, completa todos los campos.');
      return false;
    }
  
    // Validar formato del nombre (solo letras y espacios)
    const nombreValido = /^[a-zA-Z\s]+$/.test(nombre);
    if (!nombreValido) {
      this.mostrarAlerta('Error', 'El nombre solo debe contener letras y espacios.');
      return false;
    }
  
    // Validar formato de correo electrónico
    const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if (!emailValido) {
      this.mostrarAlerta('Error', 'Por favor, ingresa un correo electrónico válido.');
      return false;
    }
  
    // Validar que el RUT no sea mayor a 10 caracteres
    const rutLimpio = rut_empleado.replace(/[^0-9kK]/g, '');
    if (rut_empleado.length > 10) {
      this.mostrarAlerta('Error', 'El RUT no debe tener más de 10 caracteres.');
      return false;
    }else {
      
    }

    
  
    // Si todas las validaciones pasan
    return true;
  }
  
  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  buscarPorRut() {
    const query = this.rutBusqueda?.trim().toLowerCase(); // Convertir el término de búsqueda a minúsculas
  
    if (query) {
      // Filtrar la lista completa de trabajadores buscando coincidencias en RUT o nombre
      this.listaDeTrabajadores = this.listaCompletaDeTrabajadores.filter(trabajador =>
        trabajador.rut_empleado.toLowerCase().includes(query) || 
        trabajador.nombre.toLowerCase().includes(query)
      );
    } else {
      // Si no hay búsqueda, restaurar la lista completa
      this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores];
    }
  }



  eliminarTrabajador(id: string) {
    this.database.delete('trabajador', id).then(() => {
      console.log('Trabajador eliminado');
      this.actualizarListaTrabajadores(); // Refrescar la lista después de eliminar
    }).catch(err => {
      console.log('Error al eliminar trabajador:', err);
    });
  }

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
