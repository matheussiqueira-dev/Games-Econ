import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { HandTrackingService } from '../../../services/hand-tracking-service';
import { IBullet, IEnemy, IParticle, IStar } from '../../../interfaces/galaga.interfaces';

// ── Constantes do jogo ───────────────────────────────────────────────────────

const GALAGA = {
  PLAYER_SPEED: 7,
  BULLET_SPEED: 12,
  FIRE_RATE: 160,
  ENEMY_COLS: 8,
  ENEMY_ROWS: 4,
  ENEMY_SPACING_X: 56,
  ENEMY_SPACING_Y: 48,
  DIVE_CHANCE: 0.001,
  DIVE_SPEED: 3.5,
  STAR_COUNT: 120,
  STEERING_SENSITIVITY: 12,
  STEERING_DEADZONE: 0.025,
  PLAYER_WIDTH: 40,
  PLAYER_HEIGHT: 32,
  ENEMY_BULLET_SPEED: 5,
  ENEMY_FIRE_CHANCE: 0.003,
  RESTART_COOLDOWN: 2000,
} as const;



@Component({
  selector: 'app-galaga',
  imports: [],
  templateUrl: './galaga.html',
  styleUrl: './galaga.css',
})
export class Galaga implements AfterViewInit, OnDestroy {
  private handTracking = inject(HandTrackingService);

  // ── Canvas ──────────────────────────────────────────────────────────────
  private ctx!: CanvasRenderingContext2D;
  private gameCanvas!: HTMLCanvasElement;
  private canvasW = 0;
  private canvasH = 0;
  private animFrameId = 0;

  // ── Jogador ─────────────────────────────────────────────────────────────
  private playerX = 0;
  private playerY = 0;
  private lives = 3;
  private score = 0;
  private wave = 1;
  private invulnerable = false;
  private invulnerableTimer = 0;

  // ── Controle do volante ─────────────────────────────────────────────────
  private steeringInput = 0;
  private bothHandsClosed = false;

  // ── Entidades do jogo ───────────────────────────────────────────────────
  private bullets: IBullet[] = [];
  private enemyBullets: IBullet[] = [];
  private enemies: IEnemy[] = [];
  private particles: IParticle[] = [];
  private stars: IStar[] = [];

  // ── Hand results (para desenho no canvas) ────────────────────────────────
  private lastHandResults: any = null;

  // ── Timing ──────────────────────────────────────────────────────────────
  private lastFireTime = 0;
  private lastFrameTime = 0;
  private gameOverTime = 0;
  private formationOffsetX = 0;
  private formationDir = 1;

  // ── Estado público (template binding) ───────────────────────────────────
  public isLoading = false; //TODO : Corrigir loading
  public gameStarted = false;
  public gameOver = false;

  // ═══════════════════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngAfterViewInit(): void {
    setTimeout(() => this.setup(), 1000);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.handTracking.stop();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INICIALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  private async setup(): Promise<void> {
    try {
      const video = document.getElementById('galaga-cam') as HTMLVideoElement;
      this.gameCanvas = document.getElementById('galaga-canvas') as HTMLCanvasElement;

      if (!video || !this.gameCanvas) {
        console.error('[Galaga] Elementos não encontrados, tentando novamente...');
        setTimeout(() => this.setup(), 500);
        return;
      }

      this.ctx = this.gameCanvas.getContext('2d')!;
      this.syncCanvasSize();

      // Inicializa hand tracking com vídeo oculto (sem skeleton, sem canvas overlay)
      await this.handTracking.initialize(video, (res) => this.onHandResults(res));
      await this.handTracking.start();

      this.initStars();
      this.isLoading = false;

      this.lastFrameTime = performance.now();
      this.gameLoop(this.lastFrameTime);

      console.log('[Galaga] Hand tracking e game loop iniciados.');
    } catch (error) {
      console.error('[Galaga] Falha na inicialização:', error);
      setTimeout(() => this.setup(), 2000);
    }
  }

