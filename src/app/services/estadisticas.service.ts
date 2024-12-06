import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Observable, combineLatest, of } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  constructor(private firestore: AngularFirestore, private router: Router, private databaseService: DatabaseService) {}

  async registrarDiaTrabajado(rut_empleado: string, nombreCompleto: string, horaActual: string) {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;
    const fechaString = fechaActual.toLocaleDateString('en-CA');

    const estadisticaDoc = this.firestore.doc(`estadisticas_asistencia/${rut_empleado}_${mesActual}`);
    const turnoRef = this.firestore.collection('shifts', ref =>
      ref.where('employeeID', '==', rut_empleado).where('date', '==', fechaString)
    );

    try {
      const turnoSnapshot = await turnoRef.get().toPromise();
      if (!turnoSnapshot || turnoSnapshot.empty) return;

      const turnoData = turnoSnapshot.docs[0].data() as { startTime: string };
      const [startHour, startMinute] = turnoData.startTime.split(':').map(Number);
      const [currentHour, currentMinute] = horaActual.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const currentInMinutes = currentHour * 60 + currentMinute;
      const llegoTarde = currentInMinutes > startInMinutes;

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
    } catch (error) {
      console.error('Error al registrar el día trabajado y verificar atraso:', error);
    }
  }

  

  // Método original sin filtros
  getEstadisticasMensuales(): Observable<any[]> {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;

    const estadisticasRef = this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesActual)
    );

    return estadisticasRef.valueChanges({ idField: 'id' });
  }

  

  // Método original para trabajador específico
  getEstadisticasMensualesParaTrabajador(rut_empleado: string): Observable<any> {
    const fechaActual = new Date();
    const mesActual = `${fechaActual.getFullYear()}-${('0' + (fechaActual.getMonth() + 1)).slice(-2)}`;

    return this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesActual)
         .where('rut_empleado', '==', rut_empleado)
    ).valueChanges();
  }

  // Método original para obtener estadísticas filtradas por cargo
  getEstadisticasMensualesPorCargo(cargo: string): Observable<any[]> {
    return this.databaseService.getTrabajadoresPorCargo(cargo).pipe(
      switchMap(trabajadores => {
        if (trabajadores.length === 0) return of([]);
        const estadisticasObservables = trabajadores.map(trabajador => 
          this.getEstadisticasMensualesParaTrabajador(trabajador.rut_empleado)
        );
        return combineLatest(estadisticasObservables).pipe(
          map(estadisticas => estadisticas.flat())
        );
      })
    );
  }

  // Nuevo método: obtener estadísticas de un mes/año específicos
  getEstadisticasMensualesPorFecha(year: string, month: string): Observable<any[]> {
    const mesFiltrado = `${year}-${month}`;
    const estadisticasRef = this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesFiltrado)
    );

    return estadisticasRef.valueChanges({ idField: 'id' });
  }

  // Nuevo método: obtener estadísticas de un trabajador específico en un mes/año específicos
  getEstadisticasMensualesParaTrabajadorPorFecha(rut_empleado: string, year: string, month: string): Observable<any> {
    const mesFiltrado = `${year}-${month}`;

    return this.firestore.collection('estadisticas_asistencia', ref => 
      ref.where('mes', '==', mesFiltrado)
         .where('rut_empleado', '==', rut_empleado)
    ).valueChanges();
  }

  // Nuevo método: obtener estadísticas mensuales filtradas por cargo y fecha específica
  getEstadisticasMensualesPorCargoYFecha(cargo: string, year: string, month: string): Observable<any[]> {
    const mesFiltrado = `${year}-${month}`;

    return this.databaseService.getTrabajadoresPorCargo(cargo).pipe(
      switchMap(trabajadores => {
        if (trabajadores.length === 0) return of([]);

        const estadisticasObservables = trabajadores.map(trabajador => 
          this.getEstadisticasMensualesParaTrabajadorPorFecha(trabajador.rut_empleado, year, month)
        );

        return combineLatest(estadisticasObservables).pipe(
          map(estadisticas => estadisticas.flat())
        );
      })
    );
  }
}
