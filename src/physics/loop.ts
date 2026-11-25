import { FIXED_DT, MAX_SUBSTEPS, type World } from './world';

export class Runner {
  private raf = 0;
  private acc = 0;
  private last = 0;
  private running = false;
  private inView = true;
  private observer: IntersectionObserver | null = null;
  private onVisibility: (() => void) | null = null;

  constructor(
    readonly world: World,
    private container: HTMLElement,
    private render: () => void,
  ) {}

  start(): void {
    if (this.running) return;
    if (document.hidden) return;
    if (!this.inView) return;
    if (this.world.allAsleep()) return;
    this.running = true;
    this.last = 0;
    this.acc = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  observe(): void {
    this.refreshInView();
    if (this.observer) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        this.inView = entries.some((entry) => entry.isIntersecting);
        if (this.inView) this.start();
        else this.stop();
      },
      { threshold: 0.01 },
    );
    this.observer.observe(this.container);
    this.onVisibility = () => {
      if (document.hidden) this.stop();
      else this.start();
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  destroy(): void {
    this.stop();
    this.observer?.disconnect();
    this.observer = null;
    if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
    this.onVisibility = null;
  }

  private refreshInView(): void {
    const rect = this.container.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    this.inView = rect.bottom > 0 && rect.top < h && rect.width > 0;
  }

  private frame = (t: number): void => {
    if (!this.running) return;
    if (this.last === 0) this.last = t;
    let frameDt = (t - this.last) / 1000;
    this.last = t;
    if (frameDt > 1 / 20) frameDt = 1 / 20;
    this.acc += frameDt;
    let steps = 0;
    while (this.acc >= FIXED_DT && steps < MAX_SUBSTEPS) {
      this.world.step(FIXED_DT);
      this.acc -= FIXED_DT;
      steps++;
    }
    if (steps === MAX_SUBSTEPS) this.acc = 0;
    this.render();
    if (this.world.allAsleep()) {
      this.stop();
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };
}
