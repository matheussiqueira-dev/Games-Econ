import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { GameCard } from '../../shared/components/game-card/game-card';
import { ActivityItem } from '../../shared/components/activity-item/activity-item';
import { FriendItem } from '../../shared/components/friend-item/friend-item';
import { GameService } from '../../shared/services/game.service';
import { CurrentLoggedInUserStore } from '../../core/storage/current-logged-in-user.store';
import { iGame } from '../../shared/interfaces/game.interface';
import { HandTrackingWidget } from "../../shared/components/hand-tracking-widget/hand-tracking-widget";
import { EncomPanel } from '../../shared/components/ui/encom-panel/encom-panel';
import { TronButton } from '../../shared/components/ui/tron-button/tron-button';

@Component({
  selector: 'app-play-game-page',
  imports: [Sidebar, GameCard, ActivityItem, FriendItem, HandTrackingWidget, EncomPanel, TronButton],
  templateUrl: './play-game-dashboard.html',
  styleUrls: ['./play-game-dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayGameDashboard {
  private readonly gameService = inject(GameService);
  private readonly userStore = inject(CurrentLoggedInUserStore);

  protected readonly featuredGame = this.gameService.currentFeaturedGame;
  protected readonly recommendedGames = this.gameService.allGames;
  protected readonly activities = this.gameService.recentActivities;
  protected readonly friends = this.gameService.topFriends;
  protected readonly currentUser = this.userStore.currentUser;

  // Adiciona a propriedade para habilitar/desabilitar o hand tracking
  public handTrackingEnabled: boolean = true;

  onHandTrackingToggle(): void {
    this.handTrackingEnabled = !this.handTrackingEnabled;
  }

  protected onGameSelected(game: iGame): void {
    this.gameService.playGame(game);
  }

  protected onPlayFeatured(): void {
    this.gameService.playGame(this.featuredGame());
  }

  protected onNavigationClicked(route: string): void {
    console.log(`Navigating to: ${route}`);
  }
}
