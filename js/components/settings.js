/**
 * ============================================================================
 * COMPONENT: SETTINGS.JS - Gerenciador de Configurações e Tela Cheia
 * ============================================================================
 */

import { Storage } from '../utils/storage.js';

export class SettingsManager {
  constructor() {
    this.isFullscreen = Storage.getFullscreenPref();
    this.isSwipeEnabled = Storage.getSwipePref();
    this.initDOM();
    if (this.isFullscreen) {
      this.applyFullscreen(true);
    }
  }

  initDOM() {
    this.fsExitBtn = document.getElementById('btnExitFullscreen');
    if (this.fsExitBtn) {
      this.fsExitBtn.addEventListener('click', () => {
        this.toggleFullscreen(false);
      });
    }

    this.fsSettingBtn = document.getElementById('btnSettingFullscreen');
    if (this.fsSettingBtn) {
      this.fsSettingBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    this.swipeSettingBtn = document.getElementById('btnSettingSwipe');
    if (this.swipeSettingBtn) {
      this.swipeSettingBtn.addEventListener('click', () => {
        this.toggleSwipe();
      });
    }

    this.updateUI();
  }

  toggleFullscreen(forceState = null) {
    this.isFullscreen = forceState !== null ? forceState : !this.isFullscreen;
    this.applyFullscreen(this.isFullscreen);
    Storage.setFullscreenPref(this.isFullscreen);
    this.updateUI();
    return this.isFullscreen;
  }

  toggleSwipe(forceState = null) {
    this.isSwipeEnabled = forceState !== null ? forceState : !this.isSwipeEnabled;
    Storage.setSwipePref(this.isSwipeEnabled);
    this.updateUI();
    return this.isSwipeEnabled;
  }

  applyFullscreen(enabled) {
    if (enabled) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
  }

  updateUI() {
    const statusText = document.getElementById('settingFsStatus');
    if (statusText) {
      statusText.textContent = this.isFullscreen ? 'LIGADO' : 'DESL';
    }

    const swipeText = document.getElementById('settingSwipeStatus');
    if (swipeText) {
      swipeText.textContent = this.isSwipeEnabled ? 'LIGADO' : 'DESL';
    }
  }
}
