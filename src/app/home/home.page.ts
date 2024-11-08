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
      const llegadasTarde = data.map(d => d.llegadasTarde || 0);            // Días de llegadas tarde de cada trabajador

      // Cargar o actualizar el gráfico de Días Trabajados con los datos obtenidos
      this.updateDiasTrabajadosChart(trabajadores, diasTrabajados, llegadasTarde);
    });
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
