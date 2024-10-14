import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private firestore: AngularFirestore) {}

  //  iniciar sesión
  login() {
    this.isAuthenticatedSubject.next(true);
  }

  //  cerrar sesión
  logout() {
    this.isAuthenticatedSubject.next(false);
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
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
