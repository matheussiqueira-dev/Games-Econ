import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-background-grid',
  templateUrl: './background-grid.html',
  styleUrl: './background-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundGrid {}
