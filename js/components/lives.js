/**
 * ============================================================================
 * COMPONENT: LIVES.JS - Gerenciador de Vidas Extras (Corações)
 * ============================================================================
 */

import { CONFIG, MODES } from '../core/config.js';
import { soundFx } from '../utils/audio.js';

export class LivesManager {
  constructor() {
    this.lives = CONFIG.ENHANCED.INITIAL_LIVES;
    this.heartItem = null;
    this.spawnTimer = 40;
  }

  reset(mode = MODES.CLASSIC) {
    this.lives = mode === MODES.ENHANCED ? CONFIG.ENHANCED.INITIAL_LIVES : 1;
    this.heartItem = null;
    this.spawnTimer = 40;
  }

  spawnHeart(snake, blockedPositions = []) {
    if (this.heartItem || this.lives >= CONFIG.ENHANCED.MAX_LIVES) return;

    const emptyCells = [];
    for (let x = 1; x < CONFIG.GRID_COLUMNS - 1; x++) {
      for (let y = 1; y < CONFIG.GRID_ROWS - 1; y++) {
        if (!snake.occupies(x, y)) {
          const isBlocked = blockedPositions.some(p => p && p.x === x && p.y === y);
          if (!isBlocked) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length > 0) {
      const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.heartItem = {
        x: pos.x,
        y: pos.y,
        timeLeft: 45
      };
    }
  }

  update(snake, blockedPositions = []) {
    // Cronômetro do item de coração no chão
    if (this.heartItem) {
      this.heartItem.timeLeft--;
      if (this.heartItem.timeLeft <= 0) {
        this.heartItem = null;
      }
    } else {
      this.spawnTimer--;
      if (this.spawnTimer <= 0) {
        this.spawnHeart(snake, blockedPositions);
        this.spawnTimer = 60 + Math.floor(Math.random() * 40);
      }
    }

    // Checa se a cabeça da cobra comeu o coração
    const head = snake.getHead();
    if (this.heartItem && head && head.x === this.heartItem.x && head.y === this.heartItem.y) {
      this.addLife();
      this.heartItem = null;
      soundFx.playExtraLife();
      return true;
    }

    return false;
  }

  addLife() {
    if (this.lives < CONFIG.ENHANCED.MAX_LIVES) {
      this.lives++;
    }
  }

  loseLife() {
    this.lives--;
    return this.lives;
  }

  isDead() {
    return this.lives <= 0;
  }
}
