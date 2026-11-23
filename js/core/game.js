/**
 * ============================================================================
 * CORE: GAME.JS - Máquina de Estados e Loop Central do Jogo
 * ============================================================================
 * Orquestra todos os componentes modulares: Cobra, Comidas, Bombas, Inimigos,
 * Vidas Extras, Configurações de Tela Cheia e Renderização Canvas.
 */

import { CONFIG, MODES } from './config.js';
import { GAME_STATES } from './state.js';
import { Snake } from '../components/snake.js';
import { FoodManager } from '../components/food.js';
import { BombManager } from '../components/bombs.js';
import { EnemyManager } from '../components/enemies.js';
import { LivesManager } from '../components/lives.js';
import { SettingsManager } from '../components/settings.js';
import { Storage } from '../utils/storage.js';
import { soundFx } from '../utils/audio.js';

export class Game {
  constructor(renderer) {
    this.renderer = renderer;
    this.snake = new Snake();
    this.foodManager = new FoodManager();
    this.bombManager = new BombManager();
    this.enemyManager = new EnemyManager();
    this.livesManager = new LivesManager();
    this.settings = new SettingsManager();

    this.state = GAME_STATES.MENU;
    this.currentMode = MODES.CLASSIC;

    this.score = 0;
    this.highScores = {
      [MODES.CLASSIC]: Storage.getHighScore(MODES.CLASSIC),
      [MODES.ENHANCED]: Storage.getHighScore(MODES.ENHANCED)
    };

    this.speed = CONFIG.SPEED.INITIAL;
    this.lastFrameTime = 0;
    this.tickCounter = 0;
    this.animationFrameId = null;

    // Cooldowns de proteção contra cliques duplos rápidos
    this.lastMenuNavTime = 0;
    this.lastActionTime = 0;

    this.initDOM();
    this.updateUI();
    this.showMenu();
  }

  initDOM() {
    this.ui = {
      score: document.getElementById('currentScore'),
      highScore: document.getElementById('highScore'),
      modeBadge: document.getElementById('modeBadge'),
      livesDisplay: document.getElementById('livesDisplay'),
      menuOverlay: document.getElementById('menuOverlay'),
      settingsOverlay: document.getElementById('settingsOverlay'),
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      finalScore: document.getElementById('finalScore'),
      finalHighScore: document.getElementById('finalHighScore'),
      menuModeText: document.getElementById('menuModeText')
    };
  }

