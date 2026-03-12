import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { iActivity } from '../../interfaces/activity.interface';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.html',
  styleUrl: './activity-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityItem {
  readonly activity = input.required<iActivity>();
}
