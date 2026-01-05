import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationModalComponent } from './publication-modal.component';

describe('PublicationModalComponent', () => {
  let component: PublicationModalComponent;
  let fixture: ComponentFixture<PublicationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublicationModalComponent]
    });
    fixture = TestBed.createComponent(PublicationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
