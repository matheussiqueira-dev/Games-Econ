export enum ActivityType {
  Achievement = 'achievement',
  Update = 'update',
  Friend = 'friend'
}

export interface iActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconColor: string;
}
