import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CalendarService } from '../../services/calendar.service';

interface Employee {
  nombre: string;
  apellido: string;
  rut_empleado: string;
}

@Component({
  selector: 'app-asignar-turno-modal',
  templateUrl: './asignar-turno-modal.component.html',
  styleUrls: ['./asignar-turno-modal.component.scss'],
})
export class AsignarTurnoModalComponent implements OnInit {
  @Input() selectedDates: string[] = [];
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  startTime: string = '';
  durationHours: number = 1;  // Valor inicial de duración mínimo
  minDate: string = '';

  constructor(
    private modalController: ModalController,
    private calendarService: CalendarService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.setMinDate();
  }

  setMinDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadEmployees() {
    this.calendarService.getEmployees().subscribe((data: Employee[]) => {
      this.employees = data;
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  // Evitar entradas no numéricas como "e", "+", y "-" en el campo de duración
  preventInvalidInput(event: KeyboardEvent) {
    if (event.key === 'e' || event.key === '+' || event.key === '-') {
      event.preventDefault();
    }
  }

  // Validar que la duración sea al menos 1 hora
  validateDuration() {
    if (this.durationHours < 1 || isNaN(this.durationHours)) {
      this.durationHours = 1;  // Restablece a 1 si el valor es inválido
    }
  }

  calculateEndTime(): string {
    const timeOnly = this.startTime.includes('T') ? this.startTime.split('T')[1].substring(0, 5) : this.startTime;

    if (!timeOnly || !/^\d{2}:\d{2}$/.test(timeOnly)) {
      console.error('Formato de hora de inicio incorrecto:', timeOnly);
      return '00:00';
    }

    const [startHours, startMinutes] = timeOnly.split(':').map(Number);
    const hoursToAdd = Number(this.durationHours);
    if (isNaN(startHours) || isNaN(startMinutes) || hoursToAdd <= 0) {
      console.error('Valores inválidos para hora de inicio o duración:', {
        startHours, startMinutes, durationHours: this.durationHours
      });
      return '00:00';
    }

    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);

    let endHours = startDate.getHours() + hoursToAdd;
    const endMinutes = startDate.getMinutes();
    const dayDifference = Math.floor(endHours / 24);
    endHours = endHours % 24;

    const formattedEndHours = endHours.toString().padStart(2, '0');
    const formattedEndMinutes = endMinutes.toString().padStart(2, '0');
    const endTime = `${formattedEndHours}:${formattedEndMinutes}`;
    return dayDifference > 0 ? `${endTime} (día siguiente)` : endTime;
  }

  // Función para mostrar el cuadro de confirmación antes de crear el turno
  async showConfirmation(shift: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Turno',
      message: `¿Deseas asignar el turno para ${shift.employeeName} ${shift.employeeLastName} el ${shift.date} desde las ${shift.startTime} hasta las ${shift.endTime}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Asignación de turno cancelada.');
          },
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.createShift(shift);
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para crear el turno en la base de datos
  async createShift(shift: any) {
    try {
      await this.calendarService.create('shifts', shift);
      console.log('Turno asignado correctamente');
      this.closeModal();
    } catch (error) {
      console.error('Error al asignar el turno: ', error);
    }
  }

  async assignShifts() {
    if (!this.selectedEmployee || !this.selectedEmployee.rut_empleado) {
      console.error('Empleado no seleccionado o sin ID válido');
      return;
    }

    if (this.durationHours < 1) {
      console.error('La duración del turno debe ser al menos de 1 hora');
      alert('La duración del turno debe ser al menos de 1 hora.');
      return;
    }

    const formattedStartTime = this.extractTime(this.startTime);
    const calculatedEndTime = this.calculateEndTime();

    if (calculatedEndTime === '00:00') {
      console.error('No se pudo calcular la hora de fin correctamente');
      alert('Error al calcular la hora de fin. Verifique los datos ingresados.');
      return;
    }

    const shifts = this.selectedDates.map(date => ({
      employeeID: this.selectedEmployee!.rut_empleado,
      employeeName: this.selectedEmployee!.nombre,
      employeeLastName: this.selectedEmployee!.apellido,
      date: date.split('T')[0],
      startTime: formattedStartTime,
      endTime: calculatedEndTime,
    }));

    // Mostrar confirmación para cada turno
    for (const shift of shifts) {
      await this.showConfirmation(shift);
    }
  }

  extractTime(dateTime: string): string {
    const timePart = dateTime.includes('T') ? dateTime.split('T')[1].substring(0, 5) : dateTime;
    return timePart;
  }
}
