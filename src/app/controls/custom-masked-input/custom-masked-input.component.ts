import {Component, ElementRef, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'app-custom-masked-input',
  templateUrl: './custom-masked-input.component.html',
  styleUrls: ['./custom-masked-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomMaskedInputComponent),
    multi: true,
  }]
})
export class CustomMaskedInputComponent implements ControlValueAccessor, OnInit {
  // private _value: number = 0;

  // get value() {
  //   return this._value;
  // }
  //
  // @Input()
  // set value(val) {
  //   this._value = val;
  //   this._onChange(this.value);
  // }


  @ViewChild('mdInputEl') mdInputEl: ElementRef;

  public mdInput = new FormControl();

  @Input() mask: any[];

  @Input() title: string;

  private previousValue: string = '';

  private previousPlaceholder: string = '';

  private maxInputValue: number;

  private currentCursorPosition: number = 0;
  private readonly placeholderChar: string = '_';

  constructor() {
  }

  public ngOnInit(): void {
    this.mdInput.valueChanges
      .subscribe((value: string) => {
          if (!value || value === this.previousValue) {
            return;
          }
          this.currentCursorPosition = this.mdInputEl.nativeElement.selectionEnd;
          const placeholder = this.convertMaskToPlaceHolder();
          const values = this.conformValue(value, placeholder);
          const ajustedCursorPosition = this.getCursorPosition(value, placeholder, values.conformed);

          this.mdInputEl.nativeElement.value = values.conformed;
          this.mdInputEl.nativeElement.setSelectionRange(ajustedCursorPosition, ajustedCursorPosition, 'none');

          this._onChange(values.cleaned);

          this.previousValue = values.conformed ?? '';
          this.previousPlaceholder = placeholder ?? '';

        },
        (err) => console.warn(err)
      );
  }

  private convertMaskToPlaceHolder(): string {
    return this.mask.map((char) => {
      return (char instanceof RegExp) ? this.placeholderChar : char;
    }).join('');
  }

  private conformValue(value: string, placeholder: string): { conformed: string, cleaned: string } {
    const editDistance = value.length - this.previousValue.length;
    const isAddition = editDistance > 0;
    const indexOfFirstChange = this.currentCursorPosition + (isAddition ? -editDistance : 0);
    const indexOfLastChange = indexOfFirstChange + Math.abs(editDistance);
    // в случае удаления.
    if (!isAddition) {
      let compensatingPlaceholderChars = '';
      for (let i = indexOfFirstChange; i < indexOfLastChange; i++) {
        compensatingPlaceholderChars = (placeholder[i] === this.placeholderChar) ? compensatingPlaceholderChars + this.placeholderChar : compensatingPlaceholderChars;
      }

      value = (value.slice(0, indexOfFirstChange) + compensatingPlaceholderChars + value.slice(0, indexOfFirstChange) + value.slice(indexOfFirstChange, value.length));
    }

        const valueArr = value.split('');

        //цикл удаляет символы маски из ввода.
        for (let i = value.length - 1; i >= 0; i--) {
          let char = value[i];

          if (char !== this.placeholderChar) {
            const shouldOffset = i >= indexOfFirstChange && this.previousValue.length === this.maxInputValue;
            if (char === placeholder[(shouldOffset) ? i - editDistance : i]) {
              valueArr.splice(i, 1);
            }
          }
        }

          let conformedValue = '';
          let cleanedValue = '';

          placeholderLoop: for (let i = 0; i < placeholder.length; i++) {

            const charInPlaceholder = placeholder[i];
            if (charInPlaceholder === this.placeholderChar) {
              if (valueArr.length > 0) {
                while (valueArr.length > 0) {
                  let valueChar = valueArr.shift();
                  if (valueChar === this.placeholderChar) {
                    conformedValue += this.placeholderChar;
                    continue placeholderLoop;
                  } else if (this.mask[i].test(valueChar)) {
                    conformedValue += valueChar;
                    cleanedValue += valueChar;

                    continue placeholderLoop;
                  }

                }
              }
              conformedValue += placeholder.substr(i, placeholder.length);
              break;
            } else {
              conformedValue += charInPlaceholder;


          }
    }


  return {conformed: conformedValue, cleaned: cleanedValue};
  }

