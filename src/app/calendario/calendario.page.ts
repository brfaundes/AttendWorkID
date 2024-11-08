import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importa el idioma español
import { CalendarService } from '../services/calendar.service';
import { ModalController } from '@ionic/angular';
import { AsignarTurnoModalComponent } from '../modals/asignar-turno-modal/asignar-turno-modal.component';
import { EditShiftModalComponent } from '../modals/edit-shift-modal/edit-shift-modal.component';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  calendarOptions!: CalendarOptions;
  employeeShifts: any[] = [];
  selectedDate: string = ''; // Fecha seleccionada
  showAssignButton: boolean = false; // Mostrar botón de asignación de turno

  constructor(
    private calendarService: CalendarService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.initializeCalendar();
    this.loadShiftEvents(); // Cargar los eventos de los turnos en el calendario
  }

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
      eventClick: this.handleEventClick.bind(this), // Llama a handleEventClick al hacer clic en un evento
      selectable: true,
      editable: false,
      locale: esLocale, // Configura el idioma en español
      events: [], // Inicializamos los eventos vacíos y los cargamos después
    };
  }

  // Carga los turnos como eventos en el calendario para mostrarlos en color verde
  loadShiftEvents() {
    this.calendarService.getAllShifts().subscribe((shifts: any[]) => {
      const events = shifts.map(shift => ({
        title: `${shift.employeeName} ${shift.employeeLastName}`, // Nombre del trabajador
        start: shift.date,              // Fecha del turno
        backgroundColor: 'green',       // Color verde para indicar que hay un turno
        borderColor: 'green',
        allDay: true,                   // Evento de todo el día
        extendedProps: { shiftId: shift.id, date: shift.date } // Propiedades adicionales
      }));

      // Asignamos los eventos al calendario
      this.calendarOptions.events = events;
    });
  }

  // Maneja el clic en la fecha
  handleDateClick(info: any) {
    this.selectedDate = info.dateStr;
    this.getShiftsByDate(this.selectedDate);
  }

  // Maneja el clic en un evento (nombre del trabajador)
  handleEventClick(info: any) {
    const shiftDate = info.event.extendedProps.date; // Fecha del turno
    this.selectedDate = shiftDate;

    // Obtiene los turnos para la fecha específica
    this.getShiftsByDate(shiftDate);
    console.log(`Clic en el evento para ver los turnos de la fecha: ${shiftDate}`);
  }

  // Obtener los turnos de la fecha seleccionada
  getShiftsByDate(date: string) {
    this.calendarService.getShiftsByDate(date).subscribe((shifts: any[]) => {
      this.employeeShifts = shifts;
      console.log('Turnos para la fecha seleccionada: ', this.employeeShifts);
      this.showAssignButton = this.employeeShifts.length === 0;
    });
  }

  // Método para abrir el modal para asignar un turno
  async openAssignShiftModal() {
    const modal = await this.modalController.create({
      component: AsignarTurnoModalComponent,
      componentProps: { selectedDate: this.selectedDate },
    });
    return await modal.present();
  }

  // Método para eliminar un turno
  deleteShift(shift: any) {
    if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
      if (shift.id) {
        this.calendarService.deleteShift(shift.id).then(() => {
          console.log('Turno eliminado');
          this.getShiftsByDate(this.selectedDate);
          this.loadShiftEvents(); // Recargar eventos para reflejar la eliminación
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
          id: shift.id,
          employeeID: shift.employeeID,
          employeeName: shift.employeeName,
          employeeLastName: shift.employeeLastName,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
        }
      }
    });
    return await modal.present();
  }
}
