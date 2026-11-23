/**
 * ============================================================================
 * COMPONENT: SNAKE.JS - Entidade da Cobra e Controle de Movimento
 * ============================================================================
 */

import { CONFIG, MODES } from '../core/config.js';

export class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    const startX = Math.floor(CONFIG.GRID_COLUMNS / 2);
    const startY = Math.floor(CONFIG.GRID_ROWS / 2);

    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.invulnerableTicks = 0;
  }

  setDirection(dir) {
    const isOpposite = (dir.x !== 0 && dir.x === -this.direction.x) ||
                      (dir.y !== 0 && dir.y === -this.direction.y);

    if (!isOpposite) {
      this.nextDirection = dir;
    }
  }

  /**
   * Executa um passo da cobra
   * @param {boolean} grow 
   * @param {string} mode 
   * @returns {boolean} false se colidiu fatalmente consigo mesma ou com parede no clássico
   */
  move(grow = false, mode = MODES.CLASSIC) {
    this.direction = this.nextDirection;

    if (this.invulnerableTicks > 0) {
      this.invulnerableTicks--;
    }

    const head = this.segments[0];
    let newX = head.x + this.direction.x;
    let newY = head.y + this.direction.y;

    // Tratamento de Paredes
    if (mode === MODES.ENHANCED) {
      if (newX < 0) newX = CONFIG.GRID_COLUMNS - 1;
      else if (newX >= CONFIG.GRID_COLUMNS) newX = 0;

      if (newY < 0) newY = CONFIG.GRID_ROWS - 1;
      else if (newY >= CONFIG.GRID_ROWS) newY = 0;
    } else {
      // Modo clássico: parede é letal
      if (
        newX < 0 ||
        newX >= CONFIG.GRID_COLUMNS ||
        newY < 0 ||
        newY >= CONFIG.GRID_ROWS
      ) {
        return false;
      }
    }

    const newHead = { x: newX, y: newY };

    // Colisão consigo mesma
    const checkSegments = grow ? this.segments : this.segments.slice(0, -1);
    const selfCollision = checkSegments.some(seg => seg.x === newHead.x && seg.y === newHead.y);

    if (selfCollision) {
      return false;
    }

    this.segments.unshift(newHead);

    if (!grow) {
      this.segments.pop();
    }

    return true;
  }

  triggerInvulnerability(ticks = CONFIG.ENHANCED.INVULNERABILITY_TICKS) {
    this.invulnerableTicks = ticks;
  }

  isInvulnerable() {
    return this.invulnerableTicks > 0;
  }

  getHead() {
    return this.segments[0];
  }

  occupies(x, y) {
    return this.segments.some(seg => seg.x === x && seg.y === y);
  }
}
