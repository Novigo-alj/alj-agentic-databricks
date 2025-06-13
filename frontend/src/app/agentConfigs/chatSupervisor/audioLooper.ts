export class AudioLooper {
  private audio: HTMLAudioElement;
  private fadeDuration = 500; // ms

  constructor(audioSrc: string) {
    this.audio = new Audio(audioSrc);
    this.audio.loop = true;
    this.audio.volume = 0.25;
  }

  async play() {
    try {
      // Fade volume in smoothly before playing
      this.audio.volume = 0;
      await this.audio.play();
      this.fadeVolume(0, 0.25, this.fadeDuration);
    } catch (err) {
      console.warn("Audio play failed:", err);
    }
  }

  async stop() {
    // Fade out volume before stopping
    await this.fadeVolume(this.audio.volume, 0, this.fadeDuration);
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  private fadeVolume(from: number, to: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const stepTime = 50;
      const steps = duration / stepTime;
      const volumeStep = (to - from) / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = this.audio.volume + volumeStep;
        this.audio.volume = Math.min(Math.max(newVolume, 0), 1);

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepTime);
    });
  }
}