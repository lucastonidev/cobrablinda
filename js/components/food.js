/**
 * ============================================================================
 * COMPONENT: FOOD.JS - Gerenciador de Comidas e Itens Especiais
 * ============================================================================
 */

import { CONFIG } from '../core/config.js';

export class FoodManager {
  constructor() {
    this.food = null;
    this.bonusFood = null;
    this.foodsEatenCount = 0;
  }

  spawnFood(snake, blockedCells = []) {
    const emptyCells = [];

    for (let x = 0; x < CONFIG.GRID_COLUMNS; x++) {
      for (let y = 0; y < CONFIG.GRID_ROWS; y++) {
        if (!snake.occupies(x, y)) {
          const isBlocked = blockedCells.some(c => c && c.x === x && c.y === y);
          if (!isBlocked && (!this.bonusFood || this.bonusFood.x !== x || this.bonusFood.y !== y)) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    this.food = emptyCells[randomIndex];
    return this.food;
  }

  spawnBonusFood(snake, blockedCells = []) {
    const emptyCells = [];

    for (let x = 1; x < CONFIG.GRID_COLUMNS - 1; x++) {
      for (let y = 1; y < CONFIG.GRID_ROWS - 1; y++) {
        if (!snake.occupies(x, y)) {
          const isBlocked = blockedCells.some(c => c && c.x === x && c.y === y);
          if (!isBlocked && (!this.food || this.food.x !== x || this.food.y !== y)) {
            emptyCells.push({ x, y });
          }
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const pos = emptyCells[randomIndex];
      this.bonusFood = {
        x: pos.x,
        y: pos.y,
        timeLeft: 40,
        maxTime: 40
      };
    }
  }

  updateBonus() {
    if (this.bonusFood) {
      this.bonusFood.timeLeft--;
      if (this.bonusFood.timeLeft <= 0) {
        this.bonusFood = null;
      }
    }
  }

  onFoodConsumed(snake, isEnhancedMode = false, blockedCells = []) {
    this.foodsEatenCount++;
    this.spawnFood(snake, blockedCells);

    if (isEnhancedMode && !this.bonusFood && this.foodsEatenCount % 5 === 0) {
      this.spawnBonusFood(snake, blockedCells);
    }
  }

  reset() {
    this.food = null;
    this.bonusFood = null;
    this.foodsEatenCount = 0;
  }
}
