/**
 * ============================================================================
 * COMPONENT: BOMBS.JS - Bombas com Detonação no Modo Melhorado
 * ============================================================================
 * Gera bombas com contagem regressiva e pavio piscante no estilo Nokia retrô.
 * Ao detonar, cria área de explosão 3x3 que pode atingir a cobra!
 */

import { CONFIG } from '../core/config.js';
import { soundFx } from '../utils/audio.js';

export class BombManager {
  constructor() {
    this.bombs = [];
    this.activeExplosions = [];
    this.spawnCooldown = 25;
  }

  reset() {
    this.bombs = [];
    this.activeExplosions = [];
    this.spawnCooldown = 25;
  }

  spawnBomb(snake, blockedPositions = []) {
    if (this.bombs.length >= 2) return; // Máximo de 2 bombas simultâneas

    const emptyCells = [];
    for (let x = 2; x < CONFIG.GRID_COLUMNS - 2; x++) {
      for (let y = 2; y < CONFIG.GRID_ROWS - 2; y++) {
        if (!snake.occupies(x, y)) {
          const isBlocked = blockedPositions.some(p => p && p.x === x && p.y === y);
          const isBombHere = this.bombs.some(b => b.x === x && b.y === y);
          if (!isBlocked && !isBombHere) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length > 0) {
      const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.bombs.push({
        x: pos.x,
        y: pos.y,
        timeLeft: CONFIG.ENHANCED.BOMB_LIFETIME,
        maxTime: CONFIG.ENHANCED.BOMB_LIFETIME
      });
    }
  }

  /**
   * Atualiza as bombas e detecta explosões e danos
   * @param {Snake} snake 
   * @param {Array} blockedPositions 
   * @returns {Object} { damageToSnake: boolean, newExplosions: Array }
   */
  update(snake, blockedPositions = []) {
    let damageToSnake = false;

    // Reduz cooldown para nova bomba
    this.spawnCooldown--;
    if (this.spawnCooldown <= 0) {
      this.spawnBomb(snake, blockedPositions);
      this.spawnCooldown = 35 + Math.floor(Math.random() * 20);
    }

    // Atualiza explosões em andamento (efeito visual)
    for (let i = this.activeExplosions.length - 1; i >= 0; i--) {
      this.activeExplosions[i].ticks--;
      if (this.activeExplosions[i].ticks <= 0) {
        this.activeExplosions.splice(i, 1);
      }
    }

    const head = snake.getHead();

    // Processa cada bomba ativa
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.timeLeft--;

      // A cobra pisou direto na bomba
      const steppedOnBomb = head && head.x === bomb.x && head.y === bomb.y;
      const shouldDetonate = bomb.timeLeft <= 0 || steppedOnBomb;

      if (shouldDetonate) {
        soundFx.playExplosion();

        // Registra área de explosão 3x3
        const explosion = {
          x: bomb.x,
          y: bomb.y,
          radius: CONFIG.ENHANCED.BOMB_RADIUS,
          ticks: 5
        };
        this.activeExplosions.push(explosion);

        // Verifica se a cobra foi atingida pela explosão
        if (!snake.isInvulnerable()) {
          const hit = snake.segments.some(seg => {
            return Math.abs(seg.x - bomb.x) <= explosion.radius &&
                   Math.abs(seg.y - bomb.y) <= explosion.radius;
          });

          if (hit) {
            damageToSnake = true;
          }
        }

        this.bombs.splice(i, 1);
      }
    }

    return { damageToSnake };
  }

  getAllPositions() {
    return this.bombs.map(b => ({ x: b.x, y: b.y }));
  }
}
