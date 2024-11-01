import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarioPageRoutingModule } from './calendario-routing.module';
import { CalendarioPage } from './calendario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarioPageRoutingModule,
    FullCalendarModule
  ],
  declarations: [CalendarioPage]
})
export class CalendarioModule { }
