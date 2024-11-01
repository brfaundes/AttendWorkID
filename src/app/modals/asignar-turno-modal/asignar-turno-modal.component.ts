import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../../services/calendar.service';

@Component({
  selector: 'app-asignar-turno-modal',
  templateUrl: './asignar-turno-modal.component.html',
  styleUrls: ['./asignar-turno-modal.component.scss'],
})
export class AsignarTurnoModalComponent {
  @Input() selectedDate!: string; // Recibe la fecha seleccionada del calendario
  employees: any[] = [];
  selectedEmployee: any;
  startTime: string = '';
  endTime: string = '';

  constructor(private modalController: ModalController, private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  // Cargar empleados
  loadEmployees() {
    this.databaseService.getEmployees().subscribe((data: any[]) => {
      this.employees = data; // Asignar los empleados a la lista para el select
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  // Método para asignar el turno
  assignShift() {
    if (!this.selectedEmployee || !this.selectedEmployee.rut_empleado) {
      console.error('Empleado no seleccionado o sin ID válido');
      return;
    }
  
    const formattedDate = this.selectedDate.split('T')[0]; // Almacenar solo la fecha

    // Obtener solo las horas de startTime y endTime en formato HH:mm
    const formattedStartTime = this.extractTime(this.startTime);
    const formattedEndTime = this.extractTime(this.endTime);
  
    const shiftData = {
      employeeID: this.selectedEmployee.rut_empleado,  
      employeeName: this.selectedEmployee.nombre,
      date: formattedDate, // Almacenar solo la fecha
      startTime: formattedStartTime, // Solo la hora
      endTime: formattedEndTime,     // Solo la hora
    };
  
    console.log('Datos a subir:', shiftData);
  
    // crear el turno
    this.databaseService.create('shifts', shiftData)
      .then(() => {
        console.log('Turno asignado correctamente');
        this.closeModal(); // Cerrar el modal al terminar
      })
      .catch((error) => {
        console.error('Error al asignar el turno: ', error);
      });
  }

  // Función para extraer solo la hora en formato HH:mm
  extractTime(dateTime: string): string {
    if (!dateTime) return '';

    const timePart = dateTime.split('T')[1];  // Obtener la parte después de "T"
    return timePart ? timePart.substring(0, 5) : '';  // Devolver solo HH:mm
  }
}
