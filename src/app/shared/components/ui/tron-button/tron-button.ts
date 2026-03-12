import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tron-button',
  templateUrl: './tron-button.html',
  styleUrl: './tron-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TronButton {
  readonly variant = input<'ghost' | 'solid'>('ghost');
  readonly buttonType = input<'button' | 'submit' | 'reset'>('button');
  readonly fullWidth = input(false);
  readonly disabled = input(false);
  readonly pressed = output<MouseEvent>();

  protected onPress(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }

    this.pressed.emit(event);
  }
}
