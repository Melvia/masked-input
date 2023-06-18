import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleControlComponent } from './example-control.component';

describe('CustomMaskComponent', () => {
  let component: ExampleControlComponent;
  let fixture: ComponentFixture<ExampleControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExampleControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
