import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DatabaseService } from '../../services/calendar.service';

interface Employee {
  nombre: string;
  rut_empleado: string;
  // Otros campos si son necesarios
}

@Component({
  selector: 'app-asignar-turno-modal',
  templateUrl: './asignar-turno-modal.component.html',
  styleUrls: ['./asignar-turno-modal.component.scss'],
})
export class AsignarTurnoModalComponent implements OnInit {
  @Input() selectedDates: string[] = []; // Arreglo para almacenar múltiples fechas
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  startTime: string = '';
  endTime: string = '';
  minDate: string = '';

  constructor(private modalController: ModalController, private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadEmployees();
    this.setMinDate();
  }

  // Configurar la fecha mínima como la fecha actual
  setMinDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Cargar empleados
  loadEmployees() {
    this.databaseService.getEmployees().subscribe((data: Employee[]) => {
      this.employees = data;
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  // Método para asignar turnos en múltiples fechas
  async assignShifts() {
    if (!this.selectedEmployee || !this.selectedEmployee.rut_empleado) {
      console.error('Empleado no seleccionado o sin ID válido');
      return;
    }

    // Validar que la hora de inicio sea menor que la hora de fin
    const formattedStartTime = this.extractTime(this.startTime);
    const formattedEndTime = this.extractTime(this.endTime);

    if (formattedStartTime >= formattedEndTime) {
      console.error('La hora de inicio debe ser menor a la hora de fin');
      alert('La hora de inicio debe ser menor a la hora de fin');
      return;
    }

    // Crear turnos para cada fecha seleccionada
    const shifts = this.selectedDates.map(date => ({
      employeeID: this.selectedEmployee!.rut_empleado,
      employeeName: this.selectedEmployee!.nombre,
      date: date.split('T')[0], // Almacenar solo la fecha
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    }));

    console.log('Turnos a asignar:', shifts);

    // Guardar cada turno en la base de datos
    try {
      for (const shift of shifts) {
        await this.databaseService.create('shifts', shift);
      }
      console.log('Turnos asignados correctamente');
      this.closeModal(); // Cierra el modal al terminar
    } catch (error) {
      console.error('Error al asignar los turnos: ', error);
    }
  }

  // Función para extraer solo la hora en formato HH:mm
  extractTime(dateTime: string): string {
    if (!dateTime) return '';
    const timePart = dateTime.split('T')[1];
    return timePart ? timePart.substring(0, 5) : '';
  }
}
