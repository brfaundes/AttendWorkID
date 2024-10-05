import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trabajador } from '../models'; 

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: AngularFirestore) {} // Usar AngularFirestore

  // Crear un nuevo documento en una colección
  async create(collectionName: string, data: Trabajador): Promise<void | any> {
    try {
      const collectionRef = this.firestore.collection(collectionName); // Usar AngularFirestore
      return await collectionRef.add(data);
    } catch (error) {
      console.log('Error en create:', error);
      return null;
    }
  }

  // Obtener todos los documentos de una colección
  getAll(collectionName: string): Observable<Trabajador[]> {
    return this.firestore.collection(collectionName).snapshotChanges().pipe(
      map((actions: any[]) => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Trabajador;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  // Obtener un documento por su ID
  getById(collectionName: string, id: string): Observable<Trabajador | undefined> {
    return this.firestore.doc(`${collectionName}/${id}`).valueChanges() as Observable<Trabajador>;
  }

  // Actualizar un documento por su ID
  async update(collectionName: string, id: string, data: Trabajador): Promise<void | any> {
    try {
      const docRef = this.firestore.doc(`${collectionName}/${id}`);
      return await docRef.update(data);
    } catch (error) {
      console.log('Error en update:', error);
      return null;
    }
  }

  // Eliminar un documento por su ID
  async delete(collectionName: string, id: string): Promise<void | any> {
    try {
      const docRef = this.firestore.doc(`${collectionName}/${id}`);
      return await docRef.delete();
    } catch (error) {
      console.log('Error en delete:', error);
      return null;
    }
  }
}
