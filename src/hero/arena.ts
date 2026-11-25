import content, { fills, letterCycle, type ChipDef } from '../content';
import { iconHtml, icons } from '../lib/icons';
import { onMotionChange, reducedMotion } from '../lib/motion';
import { createPiece, destroyPiece, lookupPiece } from '../lib/piece';
import { makeBody, type Body } from '../physics/body';
import { applyDrag, bindDrag } from '../physics/drag';
import { Runner } from '../physics/loop';
import { renderWorld } from '../physics/render';
import { RESTITUTION_BLOCK, RESTITUTION_CHIP, World } from '../physics/world';
import { mountTilt } from './tilt';

interface Metrics {
  w: number;
  h: number;
  font: number;
  radius: number;
}

function metricsFor(width: number): Metrics {
  if (width >= 900) return { w: 96, h: 112, font: 68, radius: 18 };
  if (width >= 640) return { w: 72, h: 84, font: 50, radius: 18 };
  return { w: 46, h: 54, font: 32, radius: 10 };
}

function wordWidth(word: string, letterW: number): number {
  return word.length * letterW + Math.max(0, word.length - 1) * 10;
}

function chipMarkup(chip: ChipDef, scale: number): string {
  const px = (value: number) => Math.max(8, Math.round(value * scale));
  if (chip.kind === 'share') return `${iconHtml(icons.share, px(18))}<span>${chip.label}</span>`;
  if (chip.kind === 'toggle') {
    return `<span class="chip-track" style="width:${px(36)}px;height:${px(20)}px"><span class="chip-knob" style="width:${px(14)}px;height:${px(14)}px"></span></span><span>${chip.label}</span>`;
  }
  if (chip.kind === 'swatches') {
    return ['bg-tomato', 'bg-butter', 'bg-mint', 'bg-sky']
      .map((fill) => `<i class="swatch ${fill}" style="width:${px(22)}px;height:${px(22)}px"></i>`)
      .join('');
  }
  if (chip.kind === 'cursor') return `${iconHtml(icons.pointer, px(16))}<span>${chip.label}</span>`;
  if (chip.kind === 'frame') return `<span>${chip.label}</span>`;
  if (chip.kind === 'slider') {
    return `<span>Opacity</span><span class="slider-track" style="width:${px(64)}px"><span class="slider-knob" style="left:80%"></span></span><span>80%</span>`;
  }
  if (chip.kind === 'comment') return `${iconHtml(icons.message, px(18))}<span>${chip.label}</span>`;
  return iconHtml(icons.plus, px(22));
}

