/**
 * ============================================================================
 * COMPONENT: CANVAS-RENDERER.JS - Renderizador Gráfico Monocromático LCD
 * ============================================================================
 * Desenha todos os elementos na tela com estética pixel art autêntica
 * do Nokia 3310: cobra, comidas, bombas, inimigos atiradores, tiros e corações!
 */

import { CONFIG, MODES } from '../core/config.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.width = CONFIG.GRID_COLUMNS * CONFIG.CELL_SIZE;
    this.height = CONFIG.GRID_ROWS * CONFIG.CELL_SIZE;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.imageSmoothingEnabled = false;
    this.particles = [];
  }

  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawWalls(mode) {
    this.ctx.strokeStyle = CONFIG.COLORS.LCD_PIXEL_ON;

    if (mode === MODES.CLASSIC) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(1, 1, this.width - 2, this.height - 2);
    } else {
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeRect(1, 1, this.width - 2, this.height - 2);
      this.ctx.setLineDash([]);
    }
  }

  drawSnake(segments, mode, direction, tickCount = 0, isInvulnerable = false) {
    // Se estiver invulnerável (após tomar dano), pisca a cada 2 frames
    if (isInvulnerable && Math.floor(Date.now() / 90) % 2 === 0) {
      return;
    }

    const size = CONFIG.CELL_SIZE;

    segments.forEach((segment, index) => {
      const px = segment.x * size;
      const py = segment.y * size;
      const isHead = index === 0;

      this.ctx.fillStyle = CONFIG.COLORS.LCD_PIXEL_ON;
      this.ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

      if (mode === MODES.ENHANCED && isHead) {
        this.drawSnakeHeadDetails(px, py, size, direction, tickCount);
      }
    });
  }

  drawSnakeHeadDetails(px, py, size, direction, tickCount) {
    this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;

    const eyeSize = 2;
    let eye1 = { x: px + 3, y: py + 3 };
    let eye2 = { x: px + size - 5, y: py + 3 };

    if (direction.x === 1) {
      eye1 = { x: px + size - 4, y: py + 3 };
      eye2 = { x: px + size - 4, y: py + size - 5 };
    } else if (direction.x === -1) {
      eye1 = { x: px + 2, y: py + 3 };
      eye2 = { x: px + 2, y: py + size - 5 };
    } else if (direction.y === 1) {
      eye1 = { x: px + 3, y: py + size - 4 };
      eye2 = { x: px + size - 5, y: py + size - 4 };
    } else if (direction.y === -1) {
      eye1 = { x: px + 3, y: py + 2 };
      eye2 = { x: px + size - 5, y: py + 2 };
    }

    this.ctx.fillRect(eye1.x, eye1.y, eyeSize, eyeSize);
    this.ctx.fillRect(eye2.x, eye2.y, eyeSize, eyeSize);

    // Língua piscando
    if (tickCount % 6 < 3) {
      this.ctx.fillStyle = CONFIG.COLORS.LCD_PIXEL_ON;
      let tx = px + size / 2 - 1;
      let ty = py + size / 2 - 1;

      if (direction.x === 1) tx = px + size + 1;
      else if (direction.x === -1) tx = px - 3;
      else if (direction.y === 1) ty = py + size + 1;
      else if (direction.y === -1) ty = py - 3;

      this.ctx.fillRect(tx, ty, 2, 2);
    }
  }

  drawFood(food, mode) {
    if (!food) return;

    const size = CONFIG.CELL_SIZE;
    const px = food.x * size;
    const py = food.y * size;

    this.ctx.fillStyle = CONFIG.COLORS.LCD_PIXEL_ON;

    if (mode === MODES.CLASSIC) {
      this.ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
      this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;
      this.ctx.fillRect(px + 5, py + 5, 2, 2);
    } else {
      this.ctx.fillRect(px + 2, py + 3, size - 4, size - 5);
      this.ctx.fillRect(px + size / 2, py + 1, 2, 3);
    }
  }

  drawBonusFood(bonusFood) {
    if (!bonusFood) return;

    const size = CONFIG.CELL_SIZE;
    const px = bonusFood.x * size;
    const py = bonusFood.y * size;

    const shouldDraw = bonusFood.timeLeft > 15 || Math.floor(Date.now() / 150) % 2 === 0;
    if (!shouldDraw) return;

    this.ctx.fillStyle = CONFIG.COLORS.LCD_PIXEL_ON;
    // Inseto retrô com patinhas
    this.ctx.fillRect(px + 3, py + 3, size - 6, size - 6);
    this.ctx.fillRect(px + 1, py + 1, 2, 2);
    this.ctx.fillRect(px + size - 3, py + 1, 2, 2);
    this.ctx.fillRect(px + 1, py + size - 3, 2, 2);
    this.ctx.fillRect(px + size - 3, py + size - 3, 2, 2);

    // Barra de tempo restante
    const timerRatio = bonusFood.timeLeft / bonusFood.maxTime;
    const barWidth = Math.max(0, (size - 2) * timerRatio);
    this.ctx.fillRect(px + 1, py - 2, barWidth, 1.5);
  }

  /**
   * Desenha Bombas em Pixel Art Nokia
   */
  drawBombs(bombs) {
    if (!bombs) return;
    const size = CONFIG.CELL_SIZE;

    bombs.forEach(bomb => {
      const px = bomb.x * size;
      const py = bomb.y * size;

      // Pisca nos últimos segundos antes de detonar
      if (bomb.timeLeft <= 10 && Math.floor(Date.now() / 100) % 2 === 0) {
        return;
      }

      this.ctx.fillStyle = CONFIG.COLORS.BOMB;

      // Corpo esférico da bomba (círculo pixelado 8x8)
      this.ctx.fillRect(px + 3, py + 3, 6, 6);
      this.ctx.fillRect(px + 2, py + 4, 8, 4);
      this.ctx.fillRect(px + 4, py + 2, 4, 8);

      // Brilho interno do LCD
      this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;
      this.ctx.fillRect(px + 4, py + 4, 2, 2);

      // Pavio e faísca
      this.ctx.fillStyle = CONFIG.COLORS.BOMB;
      this.ctx.fillRect(px + 6, py + 1, 2, 2);
      // Faísca piscante na ponta do pavio
      if (Math.floor(Date.now() / 120) % 2 === 0) {
        this.ctx.fillRect(px + 8, py, 2, 2);
      }
    });
  }

  /**
   * Desenha o efeito visual da Explosão de Bomba
   */
  drawExplosions(explosions) {
    if (!explosions) return;
    const size = CONFIG.CELL_SIZE;

    this.ctx.fillStyle = CONFIG.COLORS.EXPLOSION;

    explosions.forEach(exp => {
      const cx = exp.x * size + size / 2;
      const cy = exp.y * size + size / 2;

      // Desenha ondas de choque pixeladas em cruz e cantos
      const radiusPx = (CONFIG.ENHANCED.BOMB_RADIUS * size) + (5 - exp.ticks) * 2;

      this.ctx.fillRect(cx - radiusPx, cy - 2, radiusPx * 2, 4);
      this.ctx.fillRect(cx - 2, cy - radiusPx, 4, radiusPx * 2);

      // Partículas em X
      const diag = Math.floor(radiusPx * 0.7);
      this.ctx.fillRect(cx - diag, cy - diag, 3, 3);
      this.ctx.fillRect(cx + diag, cy - diag, 3, 3);
      this.ctx.fillRect(cx - diag, cy + diag, 3, 3);
      this.ctx.fillRect(cx + diag, cy + diag, 3, 3);
    });
  }

  /**
   * Desenha Personagens Inimigos Atiradores (Pixel Art Retrô Estilo Nokia)
   */
  drawEnemies(enemies) {
    if (!enemies) return;
    const size = CONFIG.CELL_SIZE;

    enemies.forEach(enemy => {
      const px = enemy.x * size;
      const py = enemy.y * size;

      // Pisca nos últimos segundos antes de ir embora
      if (enemy.lifetime < 12 && Math.floor(Date.now() / 120) % 2 === 0) {
        return;
      }

      this.ctx.fillStyle = CONFIG.COLORS.ENEMY;

      // Robô/Torre Nokia retrô (8x8)
      this.ctx.fillRect(px + 2, py + 3, 8, 6);
      this.ctx.fillRect(px + 3, py + 2, 6, 8);

      // Olho / sensor no meio
      this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;
      this.ctx.fillRect(px + 4, py + 4, 4, 3);

      this.ctx.fillStyle = CONFIG.COLORS.ENEMY;
      this.ctx.fillRect(px + 5, py + 5, 2, 1);

      // Canhão apontando na direção do tiro
      const cx = px + size / 2;
      const cy = py + size / 2;
      const barrelX = cx + enemy.direction.x * 5;
      const barrelY = cy + enemy.direction.y * 5;
      this.ctx.fillRect(barrelX - 1, barrelY - 1, 3, 3);

      // Antena no topo
      this.ctx.fillRect(px + 5, py, 2, 2);
    });
  }

  /**
   * Desenha Projéteis (Tiros)
   */
  drawBullets(bullets) {
    if (!bullets) return;
    const size = CONFIG.CELL_SIZE;

    this.ctx.fillStyle = CONFIG.COLORS.BULLET;

    bullets.forEach(b => {
      const px = b.x * size;
      const py = b.y * size;

      // Projétil 3x3 sólido e rastro
      this.ctx.fillRect(px + 4, py + 4, 4, 4);
      // Rastro do tiro
      this.ctx.fillRect(px + 4 - b.vx * 2, py + 4 - b.vy * 2, 2, 2);
    });
  }

  /**
   * Desenha Item de Vida Extra (Coração Pixel Art Nokia)
   */
  drawHeartItem(heart) {
    if (!heart) return;
    const size = CONFIG.CELL_SIZE;
    const px = heart.x * size;
    const py = heart.y * size;

    // Pisca se estiver perto de sumir
    if (heart.timeLeft < 15 && Math.floor(Date.now() / 120) % 2 === 0) {
      return;
    }

    this.ctx.fillStyle = CONFIG.COLORS.HEART;

    // Formato de Coração em Pixel Art 10x10 bem visível:
    this.ctx.fillRect(px + 2, py + 2, 3, 2);
    this.ctx.fillRect(px + 7, py + 2, 3, 2);
    this.ctx.fillRect(px + 1, py + 3, 10, 4);
    this.ctx.fillRect(px + 2, py + 7, 8, 2);
    this.ctx.fillRect(px + 4, py + 9, 4, 2);
    this.ctx.fillRect(px + 5, py + 11, 2, 1);

    // Brilho interno do LCD no canto do coração
    this.ctx.fillStyle = CONFIG.COLORS.LCD_BACKGROUND;
    this.ctx.fillRect(px + 3, py + 4, 2, 2);
  }

  createEatParticles(gridX, gridY) {
    const size = CONFIG.CELL_SIZE;
    const centerX = gridX * size + size / 2;
    const centerY = gridY * size + size / 2;

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 12
      });
    }
  }

  updateAndDrawParticles() {
    this.ctx.fillStyle = CONFIG.COLORS.LCD_PIXEL_ON;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }
  }
}
