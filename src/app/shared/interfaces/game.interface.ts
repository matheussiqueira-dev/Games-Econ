export interface iGame {
  id: string;
  title: string;
  studio: string;
  category: string;
  thumbnail: string;
  featured?: boolean;
  description?: string;
}

export interface iFeaturedGame extends iGame {
  heroImage: string;
  description: string;
  trending: boolean;
}