  startNewGame() {
    this.state = GAME_STATES.PLAYING;
    this.score = 0;
    this.speed = CONFIG.SPEED.INITIAL;
    this.tickCounter = 0;

    this.snake.reset();
    this.foodManager.reset();
    this.bombManager.reset();
    this.enemyManager.reset();
    this.livesManager.reset(this.currentMode);

    this.foodManager.spawnFood(this.snake);

    this.hideAllOverlays();
    this.updateUI();

    soundFx.playEat();

    this.lastFrameTime = performance.now();
    if (!this.animationFrameId) {
      this.loop = this.loop.bind(this);
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  loop(timestamp) {
    this.animationFrameId = requestAnimationFrame(this.loop);

    if (this.state !== GAME_STATES.PLAYING) {
      if (this.state === GAME_STATES.GAME_OVER && this.renderer.particles.length > 0) {
        this.renderer.clear();
        this.renderer.drawWalls(this.currentMode);
        this.renderer.drawSnake(this.snake.segments, this.currentMode, this.snake.direction, this.tickCounter);
        this.renderer.updateAndDrawParticles();
      }
      return;
    }

    const elapsed = timestamp - this.lastFrameTime;

    if (elapsed >= this.speed) {
      this.lastFrameTime = timestamp;
      this.updateGameLogic();
    }

    this.render();
  }

  updateGameLogic() {
    this.tickCounter++;

    const isEnhanced = this.currentMode === MODES.ENHANCED;
    const head = this.snake.getHead();

    // 1. Checa se vai comer a comida normal ou bônus no próximo passo
    const nextX = head.x + this.snake.nextDirection.x;
    const nextY = head.y + this.snake.nextDirection.y;

    let checkX = nextX;
    let checkY = nextY;
    if (isEnhanced) {
      if (checkX < 0) checkX = CONFIG.GRID_COLUMNS - 1;
      else if (checkX >= CONFIG.GRID_COLUMNS) checkX = 0;
      if (checkY < 0) checkY = CONFIG.GRID_ROWS - 1;
      else if (checkY >= CONFIG.GRID_ROWS) checkY = 0;
    }

    const isEatingNormal = this.foodManager.food &&
      checkX === this.foodManager.food.x &&
      checkY === this.foodManager.food.y;

    const isEatingBonus = this.foodManager.bonusFood &&
      checkX === this.foodManager.bonusFood.x &&
      checkY === this.foodManager.bonusFood.y;

    const willGrow = isEatingNormal || isEatingBonus;

    // 2. Move a cobra
    const alive = this.snake.move(willGrow, this.currentMode);

    if (!alive) {
      // No modo melhorado, colisão consome 1 vida
      if (isEnhanced && this.livesManager.lives > 1) {
        this.livesManager.loseLife();
        this.snake.triggerInvulnerability();
        soundFx.playHurt();
        this.updateUI();
      } else {
        this.gameOver();
        return;
      }
    }

    // 3. Processa Comidas
    const blockedPositions = [
      ...this.bombManager.getAllPositions(),
      ...this.enemyManager.getAllPositions()
    ];

    if (isEatingNormal) {
      this.score += CONFIG.SCORE.NORMAL_FOOD;
      soundFx.playEat();

      if (isEnhanced) {
        this.renderer.createEatParticles(this.foodManager.food.x, this.foodManager.food.y);
      }

      this.foodManager.onFoodConsumed(this.snake, isEnhanced, blockedPositions);
      this.speed = Math.max(CONFIG.SPEED.MINIMUM, this.speed - CONFIG.SPEED.DECREMENT);
      this.checkHighScore();
      this.updateUI();
    }

    if (isEatingBonus) {
      this.score += CONFIG.SCORE.BONUS_FOOD;
      soundFx.playBonusEat();
      this.renderer.createEatParticles(this.foodManager.bonusFood.x, this.foodManager.bonusFood.y);
      this.foodManager.bonusFood = null;
      this.checkHighScore();
      this.updateUI();
    }

    this.foodManager.updateBonus();

    // 4. Elementos Exclusivos do Modo Melhorado
    if (isEnhanced) {
      // Vidas Extras (Corações)
      const gotHeart = this.livesManager.update(this.snake, blockedPositions);
      if (gotHeart) {
        this.score += CONFIG.SCORE.HEART_COLLECT;
        this.updateUI();
      }

      // Bombas (Detonação e Dano)
      const bombResult = this.bombManager.update(this.snake, blockedPositions);
      if (bombResult.damageToSnake) {
        this.handleSnakeDamage();
        if (this.state === GAME_STATES.GAME_OVER) return;
      }

      // Inimigos Atiradores (Tiros e Dano)
      const enemyResult = this.enemyManager.update(this.snake, blockedPositions);
      if (enemyResult.damageToSnake) {
        this.handleSnakeDamage();
        if (this.state === GAME_STATES.GAME_OVER) return;
      }
    }
  }

  handleSnakeDamage() {
    this.livesManager.loseLife();
    soundFx.playHurt();
    this.snake.triggerInvulnerability();
    this.updateUI();

    if (this.livesManager.isDead()) {
      this.gameOver();
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.drawWalls(this.currentMode);

    // Desenha Comidas
    this.renderer.drawFood(this.foodManager.food, this.currentMode);
    this.renderer.drawBonusFood(this.foodManager.bonusFood);

    // Desenha Elementos do Modo Melhorado
    if (this.currentMode === MODES.ENHANCED) {
      this.renderer.drawHeartItem(this.livesManager.heartItem);
      this.renderer.drawBombs(this.bombManager.bombs);
      this.renderer.drawExplosions(this.bombManager.activeExplosions);
      this.renderer.drawEnemies(this.enemyManager.enemies);
      this.renderer.drawBullets(this.enemyManager.bullets);
    }

    // Desenha Cobra
    this.renderer.drawSnake(
      this.snake.segments,
      this.currentMode,
      this.snake.direction,
      this.tickCounter,
      this.snake.isInvulnerable()
    );

    // Partículas
    if (this.renderer.particles.length > 0) {
      this.renderer.updateAndDrawParticles();
    }
  }

  gameOver() {
    this.state = GAME_STATES.GAME_OVER;
    soundFx.playDie();
    this.checkHighScore();
    this.updateKeypadState();

    if (this.ui.finalScore) this.ui.finalScore.textContent = this.score;
    if (this.ui.finalHighScore) this.ui.finalHighScore.textContent = this.highScores[this.currentMode];
    if (this.ui.gameOverOverlay) {
      this.ui.gameOverOverlay.classList.remove('hidden');
      this.resetMenuSelection(this.ui.gameOverOverlay);
    }
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      if (this.ui.pauseOverlay) this.ui.pauseOverlay.classList.remove('hidden');
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      if (this.ui.pauseOverlay) this.ui.pauseOverlay.classList.add('hidden');
      this.lastFrameTime = performance.now();
    }
    this.updateKeypadState();
  }

  showMenu() {
    this.state = GAME_STATES.MENU;
    this.hideAllOverlays();
    this.updateKeypadState();
    if (this.ui.menuOverlay) {
      this.ui.menuOverlay.classList.remove('hidden');
      this.resetMenuSelection(this.ui.menuOverlay);
    }
    this.renderer.clear();
    this.renderer.drawWalls(this.currentMode);
  }

  showSettings() {
    this.state = GAME_STATES.SETTINGS;
    this.hideAllOverlays();
    this.updateKeypadState();
    if (this.ui.settingsOverlay) {
      this.ui.settingsOverlay.classList.remove('hidden');
      this.resetMenuSelection(this.ui.settingsOverlay);
    }
    this.renderer.clear();
    this.renderer.drawWalls(this.currentMode);
  }

  updateKeypadState() {
    const keypad = document.querySelector('.keypad-container');
    const naviKey = document.getElementById('naviKey');
    if (!keypad) return;

    if (this.state === GAME_STATES.PLAYING) {
      keypad.classList.add('playing-only-arrows');
      if (naviKey) naviKey.textContent = 'PAUSA';
    } else {
      keypad.classList.remove('playing-only-arrows');
      if (naviKey) naviKey.textContent = 'OK';
    }
  }

  resetMenuSelection(overlay) {
    if (!overlay) return;
    const items = overlay.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
      if (index === 0) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  navigateMenu(direction) {
    const now = Date.now();
    // Bloqueia pulo duplo se o comando vier em menos de 160ms
    if (now - this.lastMenuNavTime < 160) return;
    this.lastMenuNavTime = now;

    let activeOverlay = null;
    if (this.state === GAME_STATES.MENU) activeOverlay = this.ui.menuOverlay;
    else if (this.state === GAME_STATES.SETTINGS) activeOverlay = this.ui.settingsOverlay;
    else if (this.state === GAME_STATES.GAME_OVER) activeOverlay = this.ui.gameOverOverlay;

    if (!activeOverlay) return;

    const items = Array.from(activeOverlay.querySelectorAll('.menu-item'));
    if (items.length === 0) return;

    let currentIndex = items.findIndex(el => el.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;

    items[currentIndex].classList.remove('active');

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = items.length - 1;
    if (nextIndex >= items.length) nextIndex = 0;

    items[nextIndex].classList.add('active');
    soundFx.playKeyClick();
  }

  activateCurrentMenuItem() {
    const now = Date.now();
    // Bloqueia dupla ativação acidental nos próximos 280ms
    if (now - this.lastActionTime < 280) return;
    this.lastActionTime = now;

    let activeOverlay = null;
    if (this.state === GAME_STATES.MENU) activeOverlay = this.ui.menuOverlay;
    else if (this.state === GAME_STATES.SETTINGS) activeOverlay = this.ui.settingsOverlay;
    else if (this.state === GAME_STATES.GAME_OVER) activeOverlay = this.ui.gameOverOverlay;

    if (activeOverlay) {
      const activeItem = activeOverlay.querySelector('.menu-item.active');
      if (activeItem) {
        activeItem.click();
        return;
      }
    }

    if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.GAME_OVER) {
      this.startNewGame();
    } else if (this.state === GAME_STATES.SETTINGS) {
      this.settings.toggleFullscreen();
    } else if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED) {
      this.togglePause();
    }
  }

  toggleMode() {
    this.currentMode = (this.currentMode === MODES.CLASSIC) ? MODES.ENHANCED : MODES.CLASSIC;
    this.livesManager.reset(this.currentMode);
    this.updateUI();

    if (this.state === GAME_STATES.MENU) {
      this.renderer.clear();
      this.renderer.drawWalls(this.currentMode);
    }
  }

  checkHighScore() {
    if (this.score > this.highScores[this.currentMode]) {
      this.highScores[this.currentMode] = this.score;
      Storage.setHighScore(this.currentMode, this.score);
    }
  }

  hideAllOverlays() {
    if (this.ui.menuOverlay) this.ui.menuOverlay.classList.add('hidden');
    if (this.ui.settingsOverlay) this.ui.settingsOverlay.classList.add('hidden');
    if (this.ui.gameOverOverlay) this.ui.gameOverOverlay.classList.add('hidden');
    if (this.ui.pauseOverlay) this.ui.pauseOverlay.classList.add('hidden');
  }

  updateUI() {
    if (this.ui.score) this.ui.score.textContent = this.score;
    if (this.ui.highScore) this.ui.highScore.textContent = this.highScores[this.currentMode];

    const isClassic = this.currentMode === MODES.CLASSIC;
    if (this.ui.modeBadge) {
      this.ui.modeBadge.textContent = isClassic ? 'CLASSIC' : 'TURBO+';
    }
    if (this.ui.menuModeText) {
      this.ui.menuModeText.textContent = isClassic ? 'Clássico' : 'Melhorado';
    }

    // Exibição de Vidas no Topo do LCD com visual ampliado e legível
    if (this.ui.livesDisplay) {
      if (isClassic) {
        this.ui.livesDisplay.innerHTML = `<span style="font-size: 0.85rem; opacity: 0.85; margin-right: 3px;">VIDA:</span><span class="heart-symbol">♥</span>`;
      } else {
        const count = Math.max(0, this.livesManager.lives);
        if (count > 0) {
          const hearts = Array(count).fill('<span class="heart-symbol">♥</span>').join(' ');
          this.ui.livesDisplay.innerHTML = `<span style="font-size: 0.85rem; opacity: 0.85; margin-right: 4px;">VIDAS:</span>${hearts}`;
        } else {
          this.ui.livesDisplay.innerHTML = `<span style="font-size: 0.85rem; letter-spacing: 1px;">💀 0 VIDAS</span>`;
        }
      }
    }

    this.updateKeypadState();
  }
}
