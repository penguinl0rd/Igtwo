
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBeep(freq = 440, duration = 0.1, type: OscillatorType = 'square') {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playBlip() {
    this.playBeep(880, 0.05, 'triangle');
  }

  playSuccess() {
    this.playBeep(440, 0.1);
    setTimeout(() => this.playBeep(880, 0.1), 100);
  }

  playSelect() {
    this.playBeep(660, 0.08, 'square');
  }
}

export const audio = new AudioService();
