// Character + shop system for Digital Forensics Detective.
// Emoji/CSS detective avatar. Banked points are currency: buying an item
// deducts from your available balance (available = totalScore - spent).
// Owned + equipped items and spent total persist in localStorage.

const Character = (() => {
  // ---- item catalog ----
  // slot: which layer it occupies (only one equipped per slot).
  // Some items are free defaults (cost 0, owned by default).
  const ITEMS = [
    // hats
    { id: 'hat_none',   slot: 'hat',   name: 'No Hat',        emoji: '',   cost: 0,   default: true },
    { id: 'hat_fedora', slot: 'hat',   name: 'Detective Hat', emoji: '🎩', cost: 40 },
    { id: 'hat_cap',    slot: 'hat',   name: 'Field Cap',     emoji: '🧢', cost: 60 },
    { id: 'hat_crown',  slot: 'hat',   name: 'Ace Crown',     emoji: '👑', cost: 200 },
    { id: 'hat_grad',   slot: 'hat',   name: 'Scholar Cap',   emoji: '🎓', cost: 120 },

    // face accessory
    { id: 'face_none',  slot: 'face',  name: 'No Eyewear',    emoji: '',   cost: 0,   default: true },
    { id: 'face_glass', slot: 'face',  name: 'Glasses',       emoji: '👓', cost: 30 },
    { id: 'face_shades',slot: 'face',  name: 'Cool Shades',   emoji: '🕶️', cost: 90 },
    { id: 'face_monocle',slot:'face',  name: 'Monocle',       emoji: '🧐', cost: 150 },

    // tool (held item)
    { id: 'tool_lens',  slot: 'tool',  name: 'Magnifier',     emoji: '🔍', cost: 0,   default: true },
    { id: 'tool_disk',  slot: 'tool',  name: 'Evidence Disk', emoji: '💽', cost: 50 },
    { id: 'tool_lock',  slot: 'tool',  name: 'Write Blocker', emoji: '🔒', cost: 80 },
    { id: 'tool_scroll',slot: 'tool',  name: 'Expert Report', emoji: '📜', cost: 100 },

    // badge (rank flair)
    { id: 'badge_none', slot: 'badge', name: 'No Badge',      emoji: '',   cost: 0,   default: true },
    { id: 'badge_star', slot: 'badge', name: 'Bronze Star',   emoji: '⭐', cost: 70 },
    { id: 'badge_medal',slot: 'badge', name: 'Gold Medal',    emoji: '🏅', cost: 180 },
    { id: 'badge_gem',  slot: 'badge', name: 'Blue Gem',      emoji: '💎', cost: 260 },

    // aura (background glow color behind avatar)
    { id: 'aura_none',  slot: 'aura',  name: 'No Aura',       swatch: 'transparent', cost: 0, default: true },
    { id: 'aura_green', slot: 'aura',  name: 'Green Aura',    swatch: '#3ddc84', cost: 60 },
    { id: 'aura_cyan',  slot: 'aura',  name: 'Cyan Aura',     swatch: '#35c9e8', cost: 60 },
    { id: 'aura_red',   slot: 'aura',  name: 'Crimson Aura',  swatch: '#ff5470', cost: 60 },
    { id: 'aura_gold',  slot: 'aura',  name: 'Golden Aura',   swatch: '#ffb020', cost: 220 },

    // title (text under name)
    { id: 'title_rookie', slot: 'title', name: 'Rookie',        cost: 0,  default: true, text: 'Rookie Investigator' },
    { id: 'title_field',  slot: 'title', name: 'Field Agent',   cost: 90, text: 'Field Agent' },
    { id: 'title_expert', slot: 'title', name: 'Expert Witness',cost: 160,text: 'Expert Witness' },
    { id: 'title_ace',    slot: 'title', name: 'Forensic Ace',  cost: 300,text: 'Forensic Ace' },
  ];

  const SLOTS = ['hat', 'face', 'tool', 'badge', 'aura', 'title'];

  function defaults() {
    const equipped = {};
    SLOTS.forEach(s => {
      const d = ITEMS.find(i => i.slot === s && i.default);
      if (d) equipped[s] = d.id;
    });
    return { owned: ITEMS.filter(i => i.default).map(i => i.id), equipped, spent: 0 };
  }

  let state = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem('df_char') || 'null');
      if (!raw) return defaults();
      const d = defaults();
      return {
        owned: Array.from(new Set([...d.owned, ...(raw.owned || [])])),
        equipped: { ...d.equipped, ...(raw.equipped || {}) },
        spent: raw.spent || 0,
      };
    } catch (e) { return defaults(); }
  }
  function save() { localStorage.setItem('df_char', JSON.stringify(state)); }

  function reset() { state = defaults(); save(); }

  function item(id) { return ITEMS.find(i => i.id === id); }
  function owns(id) { return state.owned.includes(id); }
  function spent() { return state.spent; }

  // available = banked total (passed in) minus what's been spent.
  function available(banked) { return Math.max(0, banked - state.spent); }

  function buy(id, banked) {
    const it = item(id);
    if (!it || owns(id)) return { ok: false, reason: 'owned' };
    if (available(banked) < it.cost) return { ok: false, reason: 'poor' };
    state.owned.push(id);
    state.spent += it.cost;
    state.equipped[it.slot] = id; // auto-equip on purchase
    save();
    return { ok: true };
  }
  function equip(id) {
    const it = item(id);
    if (!it || !owns(id)) return false;
    state.equipped[it.slot] = id;
    save();
    return true;
  }

  // Build the avatar DOM (emoji layers) into a container element.
  function renderAvatar(size) {
    const eq = state.equipped;
    const hat = item(eq.hat), face = item(eq.face), tool = item(eq.tool),
          badge = item(eq.badge), aura = item(eq.aura);
    const auraColor = aura && aura.swatch !== 'transparent' ? aura.swatch : '';
    const s = size || 96;
    return `
      <div class="avatar" style="width:${s}px;height:${s}px;${auraColor ? `--aura:${auraColor}` : ''}"
           ${auraColor ? 'data-aura="1"' : ''}>
        <div class="av-base" style="font-size:${s * 0.6}px">🕵️</div>
        ${hat && hat.emoji ? `<div class="av-hat" style="font-size:${s * 0.42}px">${hat.emoji}</div>` : ''}
        ${face && face.emoji ? `<div class="av-face" style="font-size:${s * 0.34}px">${face.emoji}</div>` : ''}
        ${tool && tool.emoji ? `<div class="av-tool" style="font-size:${s * 0.34}px">${tool.emoji}</div>` : ''}
        ${badge && badge.emoji ? `<div class="av-badge" style="font-size:${s * 0.3}px">${badge.emoji}</div>` : ''}
      </div>`;
  }

  function title() {
    const t = item(state.equipped.title);
    return t ? (t.text || t.name) : 'Investigator';
  }

  return { ITEMS, SLOTS, item, owns, buy, equip, available, spent, reset,
    renderAvatar, title, get equipped() { return state.equipped; } };
})();

window.GameCharacter = Character;
