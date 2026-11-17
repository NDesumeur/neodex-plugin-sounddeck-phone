// SoundDeck : fabriquer des bruitages rétro pour ses jeux. Un synthé calculé échantillon par échantillon (6 formes d'onde, glissando, répétition,
// enveloppe, vibrato, trémolo, arpège, filtre résonant, passe-haut, distorsion, écrasement, écho), 16 familles de sons à tirer au hasard,
// des réglages verrouillables, un historique, un mélange de plusieurs sons (et des jingles tout faits), 12 pads, un clavier pour jouer
// le son à différentes hauteurs, et l'export WAV (44, 22 ou 11 kHz, 16 ou 8 bits).
const CSS = `
.sdGrid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:12px}
@media (max-width:900px){.sdGrid{grid-template-columns:minmax(0,1fr)}.sdGrid>:last-child{order:-1}}
.sdFam{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.sdFam .btn,.sdRow .btn{width:auto;margin:0;padding:6px 8px}
.sdRow{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0}
.sdRow .f{width:auto;margin:0}
.sdSec{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin:10px 0 2px}
.sdP{display:grid;grid-template-columns:22px 118px minmax(0,1fr) 78px;gap:6px;align-items:center;margin:3px 0;font-size:12px;color:var(--lilac)}
.sdP b{font:12px monospace;color:#fff;text-align:right}
.sdP .lk{background:none;border:0;padding:0;cursor:var(--cp,pointer);font-size:12px;opacity:.35;color:#fff}
.sdP .lk.on{opacity:1}
.sdRange{-webkit-appearance:none;appearance:none;height:10px;background:var(--bg0);border:2px solid var(--line);outline:none;width:100%}
.sdRange::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:22px;background:var(--magenta);border:2px solid #000;cursor:var(--cp,pointer)}
.sdWave{width:100%;height:110px;display:block;image-rendering:pixelated;background:#0b0816;border:2px solid var(--line);cursor:var(--cp,pointer)}
.sdMixC{width:100%;height:70px;display:block;background:#0b0816;border:2px solid var(--line)}
.sdPads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:6px}
.sdPad{height:58px;background:var(--bg0);border:2px solid var(--line);cursor:var(--cp,pointer);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:var(--lilac);position:relative;padding:2px;text-align:center;overflow:hidden}
.sdPad b{font:16px monospace;color:#fff}
.sdPad.full{border-color:var(--magenta)}
.sdPad.mix{border-color:#ffd34f}
.sdPad.on{background:rgba(var(--pkr),.4)}
.sdPad .k{position:absolute;left:3px;top:1px;font:10px monospace;color:var(--muted)}
.sdHist{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0}
.sdHist .btn{width:auto;margin:0;padding:2px 6px;font-size:11px}
.sdLayer{display:grid;grid-template-columns:minmax(0,1fr) 70px 70px 30px 30px;gap:4px;align-items:center;margin:3px 0;font-size:11px;color:var(--lilac)}
.sdLayer .btn{margin:0;padding:2px 0;width:30px}
.sdLayer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sdHelp{font-size:12px;color:var(--lilac);margin-top:6px;line-height:1.5}
`;
const SR = 44100;
const WAVES = ['carrée', 'dent de scie', 'sinus', 'triangle', 'bruit', 'bruit métal'];
// [clé, nom, min, max, pas, unité, rubrique]
const PARAMS = [['freq', 'Hauteur', 40, 2400, 1, 'Hz', 'Hauteur'], ['slide', 'Glissando', -8, 8, .1, 'oct/s', 'Hauteur'], ['repeat', 'Répétition', 0, .5, .005, 's', 'Hauteur'],
  ['duty', 'Largeur (carrée)', .05, .5, .01, '', 'Hauteur'], ['dutySweep', 'Largeur qui bouge', -1, 1, .01, '/s', 'Hauteur'],
  ['attack', 'Attaque', 0, .5, .005, 's', 'Enveloppe'], ['sustain', 'Tenue', 0, 1, .005, 's', 'Enveloppe'], ['decay', 'Chute', .01, 1.5, .005, 's', 'Enveloppe'], ['punch', 'Punch', 0, 1, .01, '', 'Enveloppe'],
  ['vibDepth', 'Vibrato', 0, 1, .01, '', 'Modulation'], ['vibSpeed', 'Vitesse vibrato', 0, 30, .5, 'Hz', 'Modulation'], ['arpMul', 'Arpège', .5, 3, .01, '×', 'Modulation'], ['arpTime', 'Moment arpège', 0, 1, .01, 's', 'Modulation'],
  ['tremDepth', 'Trémolo', 0, 1, .01, '', 'Modulation'], ['tremSpeed', 'Vitesse trémolo', 0, 30, .5, 'Hz', 'Modulation'],
  ['lowpass', 'Filtre', 200, 20000, 10, 'Hz', 'Filtres'], ['reso', 'Résonance', 0, .95, .01, '', 'Filtres'], ['hipass', 'Passe-haut', 0, 4000, 10, 'Hz', 'Filtres'],
  ['dist', 'Distorsion', 0, 1, .01, '', 'Effets'], ['crush', 'Écrasement', 0, 1, .01, '', 'Effets'], ['echo', 'Écho', 0, .9, .01, '', 'Effets'], ['echoTime', 'Délai écho', .03, .5, .005, 's', 'Effets'],
  ['volume', 'Volume', 0, 1, .01, '', 'Effets']];
