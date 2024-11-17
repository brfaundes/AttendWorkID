import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent {
  @Input() selectedMonth!: string;
  @Input() selectedYear!: string;
  @Input() selectedCargo!: string; // Agregado

  months = [
    { value: '01', text: 'Enero' },
    { value: '02', text: 'Febrero' },
    { value: '03', text: 'Marzo' },
    { value: '04', text: 'Abril' },
    { value: '05', text: 'Mayo' },
    { value: '06', text: 'Junio' },
    { value: '07', text: 'Julio' },
    { value: '08', text: 'Agosto' },
    { value: '09', text: 'Septiembre' },
    { value: '10', text: 'Octubre' },
    { value: '11', text: 'Noviembre' },
    { value: '12', text: 'Diciembre' },
  ];

  years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  cargos = [
    { value: '', text: 'Todos' },
    { value: 'conserje', text: 'Conserje' },
    { value: 'aseo', text: 'Aseo' },
    { value: 'administrador', text: 'Administrador' },
  ];

  constructor(private modalController: ModalController) {}

  applyFilters() {
    this.modalController.dismiss({
      selectedMonth: this.selectedMonth,
      selectedYear: this.selectedYear,
      selectedCargo: this.selectedCargo, // Agregado
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
