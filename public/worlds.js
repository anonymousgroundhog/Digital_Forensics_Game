// Canvas world engine — animated themed background per case.
// One <canvas> full-screen behind the UI; scenes swap when a case opens.

const Worlds = (() => {
  let canvas, ctx, raf = null, scene = null, W = 0, H = 0, t = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function init(el) {
    canvas = el;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize() {
    if (!canvas) return;
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (scene && scene.resize) scene.resize();
  }

  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
  function loop() {
    t += 0.016;
    if (scene) scene.draw(t);
    raf = requestAnimationFrame(loop);
  }
  function play(name) {
    stop();
    scene = SCENES[name] ? SCENES[name]() : SCENES.menu();
    if (scene.resize) scene.resize();
    loop();
  }
  function rand(a, b) { return a + Math.random() * (b - a); }

  // ======================================================================
  const SCENES = {
    // ---- MENU: soft drifting grid of nodes + connecting lines ----
    menu() {
      let nodes = [];
      function reset() {
        nodes = Array.from({ length: 40 }, () => ({
          x: rand(0, W), y: rand(0, H), vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
        }));
      }
      reset();
      return {
        resize: reset,
        draw() {
          ctx.fillStyle = '#0a0e14'; ctx.fillRect(0, 0, W, H);
          for (const n of nodes) {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
          }
          ctx.strokeStyle = 'rgba(53,201,232,0.10)'; ctx.lineWidth = 1;
          for (let i = 0; i < nodes.length; i++)
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
              const d = Math.hypot(dx, dy);
              if (d < 140) {
                ctx.globalAlpha = 1 - d / 140;
                ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
              }
            }
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'rgba(61,220,132,0.6)';
          for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, 7); ctx.fill(); }
        },
      };
    },

    // ---- PHISHING: matrix data-rain (green), hidden chars ----
    phishing() {
      const glyphs = '01<>{}#$@%&*/\\|=+ABCDEF0123456789'.split('');
      let cols, drops;
      function reset() {
        cols = Math.floor(W / 14);
        drops = Array.from({ length: cols }, () => rand(-40, 0));
      }
      reset();
      return {
        resize: reset,
        draw() {
          ctx.fillStyle = 'rgba(6,14,10,0.18)'; ctx.fillRect(0, 0, W, H);
          ctx.font = '13px monospace';
          for (let i = 0; i < cols; i++) {
            const x = i * 14;
            const y = drops[i] * 16;
            ctx.fillStyle = 'rgba(180,255,210,0.9)';
            ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], x, y);
            ctx.fillStyle = 'rgba(61,220,132,0.35)';
            ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], x, y - 16);
            drops[i] += 1;
            if (y > H && Math.random() > 0.975) drops[i] = rand(-20, 0);
          }
        },
      };
    },

    // ---- SERVER: dark server room, blinking LED racks + slow scan ----
    server() {
      let racks;
      function reset() {
        const n = Math.max(4, Math.floor(W / 90));
        racks = Array.from({ length: n }, (_, i) => ({
          x: 20 + i * ((W - 40) / n),
          leds: Array.from({ length: 14 }, () => ({ on: Math.random() > .5, ph: rand(0, 6) })),
        }));
      }
      reset();
      return {
        resize: reset,
        draw(time) {
          ctx.fillStyle = '#070b11'; ctx.fillRect(0, 0, W, H);
          const rw = ((W - 40) / racks.length) - 12;
          for (const r of racks) {
            ctx.fillStyle = '#0d141d'; ctx.strokeStyle = '#1a2634'; ctx.lineWidth = 1;
            ctx.fillRect(r.x, 30, rw, H - 60); ctx.strokeRect(r.x, 30, rw, H - 60);
            r.leds.forEach((l, k) => {
              const y = 50 + k * ((H - 100) / r.leds.length);
              const blink = Math.sin(time * 3 + l.ph) > 0.3;
              ctx.fillStyle = blink ? 'rgba(61,220,132,0.9)' : 'rgba(53,201,232,0.25)';
              ctx.fillRect(r.x + 8, y, 6, 4);
              ctx.fillStyle = 'rgba(255,176,32,' + (Math.sin(time * 2 + k) > .8 ? .8 : .12) + ')';
              ctx.fillRect(r.x + rw - 14, y, 6, 4);
            });
          }
          // slow scan line
          const sy = (Math.sin(time * 0.4) * 0.5 + 0.5) * H;
          ctx.fillStyle = 'rgba(53,201,232,0.06)'; ctx.fillRect(0, sy - 20, W, 40);
        },
      };
    },

    // ---- DDoS: red packet swarm flooding a central server node ----
    ddos() {
      let packets;
      const cx = () => W / 2, cy = () => H / 2;
      function spawn() {
        const edge = (Math.random() * 4) | 0;
        let x, y;
        if (edge === 0) { x = rand(0, W); y = -10; }
        else if (edge === 1) { x = W + 10; y = rand(0, H); }
        else if (edge === 2) { x = rand(0, W); y = H + 10; }
        else { x = -10; y = rand(0, H); }
        return { x, y, sp: rand(2, 5), life: 1 };
      }
      function reset() { packets = Array.from({ length: 70 }, spawn); }
      reset();
      return {
        resize: reset,
        draw(time) {
          ctx.fillStyle = 'rgba(14,6,8,0.25)'; ctx.fillRect(0, 0, W, H);
          const CX = cx(), CY = cy();
          // pulsing overwhelmed server
          const pulse = 1 + Math.sin(time * 6) * 0.12;
          ctx.fillStyle = 'rgba(255,84,112,0.15)';
          ctx.beginPath(); ctx.arc(CX, CY, 60 * pulse, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(255,84,112,0.85)';
          ctx.fillRect(CX - 22, CY - 22, 44, 44);
          ctx.fillStyle = '#0e0608';
          ctx.font = '10px monospace'; ctx.textAlign = 'center';
          ctx.fillText('SRV', CX, CY + 3);
          ctx.textAlign = 'start';
          for (const p of packets) {
            const dx = CX - p.x, dy = CY - p.y, d = Math.hypot(dx, dy);
            p.x += (dx / d) * p.sp; p.y += (dy / d) * p.sp;
            ctx.strokeStyle = 'rgba(255,84,112,0.5)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - dx / d * 8, p.y - dy / d * 8); ctx.stroke();
            ctx.fillStyle = 'rgba(255,180,32,0.9)';
            ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
            if (d < 30) Object.assign(p, spawn());
          }
        },
      };
    },

    // ---- RAID: spinning platters + XOR parity grid ----
    raid() {
      let bits;
      function reset() {
        bits = Array.from({ length: 60 }, () => ({
          x: rand(0, W), y: rand(0, H), v: rand(0.3, 1.2), c: Math.random() > .5 ? 1 : 0,
        }));
      }
      reset();
      return {
        resize: reset,
        draw(time) {
          ctx.fillStyle = '#0a0d14'; ctx.fillRect(0, 0, W, H);
          // three spinning platters
          const cy = H / 2;
          const spread = Math.min(W / 4, 220);
          [-spread, 0, spread].forEach((off, i) => {
            const cx = W / 2 + off;
            const r = Math.min(H, W) * 0.16;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * (1.2 + i * 0.3));
            for (let ring = r; ring > 8; ring -= 10) {
              ctx.strokeStyle = 'rgba(53,201,232,' + (0.05 + 0.05 * (ring / r)) + ')';
              ctx.beginPath(); ctx.arc(0, 0, ring, 0, 7); ctx.stroke();
            }
            // read-head sector highlight
            ctx.fillStyle = 'rgba(61,220,132,0.25)';
            ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, 0, 0.5); ctx.closePath(); ctx.fill();
            ctx.restore();
            ctx.fillStyle = 'rgba(255,176,32,0.8)';
            ctx.font = '10px monospace'; ctx.textAlign = 'center';
            ctx.fillText(i === 2 ? 'PARITY' : 'DISK ' + i, cx, cy + r + 18);
            ctx.textAlign = 'start';
          });
          // XOR bitstream drifting up
          ctx.font = '12px monospace';
          for (const b of bits) {
            b.y -= b.v; if (b.y < 0) { b.y = H; b.x = rand(0, W); b.c = Math.random() > .5 ? 1 : 0; }
            ctx.fillStyle = b.c ? 'rgba(61,220,132,0.5)' : 'rgba(53,201,232,0.35)';
            ctx.fillText(b.c ? '1' : '0', b.x, b.y);
          }
        },
      };
    },
  };

  return { init, play, stop };
})();

window.GameWorlds = Worlds;
