import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReconocimientoFacialPage } from './reconocimiento-facial.page';

describe('ReconocimientoFacialPage', () => {
  let component: ReconocimientoFacialPage;
  let fixture: ComponentFixture<ReconocimientoFacialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconocimientoFacialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
