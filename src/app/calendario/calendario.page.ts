import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DatabaseService } from '../services/calendar.service';
import { ModalController } from '@ionic/angular'; // Importar el modal controller
import { AsignarTurnoModalComponent } from '../modals/asignar-turno-modal/asignar-turno-modal.component'; // Componente modal
import { EditShiftModalComponent } from '../modals/edit-shift-modal/edit-shift-modal.component';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  calendarOptions!: CalendarOptions;
  employeeShifts: any[] = [];
  selectedDate: string = ''; // Fecha sqeleccionada
  showAssignButton: boolean = false; // Mostrar botón de asignación de turno

  constructor(
    private databaseService: DatabaseService,
    private modalController: ModalController // Modal controller para abrir el modal
  ) {}

  ngOnInit() {
    this.initializeCalendar();
  }

  // Inicializamos el calendario
  initializeCalendar() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      dateClick: this.handleDateClick.bind(this),
      selectable: true,
      editable: false,
    };
  }

  // Método para manejar el clic en un día del calendario
  handleDateClick(info: any) {
    this.selectedDate = info.dateStr; // Guardamos la fecha seleccionada
    this.getShiftsByDate(this.selectedDate); // Obtener los turnos de la fecha seleccionada
  }

  // Obtener los turnos de la fecha seleccionada
  getShiftsByDate(date: string) {
    this.databaseService.getShiftsByDate(date).subscribe((shifts: any[]) => {
      this.employeeShifts = shifts;
      console.log('Turnos para la fecha seleccionada: ', this.employeeShifts);

      // Si no hay turnos, mostramos el botón para asignar un turno
      this.showAssignButton = this.employeeShifts.length === 0;
    });
  }

  // Método para abrir el modal para asignar un turno
  async openAssignShiftModal() {
    const modal = await this.modalController.create({
      component: AsignarTurnoModalComponent,
      componentProps: { selectedDate: this.selectedDate }, // Pasamos la fecha seleccionada al modal
    });
    return await modal.present();
  }

  // Método para eliminar un turno
  deleteShift(shift: any) {
    if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
      if (shift.id) {
        this.databaseService.deleteShift(shift.id).then(() => {
          console.log('Turno eliminado');
          // Actualizar la lista de turnos después de eliminar
          this.getShiftsByDate(this.selectedDate);
        }).catch(error => {
          console.error('Error al eliminar el turno:', error);
        });
      } else {
        console.error('El turno no tiene un ID válido.');
      }
    }
  }
  
  // Método para editar un turno
  async openEditShiftModal(shift: any) {
    const modal = await this.modalController.create({
      component: EditShiftModalComponent,
      componentProps: {
        shiftData: {
          id: shift.id,  // Asegúrate de que este id esté presente
          employeeID: shift.employeeID,
          employeeName: shift.employeeName,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
        }
      }
    });
    return await modal.present();
  }
}
