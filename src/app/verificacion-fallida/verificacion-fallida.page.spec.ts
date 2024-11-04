import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificacionFallidaPage } from './verificacion-fallida.page';

describe('VerificacionFallidaPage', () => {
  let component: VerificacionFallidaPage;
  let fixture: ComponentFixture<VerificacionFallidaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificacionFallidaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
