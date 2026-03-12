import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { HandTrackingService } from '../../../services/hand-tracking-service';

// ─── Responsabilidade deste componente ───────────────────────────────────────
// ✅ Registrar o callback onResults com lógica específica do jogo Naruto
// ✅ Controlar os efeitos visuais Rasengan e Chidori
// ✅ Calcular posição dos efeitos na tela com base nos landmarks
// ✅ Controlar pwr[] (poder) e wasOpen[] (estado anterior da mão)
// ❌ NÃO cria instância de Hands ou Camera — isso é responsabilidade do service
// ─────────────────────────────────────────────────────────────────────────────

//TODO Implement hands controlling on all screens, not just the game screen. Maybe add some hand controlled easter eggs on the dashboard or something?
//TODO implementar isLoading
@Component({
  selector: 'app-naruto',
  templateUrl: './naruto.html',
  styleUrls: ['./naruto.css'],
})
export class Naruto implements  AfterViewInit, OnDestroy {

  // Injeção do serviço genérico de hand tracking
  private handTracking = inject(HandTrackingService);
 
  public isLoading = false; //TODO : Corrigir loading

  // ── Estado dos efeitos visuais (exclusivo do Naruto) ────────────────────
  private pwr = [0, 0];             // força atual de cada mão [esquerda, direita] 0→1
  private wasOpen = [false, false]; // estado anterior: mão estava aberta?


