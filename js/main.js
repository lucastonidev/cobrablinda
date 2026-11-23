/**
 * ============================================================================
 * MAIN.JS - Ponto de Entrada da Aplicação Modular
 * ============================================================================
 */

import { CanvasRenderer } from './components/canvas-renderer.js';
import { Game } from './core/game.js';
import { GAME_STATES } from './core/state.js';
import { ControlsManager } from './components/controls.js';
import { soundFx } from './utils/audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('gameCanvas');
  const renderer = new CanvasRenderer(canvasElement);
  const game = new Game(renderer);

  // Mapeamento de ações unificado (Teclado, Celular e Controles Virtuais)
  const controls = new ControlsManager({
    onDirection: (dir) => {
      if (game.state === GAME_STATES.PLAYING) {
        game.snake.setDirection(dir);
      } else if (
        game.state === GAME_STATES.MENU ||
        game.state === GAME_STATES.SETTINGS ||
        game.state === GAME_STATES.GAME_OVER
      ) {
        if (dir.y !== 0) {
          game.navigateMenu(dir.y);
        } else if (dir.x !== 0) {
          // No menu, setas para os lados podem acionar a opção atual (ex: trocar modo ou tela cheia)
          game.activateCurrentMenuItem();
        }
      }
    },

    onAction: () => {
      game.activateCurrentMenuItem();
    },

    onMenu: () => {
      if (
        game.state === GAME_STATES.PLAYING ||
        game.state === GAME_STATES.GAME_OVER ||
        game.state === GAME_STATES.PAUSED ||
        game.state === GAME_STATES.SETTINGS
      ) {
        game.showMenu();
      }
    },

    onToggleMode: () => {
      game.toggleMode();
    },

    onToggleMute: () => {
      const isMuted = soundFx.toggleMute();
      const muteIndicator = document.getElementById('muteIndicator');
      if (muteIndicator) {
        muteIndicator.textContent = isMuted ? 'MUT' : 'VOL';
      }
    },

    onToggleFullscreen: () => {
      game.settings.toggleFullscreen();
    },

    onTogglePause: () => {
      game.togglePause();
    },

    isSwipeEnabled: () => {
      return game.settings.isSwipeEnabled;
    },

    isMenuOpen: () => {
      return game.state !== GAME_STATES.PLAYING;
    },

    isPlaying: () => {
      return game.state === GAME_STATES.PLAYING;
    }
  });

  // Eventos de clique nas opções da interface do LCD
  const btnStartGame = document.getElementById('btnStartGame');
  if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.startNewGame();
    });
  }

  const btnToggleMode = document.getElementById('btnToggleMode');
  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.toggleMode();
    });
  }

  const btnOpenSettings = document.getElementById('btnOpenSettings');
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.showSettings();
    });
  }

  const btnBackFromSettings = document.getElementById('btnBackFromSettings');
  if (btnBackFromSettings) {
    btnBackFromSettings.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.showMenu();
    });
  }

  const btnRestart = document.getElementById('btnRestart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.startNewGame();
    });
  }

  const btnBackMenu = document.getElementById('btnBackMenu');
  if (btnBackMenu) {
    btnBackMenu.addEventListener('click', () => {
      soundFx.playKeyClick();
      game.showMenu();
    });
  }

  // Sincroniza o foco visual ativo ao passar o mouse sobre os itens do menu
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const parent = item.closest('.menu-options');
      if (parent) {
        parent.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  console.log('🐍 Cobra Blinda Modular (Core, Utils, Components) inicializado com sucesso!');
});
