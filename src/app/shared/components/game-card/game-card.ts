import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { iGame } from '../../interfaces/game.interface';
import { TronCard } from '../ui/tron-card/tron-card';

@Component({
  selector: 'app-game-card',
  imports: [TronCard],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCard {
  readonly game = input.required<iGame>();
  readonly gameSelected = output<iGame>();
  protected readonly description = computed(() => {
    const game = this.game();
    return (
      game.description?.trim() ||
      `${game.studio} protocol optimized for ${game.category || 'experimental arcade'} deployment inside the ENCOM grid.`
    );
  });
  protected readonly details = computed(() => {
    const game = this.game();
    return `Studio ${game.studio}. Category ${game.category || 'Prototype'}. Module tuned for holographic presentation and rapid launch.`;
  });

  protected onGameClick(): void {
    this.gameSelected.emit(this.game());
  }
}
