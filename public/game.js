// Digital Forensics Detective — game engine.
// State machine: menu -> brief -> stages (decision loop) -> results.
// Now wired to GameAudio (Web Audio synth) + GameWorlds (canvas scenes).

const app = document.getElementById('app');
const body = document.body;
const hud = {
  caseEl: document.getElementById('hud-case'),
  integrity: document.getElementById('hud-integrity'),
  score: document.getElementById('hud-score'),
};

// ---- canvas world + flash overlay ----
GameWorlds.init(document.getElementById('world'));
const flash = document.createElement('div');
flash.id = 'flash';
document.body.appendChild(flash);
function doFlash(kind) {
  flash.className = '';
  void flash.offsetWidth; // restart animation
  flash.className = kind;
}

// ---- mute toggle ----
const muteBtn = document.getElementById('mute');
if (localStorage.getItem('df_muted') === '1') { GameAudio.setMuted(true); muteBtn.textContent = '🔇'; muteBtn.classList.add('off'); }
muteBtn.onclick = () => {
  const now = !GameAudio.isMuted();
  GameAudio.setMuted(now);
  localStorage.setItem('df_muted', now ? '1' : '0');
  muteBtn.textContent = now ? '🔇' : '🔊';
  muteBtn.classList.toggle('off', now);
  if (!now) GameAudio.resume();
};

// ---- leaderboard (Google Sheet via /api) ----
// Stable per-browser player id, so a rename can rewrite this player's past rows
// (name alone is ambiguous — two players may pick the same name).
function lbPlayerId() {
  let id = localStorage.getItem('df_playerId');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID()
      : 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
    localStorage.setItem('df_playerId', id);
  }
  return id;
}

const leaderboard = {
  overlay: document.getElementById('lb-overlay'),
  body: document.getElementById('lb-body'),
  toggleBtn: document.getElementById('lb-toggle'),
  enabled: localStorage.getItem('df_lb_on') === '1',
  name: localStorage.getItem('df_username') || '',
  playerId: lbPlayerId(),
};

function lbRefreshToggle() {
  const on = leaderboard.enabled;
  leaderboard.toggleBtn.classList.toggle('off', !on);
  leaderboard.toggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  leaderboard.toggleBtn.title = on
    ? 'Leaderboard ON — click to view / disable'
    : 'Leaderboard OFF — click to enable online scores';
}

// Ask for a name (once), persist it. Returns the name or '' if cancelled.
function lbEnsureName() {
  if (leaderboard.name) return leaderboard.name;
  return lbPromptName('Enter a name for the leaderboard:', '');
}

// Prompt for / change the stored name. Prefills current value. Returns the new
// name, or the existing one if cancelled/blank. Persisted per browser.
function lbPromptName(msg, prefill) {
  const entered = (window.prompt(msg, prefill != null ? prefill : (leaderboard.name || '')) || '')
    .trim().slice(0, 40);
  if (!entered) return leaderboard.name || '';
  leaderboard.name = entered;
  localStorage.setItem('df_username', entered);
  return entered;
}

// Change the username from the leaderboard header. Updates locally, rewrites
// this player's existing rows on the sheet, then reloads the board so the new
// name shows on past scores too.
function lbChangeName() {
  GameAudio.sfx.click();
  const before = leaderboard.name;
  const after = lbPromptName('Change your leaderboard name:', leaderboard.name || '');
  if (!after || after === before) return;

  lbRenderIdentity();
  // Update the "Submit as <name>" label on the results screen in place, if shown.
  const asName = document.querySelector('#lb-submit-box .lb-as b');
  if (asName) asName.textContent = after;

  // Push the rename to the sheet (rewrites past rows), then refresh the board.
  const results = document.getElementById('lb-results');
  if (results) results.innerHTML = `<p class="sub" style="padding:8px 0">Updating your name on past scores…</p>`;
  lbRename(after).then(ok => {
    if (ok) GameAudio.sfx.correct(); else GameAudio.sfx.wrong();
    // Reload the board regardless — on failure the old name simply remains.
    if (!leaderboard.overlay.hidden) reloadLeaderboardBoard();
  });
}

