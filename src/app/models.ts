export interface Trabajador {
  id?: string; // El campo id es opcional, ya que Firebase lo asigna automáticamente
  email: string;
  contrasena: string;
  rut_empleado: string;
  nombre: string;
  apellido: string;
  telefono: string;
  cargo: string;
}
