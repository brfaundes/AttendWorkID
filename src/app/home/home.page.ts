import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../services/estadisticas.service';
import { CalendarService } from '../services/calendar.service';
import { DatabaseService } from '../services/database.service';
import { Trabajador } from '../models';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { FilterModalComponent } from '../modals/filter-modal/filter-modal.component';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('diasTrabajadosChart', { static: true }) diasTrabajadosChartRef!: ElementRef;

  diasTrabajadosChart: Chart | undefined;
  isAdmin: boolean = false;
  employeeID: string | null = null;
  turnosDelMes: any[] = [];
  listaDeTrabajadores: Trabajador[] = [];
  trabajadorSeleccionadoID: string | null = null;
  trabajadorSeleccionadoNombre: string = '';
  selectedCargo: string = ''; // Cargo seleccionado
  selectedYear: string = new Date().getFullYear().toString(); // Año seleccionado
  selectedMonth: string = ('0' + (new Date().getMonth() + 1)).slice(-2); // Mes seleccionado (formato "MM")
  estadisticas: any[] = []; // Almacena las estadísticas filtradas
  cargos: string[] = ['conserje', 'aseo', 'administrador'];
  years: string[] = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()); // Últimos 5 años

  constructor(
    private estadisticasService: EstadisticasService,
    private calendarService: CalendarService,
    private databaseService: DatabaseService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadChartData();

    if (this.isAdmin) {
      this.loadAllTrabajadores();
    } else {
      this.loadTurnosDelMes();
    }
  }

  // Verificar rol y establecer el ID del trabajador
  checkUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.cargo === 'administrador';
    this.employeeID = user.rut_empleado;
  }

  // Cargar los datos en el gráfico con filtros de año, mes y cargo, solo si es administrador
  loadChartData() {
    if (this.isAdmin) {
      if (this.selectedCargo) {
        // Obtener estadísticas filtradas por cargo y fecha si el administrador selecciona un cargo
        this.estadisticasService
          .getEstadisticasMensualesPorCargoYFecha(this.selectedCargo, this.selectedYear, this.selectedMonth)
          .subscribe((data) => this.actualizarChartConDatos(data));
      } else {
        // Obtener estadísticas generales para el mes/año seleccionados
        this.estadisticasService
          .getEstadisticasMensualesPorFecha(this.selectedYear, this.selectedMonth)
          .subscribe((data) => this.actualizarChartConDatos(data));
      }
    } else {
      // Si es trabajador, cargar solo sus propias estadísticas
      this.estadisticasService.getEstadisticasMensualesParaTrabajador(this.employeeID!).subscribe((data) => {
        this.actualizarChartConDatos(data);
      });
    }
  }

  // Cargar lista de trabajadores solo si el usuario es administrador
  loadAllTrabajadores() {
    if (this.isAdmin) {
      this.databaseService.getAll('trabajador').subscribe((trabajadores: Trabajador[]) => {
        this.listaDeTrabajadores = trabajadores;
      });
    }
  }

  // Cargar turnos del mes solo para el trabajador actual o el trabajador seleccionado por el administrador
  loadTurnosDelMes() {
    const id = this.isAdmin && this.trabajadorSeleccionadoID ? this.trabajadorSeleccionadoID : this.employeeID;
    if (id) {
      this.calendarService.getTurnosDelMesParaTrabajador(id).subscribe((turnos) => {
        this.turnosDelMes = turnos;
      });
    } 
  }

  // Método llamado al seleccionar un trabajador en el desplegable
  onTrabajadorSeleccionado() {
    if (this.isAdmin) {
      const trabajador = this.listaDeTrabajadores.find((t) => t.rut_empleado === this.trabajadorSeleccionadoID);
      this.trabajadorSeleccionadoNombre = trabajador ? `${trabajador.nombre} ${trabajador.apellido}` : '';
      this.loadTurnosDelMes();
    }
  }

  // Actualizar el gráfico con los datos obtenidos
  actualizarChartConDatos(data: any[]) {
    if (data.length === 0) {
      // Si no hay datos, limpiar el gráfico
      this.clearChart();
    } else {
      // Si hay datos, actualizarlos en el gráfico
      const trabajadores = data.map((d) => d.nombreCompleto || 'Sin nombre');
      const diasTrabajados = data.map((d) => d.diasTrabajados || 0);
      const llegadasTarde = data.map((d) => d.llegadasTarde || 0);

      this.updateDiasTrabajadosChart(trabajadores, diasTrabajados, llegadasTarde);
    }
  }

  // Crear o actualizar el gráfico
  updateDiasTrabajadosChart(labels: string[], diasTrabajados: number[], llegadasTarde: number[]) {
    if (this.diasTrabajadosChart) {
      this.diasTrabajadosChart.data.labels = labels;
      this.diasTrabajadosChart.data.datasets[0].data = diasTrabajados;
      this.diasTrabajadosChart.data.datasets[1].data = llegadasTarde;
      this.diasTrabajadosChart.update();
    } else {
      this.diasTrabajadosChart = new Chart(this.diasTrabajadosChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Días Trabajados',
              data: diasTrabajados,
              backgroundColor: 'rgba(249, 177, 122, 0.95)',
              borderColor: 'rgba(249, 177, 122, 1)',
              borderWidth: 1,
            },
            {
              label: 'Atrasos',
              data: llegadasTarde,
              backgroundColor: 'rgba(45, 50, 80, 0.9)',
              borderColor: 'rgba(45, 50, 80, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Permite ajustar dinámicamente el tamaño
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14, // Tamaño de texto de la leyenda
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 12, // Ajusta el tamaño de las etiquetas del eje X
                },
                autoSkip: true, // Evita que se muestren todas las etiquetas si son demasiadas
                maxRotation: 45, // Rotación máxima de las etiquetas
                minRotation: 0, // Rotación mínima de las etiquetas
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1, // Intervalo entre ticks
                font: {
                  size: 12, // Ajusta el tamaño de las etiquetas del eje Y
                },
              },
            },
          },
        },
      });
    }
  }
  

  // Limpiar el gráfico en caso de que no haya datos
  clearChart() {
    if (this.diasTrabajadosChart) {
      this.diasTrabajadosChart.data.labels = [];
      this.diasTrabajadosChart.data.datasets.forEach((dataset) => (dataset.data = []));
      this.diasTrabajadosChart.update();
    }
  }

  // Método para abrir el modal de filtros
  async openFilter() {
    const modal = await this.modalController.create({
      component: FilterModalComponent,
      componentProps: {
        selectedMonth: this.selectedMonth,
        selectedYear: this.selectedYear,
        selectedCargo: this.selectedCargo, // Agregado
      },
      cssClass: 'custom-modal-class', // Clase personalizada para los estilos
      showBackdrop: true, // Muestra el fondo traslúcido
      backdropDismiss: true, // Permite cerrar al hacer clic en el fondo
    });
  
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        this.selectedMonth = dataReturned.data.selectedMonth;
        this.selectedYear = dataReturned.data.selectedYear;
        this.selectedCargo = dataReturned.data.selectedCargo; // Agregado
        this.loadChartData();
      }
    });


  
    return await modal.present();
  }
  
  async mostrarAlerta(header: string, message: string, color: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
      cssClass: color,
    });
    await alert.present();
  }
}