// Render the "You: <name> ✎ Change" bar at the top of the leaderboard overlay.
function lbRenderIdentity() {
  const bar = document.getElementById('lb-identity');
  if (!bar) return;
  const who = leaderboard.name ? escapeHtml(leaderboard.name) : '<i>not set</i>';
  bar.innerHTML = `
    <span class="lb-you">🕵️ You: <b>${who}</b></span>
    <button class="btn ghost small" id="lb-rename">✎ ${leaderboard.name ? 'Change name' : 'Set name'}</button>`;
  const btn = document.getElementById('lb-rename');
  if (btn) btn.onclick = lbChangeName;
}

// POST a score to the sheet. Returns a Promise<bool ok>.
function lbSubmit(payload) {
  return fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ playerId: leaderboard.playerId }, payload)),
  }).then(r => r.json()).then(j => !!(j && j.ok)).catch(() => false);
}

// Rewrite this player's past rows to a new name. Returns Promise<bool ok>.
function lbRename(name) {
  return fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', playerId: leaderboard.playerId, name }),
  }).then(r => r.json()).then(j => !!(j && j.ok)).catch(() => false);
}

// GET top scores. Returns Promise<array | null>.
function lbFetch(limit) {
  return fetch(`/api/leaderboard?limit=${limit || 20}`)
    .then(r => r.json())
    .then(j => (j && j.ok ? j.scores : null))
    .catch(() => null);
}

function openLeaderboard() {
  GameAudio.sfx.click();
  leaderboard.overlay.hidden = false;
  // Identity bar (rename control) stays put; only the results area below reloads.
  leaderboard.body.innerHTML = `
    <div id="lb-identity" class="lb-identity"></div>
    <div id="lb-results"><p class="sub" style="padding:8px 0">Loading scores…</p></div>`;
  lbRenderIdentity();
  reloadLeaderboardBoard();
}

