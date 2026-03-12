import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCard } from './game-card';
import { iGame } from '../../interfaces/game.interface';

describe('GameCard', () => {
  let component: GameCard;
  let fixture: ComponentFixture<GameCard>;

  const mockGame: iGame = {
    id: '1',
    title: 'Test Game',
    studio: 'Test Studio',
    category: 'RPG',
    thumbnail: 'test.jpg'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('game', mockGame);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit gameSelected when clicked', () => {
    spyOn(component.gameSelected, 'emit');
    component['onGameClick']();
    expect(component.gameSelected.emit).toHaveBeenCalledWith(mockGame);
  });
});