  ngAfterViewInit(): void {
    // Aguarda os scripts CDN do MediaPipe carregarem antes de inicializar
    // equivalente ao WidgetsBinding.instance.addPostFrameCallback((_) { ... })
    setTimeout(() => {
      this.setup();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Para a câmera e libera recursos — equivalente ao dispose() do Flutter
    this.handTracking.stop();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // setup()
  // Obtém os elementos do DOM e delega a inicialização ao HandTrackingService,
  // passando o callback onResults específico deste componente.
  // ─────────────────────────────────────────────────────────────────────────
  private async setup(): Promise<void> {
    try {
      const videoElement = document.getElementById('v_src') as HTMLVideoElement;
      const canvasElement = document.getElementById('out') as HTMLCanvasElement;

      if (!videoElement || !canvasElement) {
        console.error('[Naruto] Elementos de vídeo ou canvas não encontrados, tentando novamente...');
        setTimeout(() => this.setup(), 500);
        return;
      }

      // Inicializa o MediaPipe via service, passando o onResults deste componente
      await this.handTracking.initialize(videoElement, (res) => this.onResults(res, videoElement, canvasElement));
      await this.handTracking.start();

      console.log('[Naruto] Hand tracking iniciado.');
      this.isLoading = false;

    } catch (error) {
      console.error('[Naruto] Falha ao iniciar hand tracking:', error);
      this.isLoading = false;
      setTimeout(() => {
        this.isLoading = true;
        this.setup();
      }, 2000);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // onResults()
  // Callback chamado pelo MediaPipe a cada frame da câmera.
  // EXCLUSIVO do Naruto: aplica os efeitos Rasengan e Chidori.
  // O service entrega os dados brutos; este componente decide o que fazer.
  // ─────────────────────────────────────────────────────────────────────────
  private onResults(res: any, vElement: HTMLVideoElement, cElement: HTMLCanvasElement): void {
    const ctx = cElement.getContext('2d')!;
    const chidori  = document.getElementById('n') as HTMLVideoElement; // efeito mão esquerda
    const rasengan = document.getElementById('s') as HTMLVideoElement; // efeito mão direita

    cElement.width  = vElement.videoWidth;
    cElement.height = vElement.videoHeight;
    ctx.save();
    ctx.clearRect(0, 0, cElement.width, cElement.height);

    let fL = false;
    let fR = false;

    if (chidori)  chidori.style.display  = 'none';
    if (rasengan) rasengan.style.display = 'none';

    if (res.multiHandLandmarks && res.multiHandedness) {
      res.multiHandLandmarks.forEach((pts: any, i: number) => {
        const label = res.multiHandedness[i].label;
        const isR   = label === 'Right';
        const idx   = isR ? 1 : 0;

        // Desenha o esqueleto da mão via service (genérico, reutilizável)
        this.handTracking.drawHandSkeleton(ctx, pts);

        // Verifica se a mão está aberta via service (genérico, reutilizável)
        const open = this.handTracking.checkFingers(pts,3); // considera mão aberta se 3 ou mais dedos estiverem estendidos

        // ── Lógica de poder (exclusiva do Naruto) ───────────────────────
        this.pwr[idx] += open ? 0.05 : -0.15;
        this.pwr[idx]  = Math.max(0, Math.min(1, this.pwr[idx]));

        // Dispara o vídeo de efeito ao abrir a mão (detecção de borda)
        if (open && !this.wasOpen[idx]) {
          const vid = isR ? rasengan : chidori;
          if (vid) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
          }
        }
        this.wasOpen[idx] = open;

        const wrist = pts[0]; // ponto 0 = pulso
        const knk   = pts[9]; // ponto 9 = nó do dedo médio

        // ── Posicionamento dos efeitos (exclusivo do Naruto) ────────────
        if (this.pwr[idx] > 0.01) {
          if (isR && rasengan) {
            fR = true;
            const tx = (wrist.x + knk.x) / 2;
            const ty = (wrist.y + knk.y) / 2;
            const rect = cElement.getBoundingClientRect();
            rasengan.style.left    = `${(1 - tx) * rect.width}px`; // (1-tx) espelha câmera
            rasengan.style.top     = `${ty * rect.height}px`;
            rasengan.style.display = 'block';
            rasengan.style.opacity = this.pwr[idx].toString();
          } else if (!isR && chidori) {
            fL = true;
            const dx = knk.x - wrist.x;
            const dy = knk.y - wrist.y;
            const tx = knk.x + (dx * 0.8); // projeta efeito na frente da mão
            const ty = knk.y + (dy * 0.8);
            const rect = cElement.getBoundingClientRect();
            chidori.style.left    = `${(1 - tx) * rect.width}px`;
            chidori.style.top     = `${(ty * rect.height) - 120}px`;
            chidori.style.display = 'block';
            chidori.style.opacity = this.pwr[idx].toString();
          }
        }
      });
    }

    // Fade out dos efeitos quando a mão sai do frame
    if (!fL && chidori) {
      this.pwr[0] = Math.max(0, this.pwr[0] - 0.15);
      if (this.pwr[0] > 0.01) { chidori.style.display = 'block'; chidori.style.opacity = this.pwr[0].toString(); }
      this.wasOpen[0] = false;
    }
    if (!fR && rasengan) {
      this.pwr[1] = Math.max(0, this.pwr[1] - 0.15);
      if (this.pwr[1] > 0.01) { rasengan.style.display = 'block'; rasengan.style.opacity = this.pwr[1].toString(); }
      this.wasOpen[1] = false;
    }

    ctx.restore();
  }
}
/*
=======================================================================
  ANOTAÇÕES DE ESTUDO - COMO FUNCIONA O HAND TRACKING COM MEDIAPIPE
=======================================================================

  -----------------------------------------------------------------------
  1. DECLARAÇÕES GLOBAIS (declare)
  -----------------------------------------------------------------------
  As funções drawConnectors, drawLandmarks, HAND_CONNECTIONS, Hands e Camera
  NÃO são instaladas via npm. Elas são carregadas via CDN no index.html.
  O "declare" informa ao TypeScript que elas existem globalmente,
  evitando erros de compilação.

  -----------------------------------------------------------------------
  2. CICLO DE VIDA DO COMPONENTE
  -----------------------------------------------------------------------
  - ngOnInit()        → executado na inicialização do componente
  - ngAfterViewInit() → executado APÓS o DOM estar pronto (ideal para acessar elementos HTML)
  - ngOnDestroy()     → executado quando o componente é destruído (usado para limpar câmera e mãos)

  Por que ngAfterViewInit?
  O MediaPipe precisa acessar elementos do DOM (vídeo e canvas).
  Esse hook garante que o HTML já foi renderizado antes de tentar acessá-los.
  O setTimeout de 1000ms existe para garantir que os scripts CDN também carregaram.

  Por que ngOnDestroy?
  Para evitar memory leaks (vazamentos de memória), a câmera e o detector
  de mãos precisam ser finalizados quando o componente sai da tela.

  -----------------------------------------------------------------------
  3. ELEMENTOS DO DOM USADOS
  -----------------------------------------------------------------------
  - v_src → <video> com o feed da webcam (pode estar oculto visualmente)
  - out   → <canvas> onde os pontos e conexões das mãos são desenhados
  - chidori     → <video> do efeito da mão esquerda (Naruto - Rasengan)
  - rasengan     → <video> do efeito da mão direita  (Sasuke - Chidori)

  -----------------------------------------------------------------------
  4. VARIÁVEIS DE CONTROLE
  -----------------------------------------------------------------------
  - pwr = [0, 0]          → "poder" de cada mão [esquerda, direita], valor entre 0 e 1
  - wasOpen = [false, false] → estado anterior de cada mão (aberta ou fechada)

  -----------------------------------------------------------------------
  5. COMO checkOpen() FUNCIONA
  -----------------------------------------------------------------------
  O MediaPipe retorna 21 pontos (landmarks) por mão numerados de 0 a 20:

      8   12  16  20   ← pontas dos dedos (tips)
      |    |   |   |
      7   11  15  19
      6   10  14  18   ← articulações do meio (pips)
      5    9  13  17
       \   |   |  /
        4  3   2  1
             0        ← pulso (wrist)

  A lógica compara a distância euclidiana (Math.hypot) entre:
    - ponta do dedo → pulso
    - articulação do meio → pulso

  Se a ponta está mais longe, o dedo está estendido (aberto).
  Se 3 ou mais dedos estiverem abertos → mão aberta = true.

  -----------------------------------------------------------------------
  6. COMO onResults() FUNCIONA (chamado a cada frame da câmera)
  -----------------------------------------------------------------------
  a) Redimensiona o canvas para o tamanho do vídeo
  b) Limpa o canvas com ctx.clearRect()
  c) Para cada mão detectada:
     - Desenha o esqueleto com drawConnectors() (linhas azuis) e drawLandmarks() (pontos brancos)
     - Verifica se a mão está aberta com checkOpen()
     - Aumenta o poder (pwr) se aberta (+0.05) ou diminui se fechada (-0.15)
     - Se a mão ACABOU de abrir (open && !wasOpen) → dispara o vídeo de efeito
     - Posiciona o efeito visual na tela baseado na posição dos landmarks da mão

  -----------------------------------------------------------------------
  7. LÓGICA DE POSICIONAMENTO DO EFEITO
  -----------------------------------------------------------------------
  Mão direita (Sasuke):
    - Usa o ponto médio entre pulso (pts[0]) e nó do dedo (pts[9])
    - (1 - tx) espelha horizontalmente pois a câmera é espelhada

  Mão esquerda (Naruto):
    - Projeta o efeito na direção dos dedos usando vetor (knk - wrist) * 0.8
    - Desloca 120px para cima para ficar acima da mão

  -----------------------------------------------------------------------
  8. INICIALIZAÇÃO DO MEDIAPIPE
  -----------------------------------------------------------------------
  new Hands({ locateFile: ... })
    → Carrega os modelos de IA do CDN jsdelivr

  hands.setOptions({
    maxNumHands: 2,              // detecta até 2 mãos simultaneamente
    modelComplexity: 1,          // 0 = leve/rápido, 1 = preciso
    minDetectionConfidence: 0.5, // confiança mínima para iniciar detecção
    minTrackingConfidence: 0.5   // confiança mínima para manter rastreamento
  })

  new Camera(vElement, { onFrame: async () => hands.send({ image: vElement }) })
    → A cada frame da webcam, envia a imagem para o MediaPipe processar

  -----------------------------------------------------------------------
  9. FLUXO COMPLETO
  -----------------------------------------------------------------------

  Webcam → Camera (frame a frame) → hands.send(frame)
    → MediaPipe processa com IA
      → onResults() chamado
        → desenha esqueleto no canvas
        → checkOpen() verifica gesto
        → atualiza pwr[]
        → posiciona efeito visual na tela

  -----------------------------------------------------------------------
  10. RETRY AUTOMÁTICO
  -----------------------------------------------------------------------
  Se o MediaPipe ainda não carregou (typeof Hands === 'undefined'),
  ou se os elementos do DOM ainda não existem,
  o código tenta novamente após um delay usando setTimeout recursivo.
  O bloco try/catch também faz retry em caso de erro inesperado.

=======================================================================
*/