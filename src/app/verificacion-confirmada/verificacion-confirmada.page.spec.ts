import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificacionConfirmadaPage } from './verificacion-confirmada.page';

describe('VerificacionConfirmadaPage', () => {
  let component: VerificacionConfirmadaPage;
  let fixture: ComponentFixture<VerificacionConfirmadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificacionConfirmadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
