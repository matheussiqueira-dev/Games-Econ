export enum FriendStatus {
  Online = 'online',
  Away = 'away',
  Playing = 'playing'
}

export interface iFriend {
  id: string;
  username: string;
  avatar: string;
  status: FriendStatus;
  currentGame?: string;
  lastSeen?: string;
}
