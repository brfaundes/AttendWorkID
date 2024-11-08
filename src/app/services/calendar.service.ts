import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of  } from 'rxjs';
import { switchMap,map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private firestore: AngularFirestore) {}

  // Método para crear un documento en una colección
  async create(collection: string, data: any) {
    return await this.firestore.collection(collection).add(data);
  }

  // Método para obtener todos los turnos
  getAllShifts(): Observable<any[]> {
    return this.firestore.collection('shifts').valueChanges();
  }
  

  // Obtener turnos filtrados por fecha
  getShiftsByDate(date: string): Observable<any[]> {
    return this.firestore
      .collection('shifts', (ref) => ref.where('date', '==', date))
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id; // extrae id
            return { id, ...data };
          });
        })
      );
  }

  // Método para obtener la lista de empleados desde Firebase
  getEmployees(): Observable<any[]> {
    return this.firestore.collection('trabajador').valueChanges();
  }

  // Método para eliminar un turno
  async deleteShift(shiftId: string): Promise<void> {
    return await this.firestore.collection('shifts').doc(shiftId).delete();
  }

  // Método para actualizar un turno
  updateShift(shiftId: string, updatedData: any) {
    return this.firestore.collection('shifts').doc(shiftId).update(updatedData);
  }

  // Método para buscar un trabajador
  loginWithRutAndPassword(rutEmpleado: string, contrasena: string): Observable<any[]> {
    return this.firestore
      .collection('trabajador', (ref) =>
        ref.where('rut_empleado', '==', rutEmpleado).where('contrasena', '==', contrasena)
      )
      .valueChanges();
  }
}
