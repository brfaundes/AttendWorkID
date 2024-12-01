import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { EstadisticasService } from '../services/estadisticas.service';
import { CalendarService } from '../services/calendar.service';  // Asegúrate de importar el servicio de calendar
import { MenuController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-reconocimiento-facial',
  templateUrl: './reconocimiento-facial.page.html',
  styleUrls: ['./reconocimiento-facial.page.scss'],
})
export class ReconocimientoFacialPage implements OnInit {
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  rut: string = '';
  fotoUrl: string = '';
  nombre: string = '';
  apellido: string = '';
  modelosCargados: boolean = false;
  reconocimientoEnProgreso: boolean = false;
  isModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private router: Router,
    private menuController: MenuController,
    private estadisticasService: EstadisticasService, // Servicio para estadísticas
    private calendarService: CalendarService, // Servicio para turnos
    private modalController: ModalController 

  ) {
    this.route.queryParams.subscribe(params => {
      this.rut = params['rut'];
      this.fotoUrl = params['fotoUrl'];
      this.nombre = params['nombre'];
      this.apellido = params['apellido'];
    });
  }

  async ngOnInit() {
    this.menuController.enable(false);
    await this.cargarModelosFaceApi();
    this.iniciarReconocimientoFacial();
  }

  async cargarModelosFaceApi() {
    const MODEL_URL = '/assets/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    this.modelosCargados = true;
    console.log('Modelos de face-api.js cargados');
  }

  async iniciarReconocimientoFacial() {
    if (!this.modelosCargados) {
      await this.cargarModelosFaceApi();
    }

    this.reconocimientoEnProgreso = true;
    await this.iniciarVideo();

    // Validar URL de la imagen
    if (!this.fotoUrl || !this.fotoUrl.startsWith('http')) {
      this.mostrarAlerta('Error', 'URL de imagen inválida o no disponible.', 'danger');
      return;
    }

    try {
      const imagenReferencia = await faceapi.fetchImage(this.fotoUrl);
      const referenciaRostro = await faceapi
        .detectSingleFace(imagenReferencia)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!referenciaRostro) {
        this.mostrarAlerta('Error', 'No se pudo detectar el rostro de referencia', 'danger');
        return;
      }

      this.detectarRostroEnTiempoReal(referenciaRostro.descriptor);
    } catch (error) {
      console.error('Error al cargar la imagen de referencia:', error);
      this.mostrarAlerta('Error', 'No se pudo cargar la imagen de referencia. Verifica la URL y los permisos de acceso.', 'danger');
    }
  }

  async iniciarVideo() {
    const video = this.videoRef.nativeElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      video.srcObject = stream;
      video.play();
    } catch (error) {
      this.mostrarAlerta('Error', 'No se pudo acceder a la cámara.', 'danger');
      console.error('Error al acceder a la cámara:', error);
    }
  }

  async detectarRostroEnTiempoReal(descriptorReferencia: Float32Array) {
    const video = this.videoRef.nativeElement;
    const intervaloDeteccion = setInterval(async () => {
      if (!this.reconocimientoEnProgreso) {
        clearInterval(intervaloDeteccion);
        return;
      }

      const usuarioRostro = await faceapi
        .detectSingleFace(video)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (usuarioRostro) {
        const distancia = faceapi.euclideanDistance(descriptorReferencia, usuarioRostro.descriptor);

        if (distancia < 0.6) {
          this.reconocimientoEnProgreso = false;
          clearInterval(intervaloDeteccion);
          this.detenerVideo();

          const nombreCompleto = `${this.nombre} ${this.apellido}`;

          // Obtener la hora actual en formato "HH:mm"
          const ahora = new Date();
          const horaActual = ahora.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          // Verificar si el trabajador tiene turnos asignados
          this.calendarService.getTurnosDelMesParaTrabajador(this.rut).subscribe(turnos => {
            if (turnos.length === 0) {
              // Si no tiene turnos, mostrar una alerta
              this.setOpen(true);
              //this.mostrarAlerta('Sin turnos', 'No tienes turnos asignados para este mes.', 'error');
            } else {
              // Si tiene turnos, registrar el día trabajado
              this.estadisticasService.registrarDiaTrabajado(this.rut, nombreCompleto, horaActual);

              // Redirigir a la página de verificación confirmada
              this.router.navigate(['/verificacion-confirmada'], {
                queryParams: { nombre: this.nombre, apellido: this.apellido },
              });
            }
          });
        } else {
          this.reconocimientoEnProgreso = false;
          clearInterval(intervaloDeteccion);
          this.detenerVideo();
          this.router.navigate(['/verificacion-fallida']);
        }
      }
    }, 100); // Revisa cada segundo
  }

  detenerVideo() {
    const video = this.videoRef.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }
//modal si el trabajador no tiene turno
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  async redirigirAlLogin() {
    // Cerrar el modal antes de redirigir
    const modal = await this.modalController.getTop();  // Obtener el modal activo
    if (modal) {
      await modal.dismiss();  // Cerrar el modal
    }
  
    // Redirigir al login
    this.router.navigate(['/login-rut']);
  }

  async mostrarAlerta(header: string, message: string, color: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
      cssClass: color,
    });
    await alert.present();
  }
}
