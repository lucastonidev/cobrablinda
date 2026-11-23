/**
 * ============================================================================
 * UTILS: AUDIO.JS - Efeitos Sonoros Retrô Monofônicos (Web Audio API)
 * ============================================================================
 */

import { Storage } from './storage.js';

class RetroAudio {
  constructor() {
    this.audioCtx = null;
    this.isMuted = Storage.getMutedPref();
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freq, durationMs = 80, type = 'square', gain = 0.08) {
    if (this.isMuted) return;
    this.init();

    try {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));
    } catch (e) {
      // Ignora restrições silenciosas de autoplay
    }
  }

  // Bip de clique de botão físico
  playKeyClick() {
    this.playTone(880, 25, 'triangle', 0.04);
  }

  // Som ao comer a maçã clássica
  playEat() {
    this.playTone(950, 50, 'square', 0.09);
    setTimeout(() => this.playTone(1250, 60, 'square', 0.09), 45);
  }

  // Som ao comer o item bônus
  playBonusEat() {
    this.playTone(800, 45, 'square', 0.09);
    setTimeout(() => this.playTone(1100, 50, 'square', 0.09), 40);
    setTimeout(() => this.playTone(1500, 70, 'square', 0.1), 85);
  }

  // Som ao coletar vida extra (coração)
  playExtraLife() {
    this.playTone(600, 50, 'sine', 0.1);
    setTimeout(() => this.playTone(900, 60, 'sine', 0.12), 40);
    setTimeout(() => this.playTone(1200, 90, 'square', 0.14), 90);
  }

  // Som de disparo do inimigo atirador
  playShoot() {
    this.playTone(1400, 30, 'sawtooth', 0.08);
    setTimeout(() => this.playTone(700, 50, 'sawtooth', 0.07), 25);
  }

  // Som de explosão da bomba
  playExplosion() {
    this.playTone(160, 180, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(90, 220, 'square', 0.12), 40);
  }

  // Som quando a cobra leva dano (perde 1 vida)
  playHurt() {
    this.playTone(300, 100, 'sawtooth', 0.14);
    setTimeout(() => this.playTone(180, 120, 'sawtooth', 0.14), 80);
  }

  // Som de Game Over
  playDie() {
    this.playTone(400, 100, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(280, 140, 'sawtooth', 0.15), 100);
    setTimeout(() => this.playTone(150, 260, 'sawtooth', 0.15), 240);
  }

  // Alterna som mudo / ativo
  toggleMute() {
    this.isMuted = !this.isMuted;
    Storage.setMutedPref(this.isMuted);
    if (!this.isMuted) {
      this.playKeyClick();
    }
    return this.isMuted;
  }
}

export const soundFx = new RetroAudio();
