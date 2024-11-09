import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../services/estadisticas.service';
import { CalendarService } from '../services/calendar.service';

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
  employeeID: string | null = null; // ID del usuario actual
  turnosDelMes: any[] = []; // Turnos del mes actual para el trabajador
  
  constructor(
    private estadisticasService: EstadisticasService,
    private calendarService: CalendarService
  ) {}

  ngOnInit() {
    this.checkUserRole();  // Verificar rol y obtener ID
    this.loadChartData();  // Cargar datos según el rol
  }

  // Verificar rol y establecer el ID del trabajador
  checkUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.cargo === 'administrador';
    this.employeeID = user.rut_empleado; // Obtener el ID (RUT) del usuario logueado
  }

  loadChartData() {
    // Obtener datos de estadísticas desde Firestore
    this.estadisticasService.getEstadisticasMensuales().subscribe((data) => {
      let trabajadores: string[] = [];
      let diasTrabajados: number[] = [];
      let llegadasTarde: number[] = [];

      if (this.isAdmin) {
        // Administrador: mostrar datos de todos los trabajadores
        trabajadores = data.map(d => d.nombreCompleto || 'Sin nombre');
        diasTrabajados = data.map(d => d.diasTrabajados || 0);
        llegadasTarde = data.map(d => d.llegadasTarde || 0);
      } else if (this.employeeID) {
        // Usuario regular: mostrar solo sus propios datos
        const usuarioData = data.find(d => d.rut_empleado === this.employeeID);
        if (usuarioData) {
          trabajadores = [usuarioData.nombreCompleto || 'Sin nombre'];
          diasTrabajados = [usuarioData.diasTrabajados || 0];
          llegadasTarde = [usuarioData.llegadasTarde || 0];
        }

        // Cargar los turnos asignados en el mes para el trabajador
        this.loadTurnosDelMes();
      }

      // Cargar o actualizar el gráfico con los datos obtenidos
      this.updateDiasTrabajadosChart(trabajadores, diasTrabajados, llegadasTarde);
    });
  }  

  // Cargar turnos del mes para el trabajador actual
  loadTurnosDelMes() {
    if (this.employeeID) {
      this.calendarService.getTurnosDelMesParaTrabajador(this.employeeID).subscribe((turnos) => {
        this.turnosDelMes = turnos;
      });
    }
  }

  updateDiasTrabajadosChart(labels: string[], diasTrabajados: number[], llegadasTarde: number[]) {
    if (this.diasTrabajadosChart) {
      // Si el gráfico ya existe, actualiza los datos y etiquetas
      this.diasTrabajadosChart.data.labels = labels;
      this.diasTrabajadosChart.data.datasets[0].data = diasTrabajados;
      this.diasTrabajadosChart.data.datasets[1].data = llegadasTarde;
      this.diasTrabajadosChart.update();
    } else {
      // Si no existe, crea el gráfico
      this.diasTrabajadosChart = new Chart(this.diasTrabajadosChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Días Trabajados',
              data: diasTrabajados,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Atrasos',
              data: llegadasTarde,
              backgroundColor: 'rgba(255, 99, 132, 0.5)', // Rojo para llegadas tarde
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }
}
