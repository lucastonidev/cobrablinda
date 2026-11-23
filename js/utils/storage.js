/**
 * ============================================================================
 * UTILS: STORAGE.JS - Gerenciamento de Armazenamento Local (LocalStorage)
 * ============================================================================
 */

import { MODES } from '../core/config.js';

const KEYS = {
  HS_CLASSIC: 'cobra_hs_classic',
  HS_ENHANCED: 'cobra_hs_enhanced',
  FULLSCREEN: 'cobra_pref_fullscreen',
  MUTED: 'cobra_pref_muted',
  SWIPE: 'cobra_pref_swipe'
};

const isAvailable = typeof localStorage !== 'undefined';

export const Storage = {
  getHighScore(mode) {
    if (!isAvailable) return 0;
    const key = mode === MODES.CLASSIC ? KEYS.HS_CLASSIC : KEYS.HS_ENHANCED;
    return parseInt(localStorage.getItem(key) || '0', 10);
  },

  setHighScore(mode, score) {
    if (!isAvailable) return;
    const key = mode === MODES.CLASSIC ? KEYS.HS_CLASSIC : KEYS.HS_ENHANCED;
    localStorage.setItem(key, score.toString());
  },

  getFullscreenPref() {
    if (!isAvailable) return false;
    return localStorage.getItem(KEYS.FULLSCREEN) === 'true';
  },

  setFullscreenPref(enabled) {
    if (!isAvailable) return;
    localStorage.setItem(KEYS.FULLSCREEN, enabled ? 'true' : 'false');
  },

  getMutedPref() {
    if (!isAvailable) return false;
    return localStorage.getItem(KEYS.MUTED) === 'true';
  },

  setMutedPref(muted) {
    if (!isAvailable) return;
    localStorage.setItem(KEYS.MUTED, muted ? 'true' : 'false');
  },

  getSwipePref() {
    if (!isAvailable) return true;
    const val = localStorage.getItem(KEYS.SWIPE);
    return val === null ? true : val === 'true'; // Padrão: LIGADO
  },

  setSwipePref(enabled) {
    if (!isAvailable) return;
    localStorage.setItem(KEYS.SWIPE, enabled ? 'true' : 'false');
  }
};
