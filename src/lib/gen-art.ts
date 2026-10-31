// Arte generativo para carteles de películas — portado del prototipo HTML

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const PALETAS: Record<string, [string, string, string, string]> = {
  sombra: ['#1c140d', '#4a3220', '#08060a', 'rgba(236,168,84,.42)'],
  luna: ['#0a0f26', '#1f2756', '#efe6cf', 'rgba(170,190,255,.28)'],
  railes: ['#24180e', '#6a4321', '#120b06', 'rgba(255,196,110,.35)'],
  columnas: ['#170f05', '#4b3410', '#d9b46a', 'rgba(240,190,90,.26)'],
  hielo: ['#7f98ad', '#dfe8ee', '#f7fbff', 'rgba(255,236,200,.6)'],
  amanecer: ['#24122b', '#d0643a', '#ffd59a', 'rgba(255,170,90,.45)'],
  olas: ['#051c25', '#0e4a52', '#bfe7df', 'rgba(140,230,220,.25)'],
  mascara: ['#25050a', '#6e0f1a', '#f2ebe0', 'rgba(255,90,90,.22)'],
  alas: ['#0a0708', '#2e1510', '#050304', 'rgba(255,120,40,.5)'],
  rejilla: ['#0e1014', '#272c36', '#f1c46a', 'rgba(240,200,110,.2)'],
  lente: ['#121014', '#322c36', '#ece6dc', 'rgba(255,255,255,.13)'],
  espiral: ['#2b0f05', '#7a2b0c', '#ffcf66', 'rgba(255,190,80,.42)'],
  rayo: ['#0b0f22', '#262f63', '#ffe27a', 'rgba(255,230,120,.35)'],
  vampiro: ['#08070d', '#221d3c', '#e9e4f5', 'rgba(170,160,255,.22)'],
} as const;

function circle(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
}

let GRAIN: HTMLCanvasElement | null = null;
function grain(): HTMLCanvasElement {
  if (GRAIN) return GRAIN;
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d')!;
  const d = g.createImageData(160, 160);
  const r = mulberry32(4);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = r() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  GRAIN = c;
  return c;
}

type DrawFn = (
  g: CanvasRenderingContext2D,
  p: readonly string[],
  r: () => number
) => void;