const BASE = {wave: 0, freq: 440, slide: 0, repeat: 0, duty: .5, dutySweep: 0, attack: 0, sustain: .1, decay: .3, punch: 0, vibDepth: 0, vibSpeed: 6, arpMul: 1, arpTime: 0, tremDepth: 0, tremSpeed: 8,
  lowpass: 20000, reso: 0, hipass: 0, dist: 0, crush: 0, echo: 0, echoTime: .12, volume: .6};
// les familles de sons : chacune tire ses réglages au hasard dans des fourchettes typiques
const R = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const FAMILIES = {
  coin: ['Pièce', () => ({wave: pick([0, 0, 2]), freq: R(700, 1400), sustain: R(.02, .08), decay: R(.15, .35), punch: R(.3, .6), arpMul: R(1.3, 1.6), arpTime: R(.04, .09), duty: R(.3, .5)})],
  jump: ['Saut', () => ({wave: 0, freq: R(220, 500), slide: R(1.5, 4), sustain: R(.05, .15), decay: R(.1, .25), duty: R(.2, .5)})],
  laser: ['Laser', () => ({wave: pick([0, 1, 1]), freq: R(800, 2000), slide: R(-8, -4), sustain: R(.05, .12), decay: R(.05, .2), duty: R(.1, .4), dutySweep: R(-.5, .5)})],
  boom: ['Explosion', () => ({wave: 4, freq: R(60, 200), slide: R(-2, -.5), sustain: R(.1, .3), decay: R(.4, 1), punch: R(.4, .8), lowpass: R(1500, 6000), echo: pick([0, R(.2, .4)]), echoTime: R(.08, .15)})],
  power: ['Bonus', () => ({wave: pick([0, 3]), freq: R(250, 500), slide: R(1, 3), sustain: R(.2, .35), decay: R(.2, .4), vibDepth: R(.1, .4), vibSpeed: R(10, 20), duty: R(.3, .5)})],
  hit: ['Touché', () => ({wave: pick([1, 4, 0]), freq: R(150, 500), slide: R(-6, -2), sustain: R(0, .04), decay: R(.08, .2), punch: R(.3, .7), dist: R(0, .5)})],
  blip: ['Clic', () => ({wave: pick([0, 2, 3]), freq: R(400, 1500), sustain: R(.01, .04), decay: R(.02, .07), duty: R(.2, .5)})],
  door: ['Porte', () => ({wave: pick([1, 4]), freq: R(60, 160), slide: R(-1, .5), attack: R(0, .05), sustain: R(.15, .4), decay: R(.1, .3), lowpass: R(400, 1500), vibDepth: R(0, .3), vibSpeed: R(10, 25)})],
  shoot: ['Tir', () => ({wave: pick([4, 5, 1]), freq: R(400, 1200), slide: R(-6, -2), sustain: R(.01, .05), decay: R(.08, .2), punch: R(.5, .9), hipass: R(100, 600)})],
  step: ['Pas', () => ({wave: 4, freq: R(80, 250), sustain: 0, decay: R(.03, .08), lowpass: R(600, 2000), hipass: R(40, 150), volume: .8})],
  magic: ['Magie', () => ({wave: pick([2, 3]), freq: R(500, 1100), slide: R(.5, 2), sustain: R(.2, .4), decay: R(.3, .6), vibDepth: R(.2, .5), vibSpeed: R(8, 16), tremDepth: R(.3, .7), tremSpeed: R(12, 25), echo: R(.3, .5), echoTime: R(.08, .14)})],
  alarm: ['Alarme', () => ({wave: pick([0, 1]), freq: R(500, 900), sustain: R(.5, .8), decay: R(.05, .15), vibDepth: R(.6, 1), vibSpeed: R(3, 6), duty: R(.3, .5)})],
  engine: ['Moteur', () => ({wave: pick([1, 5]), freq: R(40, 90), sustain: R(.6, 1), decay: R(.1, .2), tremDepth: R(.5, .9), tremSpeed: R(15, 30), lowpass: R(500, 1500), dist: R(.3, .7)})],
  ui: ['Menu', () => ({wave: pick([2, 3, 0]), freq: R(600, 1200), sustain: R(.005, .02), decay: R(.03, .08), arpMul: R(1.2, 1.5), arpTime: R(.02, .04), duty: .5, volume: .5})],
  hurt: ['Aïe', () => ({wave: pick([0, 1]), freq: R(300, 600), slide: R(-3, -1), sustain: R(.02, .06), decay: R(.1, .2), vibDepth: R(.3, .6), vibSpeed: R(20, 30), crush: R(.1, .4)})],
  rise: ['Montée', () => ({wave: pick([0, 3, 1]), freq: R(120, 250), slide: R(2, 4), repeat: R(.08, .15), sustain: R(.4, .7), decay: R(.05, .15), duty: R(.2, .5)})],
};
// le synthé : renvoie un Float32Array (le son, puis la traîne de l'écho)
const lenOf = p => (p.attack + p.sustain + p.decay) + (p.echo > 0 ? p.echoTime * 8 : 0);
function synth(p, rate = 1) {
  const main = Math.max(1, Math.round((p.attack + p.sustain + p.decay) * SR)), n = Math.max(1, Math.round(lenOf(p) * SR)), out = new Float32Array(n);
  let phase = 0, lastCycle = -1, noiseVal = 0, held = 0, low = 0, band = 0, hp = 0, prev = 0, lfsr = 1;
  const useLp = p.lowpass < 19000, fc = Math.min(p.lowpass, SR / 6), F = 2 * Math.sin(Math.PI * fc / SR), Q = 1 - (p.reso || 0) * .95, hpa = p.hipass > 0 ? 1 / (1 + 2 * Math.PI * p.hipass / SR) : 0;
  const crushN = Math.max(1, Math.round(p.crush * 24)), drive = 1 + (p.dist || 0) * 10, dnorm = Math.tanh(drive);
  for (let i = 0; i < main; i++) {
    const t = i / SR, tp = p.repeat > 0 ? t % p.repeat : t; let f = p.freq * rate * 2 ** (p.slide * tp); if (p.arpTime > 0 && tp >= p.arpTime) f *= p.arpMul;
    f *= 1 + p.vibDepth * .06 * Math.sin(2 * Math.PI * p.vibSpeed * t); f = Math.max(20, Math.min(20000, f));
    phase += f / SR; const ph = phase % 1, cyc = Math.floor(phase * 2), duty = Math.max(.02, Math.min(.98, p.duty + (p.dutySweep || 0) * t));
    let v; switch (p.wave) {
      case 0: v = ph < duty ? 1 : -1; break; case 1: v = 1 - 2 * ph; break; case 2: v = Math.sin(2 * Math.PI * ph); break; case 3: v = ph < .5 ? 4 * ph - 1 : 3 - 4 * ph; break;
      case 5: if (cyc !== lastCycle) { lastCycle = cyc; const b = (lfsr ^ (lfsr >> 6)) & 1; lfsr = ((lfsr >> 1) | (b << 6)) & 127; } v = (lfsr & 1) * 2 - 1; break;  // le bruit « court » de la NES : métallique
      default: if (cyc !== lastCycle) { lastCycle = cyc; noiseVal = Math.random() * 2 - 1; } v = noiseVal;
    }
    if (p.dist > 0) v = Math.tanh(v * drive) / dnorm;
    if (useLp) { low += F * band; const high = v - low - Q * band; band += F * high; v = Math.max(-1.5, Math.min(1.5, low)); }
    if (hpa) { hp = hpa * (hp + v - prev); prev = v; v = hp; }
    let env = t < p.attack ? t / p.attack : t < p.attack + p.sustain ? 1 + p.punch * (1 - (t - p.attack) / Math.max(1e-4, p.sustain)) : Math.max(0, 1 - (t - p.attack - p.sustain) / p.decay);
    if (p.tremDepth > 0) env *= 1 - p.tremDepth * (.5 + .5 * Math.sin(2 * Math.PI * p.tremSpeed * t));
    if (i % crushN === 0) held = v;
    out[i] = held * env * p.volume * .5;
  }
  if (p.echo > 0) { const d = Math.max(1, Math.round(p.echoTime * SR)); for (let i = d; i < n; i++) out[i] += out[i - d] * p.echo * .6; }
  for (let i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
  return out;
}
// plusieurs sons mélangés, chacun à son moment ; ramené sous 1 s'il sature
function renderMix(layers) {
  const parts = layers.map(L => ({s: synth(L.p, L.rate || 1), at: Math.round(L.at * SR), vol: L.vol ?? 1})), n = Math.max(1, ...parts.map(q => q.at + q.s.length)), out = new Float32Array(n);
  for (const q of parts) for (let i = 0; i < q.s.length; i++) out[q.at + i] += q.s[i] * q.vol;
  let pk = 0; for (const v of out) pk = Math.max(pk, Math.abs(v)); if (pk > .99) for (let i = 0; i < n; i++) out[i] *= .99 / pk;
  return out;
}
function toWav(samples, sr = SR, bits = 16) {
  const k = SR / sr, n = Math.floor(samples.length / k), by = bits / 8, d = new DataView(new ArrayBuffer(44 + n * by)), w = (o, s) => [...s].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); d.setUint32(4, 36 + n * by, true); w(8, 'WAVE'); w(12, 'fmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, sr, true); d.setUint32(28, sr * by, true); d.setUint16(32, by, true); d.setUint16(34, bits, true); w(36, 'data'); d.setUint32(40, n * by, true);
  for (let i = 0; i < n; i++) { let v = 0; for (let j = 0; j < k; j++) v += samples[Math.floor(i * k) + j] || 0; v = Math.max(-1, Math.min(1, v / k)); if (bits === 8) d.setUint8(44 + i, Math.round(128 + v * 127)); else d.setInt16(44 + i * 2, v * 32767, true); }
  return new Uint8Array(d.buffer);
}
// les jingles : quelques notes posées l'une après l'autre
const NOTE = m => 440 * 2 ** ((m - 69) / 12);
function jingle(kind) {
  const tone = (m, at, dur, wave = 0, extra = {}) => ({name: 'note', at, vol: 1, p: {...BASE, wave, freq: NOTE(m), sustain: dur * .6, decay: dur * .5, duty: .25, volume: .55, ...extra}});
  const seq = {Victoire: [[72, .0, .1], [76, .1, .1], [79, .2, .1], [84, .3, .45, {vibDepth: .25, vibSpeed: 7}]], Défaite: [[67, 0, .22], [66, .25, .22], [65, .5, .22], [64, .75, .7, {vibDepth: .4, vibSpeed: 5, slide: -.3}]],
    'Niveau suivant': [[60, 0, .08], [64, .08, .08], [67, .16, .08], [72, .24, .08], [76, .32, .08], [79, .40, .08], [84, .48, .3]], Bonus: [[84, 0, .06, {wave: 3}], [88, .06, .06, {wave: 3}], [91, .12, .06, {wave: 3}], [96, .18, .25, {wave: 3, echo: .4, echoTime: .07}]],
    'Game over': [[64, 0, .3, {wave: 3}], [60, .35, .3, {wave: 3}], [57, .7, .3, {wave: 3}], [52, 1.05, .9, {wave: 3, vibDepth: .3, vibSpeed: 4}]]}[kind] || [];
  return seq.map(([m, at, d, ex]) => ({...tone(m, at, d, ex?.wave ?? 0, ex), name: kind}));
}
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host;
  ctx.host.addStyle(CSS);
  // vérification : chaque famille donne un son audible, sans saturer, de la bonne longueur ; le WAV a le bon en-tête dans les deux formats ; un jingle se mélange
  console.assert(Object.values(FAMILIES).every(([, f]) => { const p = {...BASE, ...f()}, s = synth(p); let pk = 0; for (const v of s) pk = Math.max(pk, Math.abs(v)); return pk > .02 && pk <= 1 && s.length === Math.max(1, Math.round(lenOf(p) * SR)); })
    && toWav(new Float32Array(10)).length === 64 && toWav(new Float32Array(40), 11025, 8).length === 54 && renderMix(jingle('Victoire')).length > SR * .7, 'sounddeck : synthé');
  let data = null; try { data = await ctx.folder.read('sounddeck'); } catch {}
  let cur = data?.cur ? {...BASE, ...data.cur} : {...BASE, ...FAMILIES.coin[1]()}, pads = data?.pads || Array(12).fill(null), curName = data?.curName || 'Pièce';
  let locks = data?.locks || {}, mix = data?.mix || [], hist = [], undoS = [], redoS = [], expSr = data?.expSr || SR, expBits = data?.expBits || 16;
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => ctx.folder.write('sounddeck', {cur, pads, curName, locks, mix, expSr, expBits}).catch(() => {}), 400); };
  const remember = () => { undoS.push(JSON.stringify({cur, curName})); if (undoS.length > 60) undoS.shift(); redoS.length = 0; };
  const back = (from, to) => { if (!from.length) return; to.push(JSON.stringify({cur, curName})); ({cur, curName} = JSON.parse(from.pop())); save(); full(); play(); };
  const keep = () => { hist.unshift({name: curName, p: {...cur}}); hist = hist.slice(0, 12); drawHist(); };
  // ---------- l'interface ----------
  view.innerHTML = '';
  const wrap = el('div', 'appWrap'), head = el('div', 'agHead'), lay = el('div', 'sdGrid'), left = el('div', 'sysCard px'), right = el('div', 'sysCard px');
  head.append(el('span', 'label', 'SoundDeck · bruitages rétro')); lay.append(left, right); wrap.append(head, lay); view.append(wrap);
  const fam = el('div', 'sdFam'), waveRow = el('div', 'sdRow'), sliders = el('div');
  const btn = (t, f, title, cls = 'btn px') => { const b = el('button', cls, t); b.onclick = f; if (title) b.title = title; return b; };
  const randAll = () => { remember(); const p = {...BASE}; for (const [k, , mn, mx] of PARAMS) if (!locks[k] && k !== 'volume') p[k] = k === 'freq' || k === 'lowpass' ? Math.exp(R(Math.log(mn), Math.log(mx))) : R(mn, mx);
    p.lowpass = Math.random() < .6 ? 20000 : p.lowpass; p.hipass *= Math.random() < .7 ? 0 : .3; p.echo *= Math.random() < .6 ? 0 : 1; p.repeat *= Math.random() < .7 ? 0 : 1; p.sustain = Math.min(p.sustain, .5); p.attack = Math.min(p.attack, .1);
    if (!locks.wave) p.wave = Math.floor(R(0, 6)); for (const k in locks) if (locks[k]) p[k] = cur[k]; cur = p; curName = 'Hasard'; keep(); save(); full(); play(); };
  left.append(el('span', 'label', 'Tirer un son au hasard'), fam, el('div', 'sdRow'), el('span', 'label', 'Réglages'), waveRow, sliders);
  left.children[2].append(btn('🎲 Hasard total', randAll, 'Tous les réglages au hasard, sauf ceux verrouillés 🔒'), el('span', 'hint', '🔒 : un réglage verrouillé ne bouge plus avec Variante, Hasard ni les familles.'));
  const cv = el('canvas', 'sdWave'), act = el('div', 'sdRow'), padsBox = el('div', 'sdPads'), nameL = el('div', 'hint'), histBox = el('div', 'sdHist'), expRow = el('div', 'sdRow');
  const mixC = el('canvas', 'sdMixC'), mixList = el('div'), mixAct = el('div', 'sdRow'), padAct = el('div', 'sdRow');
  cv.id = 'sd_wave'; cv.title = 'Touche : jouer'; nameL.id = 'sd_name';
  right.append(el('span', 'label', 'Le son'), nameL, cv, act, expRow, el('span', 'label', 'Historique'), histBox, el('span', 'label', 'Mélange'), mixC, mixList, mixAct,
    el('span', 'label', 'Pads'), padsBox, padAct,
    el('p', 'sdHelp', 'Touche un pad vide : y ranger le son. Touche un pad plein : le jouer. Appui long : le reprendre pour le modifier, le renommer ou le vider. Touche la forme d’onde pour jouer le son.'));
  const applyFam = (n, f) => { remember(); const p = {...BASE, ...f()}; for (const k in locks) if (locks[k]) p[k] = cur[k]; cur = p; curName = n; keep(); save(); full(); play(); };
  for (const [k, [n, f]] of Object.entries(FAMILIES)) { const b = btn(n, () => applyFam(n, f)); b.dataset.fam = k; fam.append(b); }
  // ---------- jouer ----------
  let ac = null, playAt = 0, playLen = 0, raf = 0;
  function playBuf(s) { try { ac ||= new AudioContext(); if (ac.state === 'suspended') ac.resume(); const b = ac.createBuffer(1, s.length, SR); b.copyToChannel(s, 0); const src = ac.createBufferSource(); src.buffer = b; src.connect(ac.destination); src.start(); return true; } catch (e) { toast('Son impossible : ' + e.message); return false; } }
  function play(p = cur, rate = 1) { if (playBuf(synth(p, rate)) && p === cur) { playAt = ac.currentTime; playLen = lenOf(p); cancelAnimationFrame(raf); raf = requestAnimationFrame(cursor); } }
  function cursor() { if (!view.isConnected) return; drawWave(); const t = ac.currentTime - playAt; if (t <= playLen) { const g = cv.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(Math.round(t / playLen * 640), 0, 2, 110); raf = requestAnimationFrame(cursor); } }
  cv.onclick = () => play();
  // ---------- les réglages ----------
  const fmtv = (v, st) => st >= 1 ? String(Math.round(v)) : (Math.round(v * 1000) / 1000).toString();
  function drawSliders() {
    waveRow.replaceChildren(...WAVES.map((w, i) => btn(w, () => { remember(); cur.wave = i; changed(); drawSliders(); play(); }, null, 'btn px' + (cur.wave === i ? ' main' : ''))));
    [...waveRow.children].forEach((b, i) => b.dataset.wave = i);
    const lw = btn(locks.wave ? '🔒 forme' : '🔓 forme', () => { locks.wave = !locks.wave; save(); drawSliders(); }); waveRow.append(lw);
    let sec = ''; const rows = [];
    for (const [k, n, mn, mx, stp, u, s] of PARAMS) {
      if (s !== sec) { sec = s; rows.push(el('div', 'sdSec', s)); }
      const row = el('div', 'sdP'), r = el('input', 'sdRange'), val = el('b', '', fmtv(cur[k], stp) + (u ? ' ' + u : '')), lk = btn(locks[k] ? '🔒' : '🔓', () => { locks[k] = !locks[k]; save(); drawSliders(); }, 'Verrouiller', 'lk' + (locks[k] ? ' on' : ''));
      val.translate = false; r.type = 'range'; r.min = mn; r.max = mx; r.step = stp; r.value = cur[k]; r.dataset.k = k;
      if (k === 'freq' || k === 'lowpass') { r.min = Math.log(mn); r.max = Math.log(mx); r.step = .001; r.value = Math.log(cur[k]); }  // échelle logarithmique pour les fréquences
      let first = true;
      r.oninput = () => { if (first) { remember(); first = false; } cur[k] = k === 'freq' || k === 'lowpass' ? Math.round(Math.exp(+r.value)) : +r.value; val.textContent = fmtv(cur[k], stp) + (u ? ' ' + u : ''); drawWave(); };
      r.onchange = () => { first = true; changed(); play(); }; row.append(lk, el('span', '', n), r, val); rows.push(row);
    }
    sliders.replaceChildren(...rows);
  }
  function drawWave() {
    const s = synth(cur), W = cv.width = 640, H = cv.height = 110, g = cv.getContext('2d'), step = s.length / W; g.fillStyle = '#0b0816'; g.fillRect(0, 0, W, H); g.fillStyle = '#241c40'; g.fillRect(0, H / 2, W, 1);
    const main = (cur.attack + cur.sustain + cur.decay) / lenOf(cur);
    for (let x = 0; x < W; x++) { let mn = 0, mx = 0; for (let i = Math.floor(x * step); i < Math.floor((x + 1) * step); i++) { mn = Math.min(mn, s[i]); mx = Math.max(mx, s[i]); } const y1 = Math.round(H / 2 - mx * H * .9), y2 = Math.round(H / 2 - mn * H * .9);
      g.fillStyle = x / W > main ? '#8a4ac8' : '#ff4fb0'; g.fillRect(x, y1, 1, Math.max(1, y2 - y1)); }
    g.fillStyle = '#8a7aa8'; g.font = '10px monospace'; g.fillText((s.length / SR).toFixed(2) + ' s', W - 44, 12);
    nameL.replaceChildren(el('span', '', curName), ' · ', el('span', '', WAVES[cur.wave]), ' · ' + Math.round(cur.freq) + ' Hz');
  }
  function changed() { save(); drawWave(); }
  // ---------- les actions ----------
  const mutate = () => { remember(); for (const [k, , mn, mx] of PARAMS) { if (k === 'volume' || locks[k]) continue; if (Math.random() < .5) { const span = (mx - mn) * .08; cur[k] = Math.max(mn, Math.min(mx, cur[k] + (Math.random() * 2 - 1) * span)); } }
    if (!locks.freq) cur.freq = Math.max(40, cur.freq * (1 + (Math.random() - .5) * .25)); curName = curName.replace(/ \*$/, '') + ' *'; keep(); save(); full(); play(); };
  const safe = s => (s.replace(/[^\wÀ-ÿ-]+/g, '-').replace(/^-|-$/g, '') || 'son');
  const dl = (bytes, name) => { const a = el('a'); a.href = URL.createObjectURL(new Blob([bytes], {type: name.endsWith('.json') ? 'application/json' : 'audio/wav'})); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const playB = btn('▶ Jouer', () => play()); playB.classList.add('main'); playB.id = 'sd_play';
  act.append(playB, btn('🎲 Variante', mutate, 'Changer un peu les réglages (sauf ceux verrouillés)'), btn('⟲ Neutre', () => { remember(); cur = {...BASE}; curName = 'Neutre'; save(); full(); }),
    btn('✎', async () => { const n = await ctx.host.ask?.('Nom du son', curName); if (n) { curName = String(n).slice(0, 30); save(); drawWave(); } }, 'Renommer'), btn('↶', () => back(undoS, redoS), 'Annuler'), btn('↷', () => back(redoS, undoS), 'Refaire'));
  const srSel = el('select', 'f'), bitSel = el('select', 'f');
  for (const r of [44100, 22050, 11025]) { const o = el('option', '', r / 1000 + ' kHz'); o.value = r; srSel.append(o); } srSel.value = expSr; srSel.onchange = () => { expSr = +srSel.value; save(); };
  for (const b of [16, 8]) { const o = el('option', '', b + ' bits'); o.value = b; bitSel.append(o); } bitSel.value = expBits; bitSel.onchange = () => { expBits = +bitSel.value; save(); };
  expRow.append(btn('Exporter WAV', () => dl(toWav(synth(cur), expSr, expBits), safe(curName) + '.wav')), srSel, bitSel);
  function drawHist() { histBox.replaceChildren(...hist.map(h => btn(h.name, () => { remember(); cur = {...BASE, ...h.p}; curName = h.name; save(); full(); play(); }, 'Reprendre ce son')));
    if (!hist.length) histBox.append(el('span', 'hint', 'Les derniers sons tirés s\'affichent ici.')); }
  // ---------- le mélange : plusieurs sons, chacun à son moment ----------
  const mixLen = () => mix.length ? Math.max(...mix.map(L => L.at + lenOf(L.p))) : 0;
  function drawMix() {
    const W = mixC.width = 640, H = mixC.height = 70, g = mixC.getContext('2d'), total = Math.max(.5, mixLen()); g.fillStyle = '#0b0816'; g.fillRect(0, 0, W, H);
    const cols = ['#ff4fb0', '#4fc3ff', '#ffd34f', '#7ee07a', '#b48cff', '#ff8a4a'];
    mix.forEach((L, i) => { const x = L.at / total * W, w = Math.max(3, lenOf(L.p) / total * W), y = 4 + (i % 6) * 10; g.fillStyle = cols[i % 6]; g.globalAlpha = .4 + .6 * (L.vol ?? 1); g.fillRect(x, y, w, 8); }); g.globalAlpha = 1;
    g.fillStyle = '#8a7aa8'; g.font = '10px monospace'; g.fillText(total.toFixed(2) + ' s', W - 44, H - 4);
    mixList.replaceChildren(...mix.map((L, i) => {
      const r = el('div', 'sdLayer'), at = el('input', 'sdRange'), vo = el('input', 'sdRange'); at.type = vo.type = 'range'; at.min = 0; at.max = 3; at.step = .01; at.value = L.at; vo.min = 0; vo.max = 1; vo.step = .05; vo.value = L.vol ?? 1;
      at.title = 'Départ : ' + L.at.toFixed(2) + ' s'; vo.title = 'Volume'; at.oninput = () => { L.at = +at.value; at.title = 'Départ : ' + L.at.toFixed(2) + ' s'; drawMixBars(); }; at.onchange = vo.onchange = () => { save(); drawMix(); }; vo.oninput = () => { L.vol = +vo.value; };
      const nm = el('span', '', (i + 1) + '. ' + L.name); nm.translate = false;
      r.append(nm, at, vo, btn('▶', () => playBuf(synth(L.p))), btn('✕', () => { mix.splice(i, 1); save(); drawMix(); })); return r; }));
    if (!mix.length) mixList.append(el('p', 'hint', 'Ajoute le son actuel, puis d\'autres, et règle le moment de départ de chacun. Ou pars d\'un jingle.'));
  }
  function drawMixBars() { const W = 640, H = 70, g = mixC.getContext('2d'), total = Math.max(.5, mixLen()); g.fillStyle = '#0b0816'; g.fillRect(0, 0, W, H); const cols = ['#ff4fb0', '#4fc3ff', '#ffd34f', '#7ee07a', '#b48cff', '#ff8a4a'];
    mix.forEach((L, i) => { g.fillStyle = cols[i % 6]; g.fillRect(L.at / total * W, 4 + (i % 6) * 10, Math.max(3, lenOf(L.p) / total * W), 8); }); }
  const jSel = el('select', 'f'); jSel.append(el('option', '', 'Jingles…')); for (const k of ['Victoire', 'Défaite', 'Niveau suivant', 'Bonus', 'Game over']) { const o = el('option', '', k); o.value = k; jSel.append(o); }
  jSel.onchange = () => { const k = jSel.value; jSel.selectedIndex = 0; if (!k) return; mix = jingle(k); save(); drawMix(); playBuf(renderMix(mix)); };
  mixAct.append(btn('+ Son actuel', () => { if (mix.length >= 12) return toast('12 sons au plus dans un mélange'); mix.push({name: curName, p: {...cur}, at: +mixLen().toFixed(2), vol: 1}); save(); drawMix(); }, 'Ajouter le son actuel à la fin du mélange'),
    btn('▶ Mélange', () => mix.length ? playBuf(renderMix(mix)) : toast('Le mélange est vide')), jSel,
    btn('WAV', () => mix.length ? dl(toWav(renderMix(mix), expSr, expBits), 'melange.wav') : toast('Le mélange est vide'), 'Exporter le mélange en WAV'),
    btn('Vider', () => { mix = []; save(); drawMix(); }));
  // ---------- les pads ----------
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  const padSound = p => p.mix ? renderMix(p.mix) : synth(p.p);
  function drawPads() {
    padsBox.replaceChildren(...pads.map((p, i) => { const d = el('div', 'sdPad' + (p ? ' full' : '') + (p?.mix ? ' mix' : '')); d.append(el('span', 'k', KEYS[i])); d.dataset.pad = i;
      if (p) { const n = el('span', '', p.name); n.translate = false; d.append(el('b', '', p.mix ? '♫' : '♪'), n); } else d.append(el('span', '', '+ ranger'));
      d.onclick = () => { if (p) { playBuf(padSound(p)); flash(d); } else { pads[i] = {name: curName, p: {...cur}}; save(); drawPads(); toast('Rangé sur le pad ' + KEYS[i]); } };
      d.oncontextmenu = async e => { e.preventDefault(); if (!p) { if (mix.length) { pads[i] = {name: 'Mélange', mix: JSON.parse(JSON.stringify(mix))}; save(); drawPads(); toast('Mélange rangé sur le pad ' + KEYS[i]); } return; }
        const r = (await ctx.host.box?.({title: p.name, text: 'Que faire de ce pad ?', buttons: ['Reprendre pour modifier', 'Renommer', 'Vider', 'Annuler']}))?.response;
        if (r === 2) { pads[i] = null; save(); drawPads(); }
        else if (r === 1) { const n = await ctx.host.ask?.('Nom du pad', p.name); if (n) { p.name = String(n).slice(0, 24); save(); drawPads(); } }
        else if (r === 0) { if (p.mix) { mix = JSON.parse(JSON.stringify(p.mix)); save(); drawMix(); } else { remember(); cur = {...BASE, ...p.p}; curName = p.name; save(); full(); } } };
      return d; }));
  }
  const bankIn = el('input'); bankIn.type = 'file'; bankIn.accept = '.json,application/json'; bankIn.hidden = true;
  bankIn.onchange = async () => { const f = bankIn.files[0]; bankIn.value = ''; if (!f) return; try { const j = JSON.parse(await f.text()); if (!Array.isArray(j.pads)) throw 0; pads = Array(12).fill(null).map((_, i) => j.pads[i] || null); save(); drawPads(); toast('Banque ouverte : ' + f.name); } catch { toast('Ce fichier n\'est pas une banque SoundDeck'); } };
  padAct.append(btn('Exporter la banque', () => dl(JSON.stringify({pads}), 'banque.sounddeck.json'), 'Les 12 pads dans un fichier'), btn('Ouvrir une banque', () => bankIn.click()), bankIn,
    btn('Tous en WAV', async () => { const full = pads.map((p, i) => [p, i]).filter(([p]) => p); if (!full.length) return toast('Aucun pad rempli'); for (const [p, i] of full) { dl(toWav(padSound(p), expSr, expBits), (i + 1) + '-' + safe(p.name) + '.wav'); await new Promise(r => setTimeout(r, 250)); } toast(full.length + ' fichiers WAV'); }, 'Un fichier WAV par pad rempli'));
  // téléphone : pas de clavier, les notes deviennent des boutons
  const notes = el('div', 'sdRow'); [['Do', 0], ['Ré', 2], ['Mi', 4], ['Fa', 5], ['Sol', 7], ['La', 9], ['Si', 11], ['Do', 12]].forEach(([n, k]) => notes.append(btn(n, () => play(cur, 2 ** (k / 12)))));
  padAct.after(el('span', 'label', 'Jouer en notes'), notes);
  const flash = d => { d.classList.add('on'); setTimeout(() => d.classList.remove('on'), 150); };
  const PIANO = {a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12};
  const onKey = e => { if (!view.isConnected) { document.removeEventListener('keydown', onKey); return; } if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && document.activeElement.type !== 'range') return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); return back(undoS, redoS); } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); return back(redoS, undoS); }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const i = KEYS.indexOf(e.key), pk = PIANO[e.key.toLowerCase()];
    if (i >= 0 && pads[i]) { playBuf(padSound(pads[i])); flash(padsBox.children[i]); } else if (pk !== undefined) play(cur, 2 ** (pk / 12)); else if (e.code === 'Space' && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); play(); } };
  document.addEventListener('keydown', onKey);
  ctx.onClose?.(() => { document.removeEventListener('keydown', onKey); cancelAnimationFrame(raf); ac?.close(); });
  function full() { drawSliders(); drawWave(); }
  view.__sd = {get cur() { return cur; }, get mix() { return mix; }, synth, renderMix, toWav, jingle, locks, mutate, back: () => back(undoS, redoS)};
  full(); drawPads(); drawHist(); drawMix();
}
