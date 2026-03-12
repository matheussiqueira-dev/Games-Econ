import { computed, Injectable, signal } from '@angular/core';
import { iUser } from '../interfaces/user/user.interface';


@Injectable({
  providedIn: 'root',
})
export class CurrentLoggedInUserStore {
  private readonly state = signal<iUser | null>(null);

  setUser(user: iUser) {
    this.state.set(user);
  }

  currentUser = computed(() => this.state());

  isLoggedIn = computed(() => this.currentUser() !== null);

  logout() {
    this.state.set(null);
  }
}
