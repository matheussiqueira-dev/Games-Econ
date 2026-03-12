import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentLoggedInUserStore } from '../../storage/current-logged-in-user.store';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  private readonly router = inject(Router);
  private readonly userStore = inject(CurrentLoggedInUserStore);
  
  readonly navigationClicked = output<string>();

  protected onNavigate(route: string): void {
    this.navigationClicked.emit(route);
    this.router.navigate([route]);
  }

  protected onLogout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }
}
