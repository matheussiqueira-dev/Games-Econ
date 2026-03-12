# AgGames

AgGames é uma plataforma de jogos construída com Angular que demonstra integração de recursos de visão computacional para experiências interativas. O projeto explora soluções de rastreamento de mãos e gestos usando o MediaPipe para permitir controles e interações sem contato dentro de mini-jogos (ex.: Galaga, jogos em desenvolvimento, etc.).

## Visão Geral

- **Objetivo:** Fornecer uma coleção de jogos com uma camada de interação baseada em visão computacional, permitindo controlar elementos do jogo via gestos/manipulação de mãos.
- **Principais tecnologias:** Angular, TypeScript, MediaPipe (Web), HTML/CSS, serviços e componentes modulares.

## Visão Computacional & MediaPipe

Este projeto usa conceitos de visão computacional para detectar e rastrear posições das mãos e padrões de movimento em tempo real. Utilizamos o MediaPipe (implementação Web / WASM) para:

- Detectar landmarks de mão (pontos-chave)
- Interpretar gestos simples (p. ex. apontar, abrir/fechar mão)
- Calcular coordenadas para direcionar elementos do jogo

Esses dados são expostos por um serviço compartilhado (`hand-tracking-service.ts`) que fornece sinais/computed values consumíveis pelos componentes de UI e lógica de jogo.

## Estrutura do Projeto

- `src/app` — Código fonte Angular
- `src/app/shared/services` — Serviços reutilizáveis (ex.: `game.service.ts`, `hand-tracking-service.ts`)
- `src/app/core/components` — Componentes centrais (ex.: `sidebar`, `main-card`)
- `assets/` — Imagens, vídeos e recursos estáticos

## Como rodar (desenvolvimento)

1. Instalar dependências:

```bash
npm install
```

2. Iniciar o servidor de desenvolvimento:

```bash
npm start
```

3. Abrir no navegador: `http://localhost:4200/`

Observação: para usar os módulos de visão computacional (MediaPipe/WebAssembly), verifique se o navegador tem suporte a WebAssembly e permissões de câmera.

## Principais Features

- Integração com MediaPipe para rastreamento de mãos
- Exemplo de jogo clássico (Galaga) com controles por gestos
- Sistema de destaque de jogos e navegação via `GameService`
- Componentes reutilizáveis e arquitetura modular em Angular

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch com a sua feature: `git checkout -b feat/nova-feature`
3. Commit suas mudanças e abra um Pull Request

## Recursos úteis

- MediaPipe: https://developers.google.com/mediapipe
- Angular: https://angular.io


