import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-clickable-link',
  imports: [],
  templateUrl: './clickable-link.html',
  styleUrl: './clickable-link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClickableLink {
  text = input<string>('');
  color = input<string>('#007bff');
  clicked = output<void>();
}