export function mountArena(): void {
  const arena = document.querySelector<HTMLElement>('#arena');
  const layer = document.querySelector<HTMLElement>('#arena-bodies');
  const hint = document.querySelector<HTMLElement>('#arena-hint');
  const reset = document.querySelector<HTMLButtonElement>('#reset-btn');
  const shake = document.querySelector<HTMLButtonElement>('#shake-btn');
  const tilt = document.querySelector<HTMLButtonElement>('#tilt-btn');
  if (!arena || !layer || !hint || !reset || !shake || !tilt) return;

  const world = new World();
  world.beforeSolve = () => applyDrag(world);
  const runner = new Runner(world, arena, () => renderWorld(world));
  runner.observe();
  mountTilt(world, runner, tilt);

  const pieces: { body: Body; el: HTMLElement }[] = [];
  let timers: number[] = [];
  let hinted = false;
  let unbind = () => {};

  const toWorld = (clientX: number, clientY: number) => {
    const rect = layer.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const clearPieces = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    unbind();
    for (const piece of pieces) destroyPiece(piece.body, piece.el);
    pieces.length = 0;
    world.clearDynamic();
    layer.innerHTML = '';
  };

  const addPiece = (body: Body, el: HTMLElement) => {
    world.addBody(body);
    layer.append(el);
    pieces.push({ body, el });
    renderWorld(world);
  };

  const wake = () => {
    if (!hinted) {
      hinted = true;
      hint.classList.add('is-gone');
    }
    runner.start();
  };

  const bind = () => {
    unbind = bindDrag(world, layer, {
      toWorld,
      lookup: lookupPiece,
      onGrab: wake,
    });
  };

  const build = () => {
    const width = layer.clientWidth;
    const height = layer.clientHeight;
    if (width < 40 || height < 40) {
      window.requestAnimationFrame(build);
      return;
    }
    clearPieces();
    world.setBounds(width, height);
    const mobile = width < 640;
    const scale = mobile ? 0.75 : 1;
    const metric = metricsFor(width);
    const reduced = reducedMotion;
    const words = content.heroWord.split(' ').filter(Boolean);
    const total =
      words.reduce((sum, word, index) => sum + wordWidth(word, metric.w) + (index ? metric.w * 0.6 : 0), 0);
    const twoRows = total > width - 12;
    const floorY = height - metric.h / 2;
    const upperY = floorY - metric.h - 8;
    const letters: { char: string; x: number; y: number; angle: number }[] = [];

    if (!twoRows) {
      let cursor = (width - total) / 2;
      const count = words.join('').length;
      let index = 0;
      words.forEach((word, wordIndex) => {
        if (wordIndex) cursor += metric.w * 0.6;
        for (const char of word) {
          const t = count <= 1 ? 0 : index / (count - 1);
          letters.push({
            char,
            x: cursor + metric.w / 2,
            y: reduced ? floorY : -140 - t * 480,
            angle: reduced ? 0 : (Math.random() - 0.5) * 0.3,
          });
          cursor += metric.w + 10;
          index += 1;
        }
        cursor -= 10;
      });
    } else {
      const base = -180 - Math.random() * 220;
      words.forEach((word, wordIndex) => {
        const span = wordWidth(word, metric.w);
        let cursor = (width - span) / 2;
        for (const char of word) {
          let y = floorY;
          if (reduced) y = wordIndex === 0 ? upperY : floorY;
          else y = wordIndex === 0 ? base : base - metric.h;
          letters.push({
            char,
            x: cursor + metric.w / 2,
            y,
            angle: reduced ? 0 : (Math.random() - 0.5) * 0.3,
          });
          cursor += metric.w + 10;
        }
      });
    }

    const chips = content.chips
      .filter((chip) => !(mobile && chip.desktopOnly))
      .map((chip) => ({
        ...chip,
        w: Math.round(chip.w * scale),
        h: Math.round(chip.h * scale),
      }));

    world.holdAwake = !reduced;
    bind();
    runner.start();

    const placeLetter = (letter: (typeof letters)[number], order: number) => {
      const body = makeBody({
        id: `letter-${order}`,
        w: metric.w,
        h: metric.h,
        x: letter.x,
        y: letter.y,
        angle: letter.angle,
        restitution: RESTITUTION_BLOCK,
      });
      if (reduced) {
        body.sleeping = true;
        body.vx = 0;
      }
      const el = createPiece(body, letter.char, {
        radius: metric.radius,
        fillClass: fills[letterCycle[order % letterCycle.length]],
        fontClass: 'font-display font-extrabold',
        fontPx: metric.font,
      });
      addPiece(body, el);
    };

    const placeChip = (chip: (typeof chips)[number], index: number) => {
      const slot = content.chipSlots[index] ?? { x: 0.5, lift: 0 };
      const x = reduced
        ? Math.max(chip.w / 2 + 4, Math.min(width - chip.w / 2 - 4, slot.x * width))
        : width * (0.15 + Math.random() * 0.7);
      const y = reduced
        ? height - chip.h / 2 - slot.lift * (metric.h + 10)
        : -160 - Math.random() * 360;
      const body = makeBody({
        id: `chip-${chip.id}`,
        w: chip.w,
        h: chip.h,
        x,
        y,
        angle: reduced ? 0 : (Math.random() - 0.5) * 0.2,
        restitution: RESTITUTION_CHIP,
      });
      if (reduced) body.sleeping = true;
      const el = createPiece(body, chipMarkup(chip, scale), {
        radius: chip.radius,
        fillClass: fills[chip.fill],
        textClass: chip.fill === 'ink' ? 'text-paper' : 'text-ink',
        fontClass: chip.mono ? 'font-mono' : 'font-sans font-semibold',
        fontPx: Math.max(12, Math.round(16 * scale)),
      });
      addPiece(body, el);
    };

    if (reduced) {
      letters.forEach(placeLetter);
      chips.forEach(placeChip);
      world.holdAwake = false;
      renderWorld(world);
      return;
    }

    letters.forEach((letter, index) => {
      timers.push(window.setTimeout(() => placeLetter(letter, index), 250 + index * 90));
    });
    const afterLetters = 250 + letters.length * 90;
    chips.forEach((chip, index) => {
      timers.push(window.setTimeout(() => placeChip(chip, index), afterLetters + index * 70));
    });
    timers.push(
      window.setTimeout(() => {
        world.holdAwake = false;
      }, afterLetters + chips.length * 70),
    );
  };

  reset.addEventListener('click', () => build());
  shake.addEventListener('click', () => {
    if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
    for (const { body } of pieces) {
      body.vy = -(900 + Math.random() * 500);
      body.vx = (Math.random() * 2 - 1) * 500;
      body.av = (Math.random() * 2 - 1) * 4;
      body.sleeping = false;
      body.sleepTime = 0;
    }
    world.holdAwake = false;
    runner.start();
  });

  let lastW = 0;
  let lastH = 0;
  const onResize = () => {
    const width = layer.clientWidth;
    const height = layer.clientHeight;
    if (Math.abs(width - lastW) < 12 && Math.abs(height - lastH) < 24 && pieces.length) {
      world.setBounds(width, height);
      return;
    }
    lastW = width;
    lastH = height;
    build();
  };
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(onResize, 150);
  });
  onMotionChange(() => {
    lastW = 0;
    build();
  });
  build();
}
