import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-example-control',
  templateUrl: './example-control.component.html',
  styleUrls: ['./example-control.component.scss'],
  providers: [{
     provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ExampleControlComponent),
    multi: true,
    }]
})
export class ExampleControlComponent implements ControlValueAccessor {
  private _value: number = 0;

  get value() {
    return this._value;
  }

  @Input()
  set value(val) {
    this._value = val;
    this.onChange(this.value);
  }

  up() {
    this.value++;
  }

  down() {
    this.value--;
  }
  constructor() { }

  onChange(_: any) {}
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(value: any): void {
    this.value = value;
  }

}
