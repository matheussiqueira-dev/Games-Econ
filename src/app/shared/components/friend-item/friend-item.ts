import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { iFriend, FriendStatus } from '../../interfaces/friend.interface';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.html',
  styleUrl: './friend-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FriendItem {
  readonly friend = input.required<iFriend>();

  protected readonly statusText = computed(() => {
    const friend = this.friend();
    switch (friend.status) {
      case FriendStatus.Playing:
        return `Playing: ${friend.currentGame}`;
      case FriendStatus.Online:
        return 'Online';
      case FriendStatus.Away:
        return `Away - ${friend.lastSeen}`;
      default:
        return 'Offline';
    }
  });

  protected readonly statusColor = computed(() => {
    switch (this.friend().status) {
      case FriendStatus.Playing:
      case FriendStatus.Online:
        return '#22c55e';
      case FriendStatus.Away:
        return '#64748b';
      default:
        return '#64748b';
    }
  });
}