// (Re)fetch scores and render the table into #lb-results. Used on open and
// after a rename. Rows owned by this browser (matched on playerId) are tagged.
function reloadLeaderboardBoard() {
  const results = document.getElementById('lb-results');
  if (!results) return;
  results.innerHTML = `<p class="sub" style="padding:8px 0">Loading scores…</p>`;
  lbFetch(25).then(scores => {
    if (scores === null) {
      results.innerHTML =
        `<p class="sub" style="padding:8px 0">Leaderboard unavailable. The server needs <code>APPS_SCRIPT_URL</code> configured (see <code>apps-script/Code.gs</code>).</p>`;
      return;
    }
    if (!scores.length) {
      results.innerHTML = `<p class="sub" style="padding:8px 0">No scores yet. Close a case and submit to be first.</p>`;
      return;
    }
    const myId = leaderboard.playerId;
    const rows = scores.map((s, i) => {
      // Prefer playerId match; fall back to name for legacy rows without an id.
      const isMe = (s.playerId && String(s.playerId) === myId) ||
        (!s.playerId && leaderboard.name && String(s.name) === leaderboard.name);
      return `
      <tr class="${isMe ? 'lb-me' : ''}">
        <td class="lb-rank">${i + 1}</td>
        <td class="lb-name">${escapeHtml(String(s.name || 'Anonymous'))}${isMe ? ' <span class="lb-youtag">you</span>' : ''}</td>
        <td class="lb-case">${escapeHtml(String(s.case || ''))}</td>
        <td class="lb-grade grade-${String(s.grade || '').toUpperCase()}">${escapeHtml(String(s.grade || ''))}</td>
        <td class="lb-score">${s.score}<span class="lb-max">/${s.max}</span></td>
      </tr>`;
    }).join('');
    results.innerHTML = `
      <table class="lb-table">
        <thead><tr><th>#</th><th>Name</th><th>Case</th><th>Grade</th><th>Score</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  });
}
function closeLeaderboard() { GameAudio.sfx.click(); leaderboard.overlay.hidden = true; }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Toggle: off->on prompts for a name (and requires one); click when on opens the
// board. Long-press / shift-click when on disables it.
leaderboard.toggleBtn.onclick = e => {
  GameAudio.sfx.click();
  if (!leaderboard.enabled) {
    const name = lbEnsureName();
    if (!name) return; // cancelled — stay off
    leaderboard.enabled = true;
    localStorage.setItem('df_lb_on', '1');
    lbRefreshToggle();
    openLeaderboard();
  } else if (e.shiftKey) {
    leaderboard.enabled = false;
    localStorage.setItem('df_lb_on', '0');
    lbRefreshToggle();
  } else {
    openLeaderboard();
  }
};
leaderboard.overlay.querySelectorAll('[data-lb-close]').forEach(e => e.onclick = closeLeaderboard);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !leaderboard.overlay.hidden) closeLeaderboard();
});
lbRefreshToggle();

// Per-run state.
const state = {
  caseIndex: 0,
  stageIndex: 0,
  score: 0,
  integrity: 100,
  answered: false,
  solved: JSON.parse(localStorage.getItem('df_solved') || '{}'),
};

const MAX_PER_STAGE = 20;

// ---------- helpers ----------
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
// Total banked score across all solved cases (best score each).
function totalScore() {
  return Object.values(state.solved).reduce((sum, s) => sum + (s.score || 0), 0);
}
// Max points possible across every case (all stages at full marks).
function maxScore() {
  return CASES.reduce((sum, c) => sum + c.stages.length * MAX_PER_STAGE, 0);
}
// On the menu the HUD shows the running total across solved cases; inside a
// case it shows the current run's live score.
function setHud(onMenu) {
  hud.score.textContent = onMenu ? `${totalScore()} / ${maxScore()}` : state.score;
  if (onMenu) {
    // Integrity is per-case; on the menu it's not applicable — show a dash.
    hud.integrity.textContent = '—';
    hud.integrity.style.color = 'var(--txt-dim)';
  } else {
    hud.integrity.textContent = state.integrity + '%';
    hud.integrity.style.color =
      state.integrity >= 80 ? 'var(--green)' : state.integrity >= 50 ? 'var(--amber)' : 'var(--red)';
  }
}
function letter(i) { return String.fromCharCode(65 + i); }
function enterWorld() { app.classList.remove('world-enter'); void app.offsetWidth; app.classList.add('world-enter'); }

// Shatter a correct answer like breaking glass: freeze the button's look into a
// grid of shards that fly apart, crack-flash it, then collapse it.
function shatterElement(elm) {
  const rect = elm.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'shatter-layer';
  layer.style.left = rect.left + 'px';
  layer.style.top = rect.top + 'px';
  layer.style.width = rect.width + 'px';
  layer.style.height = rect.height + 'px';

  const COLS = Math.max(6, Math.round(rect.width / 40));
  const ROWS = 3;
  const sw = rect.width / COLS;
  const sh = rect.height / ROWS;
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#3ddc84';

  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const shard = document.createElement('div');
      shard.className = 'shard';
      shard.style.left = col * sw + 'px';
      shard.style.top = r * sh + 'px';
      shard.style.width = sw + 'px';
      shard.style.height = sh + 'px';
      // jagged glass triangles via clip-path (alternating direction)
      shard.style.clipPath = (col + r) % 2
        ? 'polygon(0 0, 100% 0, 100% 100%, 40% 100%)'
        : 'polygon(0 0, 100% 0, 60% 100%, 0 100%)';
      shard.style.background =
        `linear-gradient(135deg, ${accent}cc, ${accent}22)`;
      // random fling vector
      const dx = (col / COLS - 0.5) * 2 * (80 + Math.random() * 120);
      const dy = (Math.random() * 140 + 40) * (Math.random() < 0.35 ? -1 : 1);
      const rot = (Math.random() - 0.5) * 720;
      shard.style.setProperty('--dx', dx.toFixed(0) + 'px');
      shard.style.setProperty('--dy', dy.toFixed(0) + 'px');
      shard.style.setProperty('--rot', rot.toFixed(0) + 'deg');
      shard.style.animationDelay = (Math.random() * 60).toFixed(0) + 'ms';
      layer.appendChild(shard);
    }
  }
  document.body.appendChild(layer);
  elm.classList.add('shattered'); // hide the original as it "breaks"
  setTimeout(() => layer.remove(), 1100);
}
// Quiet the animated background while the player is reading text-heavy screens.
function setReading(on) { body.classList.toggle('reading', on); }

function setTheme(c) {
  if (c) {
    body.dataset.world = c.world;
    body.style.setProperty('--accent', c.accent);
    GameWorlds.play(c.world);
    GameAudio.playAmbient(c.world);
  } else {
    delete body.dataset.world;
    body.style.setProperty('--accent', '#3ddc84');
    GameWorlds.play('menu');
    GameAudio.playAmbient('menu');
  }
}

// wire hover sfx on buttons/cards after each render
function wireHover(root) {
  root.querySelectorAll('.card, .choice, .btn, .mute').forEach(e =>
    e.addEventListener('mouseenter', () => GameAudio.sfx.hover()));
}

// ---------- MENU ----------
function renderMenu() {
  hud.caseEl.textContent = '—';
  state.score = 0; state.integrity = 100;
  setHud(true); // show banked total across solved cases
  setTheme(null);
  setReading(false);
  enterWorld();
  notes.activeChapter = null; // menu = full chapter library

  const cards = CASES.map((c, i) => {
    const s = state.solved[c.id];
    return `
      <div class="card" data-i="${i}" style="--card-accent:${c.accent}">
        <span class="cicon">${c.icon || '🗂️'}</span>
        <div class="crime">${c.crime}</div>
        <h3>${c.title}</h3>
        <span class="tag">${c.chapters}</span>
        ${c.tier ? `<span class="tag tier tier-${c.tier.toLowerCase()}">${c.tier}</span>` : ''}
        <span class="tag diff">${c.difficulty}</span>
        <span class="tag" style="color:${c.accent};border-color:${c.accent}66">◈ ${c.scene}</span>
        ${s ? `<div class="done">✔ SOLVED — Grade ${s.grade} · ${s.score} pts</div>` : ''}
      </div>`;
  }).join('');

  const solvedCount = Object.keys(state.solved).length;
  const banked = totalScore();
  const progress = `${solvedCount}/${CASES.length} cases solved · ${banked} / ${maxScore()} pts banked`;
  const avail = GameCharacter.available(banked);

  app.innerHTML = `
    <div class="menu-hero">
      <div class="menu-avatar" id="menu-avatar">${GameCharacter.renderAvatar(84)}</div>
      <div class="menu-hero-txt">
        <h1>Digital Forensics Detective</h1>
        <p class="menu-name">🕵️ <b id="menu-title">${GameCharacter.title()}</b> · <span id="menu-avail">${avail}</span> pts to spend
          <button class="btn ghost small" id="shop-open">🛍️ Detective Shop</button></p>
      </div>
    </div>
    <p class="sub">You are the forensic investigator. Each case drills one chapter — work it correctly, because one wrong move can make evidence inadmissible in court. Earn points, then spend them in the shop to customize your detective.</p>
    <div class="cards">${cards}</div>
    <div class="menu-foot">
      <span class="progress-line">◈ ${progress}</span>
      ${solvedCount ? `<button class="btn ghost small" id="reset-btn">↺ Reset progress</button>` : ''}
    </div>
  `;
  app.querySelectorAll('.card').forEach(card =>
    card.onclick = () => { GameAudio.sfx.click(); startCase(+card.dataset.i); });
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.onclick = confirmReset;
  document.getElementById('shop-open').onclick = openShop;
  document.getElementById('menu-avatar').onclick = openShop;
  wireHover(app);
}

// Re-render menu chrome (avatar/title/available) if we're on the menu, e.g.
// after a shop purchase. Cheap: just re-run renderMenu when the menu is shown.
function refreshMenuChrome() {
  if (notes.activeChapter === null && document.getElementById('menu-avatar')) renderMenu();
}

// ---------- reset progress ----------
function confirmReset() {
  GameAudio.sfx.click();
  const ok = window.confirm(
    'Reset all progress?\n\nThis permanently clears every solved case, grade, banked score, and all detective customizations. This cannot be undone.');
  if (!ok) return;
  state.solved = {};
  localStorage.removeItem('df_solved');
  GameCharacter.reset();
  updateAvatar();
  renderMenu();
}

// Fisher-Yates shuffle (in place).
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// Randomize the choice order for every stage of a case. Choices carry their
// own `correct`/`points`/`explain`, so reordering is safe — the A/B/C/D labels
// and correct-answer highlighting are all index-driven off the shuffled array.
function shuffleCaseChoices(c) {
  c.stages.forEach(stage => shuffle(stage.choices));
}

// ---------- CASE START / BRIEF ----------
function startCase(i) {
  state.caseIndex = i;
  state.stageIndex = 0;
  state.score = 0;
  state.integrity = 100;
  state.answered = false;
  const c = CASES[i];
  shuffleCaseChoices(c); // fresh answer order each attempt
  hud.caseEl.textContent = c.title;
  notes.activeChapter = c.chapter; // notes button opens to this case's chapter
  setHud();
  setTheme(c);
  GameAudio.sfx.transition();
  enterWorld();
  // Brief is a paragraph to read — quiet the world so text stays legible.
  setReading(true);

  app.innerHTML = `
    <div class="scene-badge"><span class="dot"></span> ENTERING WORLD · ${c.scene.toUpperCase()}</div>
    <h2>${c.icon} ${c.title}</h2>
    <p class="sub">${c.crime} · ${c.chapters} · ${c.difficulty}</p>
    <div class="panel brief">
      <div class="label">▸ CASE BRIEF</div>
      <p>${c.brief}</p>
    </div>
    <div class="row">
      <button class="btn" id="go">BEGIN INVESTIGATION →</button>
      <button class="btn ghost" id="back">◂ Case files</button>
    </div>
  `;
  document.getElementById('go').onclick = () => { GameAudio.sfx.start(); renderStage(); };
  document.getElementById('back').onclick = () => { GameAudio.sfx.click(); renderMenu(); };
  wireHover(app);
}

// ---------- STAGE (decision) ----------
function renderStage() {
  const c = CASES[state.caseIndex];
  const stage = c.stages[state.stageIndex];
  state.answered = false;
  setReading(true); // decision text — keep the background quiet
  const pct = Math.round((state.stageIndex / c.stages.length) * 100);

  app.innerHTML = `
    <div class="scene-badge"><span class="dot"></span> ${c.scene.toUpperCase()}</div>
    <div class="stage-count">STEP ${state.stageIndex + 1} / ${c.stages.length} · ${c.title}</div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <div class="panel stage-in">
      <p class="prompt">${stage.prompt}</p>
      <div class="choices" id="choices"></div>
      <div id="fb"></div>
    </div>
  `;

  const box = document.getElementById('choices');
  stage.choices.forEach((ch, idx) => {
    const b = el(`<button class="choice"><span class="key">${letter(idx)}</span><span>${ch.text}</span></button>`);
    b.onclick = () => answer(idx, box);
    box.appendChild(b);
  });
  wireHover(app);
}

function answer(idx, box) {
  if (state.answered) return;
  state.answered = true;

  const c = CASES[state.caseIndex];
  const stage = c.stages[state.stageIndex];
  const chosen = stage.choices[idx];

  state.score += chosen.points;
  const lost = Math.round((MAX_PER_STAGE - chosen.points) / MAX_PER_STAGE * 15);
  state.integrity = Math.max(0, state.integrity - lost);
  setHud();

  const good = chosen.points >= MAX_PER_STAGE;
  if (good) { GameAudio.sfx.correct(); doFlash('good'); }
  else { GameAudio.sfx.wrong(); doFlash('bad'); }

  const btns = box.querySelectorAll('.choice');
  btns.forEach((b, i) => {
    b.disabled = true;
    const cc = stage.choices[i];
    if (cc.correct) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
    else b.classList.add('dim');
  });

  // Correct pick shatters like glass.
  if (good && btns[idx]) shatterElement(btns[idx]);

  const verdict = good ? 'CORRECT PROCEDURE'
    : chosen.points > 0 ? 'PARTIALLY RIGHT' : 'PROCEDURAL ERROR';

  const last = state.stageIndex === c.stages.length - 1;
  const fb = document.getElementById('fb');
  fb.appendChild(el(`
    <div class="feedback ${good ? 'good' : 'bad'}">
      <div class="verdict">${good ? '✔' : '✘'} ${verdict}<span class="pts">+${chosen.points} pts</span></div>
      <div>${chosen.explain}</div>
      <div class="row">
        <button class="btn" id="next">${last ? 'CLOSE CASE →' : 'NEXT STEP →'}</button>
      </div>
    </div>
  `));
  const nextBtn = document.getElementById('next');
  nextBtn.addEventListener('mouseenter', () => GameAudio.sfx.hover());
  nextBtn.onclick = () => {
    GameAudio.sfx.click();
    if (last) { renderResults(); }
    else { state.stageIndex++; renderStage(); }
  };
  nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---------- RESULTS ----------
function renderResults() {
  const c = CASES[state.caseIndex];
  const max = c.stages.length * MAX_PER_STAGE;
  const pctScore = state.score / max;

  let grade = 'F', gclass = 'F', verdict, blurb;
  if (pctScore >= 0.9 && state.integrity >= 80) {
    grade = 'A'; gclass = 'A';
    verdict = 'EVIDENCE ADMISSIBLE';
    blurb = 'Textbook work. Chain of custody intact, methods Daubert-solid. The case holds up in court.';
  } else if (pctScore >= 0.75) {
    grade = 'B'; gclass = 'B';
    verdict = 'CASE HOLDS — WITH GAPS';
    blurb = 'Solid investigation, but a few missteps a sharp defense attorney could probe. Review the flagged errors.';
  } else if (pctScore >= 0.5) {
    grade = 'C'; gclass = 'C';
    verdict = 'EVIDENCE CHALLENGED';
    blurb = 'Enough procedural errors that admissibility is in doubt. Re-run the case and tighten your method.';
  } else {
    grade = 'F'; gclass = 'F';
    verdict = 'EVIDENCE THROWN OUT';
    blurb = 'Broken chain of custody / junk methods. The case collapses. Study the explanations and try again.';
  }

  if (grade === 'A' || grade === 'B') GameAudio.sfx.win();
  else GameAudio.sfx.lose();

  const prev = state.solved[c.id];
  if (!prev || state.score > prev.score) {
    state.solved[c.id] = { score: state.score, grade };
    localStorage.setItem('df_solved', JSON.stringify(state.solved));
  }

  const nextIdx = state.caseIndex + 1;
  const hasNext = nextIdx < CASES.length;
  setReading(false); // results screen — let the world breathe again
  enterWorld();

  app.innerHTML = `
    <h2>Case Closed: ${c.title}</h2>
    <div class="panel" style="text-align:center">
      <div class="grade ${gclass}">${grade}</div>
      <div style="letter-spacing:2px;color:var(--txt-dim)">${verdict}</div>
      <div class="stat-row" style="justify-content:center">
        <div class="stat"><b>${state.score}/${max}</b><span>SCORE</span></div>
        <div class="stat"><b>${state.integrity}%</b><span>EVIDENCE INTEGRITY</span></div>
        <div class="stat"><b>${c.stages.length}</b><span>DECISIONS</span></div>
      </div>
      <p style="max-width:520px;margin:0 auto 22px">${blurb}</p>
      <div id="lb-submit-box" class="lb-submit"></div>
      <div class="row" style="justify-content:center">
        <button class="btn ghost" id="retry">↺ Retry case</button>
        ${hasNext ? `<button class="btn" id="next">Next world →</button>`
                  : `<button class="btn" id="menu">All cases ✓ · Case files</button>`}
      </div>
      <div class="row" style="justify-content:center;margin-top:6px">
        <button class="btn ghost" id="menu2">◂ Case files</button>
      </div>
    </div>
  `;
  document.getElementById('retry').onclick = () => { GameAudio.sfx.click(); startCase(state.caseIndex); };
  document.getElementById('menu2').onclick = () => { GameAudio.sfx.click(); renderMenu(); };
  if (hasNext) document.getElementById('next').onclick = () => { GameAudio.sfx.click(); startCase(nextIdx); };
  else document.getElementById('menu').onclick = () => { GameAudio.sfx.click(); renderMenu(); };

  renderSubmitBox(c, { score: state.score, max, grade, integrity: state.integrity });
  wireHover(app);
}

// Opt-in leaderboard submit UI on the results screen. Only shown when the
// leaderboard toggle is ON. Submits this run's score to the Google Sheet.
function renderSubmitBox(c, run) {
  const box = document.getElementById('lb-submit-box');
  if (!box) return;
  if (!leaderboard.enabled) {
    box.innerHTML = `<button class="btn ghost small" id="lb-enable">🏆 Enable leaderboard</button>`;
    document.getElementById('lb-enable').onclick = () => {
      GameAudio.sfx.click();
      const name = lbEnsureName();
      if (!name) return;
      leaderboard.enabled = true;
      localStorage.setItem('df_lb_on', '1');
      lbRefreshToggle();
      renderSubmitBox(c, run);
    };
    return;
  }
  const who = leaderboard.name ? escapeHtml(leaderboard.name) : 'Anonymous';
  box.innerHTML = `
    <div class="lb-submit-row">
      <span class="lb-as">Submit as <b>${who}</b></span>
      <button class="btn small" id="lb-send">🏆 Submit score</button>
      <button class="btn ghost small" id="lb-view">View board</button>
    </div>
    <div class="lb-msg" id="lb-msg"></div>`;

  const msg = document.getElementById('lb-msg');
  const send = document.getElementById('lb-send');
  document.getElementById('lb-view').onclick = openLeaderboard;
  send.onclick = () => {
    GameAudio.sfx.click();
    const name = lbEnsureName();
    if (!name) return;
    send.disabled = true;
    msg.textContent = 'Submitting…';
    lbSubmit({
      name,
      case: c.title,
      score: run.score,
      max: run.max,
      grade: run.grade,
      integrity: run.integrity,
    }).then(ok => {
      if (ok) { msg.textContent = '✔ Submitted to leaderboard.'; msg.className = 'lb-msg ok'; GameAudio.sfx.correct(); }
      else { msg.textContent = '✘ Submit failed — is the server configured?'; msg.className = 'lb-msg err'; send.disabled = false; GameAudio.sfx.wrong(); }
    });
  };
}

// ---------- Field Notes overlay ----------
const notes = {
  overlay: document.getElementById('notes-overlay'),
  tabs: document.getElementById('notes-tabs'),
  body: document.getElementById('notes-body'),
  activeChapter: null, // chapter number when inside a case, else null (menu = library)
};

function renderNotesChapter(chId) {
  const ch = NOTES.find(n => n.id === chId) || NOTES[0];
  // tabs
  notes.tabs.innerHTML = NOTES.map(n =>
    `<button class="notes-tab ${n.id === ch.id ? 'active' : ''}" data-ch="${n.id}">Ch ${n.num} · ${n.title}</button>`
  ).join('');
  notes.tabs.querySelectorAll('.notes-tab').forEach(t =>
    t.onclick = () => { GameAudio.sfx.click(); renderNotesChapter(t.dataset.ch); });

  // relevance hint when a case is open (match on chapter number)
  let hint = '';
  if (notes.activeChapter && ch.num === notes.activeChapter)
    hint = `<div class="notes-hint">◈ Relevant to your current case.</div>`;

  const secs = ch.sections.map((s, i) =>
    `<details ${i === 0 ? 'open' : ''}>
       <summary>${s.h}</summary>
       <div class="sec-body">${s.body}</div>
     </details>`
  ).join('');

  notes.body.innerHTML = `
    <h2>Chapter ${ch.num}: ${ch.title}</h2>
    <p class="ch-sub">${ch.subtitle}</p>
    ${hint}
    ${secs}`;
  notes.body.scrollTop = 0;
}

function openNotes() {
  GameAudio.sfx.click();
  // Inside a case, open to that case's chapter; on the menu, start at Ch 1.
  let startCh = 'ch1';
  if (notes.activeChapter) {
    const rel = NOTES.find(n => n.num === notes.activeChapter);
    if (rel) startCh = rel.id;
  }
  renderNotesChapter(startCh);
  notes.overlay.hidden = false;
}
function closeNotes() { GameAudio.sfx.click(); notes.overlay.hidden = true; }

document.getElementById('notes-btn').onclick = openNotes;
document.getElementById('notes-close').onclick = closeNotes;
notes.overlay.querySelector('.notes-backdrop').onclick = closeNotes;
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !notes.overlay.hidden) closeNotes();
});

// ---------- Character avatar + shop ----------
const shop = {
  overlay: document.getElementById('shop-overlay'),
  tabs: document.getElementById('shop-tabs'),
  body: document.getElementById('shop-body'),
  activeSlot: 'hat',
};

// Refresh the little HUD avatar (top-right).
function updateAvatar() {
  const btn = document.getElementById('avatar-btn');
  btn.innerHTML = GameCharacter.renderAvatar(38);
}

const SLOT_LABELS = { hat: 'Hats', face: 'Eyewear', tool: 'Tools', badge: 'Badges', aura: 'Auras', title: 'Titles' };

function renderShop() {
  const banked = totalScore();
  const avail = GameCharacter.available(banked);
  document.getElementById('shop-avatar').innerHTML = GameCharacter.renderAvatar(90);
  document.getElementById('shop-title').textContent = GameCharacter.title();
  document.getElementById('shop-available').textContent = avail;
  document.getElementById('shop-banked').textContent = `(banked ${banked} · spent ${GameCharacter.spent()})`;

  // tabs
  shop.tabs.innerHTML = GameCharacter.SLOTS.map(s =>
    `<button class="notes-tab ${s === shop.activeSlot ? 'active' : ''}" data-slot="${s}">${SLOT_LABELS[s]}</button>`
  ).join('');
  shop.tabs.querySelectorAll('.notes-tab').forEach(t =>
    t.onclick = () => { GameAudio.sfx.click(); shop.activeSlot = t.dataset.slot; renderShop(); });

  // items in the active slot
  const items = GameCharacter.ITEMS.filter(i => i.slot === shop.activeSlot);
  shop.body.innerHTML = items.map(it => {
    const owned = GameCharacter.owns(it.id);
    const equipped = GameCharacter.equipped[it.slot] === it.id;
    const canAfford = avail >= it.cost;
    const preview = it.emoji ? `<span class="shop-emoji">${it.emoji}</span>`
      : it.swatch ? `<span class="shop-swatch" style="background:${it.swatch === 'transparent' ? '#26344a' : it.swatch}"></span>`
      : `<span class="shop-emoji">🏷️</span>`;
    let action;
    if (equipped) action = `<span class="shop-eq">✓ Equipped</span>`;
    else if (owned) action = `<button class="btn small equip" data-id="${it.id}">Equip</button>`;
    else action = `<button class="btn small buy" data-id="${it.id}" ${canAfford ? '' : 'disabled'}>
        ${it.cost === 0 ? 'Get' : `Buy · ${it.cost}`}</button>`;
    return `
      <div class="shop-item ${equipped ? 'is-eq' : ''} ${!owned && !canAfford ? 'locked' : ''}">
        ${preview}
        <div class="shop-name">${it.name}</div>
        <div class="shop-cost">${owned ? 'Owned' : it.cost === 0 ? 'Free' : it.cost + ' pts'}</div>
        ${action}
      </div>`;
  }).join('');

  shop.body.querySelectorAll('.buy').forEach(b => b.onclick = () => {
    const res = GameCharacter.buy(b.dataset.id, totalScore());
    if (res.ok) { GameAudio.sfx.correct(); }
    else { GameAudio.sfx.wrong(); }
    updateAvatar(); renderShop();
    if (typeof refreshMenuChrome === 'function') refreshMenuChrome();
  });
  shop.body.querySelectorAll('.equip').forEach(b => b.onclick = () => {
    GameCharacter.equip(b.dataset.id); GameAudio.sfx.click();
    updateAvatar(); renderShop();
    if (typeof refreshMenuChrome === 'function') refreshMenuChrome();
  });
}

function openShop() { GameAudio.sfx.click(); renderShop(); shop.overlay.hidden = false; }
function closeShop() { GameAudio.sfx.click(); shop.overlay.hidden = true; }

document.getElementById('avatar-btn').onclick = openShop;
shop.overlay.querySelectorAll('[data-shop-close]').forEach(e => e.onclick = closeShop);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !shop.overlay.hidden) closeShop();
});
updateAvatar();

// keyboard: A/B/C/D to answer
document.addEventListener('keydown', e => {
  const k = e.key.toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(k) && !state.answered) {
    const box = document.getElementById('choices');
    if (!box) return;
    const idx = k.charCodeAt(0) - 65;
    const btns = box.querySelectorAll('.choice');
    if (btns[idx]) btns[idx].click();
  }
});

// The AudioContext can only be created/resumed inside a real user gesture.
// arm() does that synchronously on the first interaction anywhere on the page.
function firstGesture() {
  GameAudio.arm(body.dataset.world || 'menu');
}
document.addEventListener('pointerdown', firstGesture, { once: true });
document.addEventListener('keydown', firstGesture, { once: true });

renderMenu();
