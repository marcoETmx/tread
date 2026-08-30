export class AudioSystem {
  private ctx: AudioContext | undefined
  private muted = false

  resume(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.ctx = new Ctor()
    }
    void this.ctx.resume()
  }

  private tone(freq: number, duration: number, type: OscillatorType, gain = 0.05, delay = 0): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return
    const osc = this.ctx.createOscillator()
    const amp = this.ctx.createGain()
    const start = this.ctx.currentTime + delay
    osc.type = type
    osc.frequency.value = freq
    amp.gain.setValueAtTime(gain, start)
    amp.gain.exponentialRampToValueAtTime(0.001, start + duration)
    osc.connect(amp)
    amp.connect(this.ctx.destination)
    osc.start(start)
    osc.stop(start + duration)
  }

  private thud(freq: number, duration: number, gain = 0.06): void {
    this.tone(freq, duration, 'square', gain)
    this.tone(freq * 0.5, duration + 0.04, 'sawtooth', gain * 0.6)
  }

  jump(): void {
    this.tone(380, 0.08, 'square', 0.035)
    this.tone(520, 0.1, 'square', 0.03, 0.04)
  }

  collect(): void {
    this.tone(620, 0.06, 'square', 0.045)
    this.tone(880, 0.08, 'square', 0.04, 0.05)
    this.tone(1240, 0.12, 'triangle', 0.035, 0.1)
  }

  hurt(): void {
    this.thud(140, 0.22, 0.07)
    this.tone(90, 0.28, 'sawtooth', 0.04)
  }

  land(): void {
    this.thud(110, 0.08, 0.045)
  }

  win(): void {
    this.tone(392, 0.12, 'square', 0.05)
    this.tone(523, 0.14, 'square', 0.05, 0.11)
    this.tone(659, 0.16, 'square', 0.05, 0.22)
    this.tone(784, 0.28, 'triangle', 0.055, 0.34)
  }

  install(): void {
    this.thud(180, 0.18, 0.04)
    this.tone(240, 0.35, 'square', 0.03, 0.08)
    this.tone(360, 0.4, 'square', 0.025, 0.2)
  }
}

export const audio = new AudioSystem()
