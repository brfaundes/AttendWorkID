import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../../services/calendar.service';

@Component({
  selector: 'app-edit-shift-modal',
  templateUrl: './edit-shift-modal.component.html',
  styleUrls: ['./edit-shift-modal.component.scss'],
})
export class EditShiftModalComponent {
  @Input() shiftData: any; // Recibir el turno a editar
  employees: any[] = [];
  selectedEmployee: any;
  startTime: string = '';
  endTime: string = '';
  selectedDate: string = '';

  constructor(private modalController: ModalController, private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadEmployees();
    this.populateFields();
  }

  // Cargar empleados
  loadEmployees() {
    this.databaseService.getEmployees().subscribe((data: any[]) => {
      this.employees = data;

      // Asignar el empleado actual
      if (this.shiftData && this.shiftData.employeeID) {
        this.selectedEmployee = this.employees.find(emp => emp.rut_empleado === this.shiftData.employeeID);
      }
    });
  }

  // Rellenar los campos con los datos del turno
  populateFields() {
    if (this.shiftData) {
      this.selectedDate = this.shiftData.date;  // Cargar la fecha del turno
      this.startTime = this.shiftData.startTime;  // Cargar la hora de inicio
      this.endTime = this.shiftData.endTime;  // Cargar la hora de fin
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  // Método para actualizar el turno
  updateShift() {
    if (!this.selectedEmployee) {
      console.error('Empleado no seleccionado o sin ID válido');
      return;
    }
  
    // Verificar si el trabajador se seleccionó
    if (!this.shiftData || !this.shiftData.id) {
      console.error('ID del turno no está definido');
      return;
    }
  
    const formattedDate = this.selectedDate.split('T')[0]; // Almacenar solo la fecha
  
    // Verificar si los tiempos de inicio y fin están definidos.
    const formattedStartTime = this.startTime ? this.extractTime(this.startTime) : this.shiftData.startTime;
    const formattedEndTime = this.endTime ? this.extractTime(this.endTime) : this.shiftData.endTime;
  
    const updatedShiftData = {
      employeeID: this.selectedEmployee.rut_empleado,
      employeeName: this.selectedEmployee.nombre,
      date: formattedDate, // Solo la fecha
      startTime: formattedStartTime, // Solo la hora
      endTime: formattedEndTime,     // Solo la hora
    };
  
    console.log('Datos a actualizar:', updatedShiftData);
  
    // Llama a Firebase enviando el ID para actualizar
    this.databaseService.updateShift(this.shiftData.id, updatedShiftData)
      .then(() => {
        console.log('Turno actualizado correctamente');
        this.closeModal();
      })
      .catch((error) => {
        console.error('Error al actualizar el turno: ', error);
      });
  }

  // Función para extraer la hora en formato HH:mm
  extractTime(dateTime: string): string {
    if (!dateTime) return '';
    if (dateTime.includes('T')) {
      const timePart = dateTime.split('T')[1];  // Obtener la parte después de "T"
      return timePart ? timePart.substring(0, 5) : '';  // Devolver solo HH:mm
    }
    return dateTime;
  }
}