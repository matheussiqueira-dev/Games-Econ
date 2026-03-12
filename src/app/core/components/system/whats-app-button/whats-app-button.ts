import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-whats-app-button',
  templateUrl: './whats-app-button.html',
  styleUrl: './whats-app-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsAppButton {}
