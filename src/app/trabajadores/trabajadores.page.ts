import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { Trabajador } from '../models';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-trabajadores',
  templateUrl: './trabajadores.page.html',
  styleUrls: ['./trabajadores.page.scss'],
})
export class TrabajadoresPage implements OnInit {
  nombreTrabajador: string = '';
  rutBusqueda: string = '';
  trabajadorEditandoId: string | null = null;
  trabajador: Trabajador = {
    email: '',
    contrasena: '',
    rut_empleado: '',
    nombre: '',
    apellido: '',
    telefono: '',
    cargo: '',
    fotoUrl: '' // Nueva propiedad para almacenar la URL de la foto
  };

  listaDeTrabajadores: Trabajador[] = [];
  listaCompletaDeTrabajadores: Trabajador[] = [];
  isAdmin: boolean = false;
  selectedImage: File | null = null; // Imagen para agregar trabajador
  selectedEditImage: File | null = null; // Imagen para editar trabajador

  constructor(
    private database: DatabaseService, 
    private modalController: ModalController,
    private alertController: AlertController,
    private storage: AngularFireStorage
  ) {}

  async ngOnInit() {
    this.checkUserRole();
    try {
      this.database.getAll('trabajador').subscribe(listaDeTrabajadoresRef => {
        this.listaCompletaDeTrabajadores = listaDeTrabajadoresRef;
        this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores];
      });
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  checkUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.cargo === 'administrador';
  }

  // Método para seleccionar imagen al agregar un nuevo trabajador
  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  async agregarTrabajador() {
    if (this.validarTrabajador()) {
      if (this.selectedImage) {
        const filePath = `trabajadores/${Date.now()}_${this.selectedImage.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedImage);

        uploadTask.snapshotChanges()
          .pipe(finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.trabajador.fotoUrl = url; // Guardar la URL de la foto
              this.guardarTrabajador();
            });
          }))
          .subscribe();
      } else {
        this.guardarTrabajador();
      }
    }
  }

  async guardarTrabajador() {
    try {
      await this.database.create('trabajador', this.trabajador);
      console.log('Trabajador agregado');
      this.resetFormulario();
      this.actualizarListaTrabajadores();
      this.seguirAgregandoTrabajadores();
    } catch (err) {
      console.error('Error al agregar trabajador:', err);
    }
  }

  // Método para seleccionar nueva imagen al editar un trabajador
  onEditImageSelected(event: any) {
    this.selectedEditImage = event.target.files[0];
  }

  async editarTrabajador() {
    if (this.validarTrabajador() && this.trabajadorEditandoId) {
      try {
        if (this.selectedEditImage) {
          const filePath = `trabajadores/${Date.now()}_${this.selectedEditImage.name}`;
          const fileRef = this.storage.ref(filePath);
          const uploadTask = this.storage.upload(filePath, this.selectedEditImage);

          uploadTask.snapshotChanges()
            .pipe(finalize(() => {
              fileRef.getDownloadURL().subscribe((url) => {
                this.trabajador.fotoUrl = url; // Actualizar la URL de la foto
                this.actualizarTrabajador();
              });
            }))
            .subscribe();
        } else {
          // Si no hay nueva imagen, actualizar solo los demás datos
          this.actualizarTrabajador();
        }
      } catch (err) {
        console.log('Error al editar trabajador:', err);
      }
    } else {
      console.log('Por favor, completa todos los campos o selecciona un trabajador para editar.');
    }
  }

  async actualizarTrabajador() {
    if (this.trabajadorEditandoId) {
      try {
        await this.database.update('trabajador', this.trabajadorEditandoId, this.trabajador);
        console.log('Trabajador editado');
        this.resetFormulario();
        this.actualizarListaTrabajadores();
        await this.modalController.dismiss();
      } catch (err) {
        console.log('Error al actualizar trabajador:', err);
      }
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
            this.editarTrabajador();
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
          text: 'Sí',
          role: 'cancel',
          handler: () => {
            this.resetFormulario();
          }
        },
        {
          text: 'No',
          handler: () => {
            this.modalController.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  cargarTrabajadorParaEditar(trabajador: Trabajador) {
    this.trabajador = { ...trabajador };
    this.trabajadorEditandoId = trabajador.id || null;
  }

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
    if (!email || !rut_empleado || !nombre) {
      this.mostrarAlerta('Error', 'Por favor, completa todos los campos.');
      return false;
    }
    const nombreValido = /^[a-zA-Z\s]+$/.test(nombre);
    if (!nombreValido) {
      this.mostrarAlerta('Error', 'El nombre solo debe contener letras y espacios.');
      return false;
    }
    const emailValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    if (!emailValido) {
      this.mostrarAlerta('Error', 'Por favor, ingresa un correo electrónico válido.');
      return false;
    }
    if (rut_empleado.length > 10) {
      this.mostrarAlerta('Error', 'El RUT no debe tener más de 10 caracteres.');
      return false;
    }
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
    const query = this.rutBusqueda?.trim().toLowerCase();
    if (query) {
      this.listaDeTrabajadores = this.listaCompletaDeTrabajadores.filter(trabajador =>
        trabajador.rut_empleado.toLowerCase().includes(query) || 
        trabajador.nombre.toLowerCase().includes(query)
      );
    } else {
      this.listaDeTrabajadores = [...this.listaCompletaDeTrabajadores];
    }
  }

  eliminarTrabajador(id: string) {
    this.database.delete('trabajador', id).then(() => {
      console.log('Trabajador eliminado');
      this.actualizarListaTrabajadores();
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
            this.eliminarTrabajador(id);
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
      cargo: '',
      fotoUrl: ''
    };
    this.selectedImage = null;
    this.selectedEditImage = null;
  }
}
