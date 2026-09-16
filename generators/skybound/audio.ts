// Fully procedural sound: wind that scales with airspeed, sonic booms, heat-vision hum,
// explosions, thuds. No audio assets — everything is synthesized from noise buffers and oscillators.

export class Sfx {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private noiseBuf!: AudioBuffer;

  private windGain!: GainNode;
  private windFilter!: BiquadFilterNode;
  private rumbleGain!: GainNode;

  private laserOsc: OscillatorNode | null = null;
  private laserGain: GainNode | null = null;

  unlock() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(ctx.destination);

    // 2s of white noise, reused by everything.
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    // Looping wind: noise -> bandpass -> gain.
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this.noiseBuf;
    windSrc.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 300;
    this.windFilter.Q.value = 0.6;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    windSrc.connect(this.windFilter).connect(this.windGain).connect(this.master);
    windSrc.start();

    // Low boost rumble: noise -> lowpass.
    const rumbleSrc = ctx.createBufferSource();
    rumbleSrc.buffer = this.noiseBuf;
    rumbleSrc.loop = true;
    rumbleSrc.playbackRate.value = 0.3;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 90;
    this.rumbleGain = ctx.createGain();
    this.rumbleGain.gain.value = 0;
    rumbleSrc.connect(rumbleFilter).connect(this.rumbleGain).connect(this.master);
    rumbleSrc.start();
  }

  /** speed in m/s; boost 0..1; space 0..1 (mutes wind in vacuum). */
  wind(speed: number, boost: number, space: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const air = 1 - space * 0.92;
    const s = Math.min(1, speed / 300);
    this.windGain.gain.setTargetAtTime((0.02 + s * 0.5) * (speed > 6 ? 1 : 0) * air, t, 0.12);
    this.windFilter.frequency.setTargetAtTime(200 + s * 1400, t, 0.15);
    this.rumbleGain.gain.setTargetAtTime(boost * 0.5 * air, t, 0.1);
  }

  private burst(dur: number, filterType: BiquadFilterType, freq: number, gain: number, rate = 1) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = rate;
    const f = ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  sonicBoom() {
    this.burst(1.4, 'lowpass', 120, 1.2, 0.4);
    this.burst(0.25, 'highpass', 1000, 0.5);
  }

  explosion(intensity = 1) {
    this.burst(0.9 * intensity + 0.3, 'lowpass', 200, Math.min(1.2, 0.5 * intensity + 0.3), 0.5);
    this.burst(0.3, 'bandpass', 900, 0.35 * intensity);
  }

  thud(intensity = 1) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.min(1, 0.7 * intensity), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.35);
    this.burst(0.2, 'lowpass', 400, 0.4 * intensity);
  }

  whoosh() {
    this.burst(0.6, 'bandpass', 700, 0.5, 1.6);
  }

  crumble() {
    this.burst(0.4, 'lowpass', 500, 0.3, 0.7);
  }

  laser(on: boolean) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (on && !this.laserOsc) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 70;
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 138;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 700;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.08);
      osc.connect(f);
      osc2.connect(f);
      f.connect(g).connect(this.master);
      osc.start();
      osc2.start();
      this.laserOsc = osc;
      this.laserGain = g;
      (osc as unknown as { _pair: OscillatorNode })._pair = osc2;
    } else if (!on && this.laserOsc) {
      const osc = this.laserOsc;
      const osc2 = (osc as unknown as { _pair: OscillatorNode })._pair;
      const g = this.laserGain!;
      const t = ctx.currentTime;
      g.gain.setTargetAtTime(0, t, 0.05);
      osc.stop(t + 0.3);
      osc2.stop(t + 0.3);
      this.laserOsc = null;
      this.laserGain = null;
    }
  }
}
