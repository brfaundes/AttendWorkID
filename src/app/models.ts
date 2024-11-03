export interface Trabajador {
  id?: string;
  email: string;
  contrasena: string;
  rut_empleado: string;
  nombre: string;
  apellido: string;
  telefono: string;
  cargo: string;
  fotoUrl?: string; // Nueva propiedad para la URL de la foto
}