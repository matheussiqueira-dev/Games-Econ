import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { InputTypeEnum } from '../../utils/enums';

@Component({
  selector: 'app-hybrid-field',
  imports: [],
  templateUrl: './hybrid-field.html',
  styleUrl: './hybrid-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HybridField {
  type = input<InputTypeEnum>(InputTypeEnum.Text);
  placeholder = input<string>('');
  value = input<string>('');
  valueChange = output<string>();

  showPassword = signal(false);

  inputType = computed(() => {
    if (this.type() === InputTypeEnum.Password) {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
