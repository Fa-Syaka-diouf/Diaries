// A soft paper "swish", synthesised with the Web Audio API so the book ships no
// audio file. Disabled by default; the reader turns it on from the toolbar.

let ctx: AudioContext | null = null

export function playPageTurn() {
  try {
    ctx ??= new AudioContext()
    const dur = 0.42
    const len = Math.floor(ctx.sampleRate * dur)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const x = i / len
      // rising then falling envelope with paper-like grain
      const env = Math.sin(Math.PI * Math.pow(x, 0.6)) * (1 - x) ** 1.5
      data[i] = (Math.random() * 2 - 1) * env * (0.6 + 0.4 * Math.random())
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.setValueAtTime(1800, ctx.currentTime)
    band.frequency.linearRampToValueAtTime(3800, ctx.currentTime + dur)
    band.Q.value = 0.7
    const gain = ctx.createGain()
    gain.gain.value = 0.16
    src.connect(band).connect(gain).connect(ctx.destination)
    src.start()
  } catch {
    // Audio unavailable: silently ignore, the sound is decorative.
  }
}
