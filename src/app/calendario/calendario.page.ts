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
        allDay: true                    // Evento de todo el día
      }));

      // Asignamos los eventos al calendario
      this.calendarOptions.events = events;
    });
  }

  handleDateClick(info: any) {
    this.selectedDate = info.dateStr;
    this.getShiftsByDate(this.selectedDate);
  }

  getShiftsByDate(date: string) {
    this.calendarService.getShiftsByDate(date).subscribe((shifts: any[]) => {
      this.employeeShifts = shifts;
      console.log('Turnos para la fecha seleccionada: ', this.employeeShifts);
      this.showAssignButton = this.employeeShifts.length === 0;
    });
  }

  async openAssignShiftModal() {
    const modal = await this.modalController.create({
      component: AsignarTurnoModalComponent,
      componentProps: { selectedDate: this.selectedDate },
    });
    return await modal.present();
  }

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
