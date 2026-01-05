import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutilModalComponent } from './outil-modal.component';

describe('OutilModalComponent', () => {
  let component: OutilModalComponent;
  let fixture: ComponentFixture<OutilModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutilModalComponent]
    });
    fixture = TestBed.createComponent(OutilModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
