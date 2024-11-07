import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Trabajador } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<Trabajador | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private firestore: AngularFirestore) {}

  // Iniciar sesión con RUT y contraseña
  loginWithRutAndPassword(rutEmpleado: string, contrasena: string): Observable<Trabajador | null> {
    return this.firestore
      .collection<Trabajador>('trabajador', ref =>
        ref.where('rut_empleado', '==', rutEmpleado).where('contrasena', '==', contrasena)
      )
      .valueChanges()
      .pipe(
        map(users => users[0] || null),
        tap(user => {
          if (user) {
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(user); // Guardar usuario en el estado actual
          }
        }),
        catchError(error => {
          console.error('Error al autenticar:', error);
          return of(null);
        })
      );
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
  }

  // Obtener el usuario actual
  getCurrentUser(): Observable<Trabajador | null> {
    return this.currentUser$;
  }

    // Método para buscar un trabajador
    loginWithRut(rutEmpleado: string): Observable<any[]> {
      return this.firestore
        .collection('trabajador', (ref) =>
          ref.where('rut_empleado', '==', rutEmpleado)
        )
        .valueChanges();
    }

      // Método para establecer el usuario autenticado al restaurar la sesión
  setAuthenticatedUser(user: Trabajador) {
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

}
