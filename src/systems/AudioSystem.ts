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

  private tone(freq: number, duration: number, type: OscillatorType, gain = 0.05): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return
    const osc = this.ctx.createOscillator()
    const amp = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    amp.gain.value = gain
    amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
    osc.connect(amp)
    amp.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  jump(): void {
    this.tone(420, 0.12, 'square', 0.04)
  }

  collect(): void {
    this.tone(740, 0.08, 'triangle', 0.05)
    this.tone(980, 0.12, 'triangle', 0.04)
  }

  hurt(): void {
    this.tone(160, 0.18, 'sawtooth', 0.05)
  }

  land(): void {
    this.tone(120, 0.06, 'sine', 0.03)
  }

  win(): void {
    this.tone(520, 0.12, 'triangle', 0.05)
    this.tone(780, 0.2, 'triangle', 0.05)
  }

  install(): void {
    this.tone(240, 0.3, 'square', 0.03)
  }
}

export const audio = new AudioSystem()
