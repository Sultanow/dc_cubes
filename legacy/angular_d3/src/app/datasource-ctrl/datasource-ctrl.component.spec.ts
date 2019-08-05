import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceCtrlComponent } from './datasource-ctrl.component';

describe('DatasourceCtrlComponent', () => {
  let component: DatasourceCtrlComponent;
  let fixture: ComponentFixture<DatasourceCtrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasourceCtrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourceCtrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
