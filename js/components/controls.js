/**
 * ============================================================================
 * COMPONENT: CONTROLS.JS - Gerenciador de Entradas e Toque Mobile
 * ============================================================================
 * Unifica teclado, teclado físico do Nokia (com resposta instantânea ao toque)
 * e gestos de deslizar o dedo (Swipe Touch) na tela!
 */

import { soundFx } from '../utils/audio.js';

export class ControlsManager {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.initKeyboard();
    this.initVirtualKeypad();
    this.initFullscreenControls();
    this.initSwipeGestures();
  }

  /**
   * Vincula evento de toque/clique com debounce seguro contra clique duplo
   * O pointerdown responde instantaneamente ao toque, e o clique sintético
   * gerado pelo navegador mobile 150-300ms depois é 100% descartado.
   */
  bindFastPress(el, callback) {
    if (!el) return;
    let lastTime = 0;

    const handler = (e) => {
      const now = Date.now();
      // Descarta qualquer evento secundário nos próximos 350ms (elimina o clique duplo)
      if (now - lastTime < 350) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      lastTime = now;

      if (e.cancelable && e.type !== 'mousedown') {
        e.preventDefault();
      }

      soundFx.playKeyClick();
      el.classList.add('btn-pressed');
      setTimeout(() => el.classList.remove('btn-pressed'), 120);

      callback(e);
    };

    el.addEventListener('pointerdown', handler, { passive: false });
    el.addEventListener('click', handler);
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Evita repetição acelerada no menu ao manter a tecla pressionada
      if (e.repeat) return;

      switch (e.key) {
        // Cima
        case 'ArrowUp':
        case 'w':
        case 'W':
        case '2':
          this.callbacks.onDirection({ x: 0, y: -1 });
          this.animateKey('key-2');
          break;

        // Baixo
        case 'ArrowDown':
        case 's':
        case 'S':
        case '8':
          this.callbacks.onDirection({ x: 0, y: 1 });
          this.animateKey('key-8');
          break;

        // Esquerda
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case '4':
          this.callbacks.onDirection({ x: -1, y: 0 });
          this.animateKey('key-4');
          break;

        // Direita
        case 'ArrowRight':
        case 'd':
        case 'D':
        case '6':
          this.callbacks.onDirection({ x: 1, y: 0 });
          this.animateKey('key-6');
          break;

        // Ação / Enter / Espaço / 5
        case 'Enter':
        case ' ':
        case '5':
          this.callbacks.onAction();
          this.animateKey('key-5');
          this.animateKey('naviKey');
          break;

        // Menu / Voltar / Esc / C
        case 'Escape':
        case 'c':
        case 'C':
        case 'Backspace':
          this.callbacks.onMenu();
          this.animateKey('keyClear');
          break;

        // Alternar Modo de Jogo (*)
        case '*':
          this.callbacks.onToggleMode();
          this.animateKey('key-star');
          break;

        // Alternar Mudo (#)
        case '#':
          this.callbacks.onToggleMute();
          this.animateKey('key-hash');
          break;

        // Alternar Tela Cheia (F)
        case 'f':
        case 'F':
          this.callbacks.onToggleFullscreen();
          break;
      }
    });
  }

  initVirtualKeypad() {
    // Tecla Central Navi-Key
    this.bindFastPress(document.getElementById('naviKey'), () => {
      this.callbacks.onAction();
    });

    // Tecla Menu
    this.bindFastPress(document.getElementById('keyMenu'), () => {
      this.callbacks.onMenu();
    });

    // Tecla C (Voltar)
    this.bindFastPress(document.getElementById('keyClear'), () => {
      this.callbacks.onMenu();
    });

    // Teclas Numéricas (2, 4, 6, 8, etc.)
    const numButtons = document.querySelectorAll('.num-btn');
    numButtons.forEach(btn => {
      this.bindFastPress(btn, () => {
        const action = btn.dataset.action;
        const dir = btn.dataset.dir;

        if (dir) {
          const [dx, dy] = dir.split(',').map(Number);
          this.callbacks.onDirection({ x: dx, y: dy });
        } else if (action === 'action') {
          this.callbacks.onAction();
        } else if (action === 'toggle-mode') {
          this.callbacks.onToggleMode();
        } else if (action === 'toggle-mute') {
          this.callbacks.onToggleMute();
        }
      });
    });
  }

  initFullscreenControls() {
    this.bindFastPress(document.getElementById('fsMenuBtn'), () => this.callbacks.onMenu());
    this.bindFastPress(document.getElementById('fsPauseBtn'), () => this.callbacks.onTogglePause());
  }

  /**
   * Controle por Gestos de Arrastar (Swipe) no Touch Screen
   * Permite deslizar o dedo em qualquer lugar da tela do jogo para mudar a direção!
   */
  initSwipeGestures() {
    const target = document.querySelector('.canvas-wrapper') || document.getElementById('gameCanvas');
    if (!target) return;

    let startX = 0;
    let startY = 0;
    let isTracking = false;

    const onStart = (e) => {
      // Ignora gestos de deslizar se estiver em menu ou interagindo com botões
      if (this.callbacks.isMenuOpen && this.callbacks.isMenuOpen()) return;
      if (e.target.closest('button, .menu-item, .screen-overlay')) return;
      if (this.callbacks.isSwipeEnabled && !this.callbacks.isSwipeEnabled()) return;

      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      isTracking = true;
    };

    const onMove = (e) => {
      if (!isTracking) return;
      if (this.callbacks.isSwipeEnabled && !this.callbacks.isSwipeEnabled()) return;

      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      const distance = Math.hypot(dx, dy);

      // Limiar de disparo de 18px para resposta rápida e sem falso positivo
      if (distance >= 18) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // Deslize Horizontal
          this.callbacks.onDirection({ x: dx > 0 ? 1 : -1, y: 0 });
        } else {
          // Deslize Vertical
          this.callbacks.onDirection({ x: 0, y: dy > 0 ? 1 : -1 });
        }

        // Reseta o ponto de origem para permitir curvas contínuas com o mesmo arraste!
        startX = point.clientX;
        startY = point.clientY;

        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const onEnd = () => {
      isTracking = false;
    };

    target.addEventListener('touchstart', onStart, { passive: false });
    target.addEventListener('touchmove', onMove, { passive: false });
    target.addEventListener('touchend', onEnd, { passive: true });
    target.addEventListener('touchcancel', onEnd, { passive: true });

    // Suporte a arrasto com mouse no canvas também
    target.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  animateKey(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('btn-pressed');
      setTimeout(() => el.classList.remove('btn-pressed'), 120);
    }
  }
}
