import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundGrid } from './core/components/system/background-grid/background-grid';
import { Footer } from './core/components/system/footer/footer';
import { WhatsAppButton } from './core/components/system/whats-app-button/whats-app-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BackgroundGrid, Footer, WhatsAppButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Games-ECON');
}
