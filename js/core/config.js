/**
 * ============================================================================
 * CORE: CONFIG.JS - Configurações Gerais e Constantes do Jogo
 * ============================================================================
 */

export const MODES = {
  CLASSIC: 'classic',    // Modo Nokia Clássico: Bateu na parede morre, 1 vida, comida normal
  ENHANCED: 'enhanced'   // Modo Melhorado: Atravessa paredes, bombas, inimigos atiradores, vidas extras
};

export const CONFIG = {
  // Configuração da Grade (Grid)
  GRID_COLUMNS: 24,
  GRID_ROWS: 18,
  CELL_SIZE: 12, // 24 * 12 = 288x216 pixels no Canvas

  // Cores do Canvas (Monocromático Estilo LCD Nokia 3310)
  COLORS: {
    LCD_BACKGROUND: '#97a858',
    LCD_PIXEL_ON: '#162410',
    LCD_PIXEL_DIM: 'rgba(22, 36, 16, 0.15)',
    BOMB: '#162410',
    ENEMY: '#162410',
    BULLET: '#162410',
    HEART: '#162410',
    EXPLOSION: '#162410'
  },

  // Velocidades (milissegundos entre cada passo da cobra)
  SPEED: {
    INITIAL: 135,
    MINIMUM: 60,
    DECREMENT: 3
  },

  // Pontuações
  SCORE: {
    NORMAL_FOOD: 10,
    BONUS_FOOD: 30,
    HEART_COLLECT: 20,
    ENEMY_DODGE: 15
  },

  // Parâmetros do Modo Melhorado
  ENHANCED: {
    INITIAL_LIVES: 3,
    MAX_LIVES: 4,
    INVULNERABILITY_TICKS: 18, // Ticks imune após levar dano
    BOMB_LIFETIME: 36,          // Duração da bomba antes de detonar
    BOMB_RADIUS: 1,            // Raio de explosão (1 = área 3x3)
    ENEMY_LIFETIME: 70,        // Duração do inimigo atirador na tela
    ENEMY_SHOOT_COOLDOWN: 14   // Frequência de tiros
  }
};
