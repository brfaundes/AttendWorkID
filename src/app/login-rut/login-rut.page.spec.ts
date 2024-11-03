import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginRutPage } from './login-rut.page';

describe('LoginRutPage', () => {
  let component: LoginRutPage;
  let fixture: ComponentFixture<LoginRutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginRutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