  /** Ajusta o canvas ao tamanho do container (só reseta se mudou) */
  private syncCanvasSize(): void {
    const parent = this.gameCanvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === this.canvasW && h === this.canvasH) return;

    this.canvasW = w;
    this.canvasH = h;
    this.gameCanvas.width = w;
    this.gameCanvas.height = h;
    this.playerY = h - 60;
    if (this.playerX === 0) this.playerX = w / 2;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HAND TRACKING CALLBACK
  // ═══════════════════════════════════════════════════════════════════════════
  //
  //  Detecção do gesto "volante":
  //  - Ambas as mãos com punhos fechados (≤1 dedo estendido)
  //  - Diferença Y entre pulsos = ângulo do volante
  //  - Mão direita mais baixa (Y maior) que esquerda → virar para DIREITA
  //  - Mão esquerda mais baixa que direita → virar para ESQUERDA
  //
  //  Labels do MediaPipe são anatômicos: "Left" = mão esquerda real do usuário.
  // ═══════════════════════════════════════════════════════════════════════════

  private onHandResults(res: any): void {
    this.lastHandResults = res;

    if (!res.multiHandLandmarks || !res.multiHandedness || res.multiHandLandmarks.length < 2) {
      this.bothHandsClosed = false;
      return;
    }

    let leftWristY = -1;
    let rightWristY = -1;
    let leftClosed = false;
    let rightClosed = false;

    for (let i = 0; i < res.multiHandLandmarks.length; i++) {
      const label = res.multiHandedness[i].label;   // "Left" ou "Right" (anatômico)
      const landmarks = res.multiHandLandmarks[i];
      const wristY = landmarks[0].y;                // landmark 0 = pulso, y normalizado 0..1
      const isClosed = this.handTracking.checkFingers(landmarks, 0); // < 2 dedos = punho

      if (label === 'Left') {
        rightWristY = wristY;
        rightClosed = isClosed;
 
      } else {
        leftWristY = wristY;
        leftClosed = isClosed;
 
      }
    }

    // Precisa de ambas as mãos fechadas para pilotar
    if (leftWristY < 0 || rightWristY < 0 || !leftClosed || !rightClosed) {
      this.bothHandsClosed = false;
      this.steeringInput *= 0.85; // decay suave
      return;
    }

    this.bothHandsClosed = true;

    // Diferença Y → ângulo do volante
    // Mão direita mais baixa (Y maior) = volante virado p/ direita (sentido horário)
    const diff = rightWristY - leftWristY;

    this.steeringInput = Math.abs(diff) < GALAGA.STEERING_DEADZONE
      ? 0
      : Math.max(-1, Math.min(1, diff * GALAGA.STEERING_SENSITIVITY));

    // Iniciar ou reiniciar o jogo ao fechar os punhos
    if (!this.gameStarted) {
      const now = performance.now();
      if (!this.gameOver || now - this.gameOverTime > GALAGA.RESTART_COOLDOWN) {
        this.startGame();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CONTROLE DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  private startGame(): void {
    this.gameStarted = true;
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.playerX = this.canvasW / 2;
    this.invulnerable = false;
    this.spawnWave();
  }

  private spawnWave(): void {
    this.enemies = [];
    const cols = GALAGA.ENEMY_COLS;
    const rows = Math.min(GALAGA.ENEMY_ROWS + Math.floor(this.wave / 3), 6);
    const startX = (this.canvasW - (cols - 1) * GALAGA.ENEMY_SPACING_X) / 2;
    const startY = 70;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const type = row === 0 ? 'boss' : row <= 1 ? 'mid' : 'basic';
        const bx = startX + col * GALAGA.ENEMY_SPACING_X;
        const by = startY + row * GALAGA.ENEMY_SPACING_Y;

        this.enemies.push({
          x: bx, y: by, type,
          hp: type === 'boss' ? 2 : 1,
          active: true,
          baseX: bx, baseY: by,
          phase: Math.random() * Math.PI * 2,
          diving: false,
          diveAngle: 0,
          diveSpeed: GALAGA.DIVE_SPEED + this.wave * 0.3,
          width: type === 'boss' ? 36 : 28,
          height: type === 'boss' ? 30 : 24,
          points: type === 'boss' ? 400 : type === 'mid' ? 200 : 100,
        });
      }
    }

    this.formationOffsetX = 0;
    this.formationDir = 1;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GAME LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  private gameLoop = (timestamp: number): void => {
    const dt = Math.min((timestamp - this.lastFrameTime) / 16.67, 3); // normalizado ~60fps
    this.lastFrameTime = timestamp;

    this.syncCanvasSize();
    this.update(dt, timestamp);
    this.render();

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════════════════

  private update(dt: number, now: number): void {
    this.updateStars(dt);
    if (!this.gameStarted || this.gameOver) return;

    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateEnemyBullets(dt);
    this.updateParticles(dt);
    this.checkCollisions();
    this.autoFire(now);

    // Próxima onda quando todos eliminados
    if (this.enemies.every(e => !e.active)) {
      this.wave++;
      this.spawnWave();
    }

    // Timer de invulnerabilidade
    if (this.invulnerable) {
      this.invulnerableTimer -= dt * 16.67;
      if (this.invulnerableTimer <= 0) this.invulnerable = false;
    }
  }

  private updatePlayer(dt: number): void {
    this.playerX += this.steeringInput * GALAGA.PLAYER_SPEED * dt;
    const halfW = GALAGA.PLAYER_WIDTH / 2;
    this.playerX = Math.max(halfW, Math.min(this.canvasW - halfW, this.playerX));
  }

  private updateBullets(dt: number): void {
    for (const b of this.bullets) {
      if (!b.active) continue;
      b.y -= b.speed * dt;
      if (b.y < -10) b.active = false;
    }
    this.bullets = this.bullets.filter(b => b.active);
  }

  private updateEnemyBullets(dt: number): void {
    for (const b of this.enemyBullets) {
      if (!b.active) continue;
      b.y += b.speed * dt;
      if (b.y > this.canvasH + 10) b.active = false;
    }
    this.enemyBullets = this.enemyBullets.filter(b => b.active);
  }

  private updateEnemies(dt: number): void {
    // Formação oscila lateralmente
    this.formationOffsetX += 0.5 * this.formationDir * dt;
    if (Math.abs(this.formationOffsetX) > this.canvasW * 0.12) {
      this.formationDir *= -1;
    }

    for (const e of this.enemies) {
      if (!e.active) continue;

      if (e.diving) {
        // Mergulho com trajetória sinusoidal
        e.y += e.diveSpeed * dt;
        e.x += Math.sin(e.diveAngle) * 2.5 * dt;
        e.diveAngle += 0.05 * dt;

        // Retorna à formação após sair da tela
        if (e.y > this.canvasH + 50) {
          e.diving = false;
          e.x = e.baseX + this.formationOffsetX;
          e.y = e.baseY;
        }
      } else {
        // Movimento na formação
        e.x = e.baseX + this.formationOffsetX + Math.sin(e.phase) * 15;
        e.y = e.baseY;
        e.phase += 0.02 * dt;

        // Chance de mergulhar (aumenta por onda)
        if (Math.random() < GALAGA.DIVE_CHANCE * dt * (1 + this.wave * 0.15)) {
          e.diving = true;
          e.diveAngle = Math.random() * Math.PI * 2;
        }

        // Chance de atirar
        if (Math.random() < GALAGA.ENEMY_FIRE_CHANCE * dt) {
          this.enemyBullets.push({
            x: e.x,
            y: e.y + e.height / 2,
            speed: GALAGA.ENEMY_BULLET_SPEED + this.wave * 0.4,
            active: true,
          });
        }
      }
    }
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 16.67;
      p.vy += 0.05 * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  /** Disparo automático enquanto ambas as mãos estiverem fechadas */
  private autoFire(now: number): void {
    if (!this.bothHandsClosed || now - this.lastFireTime < GALAGA.FIRE_RATE) return;

    this.bullets.push({
      x: this.playerX,
      y: this.playerY - GALAGA.PLAYER_HEIGHT / 2,
      speed: GALAGA.BULLET_SPEED,
      active: true,
    });
    this.lastFireTime = now;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  COLISÕES
  // ═══════════════════════════════════════════════════════════════════════════

  private checkCollisions(): void {
    // Tiros do jogador → inimigos
    for (const b of this.bullets) {
      if (!b.active) continue;
      for (const e of this.enemies) {
        if (!e.active) continue;
        if (Math.abs(b.x - e.x) < e.width / 2 + 3 && Math.abs(b.y - e.y) < e.height / 2 + 8) {
          b.active = false;
          e.hp--;
          if (e.hp <= 0) {
            e.active = false;
            this.score += e.points;
            const color = e.type === 'boss' ? '#ff4466' : e.type === 'mid' ? '#ffaa00' : '#44ff88';
            this.spawnExplosion(e.x, e.y, color);
          }
          break;
        }
      }
    }

    if (this.invulnerable) return;

    // Tiros inimigos → jogador
    for (const b of this.enemyBullets) {
      if (!b.active) continue;
      if (Math.abs(b.x - this.playerX) < GALAGA.PLAYER_WIDTH / 2 &&
          Math.abs(b.y - this.playerY) < GALAGA.PLAYER_HEIGHT / 2) {
        b.active = false;
        this.playerHit();
        return;
      }
    }

    // Inimigos mergulhando → jogador
    for (const e of this.enemies) {
      if (!e.active || !e.diving) continue;
      if (Math.abs(e.x - this.playerX) < (e.width + GALAGA.PLAYER_WIDTH) / 2 &&
          Math.abs(e.y - this.playerY) < (e.height + GALAGA.PLAYER_HEIGHT) / 2) {
        e.active = false;
        this.score += e.points;
        this.spawnExplosion(e.x, e.y, '#ff8800');
        this.playerHit();
        return;
      }
    }
  }

  private playerHit(): void {
    this.lives--;
    this.spawnExplosion(this.playerX, this.playerY, '#ffffff');

    if (this.lives <= 0) {
      this.gameOver = true;
      this.gameStarted = false;
      this.gameOverTime = performance.now();
    } else {
      this.invulnerable = true;
      this.invulnerableTimer = 2000;
      this.playerX = this.canvasW / 2;
    }
  }

  private spawnExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300 + Math.random() * 400,
        maxLife: 700,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  private render(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    // Fundo do espaço
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    this.renderStars();

    if (this.gameStarted && !this.gameOver) {
      this.renderEnemies();
      this.renderBullets();
      this.renderEnemyBullets();
      this.renderPlayer();
      this.renderParticles();
      this.renderHands();
      this.renderHUD();
      this.renderSteeringIndicator();
    } else if (this.gameOver) {
      this.renderParticles();
      this.renderHands();
      this.renderGameOver();
    } else {
      this.renderStartScreen();
      this.renderHands();
    }
  }

  // ── Estrelas ──────────────────────────────────────────────────────────────

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < GALAGA.STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random() * (this.canvasW || 1200),
        y: Math.random() * (this.canvasH || 800),
        speed: 0.2 + Math.random() * 1.5,
        size: 0.5 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
  }

  private updateStars(dt: number): void {
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > this.canvasH) {
        s.y = 0;
        s.x = Math.random() * this.canvasW;
      }
    }
  }

  private renderStars(): void {
    const ctx = this.ctx;
    for (const s of this.stars) {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── Nave do jogador ───────────────────────────────────────────────────────

  private renderPlayer(): void {
    const ctx = this.ctx;
    const px = this.playerX;
    const py = this.playerY;

    // Pisca durante invulnerabilidade
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) return;

    ctx.save();

    // Motor — glow azul
    const glow = ctx.createRadialGradient(px, py + 16, 0, px, py + 16, 22);
    glow.addColorStop(0, 'rgba(0, 200, 255, 0.8)');
    glow.addColorStop(0.5, 'rgba(0, 100, 255, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(px - 22, py + 6, 44, 26);

    // Corpo principal
    ctx.fillStyle = '#00d4ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d4ff';

    ctx.beginPath();
    ctx.moveTo(px, py - 18);        // nariz
    ctx.lineTo(px + 18, py + 14);   // asa direita
    ctx.lineTo(px + 6, py + 8);
    ctx.lineTo(px + 6, py + 14);
    ctx.lineTo(px - 6, py + 14);
    ctx.lineTo(px - 6, py + 8);
    ctx.lineTo(px - 18, py + 14);   // asa esquerda
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#80eeff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(px, py - 10);
    ctx.lineTo(px + 5, py + 2);
    ctx.lineTo(px - 5, py + 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // ── Inimigos ──────────────────────────────────────────────────────────────

  private renderEnemies(): void {
    const ctx = this.ctx;
    for (const e of this.enemies) {
      if (!e.active) continue;

      ctx.save();

      const colors: Record<string, [string, string]> = {
        boss:  ['#ff4466', '#ff2244'],
        mid:   ['#ffaa00', '#ff8800'],
        basic: ['#44ff88', '#22ff66'],
      };
      const [fill, glowColor] = colors[e.type] ?? colors['basic'];

      ctx.shadowBlur = 10;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = fill;

      if (e.type === 'boss')      this.drawBossEnemy(ctx, e.x, e.y, e.width);
      else if (e.type === 'mid')  this.drawMidEnemy(ctx, e.x, e.y, e.width);
      else                        this.drawBasicEnemy(ctx, e.x, e.y, e.width);

      ctx.restore();
    }
  }

  private drawBossEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
    const h = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + h, y - h * 0.3);
    ctx.lineTo(x + h * 1.2, y);
    ctx.lineTo(x + h, y + h * 0.5);
    ctx.lineTo(x + h * 0.3, y + h * 0.3);
    ctx.lineTo(x - h * 0.3, y + h * 0.3);
    ctx.lineTo(x - h, y + h * 0.5);
    ctx.lineTo(x - h * 1.2, y);
    ctx.lineTo(x - h, y - h * 0.3);
    ctx.closePath();
    ctx.fill();

    // Olhos do boss
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMidEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
    const h = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + h, y);
    ctx.lineTo(x + h * 0.6, y + h * 0.5);
    ctx.lineTo(x, y + h * 0.3);
    ctx.lineTo(x - h * 0.6, y + h * 0.5);
    ctx.lineTo(x - h, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawBasicEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
    const h = w / 2;

    // Corpo circular
    ctx.beginPath();
    ctx.arc(x, y, h * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Asa esquerda
    ctx.beginPath();
    ctx.moveTo(x - h * 0.5, y);
    ctx.lineTo(x - h, y + h * 0.4);
    ctx.lineTo(x - h * 0.3, y + h * 0.2);
    ctx.fill();

    // Asa direita
    ctx.beginPath();
    ctx.moveTo(x + h * 0.5, y);
    ctx.lineTo(x + h, y + h * 0.4);
    ctx.lineTo(x + h * 0.3, y + h * 0.2);
    ctx.fill();
  }

  // ── Projéteis ─────────────────────────────────────────────────────────────

  private renderBullets(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = '#00ffff';

    for (const b of this.bullets) {
      if (!b.active) continue;
      ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
    }
    ctx.restore();
  }

  private renderEnemyBullets(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff4444';
    ctx.fillStyle = '#ff6666';

    for (const b of this.enemyBullets) {
      if (!b.active) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Partículas de explosão ────────────────────────────────────────────────

  private renderParticles(): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ── HUD (score, vidas, wave) ──────────────────────────────────────────────

  private renderHUD(): void {
    const ctx = this.ctx;
    ctx.save();

    // Score
    ctx.font = '20px "Orbitron", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 20, 30);

    // Wave
    ctx.textAlign = 'center';
    ctx.fillText(`WAVE ${this.wave}`, this.canvasW / 2, 30);

    // Vidas (triângulos representando naves)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00d4ff';
    for (let i = 0; i < this.lives; i++) {
      const lx = this.canvasW - 30 - i * 30;
      ctx.beginPath();
      ctx.moveTo(lx, 18);
      ctx.lineTo(lx + 8, 30);
      ctx.lineTo(lx - 8, 30);
      ctx.closePath();
      ctx.fill();
    }

    // Alerta quando não está pilotando
    if (!this.bothHandsClosed) {
      ctx.font = '14px "Orbitron", monospace';
      ctx.fillStyle = '#ff8844';
      ctx.textAlign = 'center';
      ctx.fillText('✊ FECHE AMBAS AS MÃOS PARA PILOTAR', this.canvasW / 2, this.canvasH - 20);
    }

    ctx.restore();
  }

  // ── Indicador visual do volante ───────────────────────────────────────────

  private renderSteeringIndicator(): void {
    if (!this.bothHandsClosed) return;

    const ctx = this.ctx;
    const cx = this.canvasW / 2;
    const cy = this.canvasH - 45;
    const angle = this.steeringInput * 0.6; // ângulo visual do volante

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Aro do volante
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Raios do volante
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();

    // Centro
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── Mãos (esqueleto) ────────────────────────────────────────────────────────

  private renderHands(): void {
    if (!this.lastHandResults?.multiHandLandmarks?.length) return;
    const ctx = this.ctx;

    ctx.save();
    // Espelha horizontalmente para corresponder à orientação selfie da câmera
    ctx.scale(-1, 1);
    ctx.translate(-this.canvasW, 0);

    for (const landmarks of this.lastHandResults.multiHandLandmarks) {
      this.handTracking.drawHandSkeleton(ctx, landmarks);
    }

    ctx.restore();
  }

  // ── Tela inicial ──────────────────────────────────────────────────────────

  private renderStartScreen(): void {
    const ctx = this.ctx;
    const cx = this.canvasW / 2;
    const cy = this.canvasH / 2;

    ctx.save();

    // Título
    ctx.font = 'bold 48px "Orbitron", monospace';
    ctx.fillStyle = '#00d4ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00d4ff';
    ctx.textAlign = 'center';
    ctx.fillText('GALAGA', cx, cy - 60);

    // Subtítulo
    ctx.shadowBlur = 0;
    ctx.font = '16px "Orbitron", monospace';
    ctx.fillStyle = '#8888aa';
    ctx.fillText('HAND TRACKING EDITION', cx, cy - 30);

    // Instruções
    ctx.font = '14px "Orbitron", monospace';
    ctx.fillStyle = '#aaaacc';
    ctx.fillText('✊ Feche ambas as mãos como se segurasse um volante', cx, cy + 30);
    ctx.fillText('↕ Levante uma mão e abaixe outra para virar', cx, cy + 55);
    ctx.fillText('🔫 Tiro automático enquanto pilota', cx, cy + 80);

    // Prompt piscante
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = '#00d4ff';
      ctx.fillText('FECHE OS PUNHOS PARA COMEÇAR', cx, cy + 130);
    }

    ctx.restore();
  }

  // ── Tela de game over ─────────────────────────────────────────────────────

  private renderGameOver(): void {
    const ctx = this.ctx;
    const cx = this.canvasW / 2;
    const cy = this.canvasH / 2;

    ctx.save();

    // Overlay escuro
    ctx.fillStyle = 'rgba(5, 5, 10, 0.7)';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Game Over
    ctx.font = 'bold 42px "Orbitron", monospace';
    ctx.fillStyle = '#ff4466';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4466';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy - 40);

    // Score final
    ctx.shadowBlur = 0;
    ctx.font = '22px "Orbitron", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SCORE: ${this.score}`, cx, cy + 10);
    ctx.fillText(`WAVE: ${this.wave}`, cx, cy + 40);

    // Prompt de restart
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.font = '14px "Orbitron", monospace';
      ctx.fillStyle = '#00d4ff';
      ctx.fillText('FECHE OS PUNHOS PARA RECOMEÇAR', cx, cy + 90);
    }

    ctx.restore();
  }
}
