import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Naruto } from '../../shared/components/games/naruto/naruto';
import { Galaga } from '../../shared/components/games/galaga/galaga';
import { EncomPanel } from '../../shared/components/ui/encom-panel/encom-panel';

@Component({
  selector: 'app-play-game-page',
  imports: [Naruto, Galaga, RouterLink, EncomPanel],
  templateUrl: './play-game-page.html',
  styleUrl: './play-game-page.css',
})
export class PlayGamePage implements OnInit {
  private route = inject(ActivatedRoute);
  
  gameId?: string;
  gameTitle?: string;
  gameCategory?: string;
  selectedGame?: string;

  ngOnInit(): void {
    // Capturar query parameters
    this.route.queryParams.subscribe(params => {
      this.gameId = params['gameId'];
      this.gameTitle = params['title'];
      this.gameCategory = params['category'];
      
      console.log('Game ID:', this.gameId);
      console.log('Game Title:', this.gameTitle);
      console.log('Game Category:', this.gameCategory);
      
      // Determinar qual jogo carregar baseado no título ou ID
      this.determineSelectedGame();
    });
  }
  
  private determineSelectedGame(): void {
    if (this.gameTitle?.includes('Naruto') || this.gameId === '1') {
      this.selectedGame = 'naruto';
    } else if (this.gameTitle?.includes('Galaga') || this.gameId === '2') {
      this.selectedGame = 'galaga';
    } else {
      this.selectedGame = 'default';
    }
    console.log('Selected game:', this.selectedGame);
  }

    // Para capturar parâmetros de rota (caso use /play-game/:id)
    // this.route.params.subscribe(params => {
    //   this.gameId = params['id'];
    // });

    // Para capturar state (dados via navigate state)
    // const navigation = this.router.getCurrentNavigation();
    // const stateData = navigation?.extras?.state?.['game'];
    
    // Para capturar fragment (#section)
    // this.route.fragment.subscribe(fragment => {
    //   console.log('Fragment:', fragment);
    // });
  }
