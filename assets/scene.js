(function () {
  'use strict';
  const scene = document.querySelector('.landscape');
  const pre = document.getElementById('ascii-landscape');
  const wizard = document.querySelector('.pixel-wizard');
  if (wizard) wizard.hidden = true;

  const sprite = document.createElement('canvas');
  sprite.width = 40;
  sprite.height = 32;
  sprite.className = 'scene-sprite';
  sprite.setAttribute('aria-hidden', 'true');
  scene.appendChild(sprite);

  const button = document.createElement('button');
  button.className = 'scene-switch';
  button.type = 'button';
  scene.appendChild(button);

  const radio = document.querySelector('.now-playing');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');

  // Fixed glyph size — never stretch letters; widen by adding columns.
  const FONT_PX = 9;
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = FONT_PX + 'px monospace';
  const CHAR_W = Math.max(1, measure.measureText('M').width);
  const CHAR_H = FONT_PX;

  let fisher = false;
  let timer;
  let cols = 120;
  let rows = 48;

  const noise = (x, y) => ((x * 73 + y * 137 + x * y * 19) % 101) / 101;

  function measureGrid() {
    const w = Math.max(1, scene.clientWidth);
    const h = Math.max(1, scene.clientHeight);
    cols = Math.max(48, Math.floor(w / CHAR_W));
    rows = Math.max(24, Math.floor(h / CHAR_H));
  }

  function drawSprite(ctx) {
    ctx.clearRect(0, 0, 40, 32);
    const rect = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    };
    if (!fisher) {
      rect(15, 2, 7, 2, '#292d31');
      rect(12, 4, 13, 3, '#292d31');
      rect(9, 7, 20, 2, '#44484a');
    }
    rect(13, 10, 13, 9, '#ee997a');
    rect(11, 13, 18, 4, '#ee997a');
    rect(23, 11, 2, 2, '#141414');
    rect(13, 19, 3, 2, '#ee997a');
    rect(20, 19, 3, 2, '#ee997a');
    if (fisher) {
      rect(7, 23, 27, 3, '#a67435');
      rect(9, 26, 23, 2, '#795020');
      rect(6, 21, 3, 3, '#c7994c');
      rect(32, 21, 3, 3, '#c7994c');
      rect(9, 24, 23, 1, '#e0af59');
      rect(7, 5, 1, 17, '#c4c4cc');
      rect(8, 0, 1, 6, '#c4c4cc');
      rect(10, 1, 1, 10, '#88829c');
      rect(11, 10, 1, 3, '#88829c');
    } else {
      rect(3, 21, 29, 1, '#a47a38');
      rect(1, 19, 9, 5, '#d8ad59');
      rect(0, 20, 6, 1, '#ffe19a');
      rect(0, 23, 7, 1, '#ffe19a');
      rect(2, 18, 3, 1, '#ffe19a');
    }
  }

  function draw() {
    measureGrid();
    const w = cols;
    const h = rows;
    const moonCx = w * 0.515;
    const moonCy = h * 0.33;
    const R = Math.min(w, h) * 0.28;
    const lines = [];

    for (let y = 0; y < h; y++) {
      let row = '';
      for (let x = 0; x < w; x++) {
        const n = noise(x, y);
        const dx = x - moonCx;
        const dy = y - moonCy;
        let c = ' ';
        if (!fisher) {
          const r = Math.hypot(dx, dy);
          const ridge =
            h * 0.54 -
            h * 0.14 * Math.abs(Math.sin(x * 0.067)) -
            h * 0.07 * Math.sin(x * 0.173);
          if (y > ridge) {
            const depth = (y - ridge) / (h - ridge);
            let terrain;
            let density;
            if (depth < 0.12) {
              terrain = 'X#@';
              density = 0.85;
            } else if (depth < 0.45) {
              terrain = 'xo/';
              density = 0.55 - 0.20 * (depth - 0.12) / 0.33;
            } else {
              terrain = '|' + String.fromCharCode(92) + '.:';
              density = 0.35 - 0.27 * (depth - 0.45) / 0.55;
            }
            c = n < density ? terrain.charAt((x * 3 + y * 7) % terrain.length) : ' ';
          } else if (n > 0.9985) {
            c = '.';
          }
          // Apply the moon last so its hollow center always wins over terrain.
          if (r < R * 0.42) {
            c = ' ';
          } else if (r < R * 0.88) {
            const t = (r / R - 0.42) / 0.46;
            const density = 0.55 + 0.35 * Math.sin(Math.PI * t);
            c = n < density ? 'wm~v'[(x + y * 2) % 4] : ' ';
          } else if (r < R * 1.05) {
            c = n < 0.32 ? (x % 2 ? '/' : String.fromCharCode(92)) : ' ';
          }
        } else {
          const edge = h * 0.26 + h * 0.11 * Math.sin(x * 0.048) + h * 0.08 * Math.sin(x * 0.127);
          const water = h * 0.76 + h * 0.07 * Math.sin(x * 0.039) + h * 0.04 * Math.sin(x * 0.103);
          if (y < 2) {
            c = n < 0.95 ? (y % 2 === 0 ? '=' : '-') : ' ';
          } else if (y < edge) {
            c = n < 0.78 ? (y % 2 === 0 ? '=' : '.') : ' ';
          } else if (y > water) {
            const wt = (y - water) / (h - water);
            const density = 0.06 + 0.22 * wt * wt;
            c = n < density ? ((x + y) % 10 === 0 ? '-' : '.') : ' ';
          } else if (n > 0.9985) {
            c = '.';
          }
        }
        row += c;
      }
      lines.push(row);
    }

    pre.textContent = lines.join('\n');
    scene.dataset.scene = fisher ? 'fisher' : 'wizard';
    button.textContent = fisher ? '01 / MOON FLIGHT' : '02 / STILL WATER';
    button.setAttribute('aria-label', fisher ? 'Switch to moon flight' : 'Switch to still water');
    scene.setAttribute(
      'aria-label',
      fisher
        ? 'Pixel fisher on dark water beneath scanline mountains'
        : 'Pixel wizard flying over ASCII mountains and a woven moon'
    );

    radio.replaceChildren();
    const note = document.createElement('span');
    note.className = 'note-icon';
    note.textContent = '\u266b';
    note.setAttribute('aria-hidden', 'true');
    const track = document.createElement('span');
    track.className = 'track-title';
    track.textContent = fisher
      ? 'Kolby Wade \u2014 Pianos on Grass'
      : 'Forest Park (Ft. Farnell Newton)';
    radio.append(note, track);
    radio.title = track.textContent;

    drawSprite(sprite.getContext('2d'));
  }

  function schedule() {
    clearInterval(timer);
    if (!motion.matches) {
      timer = setInterval(function () {
        if (!document.hidden) {
          fisher = !fisher;
          draw();
        }
      }, 30000);
    }
  }

  let resizeTick = 0;
  new ResizeObserver(function () {
    clearTimeout(resizeTick);
    resizeTick = setTimeout(draw, 50);
  }).observe(scene);

  button.addEventListener('click', function () {
    fisher = !fisher;
    draw();
    schedule();
  });
  motion.addEventListener('change', schedule);
  if (document.fonts) document.fonts.ready.then(draw);
  draw();
  schedule();
})();
