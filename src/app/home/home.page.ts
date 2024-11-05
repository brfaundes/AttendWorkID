import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { EstadisticasService } from '../services/estadisticas.service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('diasTrabajadosChart', { static: true }) diasTrabajadosChartRef!: ElementRef;
  @ViewChild('ausenciasChart', { static: true }) ausenciasChartRef!: ElementRef;
  @ViewChild('llegadasTardeChart', { static: true }) llegadasTardeChartRef!: ElementRef;

  diasTrabajadosChart: Chart | undefined;

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit() {
    this.loadChartData();
  }

  loadChartData() {
    // Obtener datos de estadística desde Firestore
    this.estadisticasService.getEstadisticasMensuales().subscribe((data) => {
      const trabajadores = data.map(d => d.nombreCompleto || 'Sin nombre'); // Usar nombre del trabajador
      const diasTrabajados = data.map(d => d.diasTrabajados || 0);          // Días trabajados de cada trabajador

      // Cargar o actualizar el gráfico de Días Trabajados con los datos obtenidos
      this.updateDiasTrabajadosChart(trabajadores, diasTrabajados);
    });
  }

  updateDiasTrabajadosChart(labels: string[], data: number[]) {
    if (this.diasTrabajadosChart) {
      // Si el gráfico ya existe, actualiza los datos y etiquetas
      this.diasTrabajadosChart.data.labels = labels;
      this.diasTrabajadosChart.data.datasets[0].data = data;
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
              data,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
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
