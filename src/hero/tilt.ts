import { reducedMotion } from '../lib/motion';
import { GRAVITY, type World } from '../physics/world';
import type { Runner } from '../physics/loop';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function needsPermission(): boolean {
  const ctor = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>;
  };
  return typeof ctor.requestPermission === 'function';
}

export function mountTilt(world: World, runner: Runner, button: HTMLButtonElement): void {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion || !coarse) return;

  const listen = () => {
    window.addEventListener('deviceorientation', onOrientation);
    button.textContent = '';
    button.classList.add('is-shown', 'tilt-on');
    const label = document.createElement('span');
    label.textContent = 'Tilt on';
    button.append(label);
    button.disabled = true;
  };

  const onOrientation = (event: DeviceOrientationEvent) => {
    const orient = window.screen.orientation?.angle ?? 0;
    let angle = event.gamma ?? 0;
    if (orient === 90) angle = event.beta ?? 0;
    if (orient === -90 || orient === 270) angle = -(event.beta ?? 0);
    const gx = GRAVITY * clamp(angle / 35, -1, 1);
    const gy = Math.sqrt(Math.max(GRAVITY * GRAVITY - gx * gx, 0.3 * GRAVITY * (0.3 * GRAVITY)));
    const nextX = world.gravity.x + (gx - world.gravity.x) * 0.15;
    const nextY = world.gravity.y + (gy - world.gravity.y) * 0.15;
    const delta = Math.hypot(nextX - world.gravity.x, nextY - world.gravity.y);
    world.gravity.x = nextX;
    world.gravity.y = nextY;
    if (delta > 0.02 * GRAVITY) {
      world.wakeAll();
      runner.start();
    }
  };

  if (needsPermission()) {
    button.classList.add('is-shown');
    button.addEventListener('click', async () => {
      const ctor = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };
      try {
        const result = await ctor.requestPermission?.();
        if (result === 'granted') {
          listen();
          return;
        }
      } catch {
        /* denial or a thrown permission prompt */
      }
      button.textContent = 'Tilt blocked';
      window.setTimeout(() => button.classList.remove('is-shown'), 2000);
    });
    return;
  }

  listen();
}
