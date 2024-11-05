import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as faceapi from 'face-api.js';
import { EstadisticasService } from '../services/estadisticas.service';

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

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private router: Router,
    private estadisticasService: EstadisticasService // Servicio para actualizar estadísticas
  ) {
    this.route.queryParams.subscribe(params => {
      this.rut = params['rut'];
      this.fotoUrl = params['fotoUrl'];
      this.nombre = params['nombre'];
      this.apellido = params['apellido'];
    });
  }

  async ngOnInit() {
    await this.cargarModelosFaceApi();
    this.iniciarReconocimientoFacial(); // Ejecuta automáticamente la cámara y el reconocimiento facial
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

          // Llamada al servicio para registrar el día trabajado
          const nombreCompleto = `${this.nombre} ${this.apellido}`;
          this.estadisticasService.registrarDiaTrabajado(this.rut, nombreCompleto);

          // Redirección a la página de verificación confirmada
          this.router.navigate(['/verificacion-confirmada'], {
            queryParams: { nombre: this.nombre, apellido: this.apellido }
          });
        } else {
          this.reconocimientoEnProgreso = false;
          clearInterval(intervaloDeteccion);
          this.detenerVideo();
          this.router.navigate(['/verificacion-fallida']);
        }
      }
    }, 1000); // Revisa cada segundo
  }

  detenerVideo() {
    const video = this.videoRef.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
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
