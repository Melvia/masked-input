import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMaskedInputComponent } from './custom-masked-input.component';

describe('CustomMaskComponent', () => {
  let component: CustomMaskedInputComponent;
  let fixture: ComponentFixture<CustomMaskedInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomMaskedInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMaskedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
