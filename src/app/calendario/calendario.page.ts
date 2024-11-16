import { Component, OnInit } from '@angular/core';
import { CalendarOptions, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CalendarService } from '../services/calendar.service';
import { ModalController, AlertController } from '@ionic/angular';
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
  selectedDate: string = '';
  showAssignButton: boolean = false;
  currentViewTitle: string = '';

  constructor(
    private calendarService: CalendarService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializeCalendar();
    this.loadShiftEvents();
  }

  /**
   * Inicializa las opciones del calendario, incluyendo la lógica para hacerlo responsive.
   */
  initializeCalendar() {
    const aspectRatio = this.calculateAspectRatio();
    const isMobile = window.innerWidth < 768;

    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: isMobile ? 'timeGridWeek' : 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next',
        center: '',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      selectable: true,
      editable: false,
      locale: esLocale,
      events: [],
      eventContent: this.renderEventContent.bind(this), // Personalización del contenido de eventos
      aspectRatio, // Relación de aspecto inicial
      windowResize: this.handleWindowResize.bind(this), // Recalcula el aspectRatio en tiempo real
      dayHeaderFormat: isMobile ? { weekday: 'short' } : { weekday: 'long' }, // Formato de los nombres de los días
      contentHeight: 'auto', // Altura automática del contenido

      // Añadimos estos parámetros para capturar cambios en la vista
      viewDidMount: this.handleViewDidMount.bind(this),
      datesSet: this.handleDatesSet.bind(this),
    };
  }

  /**
   * Maneja el evento cuando la vista del calendario ha sido montada.
   */
  handleViewDidMount(viewInfo: any) {
    this.updateCurrentViewTitle(viewInfo.view);
  }

  /**
   * Maneja el evento cuando las fechas del calendario han sido establecidas.
   */
  handleDatesSet(viewInfo: any) {
    this.updateCurrentViewTitle(viewInfo.view);
  }

  /**
   * Actualiza el título de la vista actual.
   * @param view La vista actual del calendario.
   */
  updateCurrentViewTitle(view: ViewApi) {
    const viewType = view.type;
    let title = '';

    if (viewType === 'dayGridMonth') {
      title = view.currentStart.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
    } else if (viewType === 'timeGridWeek') {
      const start = view.currentStart;
      const end = view.currentEnd;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
      title = `Semana del ${start.toLocaleDateString('es-ES', options)} al ${new Date(
        end.getTime() - 1
      ).toLocaleDateString('es-ES', options)}`;
    } else if (viewType === 'timeGridDay') {
      title = view.currentStart.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    this.currentViewTitle = title;
  }

  /**
   * Calcula el aspectRatio para que el calendario ocupe el 65-70% de la altura de la pantalla.
   * @returns El aspectRatio calculado.
   */
  calculateAspectRatio(): number {
    const screenHeight = window.innerHeight;
    const calendarHeight = screenHeight * 0.65; // 65% de la altura de la pantalla
    const calendarWidth = window.innerWidth;
    return calendarWidth / calendarHeight; // Relación de aspecto dinámica
  }

  /**
   * Maneja el evento de redimensionar la ventana para recalcular el aspectRatio y ajustar opciones.
   */
  handleWindowResize() {
    const newAspectRatio = this.calculateAspectRatio();
    const isMobile = window.innerWidth < 768;

    this.calendarOptions = {
      ...this.calendarOptions,
      aspectRatio: newAspectRatio, // Actualiza el aspectRatio dinámicamente
      headerToolbar: {
        left: 'prev,next',
        center: '',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      dayHeaderFormat: isMobile ? { weekday: 'short' } : { weekday: 'long' }, // Actualiza el formato de los nombres de los días
      initialView: isMobile ? 'timeGridWeek' : 'dayGridMonth', // Cambia la vista inicial según el tamaño de la pantalla
    };
  }

  /**
   * Carga los turnos desde el servicio y los organiza como eventos en el calendario.
   */
  loadShiftEvents() {
    this.calendarService.getAllShifts().subscribe((shifts: any[]) => {
      const shiftsByDate: { [key: string]: any[] } = {};

      // Agrupar los turnos por fecha y contar cuántos hay en cada día
      shifts.forEach((shift) => {
        const date = shift.date;
        if (!shiftsByDate[date]) {
          shiftsByDate[date] = [];
        }
        shiftsByDate[date].push(shift);
      });

      // Crear eventos en el calendario con el número de turnos por día
      const events = Object.keys(shiftsByDate).map((date) => ({
        title: `Turnos: ${shiftsByDate[date].length}`, // Número de turnos como título
        start: date,
        backgroundColor: 'green',
        borderColor: 'green',
        allDay: true,
        extendedProps: { shiftCount: shiftsByDate[date].length }, // Guardar el número de turnos
      }));

      this.calendarOptions.events = events;
    });
  }

  /**
   * Personaliza el contenido del evento para mostrar el número de turnos centrado.
   */
  renderEventContent(eventInfo: any) {
    const shiftCount = eventInfo.event.extendedProps.shiftCount;
    return {
      html: `<div class="shift-count-centered">${shiftCount}</div>`,
    };
  }

  /**
   * Maneja el evento de clic en una fecha del calendario.
   */
  handleDateClick(info: any) {
    this.selectedDate = info.dateStr;
    this.getShiftsByDate(this.selectedDate);
  }

  /**
   * Maneja el evento de clic en un evento del calendario.
   */
  handleEventClick(info: any) {
    const shiftDate = info.event.startStr;
    this.selectedDate = shiftDate;
    this.getShiftsByDate(shiftDate);
  }

  /**
   * Obtiene los turnos de una fecha específica desde el servicio.
   * @param date La fecha seleccionada.
   */
  getShiftsByDate(date: string) {
    this.calendarService.getShiftsByDate(date).subscribe((shifts: any[]) => {
      this.employeeShifts = shifts;
      this.showAssignButton = this.employeeShifts.length === 0;
    });
  }

  /**
   * Abre el modal para asignar un turno.
   */
  async openAssignShiftModal() {
    const modal = await this.modalController.create({
      component: AsignarTurnoModalComponent,
      componentProps: { selectedDate: this.selectedDate },
    });
    return await modal.present();
  }

  /**
   * Abre el modal para editar un turno.
   * @param shift El turno seleccionado.
   */
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
        },
      },
    });
    return await modal.present();
  }

  /**
   * Elimina un turno después de confirmar la acción.
   * @param shift El turno a eliminar.
   */
  async deleteShift(shift: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro que deseas eliminar el turno para ${shift.employeeName} ${shift.employeeLastName} del ${shift.date} de ${shift.startTime} a ${shift.endTime}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.calendarService.deleteShift(shift.id);
              console.log('Turno eliminado correctamente');
              this.loadShifts();
            } catch (error) {
              console.error('Error al eliminar el turno:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Recarga los turnos desde el servicio.
   */
  loadShifts() {
    this.loadShiftEvents();
  }
}
