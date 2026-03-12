import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { iGame } from '../../interfaces/game.interface';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCard {
  readonly game = input.required<iGame>();
  readonly gameSelected = output<iGame>();

  protected onGameClick(): void {
    this.gameSelected.emit(this.game());
  }
}
