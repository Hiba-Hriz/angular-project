import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvtComponent } from './evt.component';

describe('EvtComponent', () => {
  let component: EvtComponent;
  let fixture: ComponentFixture<EvtComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvtComponent]
    });
    fixture = TestBed.createComponent(EvtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
