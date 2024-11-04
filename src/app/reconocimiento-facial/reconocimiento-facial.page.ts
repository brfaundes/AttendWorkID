import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-reconocimiento-facial',
  templateUrl: './reconocimiento-facial.page.html',
  styleUrls: ['./reconocimiento-facial.page.scss'],
})
export class ReconocimientoFacialPage implements OnInit {
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  rut: string = '';
  fotoUrl: string = '';
  nombreUsuario: string = '';
  modelosCargados: boolean = false;
  reconocimientoEnProgreso: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.rut = params['rut'];
      this.fotoUrl = params['fotoUrl'];
      this.nombreUsuario = params['nombre'];
    });
  }

  async ngOnInit() {
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
  }

  async iniciarReconocimientoFacial() {
    if (!this.modelosCargados) {
      await this.cargarModelosFaceApi();
    }

    this.reconocimientoEnProgreso = true;
    await this.iniciarVideo();

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
  }

  async iniciarVideo() {
    const video = this.videoRef.nativeElement;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
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
          this.router.navigate(['/verificacion-confirmada']);
        } else {
          this.mostrarAlerta(
            'Rostro no reconocido',
            'El rostro detectado no coincide con el usuario de referencia.',
            'warning'
          );
        }
      }
    }, 1000);
  }

  detenerVideo() {
    const video = this.videoRef.nativeElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string, color: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      cssClass: color,
    });
    await alert.present();
  }
}
