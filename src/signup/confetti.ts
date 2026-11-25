import { fills, letterCycle } from '../content';
import { reducedMotion } from '../lib/motion';
import { createPiece, lookupPiece } from '../lib/piece';
import { makeBody } from '../physics/body';
import { applyDrag, bindDrag } from '../physics/drag';
import { Runner } from '../physics/loop';
import { renderWorld } from '../physics/render';
import { RESTITUTION_CHIP, World } from '../physics/world';

let world: World | null = null;
let runner: Runner | null = null;
let bound = false;

export function dropConfetti(host: HTMLElement): void {
  const width = host.clientWidth;
  const height = host.clientHeight;
  if (width < 40 || height < 40) {
    window.requestAnimationFrame(() => dropConfetti(host));
    return;
  }
  if (!world) {
    world = new World();
    world.beforeSolve = () => {
      if (world) applyDrag(world);
    };
    runner = new Runner(world, host, () => {
      if (world) renderWorld(world);
    });
    runner.observe();
  }
  const current = world;
  current.setBounds(width, height);
  current.clearDynamic();
  host.querySelectorAll('.phys').forEach((node) => node.remove());
  if (!bound) {
    bound = true;
    bindDrag(current, host, {
      toWorld: (clientX, clientY) => {
        const rect = host.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
      },
      lookup: lookupPiece,
      onGrab: () => runner?.start(),
    });
  }

  const reduced = reducedMotion;
  current.holdAwake = !reduced;
  for (let index = 0; index < 16; index += 1) {
    const size = 18 + Math.round(Math.random() * 12);
    const go = () => {
      const body = makeBody({
        id: `confetti-${index}-${size}`,
        w: size,
        h: size,
        x: reduced ? 20 + ((index * 37) % Math.max(30, width - 30)) : width * (0.08 + Math.random() * 0.84),
        y: reduced ? height - size / 2 - (index % 3) * 4 : -10 - index * 8,
        angle: reduced ? 0 : (Math.random() - 0.5) * 0.8,
        restitution: RESTITUTION_CHIP,
      });
      if (reduced) body.sleeping = true;
      const el = createPiece(body, '', {
        radius: 4,
        fillClass: fills[letterCycle[index % letterCycle.length]],
        borderPx: 2,
      });
      current.addBody(body);
      host.append(el);
      renderWorld(current);
    };
    if (reduced) go();
    else window.setTimeout(go, index * 60);
  }
  if (reduced) {
    current.holdAwake = false;
    renderWorld(current);
    return;
  }
  runner?.start();
  window.setTimeout(() => {
    current.holdAwake = false;
  }, 16 * 60 + 40);
}
