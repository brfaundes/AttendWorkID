import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../services/estadisticas.service';
import { CalendarService } from '../services/calendar.service';
import { DatabaseService } from '../services/database.service';
import { Trabajador } from '../models';

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
    private databaseService: DatabaseService
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
        this.estadisticasService.getEstadisticasMensualesPorCargoYFecha(this.selectedCargo, this.selectedYear, this.selectedMonth)
          .subscribe((data) => this.actualizarChartConDatos(data));
      } else {
        // Obtener estadísticas generales para el mes/año seleccionados
        this.estadisticasService.getEstadisticasMensualesPorFecha(this.selectedYear, this.selectedMonth)
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
      const trabajador = this.listaDeTrabajadores.find(t => t.rut_empleado === this.trabajadorSeleccionadoID);
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
      const trabajadores = data.map(d => d.nombreCompleto || 'Sin nombre');
      const diasTrabajados = data.map(d => d.diasTrabajados || 0);
      const llegadasTarde = data.map(d => d.llegadasTarde || 0);

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
            { label: 'Días Trabajados', data: diasTrabajados, backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 },
            { label: 'Atrasos', data: llegadasTarde, backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 },
          ],
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } },
      });
    }
  }

  // Limpiar el gráfico en caso de que no haya datos
  clearChart() {
    if (this.diasTrabajadosChart) {
      this.diasTrabajadosChart.data.labels = [];
      this.diasTrabajadosChart.data.datasets.forEach(dataset => dataset.data = []);
      this.diasTrabajadosChart.update();
    }
  }

  // Método para actualizar el gráfico cuando cambian los filtros de año o mes
  onYearOrMonthChange() {
    this.loadChartData(); // Cargar datos en el gráfico con los nuevos filtros
  }
}
