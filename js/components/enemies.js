/**
 * ============================================================================
 * COMPONENT: ENEMIES.JS - Personagens Inimigos Atiradores (Modo Melhorado)
 * ============================================================================
 * Personagens estilo Nokia Space Impact que surgem na tela, miram e disparam
 * projéteis (tiros). Se a cobra for atingida ou colidir com o tiro, perde vida!
 */

import { CONFIG } from '../core/config.js';
import { soundFx } from '../utils/audio.js';

export class EnemyManager {
  constructor() {
    this.enemies = [];
    this.bullets = [];
    this.spawnCooldown = 30;
  }

  reset() {
    this.enemies = [];
    this.bullets = [];
    this.spawnCooldown = 30;
  }

  spawnEnemy(snake, blockedPositions = []) {
    if (this.enemies.length >= 2) return; // Máximo de 2 inimigos ao mesmo tempo

    const emptyCells = [];
    // Spawna preferencialmente nas faixas laterais ou intermediárias
    for (let x = 1; x < CONFIG.GRID_COLUMNS - 1; x++) {
      for (let y = 1; y < CONFIG.GRID_ROWS - 1; y++) {
        if (!snake.occupies(x, y)) {
          const isBlocked = blockedPositions.some(p => p && p.x === x && p.y === y);
          const isEnemyHere = this.enemies.some(e => e.x === x && e.y === y);
          if (!isBlocked && !isEnemyHere) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length > 0) {
      const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      
      // Define a direção inicial do canhão do inimigo (aponta para o centro da tela)
      const centerX = Math.floor(CONFIG.GRID_COLUMNS / 2);
      const centerY = Math.floor(CONFIG.GRID_ROWS / 2);
      
      let dir = { x: 1, y: 0 };
      if (Math.abs(pos.x - centerX) > Math.abs(pos.y - centerY)) {
        dir = { x: pos.x < centerX ? 1 : -1, y: 0 };
      } else {
        dir = { x: 0, y: pos.y < centerY ? 1 : -1 };
      }

      this.enemies.push({
        x: pos.x,
        y: pos.y,
        lifetime: CONFIG.ENHANCED.ENEMY_LIFETIME,
        shootCooldown: 8, // Primeiro tiro rápido
        direction: dir,
        animFrame: 0
      });
    }
  }

  /**
   * Atualiza a lógica dos inimigos e projéteis
   * @param {Snake} snake 
   * @param {Array} blockedPositions 
   * @returns {Object} { damageToSnake: boolean }
   */
  update(snake, blockedPositions = []) {
    let damageToSnake = false;

    // Cooldown para gerar novo inimigo
    this.spawnCooldown--;
    if (this.spawnCooldown <= 0) {
      this.spawnEnemy(snake, blockedPositions);
      this.spawnCooldown = 50 + Math.floor(Math.random() * 30);
    }

    const head = snake.getHead();

    // 1. Atualiza e move os projéteis existentes
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // Saiu da tela
      if (
        bullet.x < 0 || bullet.x >= CONFIG.GRID_COLUMNS ||
        bullet.y < 0 || bullet.y >= CONFIG.GRID_ROWS
      ) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Projétil atingiu qualquer parte da cobra
      if (!snake.isInvulnerable() && snake.occupies(bullet.x, bullet.y)) {
        damageToSnake = true;
        this.bullets.splice(i, 1);
        continue;
      }
    }

    // 2. Atualiza os inimigos (disparo e tempo de vida)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.lifetime--;
      enemy.animFrame++;

      // Se a cobra colidir de frente com o próprio inimigo
      if (!snake.isInvulnerable() && head && head.x === enemy.x && head.y === enemy.y) {
        damageToSnake = true;
      }

      // Disparo de tiros periódicos
      enemy.shootCooldown--;
      if (enemy.shootCooldown <= 0) {
        // Dispara o tiro na direção do canhão
        this.bullets.push({
          x: enemy.x + enemy.direction.x,
          y: enemy.y + enemy.direction.y,
          vx: enemy.direction.x,
          vy: enemy.direction.y
        });

        soundFx.playShoot();
        enemy.shootCooldown = CONFIG.ENHANCED.ENEMY_SHOOT_COOLDOWN;

        // Ocasionalmente gira o canhão para outra direção
        const directions = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ];
        enemy.direction = directions[Math.floor(Math.random() * directions.length)];
      }

      // Desaparece quando esgota o tempo de vida
      if (enemy.lifetime <= 0) {
        this.enemies.splice(i, 1);
      }
    }

    return { damageToSnake };
  }

  getAllPositions() {
    return this.enemies.map(e => ({ x: e.x, y: e.y }));
  }
}
