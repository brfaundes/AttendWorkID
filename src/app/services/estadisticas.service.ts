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
   * Registra el día trabajado y verifica si el empleado llegó tarde.
   * @param rut_empleado - RUT único del empleado
   * @param nombreCompleto - Nombre completo del empleado
   * @param horaActual - Hora de verificación en formato "HH:mm"
   */
  async registrarDiaTrabajado(rut_empleado: string, nombreCompleto: string, horaActual: string) {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;
    const fechaString = fechaActual.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD

    // Referencia al documento específico dentro de la colección 'estadisticas_asistencia'
    const estadisticaDoc = this.firestore.doc(`estadisticas_asistencia/${rut_empleado}_${mesActual}`);
    const turnoRef = this.firestore.collection('shifts', ref =>
      ref.where('employeeID', '==', rut_empleado).where('date', '==', fechaString)
    );

    try {
      console.log(`Buscando turno para empleadoID: ${rut_empleado} en fecha: ${fechaString}`);
      const turnoSnapshot = await turnoRef.get().toPromise();

      if (!turnoSnapshot || turnoSnapshot.empty) {
        console.log('No se encontró turno para hoy');
        return;
      }

      const turnoData = turnoSnapshot.docs[0].data() as { startTime: string };
      const startTime = turnoData.startTime;

      // Convertir horas a minutos para comparar
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [currentHour, currentMinute] = horaActual.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const currentInMinutes = currentHour * 60 + currentMinute;

      const llegoTarde = currentInMinutes > startInMinutes;

      console.log(`Hora inicio turno: ${startTime}, Hora actual: ${horaActual}`);
      console.log(`Minutos de inicio: ${startInMinutes}, Minutos actuales: ${currentInMinutes}`);
      console.log(`¿Llego tarde? ${llegoTarde}`);

      const estadisticaSnap = await estadisticaDoc.get().toPromise();

      if (estadisticaSnap && estadisticaSnap.exists) {
        await estadisticaDoc.update({
          diasTrabajados: firebase.firestore.FieldValue.increment(1),
          ...(llegoTarde ? { llegadasTarde: firebase.firestore.FieldValue.increment(1) } : {})
        });
      } else {
        await estadisticaDoc.set({
          rut_empleado,
          nombreCompleto,
          mes: mesActual,
          diasTrabajados: 1,
          ausencias: 0,
          llegadasTarde: llegoTarde ? 1 : 0
        });
      }

      console.log('Día trabajado y verificación de atraso registrados con éxito');
    } catch (error) {
      console.error('Error al registrar el día trabajado y verificar atraso:', error);
    }
  }

  /**
   * Obtiene las estadísticas de asistencia para el mes actual.
   * @returns Un Observable de las estadísticas mensuales.
   */
  getEstadisticasMensuales(): Observable<any[]> {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;

    const estadisticasRef = this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesActual)
    );

    return estadisticasRef.valueChanges({ idField: 'id' });
  }
}
