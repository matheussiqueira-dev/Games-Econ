import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-main-card',
  imports: [],
  templateUrl: './main-card.html',
  styleUrl: './main-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainCard {
  width = input<string>('350px');
  height = input<string>('400px');
  justifyContent = input<string>('center');
  alignItems = input<string>('center');
  flexDirection = input<string>('column');
  opacity = input<string>('1');
  gap = input<string>('10px');
  background = input<string>('rgba(40, 30, 60, 0.55)');
}
