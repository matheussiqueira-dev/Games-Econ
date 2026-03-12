import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { iGame, iFeaturedGame } from '../interfaces/game.interface';
import { iActivity, ActivityType } from '../interfaces/activity.interface';
import { iFriend, FriendStatus } from '../interfaces/friend.interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly games = signal<iGame[]>([
    {
      id: '1',
      title: 'Naruto: Rasengan and Chidori',
      studio: 'VAND Studios',
      category: '',
      thumbnail: 'assets/naruto.png'
    },
    {
      id: '2',
      title: 'Galaga',
      studio: 'VAND Studios',
      category: 'ARCADE',
      thumbnail: 'assets/galaga.png'
    },
    {
      id: '3',
      title: 'Future implementation',
      studio: 'VAND Studios',
      category: 'In Development',
      thumbnail: 'assets/logo.png'
    },
    {
      id: '4',
      title: 'Future implementation',
      studio: 'VAND Studios',
      category: 'In Development',
      thumbnail: 'assets/logo.png'
    },
    {
      id: '5',
      title: 'Future implementation',
      studio: 'VAND Studios',
      category: 'In Development',
      thumbnail: 'assets/logo.png'
    }
  ]);

  private readonly featuredGame = signal<iFeaturedGame>({
    id: '2',
    title: 'Galaga',
    studio: 'VAND Studios',
    category: 'ARCADE',
    thumbnail: 'assets/galaga2.png',
    heroImage: 'assets/galaga2.png',
    description: 'Relive the classic arcade shooter where you defend against waves of alien invaders.',
    featured: true,
    trending: true
  });

  private readonly activities = signal<iActivity[]>([
    {
      id: '1',
      type: ActivityType.Achievement,
      title: 'Achievement Unlocked',
      description: '"Speed Demon" in Apex Velocity',
      timestamp: '2h ago',
      icon: '🏆',
      iconColor: '#22c55e'
    },
    {
      id: '2',
      type: ActivityType.Update,
      title: 'Update Completed',
      description: 'Cyber-Reckoning v2.4.0 Patch',
      timestamp: '5h ago',
      icon: '⬇️',
      iconColor: '#3b82f6'
    },
    {
      id: '3',
      type: ActivityType.Friend,
      title: 'Friend Request',
      description: 'NightShade_42 wants to join your party',
      timestamp: 'Yesterday',
      icon: '👥',
      iconColor: '#a855f7'
    }
  ]);

  private readonly friends = signal<iFriend[]>([
    {
      id: '1',
      username: 'friend1',
      avatar: 'assets/logo.png',
      status: FriendStatus.Playing,
      currentGame: 'Mist Walker'
    },
    {
      id: '2',
      username: 'friend2',
      avatar: 'assets/logo.png',
      status: FriendStatus.Online
    },
    {
      id: '3',
      username: 'friend3',
      avatar: 'assets/logo.png',
      status: FriendStatus.Away,
      lastSeen: '15m'
    }
  ]);

  readonly allGames = computed(() => this.games());
  readonly currentFeaturedGame = computed(() => this.featuredGame());
  readonly recentActivities = computed(() => this.activities());
  readonly topFriends = computed(() => this.friends());
  
  private router = inject(Router);

  playGame(game: iGame): void {
    console.log(`Starting game: ${game.title}`);
    
    this.router.navigate(['play-game'], { 
      queryParams: { 
        gameId: game.id, 
        title: game.title,
        category: game.category 
      } 
    });
    
  }
}
