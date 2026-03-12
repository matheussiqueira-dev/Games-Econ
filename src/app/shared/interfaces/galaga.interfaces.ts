export interface IBullet {
  x: number;
  y: number;
  speed: number;
  active: boolean;
}

export interface IEnemy {
  x: number;
  y: number;
  type: 'basic' | 'mid' | 'boss';
  hp: number;
  active: boolean;
  baseX: number;
  baseY: number;
  phase: number;
  diving: boolean;
  diveAngle: number;
  diveSpeed: number;
  width: number;
  height: number;
  points: number;
}

export interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface IStar {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}
