import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  constructor(private firestore: AngularFirestore) {}

  /**
   * Incrementa el contador de `diasTrabajados` para un empleado en el mes actual.
   * @param rut_empleado - RUT único del empleado
   * @param nombreCompleto - Nombre completo del empleado
   */
  async registrarDiaTrabajado(rut_empleado: string, nombreCompleto: string) {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;

    // Referencia al documento específico dentro de la colección 'estadisticas_asistencia'
    const estadisticaDoc = this.firestore.doc(`estadisticas_asistencia/${rut_empleado}_${mesActual}`);

    try {
      // Realiza la consulta del documento
      const estadisticaSnap = await estadisticaDoc.get().toPromise();

      // Verifica si el snapshot es válido antes de continuar
      if (estadisticaSnap && estadisticaSnap.exists) {
        // Si el documento existe, incrementamos `diasTrabajados`
        await estadisticaDoc.update({
          diasTrabajados: firebase.firestore.FieldValue.increment(1)
        });
      } else {
        // Si el documento no existe, lo creamos con los valores iniciales
        await estadisticaDoc.set({
          rut_empleado,
          nombreCompleto,
          mes: mesActual,
          diasTrabajados: 1,
          ausencias: 0,
          llegadasTarde: 0
        });
      }

      console.log('Día trabajado registrado con éxito');
    } catch (error) {
      console.error('Error al registrar el día trabajado:', error);
    }
  }

  /**
   * Obtiene las estadísticas de asistencia para el mes actual.
   * @returns Un Observable de las estadísticas mensuales.
   */
  getEstadisticasMensuales(): Observable<any[]> {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;

    // Filtramos solo los registros del mes actual
    const estadisticasRef = this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesActual)
    );

    return estadisticasRef.valueChanges({ idField: 'id' });
  }
}