  private getCursorPosition(value: string, placeholder: string, conformedValue: string): number {
    if (this.currentCursorPosition === 0) {
      return 0;
    }

    const editLength = value.length - this.previousValue.length;
    const isAddition = editLength > 0;
    const isFirstValue = this.previousValue.length === 0;
    const isPartialMultiCharEdit = editLength > 1 && !isAddition && !isFirstValue;

    if (isPartialMultiCharEdit) {
      return this.currentCursorPosition;
    }

    const possiblyHasRejectedChar = isAddition && (
      this.previousValue === conformedValue ||
      conformedValue === placeholder);

    let startingSearchIndex = 0;
    let trackRightCharacter;
    let targetChar: string | undefined;

    if (possiblyHasRejectedChar) {
      startingSearchIndex = this.currentCursorPosition - editLength;
    } else {

      const normalizedConformedValue = conformedValue.toLowerCase();
      const normalizedValue = value.toLowerCase();
      const leftHalfChars = normalizedValue.substr(0, this.currentCursorPosition).split('');

      const intersection = leftHalfChars.filter((char) => normalizedConformedValue.indexOf(char) !== -1);

      targetChar = intersection[intersection.length - 1];

      const previousLeftMaskChars = this.previousPlaceholder
        .substr(0, intersection.length)
        .split('')
        .filter((char) => char !== this.placeholderChar)
        .length;

      const leftMaskChars = placeholder
        .substr(0, intersection.length)
        .split('')
        .filter((char) => char !== this.placeholderChar)
        .length;

      const maskLengthChanged = leftMaskChars !== previousLeftMaskChars;


      const targetIsMaskMovingLeft = (
        this.previousPlaceholder[intersection.length - 1] !== undefined &&
        placeholder[intersection.length - 2] !== undefined &&
        this.previousPlaceholder[intersection.length - 1] !== this.placeholderChar &&
        this.previousPlaceholder[intersection.length - 1] !== placeholder[intersection.length - 1] &&
        this.previousPlaceholder[intersection.length - 1] === placeholder[intersection.length - 2]
      );

      if (!isAddition &&
        (maskLengthChanged || targetIsMaskMovingLeft) &&
        previousLeftMaskChars > 0 &&
        placeholder.indexOf(targetChar) > -1 &&
        value[this.currentCursorPosition] !== undefined) {
        trackRightCharacter = true;
        targetChar = value[this.currentCursorPosition];
      }

      const countTargetCharInIntersection = intersection.filter((char) => char === targetChar).length;

      const countTargetCharInPlaceholder = placeholder
        .substr(0, placeholder.indexOf(this.placeholderChar))
        .split('')
        .filter((char, index) => (
          char === targetChar &&
          value[index] !== char
        )).length;

      const requiredNumberOfMatches =
        (countTargetCharInPlaceholder + countTargetCharInIntersection + (trackRightCharacter ? 1 : 0));

      let numberOfEncounteredMatches = 0;

      //----------

      for (let i = 0; i < conformedValue.length; i++) {
        const conformedValueChar = normalizedConformedValue[i];

        startingSearchIndex = i + 1;

        if (conformedValueChar === targetChar) {
          numberOfEncounteredMatches++;
        }

        if (numberOfEncounteredMatches >= requiredNumberOfMatches) {
          break;
        }
      }
    }

    if (isAddition) {
      let lastPlaceholderChar = startingSearchIndex;

      for (let i = startingSearchIndex; i <= placeholder.length; i++) {
        if (placeholder[i] === this.placeholderChar) {
          lastPlaceholderChar = i;
        }

        if (placeholder[i] === this.placeholderChar || i === placeholder.length) {
          return lastPlaceholderChar;
        }
      }
    } else {
      if (trackRightCharacter) {
        for (let i = startingSearchIndex - 1; i >= 0; i--) {
          if (
            conformedValue[i] === targetChar ||
            i === 0
          ) {
            return i;
          }
        }
      } else {
        for (let i = startingSearchIndex; i >= 0; i--) {
          if (placeholder[i - 1] === this.placeholderChar || i === 0) {
            return i;
          }
        }
      }
    }
    console.log("последний вариант");
    return 0;
  }

  private _onChange: Function = (_: any) => {
  }

  private _onTouched: Function = (_: any) => {
  }


  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(value: any): void {
    this.mdInput.setValue(value);
  }

  private _convertMaskToPlaceholder(): string {
    return this.mask.map((char) => {
      return (char instanceof RegExp) ? this.placeholderChar : char;
    }).join('');
  }
}