const M: Record<string, DrawFn> = {
  sombra(g, p, r) {
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.beginPath();
    g.moveTo(560, 900);
    let x = 560,
      y = 900;
    for (let i = 0; i < 9; i++) {
      y -= 58;
      g.lineTo(x, y);
      x += 86;
      g.lineTo(x, y);
    }
    g.lineTo(x, 900);
    g.closePath();
    g.fill();
    g.save();
    g.translate(30, 0);
    g.fillStyle = p[2];
    g.globalAlpha = 0.94;
    g.shadowColor = p[3];
    g.shadowBlur = 60;
    g.beginPath();
    g.ellipse(1120, 300, 58, 82, 0.18, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(1068, 272);
    g.lineTo(1046, 232);
    g.lineTo(1086, 256);
    g.fill();
    g.beginPath();
    g.moveTo(1158, 252);
    g.lineTo(1178, 212);
    g.lineTo(1170, 262);
    g.fill();
    g.beginPath();
    g.moveTo(1066, 360);
    g.quadraticCurveTo(1020, 620, 990, 900);
    g.lineTo(1240, 900);
    g.quadraticCurveTo(1210, 610, 1176, 360);
    g.closePath();
    g.fill();
    g.lineCap = 'round';
    g.strokeStyle = p[2];
    g.lineWidth = 40;
    g.beginPath();
    g.moveTo(1084, 420);
    g.quadraticCurveTo(990, 410, 918, 350);
    g.stroke();
    g.lineWidth = 11;
    (
      [
        [826, 250],
        [808, 292],
        [800, 334],
        [812, 378],
      ] as [number, number][]
    ).forEach(([fx, fy]) => {
      g.beginPath();
      g.moveTo(912, 348);
      g.quadraticCurveTo((912 + fx) / 2, fy - 10, fx, fy);
      g.stroke();
    });
    g.restore();
    void r;
  },

  luna(g, p, r) {
    for (let i = 0; i < 120; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`;
      circle(g, r() * 1600, r() * 900, r() * 2.2);
      g.fill();
    }
    const gr = g.createRadialGradient(1020, 360, 40, 1080, 430, 310);
    gr.addColorStop(0, '#fffaf0');
    gr.addColorStop(1, p[2]);
    g.fillStyle = gr;
    circle(g, 1080, 430, 300);
    g.fill();
    g.fillStyle = 'rgba(120,100,80,.18)';
    for (let i = 0; i < 14; i++) {
      const a = r() * 6.28,
        d = r() * 240;
      circle(g, 1080 + Math.cos(a) * d, 430 + Math.sin(a) * d, 10 + r() * 30);
      g.fill();
    }
    g.fillStyle = p[0];
    g.beginPath();
    g.ellipse(990, 390, 44, 20, -0.1, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = p[0];
    g.lineCap = 'round';
    g.beginPath();
    g.arc(1080, 500, 90, 0.25, Math.PI - 0.25);
    g.stroke();
    g.save();
    g.translate(1190, 380);
    g.rotate(-0.62);
    g.fillStyle = '#b9b2a6';
    g.beginPath();
    g.moveTo(0, -36);
    g.lineTo(190, -30);
    g.quadraticCurveTo(270, 0, 190, 30);
    g.lineTo(0, 36);
    g.closePath();
    g.fill();
    g.fillStyle = '#8b8378';
    [60, 120].forEach((x) => g.fillRect(x, -34, 10, 68));
    g.restore();
  },

  railes(g, p, r) {
    const vx = 1120,
      vy = 400;
    g.strokeStyle = p[2];
    g.lineCap = 'round';
    for (const x0 of [640, 1600]) {
      g.lineWidth = 16;
      g.beginPath();
      g.moveTo(x0, 900);
      g.lineTo(vx, vy);
      g.stroke();
    }
    for (let k = 1; k <= 14; k++) {
      const t = Math.pow(k / 14, 2),
        y = vy + (900 - vy) * t,
        xl = vx + (640 - vx) * t,
        xr = vx + (1600 - vx) * t;
      g.lineWidth = 4 + 18 * t;
      g.beginPath();
      g.moveTo(xl - 30 * t, y);
      g.lineTo(xr + 30 * t, y);
      g.stroke();
    }
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(255,240,220,${0.06 + r() * 0.08})`;
      circle(g, vx + 60 + i * 46 + r() * 30, vy - 80 - i * 34 + r() * 20, 40 + i * 14);
      g.fill();
    }
  },

  columnas(g, p, r) {
    const gr = g.createLinearGradient(0, 150, 0, 850);
    gr.addColorStop(0, '#f6dc9a');
    gr.addColorStop(1, p[2]);
    g.fillStyle = gr;
    g.globalAlpha = 0.9;
    g.fillRect(560, 170, 1100, 58);
    g.fillRect(600, 236, 1060, 18);
    for (let i = 0; i < 7; i++) {
      const x = 640 + i * 142;
      g.fillRect(x - 14, 262, 98, 26);
      g.fillRect(x, 288, 70, 520);
      g.fillRect(x - 18, 808, 106, 22);
    }
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,.28)';
    for (let i = 0; i < 7; i++) {
      g.fillRect(660 + i * 142, 288, 14, 520);
    }
    void r;
  },

  hielo(g, p, r) {
    const gr = g.createRadialGradient(1160, 560, 10, 1160, 560, 260);
    gr.addColorStop(0, 'rgba(255,236,190,1)');
    gr.addColorStop(1, 'rgba(255,236,190,0)');
    g.fillStyle = gr;
    g.fillRect(800, 300, 720, 520);
    g.fillStyle = '#fff3d6';
    circle(g, 1160, 560, 46);
    g.fill();
    g.fillStyle = p[2];
    g.beginPath();
    g.moveTo(0, 640);
    let x = 0;
    while (x < 1600) {
      x += 60 + r() * 90;
      g.lineTo(x, 600 + r() * 70);
    }
    g.lineTo(1600, 900);
    g.lineTo(0, 900);
    g.closePath();
    g.fill();
    g.fillStyle = '#e6eef3';
    g.beginPath();
    g.arc(930, 700, 92, Math.PI, 0);
    g.fill();
    g.strokeStyle = 'rgba(90,120,140,.35)';
    g.lineWidth = 3;
    for (const yy of [640, 670]) {
      g.beginPath();
      g.moveTo(850, yy);
      g.lineTo(1010, yy);
      g.stroke();
    }
    g.fillStyle = '#2b3a46';
    g.beginPath();
    g.arc(930, 700, 24, Math.PI, 0);
    g.fill();
  },

  amanecer(g, p, r) {
    const H = 560;
    g.save();
    g.beginPath();
    g.rect(0, 0, 1600, H);
    g.clip();
    const gr = g.createRadialGradient(1100, H, 20, 1100, H, 240);
    gr.addColorStop(0, '#fff1c9');
    gr.addColorStop(1, p[2]);
    g.fillStyle = gr;
    circle(g, 1100, H, 230);
    g.fill();
    g.restore();
    g.fillStyle = 'rgba(10,6,20,.55)';
    g.fillRect(0, H, 1600, 340);
    for (let i = 0; i < 16; i++) {
      const y = H + 12 + i * 20,
        w = (420 - i * 22) * (0.7 + r() * 0.5);
      g.fillStyle = `rgba(255,215,150,${0.55 - i * 0.03})`;
      g.fillRect(1100 - w / 2, y, w, 5 + (i % 3));
    }
    g.fillStyle = '#120814';
    g.beginPath();
    g.moveTo(860, 640);
    g.lineTo(1010, 640);
    g.lineTo(985, 662);
    g.lineTo(880, 662);
    g.closePath();
    g.fill();
    g.fillRect(930, 560, 6, 82);
  },

  olas(g, p, r) {
    const gr = g.createRadialGradient(1250, 240, 10, 1250, 240, 140);
    gr.addColorStop(0, '#f2fff9');
    gr.addColorStop(1, 'rgba(242,255,249,0)');
    g.fillStyle = gr;
    circle(g, 1250, 240, 140);
    g.fill();
    g.fillStyle = '#eafff7';
    circle(g, 1250, 240, 70);
    g.fill();
    for (let j = 0; j < 9; j++) {
      g.strokeStyle = `rgba(191,231,223,${0.75 - j * 0.07})`;
      g.lineWidth = 4;
      g.beginPath();
      for (let x = 500; x <= 1600; x += 10) {
        const y = 470 + j * 52 + Math.sin(x / 70 + j) * 12;
        x === 500 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
    g.strokeStyle = '#04141a';
    g.lineWidth = 22;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(760, 900);
    g.quadraticCurveTo(820, 620, 900, 370);
    g.stroke();
    g.lineWidth = 10;
    (
      [
        [-1, 0.2],
        [-1, -0.3],
        [1, 0.1],
        [1, -0.4],
        [0, -1],
      ] as [number, number][]
    ).forEach(([dx, dy]) => {
      g.beginPath();
      g.moveTo(900, 370);
      g.quadraticCurveTo(
        900 + dx * 120,
        370 + dy * 120 - 40,
        900 + dx * 230,
        430 + dy * 80
      );
      g.stroke();
    });
    void r;
  },

  mascara(g, p, r) {
    for (let x = 0; x < 1600; x += 70) {
      const gr = g.createLinearGradient(x, 0, x + 70, 0);
      gr.addColorStop(0, 'rgba(0,0,0,.35)');
      gr.addColorStop(0.5, 'rgba(255,60,70,.08)');
      gr.addColorStop(1, 'rgba(0,0,0,.35)');
      g.fillStyle = gr;
      g.fillRect(x, 0, 70, 900);
    }
    g.save();
    g.shadowColor = 'rgba(0,0,0,.6)';
    g.shadowBlur = 60;
    const gr = g.createLinearGradient(980, 200, 1240, 680);
    gr.addColorStop(0, '#fffaf2');
    gr.addColorStop(1, '#cfc4b4');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(1100, 170);
    g.bezierCurveTo(1260, 170, 1300, 330, 1290, 450);
    g.bezierCurveTo(1280, 560, 1220, 650, 1100, 690);
    g.lineTo(1100, 170);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = '#14060a';
    g.beginPath();
    g.ellipse(1185, 400, 48, 22, 0.12, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(1100, 170);
    g.lineTo(1100, 690);
    g.stroke();
    void r;
  },

  alas(g, p, r) {
    const gr = g.createRadialGradient(1100, 860, 20, 1100, 860, 420);
    gr.addColorStop(0, 'rgba(255,150,60,.75)');
    gr.addColorStop(1, 'rgba(255,90,30,0)');
    g.fillStyle = gr;
    g.fillRect(600, 400, 1000, 500);
    g.strokeStyle = p[2];
    g.lineCap = 'round';
    for (const s of [-1, 1]) {
      for (let i = 0; i < 22; i++) {
        const t = i / 21;
        g.lineWidth = 26 - 14 * t;
        g.beginPath();
        g.moveTo(1100, 250);
        g.quadraticCurveTo(
          1100 + s * (160 + 260 * t),
          120 + 60 * t,
          1100 + s * (260 + 420 * t),
          300 + 560 * t * t
        );
        g.stroke();
      }
    }
    g.fillStyle = p[2];
    g.beginPath();
    g.ellipse(1100, 250, 40, 60, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,180,90,.9)';
    circle(g, 1086, 240, 5);
    g.fill();
    circle(g, 1114, 240, 5);
    g.fill();
    void r;
  },

  rejilla(g, p, r) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 10; col++) {
        const lit = r() > 0.55;
        g.fillStyle = lit
          ? `rgba(241,196,106,${0.55 + r() * 0.4})`
          : 'rgba(255,255,255,.05)';
        g.fillRect(620 + col * 96, 90 + row * 70, 58, 40);
      }
    }
    g.fillStyle = 'rgba(0,0,0,.55)';
    g.fillRect(940, 560, 320, 340);
    g.strokeStyle = p[2];
    g.lineWidth = 8;
    g.strokeRect(940, 560, 320, 340);
    for (const [x1, x2] of [
      [960, 1060],
      [1100, 1240],
      [1070, 1130],
    ] as [number, number][]) {
      g.fillStyle = 'rgba(241,196,106,.22)';
      g.beginPath();
      g.moveTo(x1, 580);
      g.lineTo(x2, 580);
      g.lineTo(x2, 880);
      g.lineTo(x1, 880);
      g.closePath();
      g.fill();
      g.lineWidth = 4;
      g.stroke();
    }
    g.fillStyle = p[2];
    g.fillRect(1094, 560, 12, 340);
  },

  lente(g, p, r) {
    g.save();
    g.translate(1100, 450);
    for (const [rad, a] of [
      [330, 0.2],
      [270, 0.35],
      [210, 0.5],
    ] as [number, number][]) {
      g.strokeStyle = `rgba(236,230,220,${a})`;
      g.lineWidth = rad === 330 ? 18 : 6;
      circle(g, 0, 0, rad);
      g.stroke();
    }
    for (let i = 0; i < 8; i++) {
      g.rotate(Math.PI / 4);
      g.fillStyle = 'rgba(20,18,22,.7)';
      g.beginPath();
      g.moveTo(80, -40);
      g.lineTo(200, -10);
      g.lineTo(150, 90);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(236,230,220,.25)';
      g.lineWidth = 2;
      g.stroke();
    }
    g.fillStyle = p[2];
    g.beginPath();
    g.moveTo(-110, 0);
    g.quadraticCurveTo(0, -80, 110, 0);
    g.quadraticCurveTo(0, 80, -110, 0);
    g.fill();
    g.fillStyle = '#16131a';
    circle(g, 0, 0, 40);
    g.fill();
    g.fillStyle = p[2];
    circle(g, -12, -12, 10);
    g.fill();
    g.restore();
    void r;
  },

  espiral(g, p, r) {
    g.save();
    g.translate(1120, 420);
    g.strokeStyle = p[2];
    g.lineCap = 'round';
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(Math.cos(a) * 200, Math.sin(a) * 200);
      g.quadraticCurveTo(
        Math.cos(a + 0.35) * 300,
        Math.sin(a + 0.35) * 300,
        Math.cos(a + 0.6) * 390,
        Math.sin(a + 0.6) * 390
      );
      g.stroke();
    }
    const gr = g.createRadialGradient(-40, -40, 10, 0, 0, 180);
    gr.addColorStop(0, '#fff3c2');
    gr.addColorStop(1, p[2]);
    g.fillStyle = gr;
    circle(g, 0, 0, 175);
    g.fill();
    g.fillStyle = p[0];
    g.beginPath();
    g.ellipse(-60, -30, 24, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.ellipse(60, -30, 24, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = p[0];
    g.beginPath();
    g.arc(0, 30, 70, 0.3, Math.PI - 0.3);
    g.stroke();
    g.restore();
    void r;
  },

  rayo(g, p, r) {
    const gr = g.createRadialGradient(1120, 320, 10, 1120, 320, 320);
    gr.addColorStop(0, 'rgba(255,240,170,.85)');
    gr.addColorStop(1, 'rgba(255,240,170,0)');
    g.fillStyle = gr;
    g.fillRect(780, 0, 700, 700);
    g.fillStyle = p[2];
    circle(g, 1120, 320, 112);
    g.fill();
    g.fillStyle = '#8f8a7a';
    g.fillRect(1072, 420, 96, 70);
    g.fillStyle = '#6d6858';
    for (let i = 0; i < 3; i++) g.fillRect(1072, 432 + i * 20, 96, 7);
    g.strokeStyle = p[2];
    g.lineWidth = 9;
    g.lineJoin = 'round';
    for (const [a, len] of [
      [2.6, 330],
      [0.4, 300],
      [1.5, 360],
      [-0.6, 280],
    ] as [number, number][]) {
      g.beginPath();
      let x = 1120 + Math.cos(a) * 140,
        y = 320 + Math.sin(a) * 140;
      g.moveTo(x, y);
      for (let k = 1; k <= 5; k++) {
        const d = 140 + (len * k) / 5,
          o = (k % 2 ? 1 : -1) * 28;
        x = 1120 + Math.cos(a) * d + Math.cos(a + 1.57) * o;
        y = 320 + Math.sin(a) * d + Math.sin(a + 1.57) * o;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    void r;
  },

  vampiro(g, p, r) {
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(233,228,245,${0.2 + r() * 0.5})`;
      circle(g, r() * 1600, r() * 520, r() * 2);
      g.fill();
    }
    g.fillStyle = p[2];
    circle(g, 1180, 260, 120);
    g.fill();
    g.fillStyle = p[1];
    circle(g, 1230, 230, 112);
    g.fill();
    g.fillStyle = '#040308';
    g.beginPath();
    g.moveTo(400, 900);
    let x = 400,
      y = 640;
    g.lineTo(x, y);
    while (x < 1600) {
      const w = 60 + r() * 120,
        h = 560 + r() * 140;
      x += w * 0.15;
      g.lineTo(x, h);
      if (r() > 0.6) {
        g.lineTo(x + 10, h - 60);
        g.lineTo(x + 26, h - 60);
        g.lineTo(x + 26, h);
      }
      x += w;
      g.lineTo(x, h);
      g.lineTo(x + 20, h + 20);
    }
    g.lineTo(1600, 900);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(1000, 560);
    g.quadraticCurveTo(1010, 470, 1030, 450);
    g.quadraticCurveTo(1050, 470, 1060, 560);
    g.closePath();
    g.fill();
    circle(g, 1030, 440, 18);
    g.fill();
    void y;
  },
};

export function pintarCartel(
  canvas: HTMLCanvasElement,
  film: { motif: string; paleta: string[]; id: string }
): void {
  const W = 1600,
    H = 900;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  if (!g) return;

  const p = film.paleta.length >= 4 ? film.paleta : PALETAS[film.motif] ?? PALETAS['sombra'];
  const rng = mulberry32(hashStr(film.id));

  // Fondo
  const bg = g.createLinearGradient(0, 0, 1600, 900);
  bg.addColorStop(0, p[0]);
  bg.addColorStop(1, p[1]);
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Dibujar motif
  const drawFn = M[film.motif] ?? M['sombra'];
  drawFn(g, p, rng);

  // Viñeta
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,.72)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);

  // Grano
  g.save();
  g.globalAlpha = 0.045;
  g.globalCompositeOperation = 'screen';
  const grainCanvas = grain();
  const pat = g.createPattern(grainCanvas, 'repeat');
  if (pat) {
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
  }
  g.restore();
}
