import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-encom-panel',
  templateUrl: './encom-panel.html',
  styleUrl: './encom-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncomPanel {
  readonly compact = input(false);
  readonly elevated = input(false);
}
