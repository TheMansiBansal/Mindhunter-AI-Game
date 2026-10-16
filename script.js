'use strict';
/* MINDHUNTER - rule-based expert system. Sections: 1 DATA, 2 KNOWLEDGE BASE + RULES, 3 INFERENCE ENGINE, 4 UI */
// ===== 1. GAME DATA =====
const SUSP = {
 elena:{n:'Elena Cross',r:'Business Partner',i:'EC',bio:'Co-founder of Blackwood Systems. Poised, calculating.',motive:'A buyout dispute with the victim.',
  t:[['Where were you at 11 PM?','"In the guest office on a video call with investors. Check my call log."','c6'],['How was your partnership?','"Tense. Richard wanted to buy me out at a loss - I admit that."','c9'],['Who had the study keys?','"Only Richard\'s master cards. I carry one, so does Noah."',null]]},
 adrian:{n:'Adrian Vale',r:"Victim's Nephew",i:'AV',bio:'Charming, heavily in debt, heir to a large fortune.',motive:'Cut off from the family allowance.',
  t:[['Where were you?','"I left at 10:20 for the Neon Club. Ask the doorman."','c7'],['About money...','"Uncle cut me off last week. Furious? Yes. A killer? No."','c10'],['Did you see anything?','"Noah was prowling the corridors all evening."',null]]},
 mira:{n:'Dr. Mira Shah',r:'Family Physician',i:'MS',bio:'Calm and clinical. Treated the family for twenty years.',motive:'Falsified medical records the victim knew about.',
  t:[['Where were you at 11?','"In my car, on a hospital call outside the front gate. The gate camera will show it."',null],['Your relationship with Richard?','"He found irregularities in my records and threatened to report me."','c11'],['Cause of death?','"Blunt trauma, I would think. Consult the autopsy."',null]]},
 noah:{n:'Noah Reed',r:'Head of Security',i:'NR',bio:'Ex-military, quiet, precise. Controls every camera in the house.',motive:'Victim discovered missing security funds.',
  t:[['Where were you at 11?','"In the security room, monitoring cameras all night."',null],['Any camera problems?','"A glitch. Nothing unusual. Check the security room logs if you like."',null],['Your opinion of Richard?','"A fair employer. I had no quarrel with him."',null]]}};
const SK = Object.keys(SUSP);
const CLUES = {
 c1:{t:'Autopsy Report',d:'Death by blunt trauma between 10:45 and 11:00 PM.',s:'Study (body)',g:'Fixes the window of death.',f:['tod_window']},
 c2:{t:'Study Door Log',d:"Master card #1 (Noah Reed) opened the study at 10:48 PM.",s:'Security Room',g:'Places Noah at the scene inside the window.',f:['card_noah']},
 c3:{t:'Deleted CCTV',d:"Feed 10:40-11:05 wiped from the security console using Noah's login.",s:'Security Room',g:'Evidence tampering.',f:['cctv_noah']},
 c4:{t:'Audit Memo',d:'Blackwood planned to fire Noah and report missing security funds.',s:'Office desk',g:'Gives Noah a motive.',f:['memo_noah']},
 c5:{t:'Master Key Registry',d:'Only two master cards exist: Noah Reed and Elena Cross.',s:'Office',g:'Only master holders could enter the locked study.',f:['master_noah','master_elena']},
 c6:{t:'Video Call Log',d:'Elena was on an investor call 10:40-11:15 PM.',s:'Interview: Elena',g:'Alibi for the whole window.',f:['call_elena']},
 c7:{t:'Club Doorman Record',d:'Adrian checked in at the Neon Club 10:30-11:30 PM.',s:'Interview: Adrian',g:'Alibi for the whole window.',f:['club_adrian']},
 c8:{t:'Gate Camera',d:"Mira's car at the gate on a hospital call 10:45-11:10 PM.",s:'Front Gate',g:'Alibi for the whole window.',f:['gate_mira']},
 c9:{t:'Buyout Contract',d:'Blackwood intended to buy out Elena at a loss.',s:'Interview: Elena',g:'Gives Elena a motive.',f:['buyout_elena']},
 c10:{t:'Allowance Cut-off',d:'Adrian lost his allowance a week ago.',s:'Interview: Adrian',g:'Gives Adrian a motive.',f:['cutoff_adrian']},
 c11:{t:'Falsified Records',d:'Blackwood threatened to expose Mira\'s falsified records.',s:'Interview: Mira',g:'Gives Mira a motive.',f:['threat_mira']}};
const LOCS = {study:['The Study','Blood, a toppled bronze statue, a locked door.',['c1']],sec:['Security Room','Monitors, a terminal logged in as admin.',['c2','c3']],office:["Blackwood's Office",'Papers, a safe, a drawer left open.',['c4','c5']],gate:['Front Gate','A camera watches the driveway.',['c8']]};
const TL = [['8:00 PM','Dinner party begins; all four suspects at the mansion.'],['10:30 PM','Adrian at the Neon Club.','c7'],['10:40 PM','Elena begins an investor video call (to 11:15).','c6'],['10:40 PM','CCTV feed goes dark (to 11:05).','c3'],['10:45 PM','Mira on a hospital call at the gate (to 11:10).','c8'],['10:45-11:00 PM','Window of death.','c1'],['10:48 PM',"Noah's master card opens the study.",'c2'],['11:00 PM','Body found.'],['11:05 PM','CCTV restored; deletion traced to the security console.','c3']];
const TRUTH = 'noah';

// ===== 2. KNOWLEDGE BASE + RULES =====
const LBL = {tod_window:'Death occurred 10:45-11:00 PM',card_noah:"Noah's master card entered the study at 10:48",cctv_noah:"CCTV deleted using Noah's login",memo_noah:'Victim planned to fire Noah',master_noah:'Noah holds a master key',master_elena:'Elena holds a master key',call_elena:'Elena on video call 10:40-11:15',club_adrian:'Adrian at club 10:30-11:30',gate_mira:'Mira at gate on call 10:45-11:10',buyout_elena:'Victim planned Elena buyout',cutoff_adrian:'Adrian lost allowance',threat_mira:'Victim threatened to expose Mira',concealment_noah:'Noah concealed evidence'};
for (const s of SK) { const n = SUSP[s].n; Object.assign(LBL,{['alibi_'+s]:n+' has a verified alibi',['opportunity_'+s]:n+' had opportunity',['means_'+s]:n+' had means (master key)',['motive_'+s]:n+' had a motive',['guilty_'+s]:n+' is GUILTY'}); }
const lbl = k => LBL[k] || k;
// Each rule: IF all antecedents are CONFIRMED THEN conclusion (val=true: confirmed, val=false: disproven).
const RULES = []; let rn = 1;
const rule = (name, ifs, then, val = true) => RULES.push({id:'R' + rn++, name, if:ifs, then, val});
for (const [s, f] of [['elena','call_elena'],['adrian','club_adrian'],['mira','gate_mira']]) rule('Alibi covering the death window', ['tod_window', f], 'alibi_' + s);
for (const s of SK) rule('An alibi rules out opportunity', ['alibi_' + s], 'opportunity_' + s, false);
rule('Seen entering the study during the window = opportunity', ['tod_window','card_noah'], 'opportunity_noah');
for (const s of SK.filter(x => x==='noah'||x==='elena')) rule('Master key = means (study was locked)', ['master_' + s], 'means_' + s);
for (const [s, f] of [['elena','buyout_elena'],['adrian','cutoff_adrian'],['mira','threat_mira'],['noah','memo_noah']]) rule('Documented grievance = motive', [f], 'motive_' + s);
rule('Deleting footage = concealment', ['cctv_noah'], 'concealment_noah');
for (const s of SK) rule('Motive + Opportunity + Means = guilty', ['motive_'+s,'opportunity_'+s,'means_'+s], 'guilty_' + s);
const ruleText = r => `IF ${r.if.map(lbl).join(' AND ')} THEN ${r.val ? '' : 'NOT '}${lbl(r.then)}`;

const KB = {facts:{}, fired:new Set(), log:[], clues:new Set()};
function resetKB() { KB.facts = {}; KB.fired = new Set(); KB.log = []; KB.clues = new Set(); }
const isTrue = k => KB.facts[k] && KB.facts[k].val === true;

// ===== 3. INFERENCE ENGINE =====
function addClue(id) { // returns false if duplicate; asserts base facts then runs forward chaining
  if (KB.clues.has(id)) return false;
  KB.clues.add(id);
  for (const f of CLUES[id].f) if (!KB.facts[f]) KB.facts[f] = {val:true, by:'Evidence ' + id, base:true};
  forwardChain(); return true;
}
// FORWARD CHAINING: data-driven. Repeatedly fire any rule whose antecedents are all confirmed until nothing new appears.
function forwardChain() {
  let changed = true, round = 0;
  while (changed) {
    changed = false; round++;
    for (const r of RULES) {
      if (KB.fired.has(r.id) || !r.if.every(isTrue)) continue;
      KB.fired.add(r.id); changed = true;
      if (!KB.facts[r.then]) KB.facts[r.then] = {val:r.val, by:r.id}; // no duplicate derived facts
      KB.log.push({r, round});
    }
  }
}
// BACKWARD CHAINING: goal-driven. Returns 'T' proven, 'F' disproven, 'U' unknown. Unknown leaf facts go in `miss`. Absence of evidence is never treated as false.
function prove(g, tr = [], miss = new Set(), d = 0) {
  const pad = '  '.repeat(d), f = KB.facts[g];
  if (f) { tr.push(`${pad}${lbl(g)} -> ${f.val ? 'CONFIRMED' : 'DISPROVEN'} (${f.by})`); return f.val ? 'T' : 'F'; }
  const rs = RULES.filter(r => r.then === g);
  if (!rs.length) { tr.push(`${pad}${lbl(g)} -> UNKNOWN (no evidence yet)`); miss.add(g); return 'U'; }
  tr.push(`${pad}GOAL: ${lbl(g)}  [candidate rules: ${rs.map(r => r.id).join(', ')}]`);
  let best = 'U';
  for (const r of rs) {
    tr.push(`${pad} ${r.id}: ${ruleText(r)}`);
    const res = r.if.map(a => prove(a, tr, miss, d + 2));
    if (res.every(x => x === 'T')) { tr.push(`${pad} => ${r.id} satisfied: ${r.val ? 'PROVEN' : 'DISPROVEN'}`); return r.val ? 'T' : 'F'; }
    if (r.val && res.includes('F')) { tr.push(`${pad} => ${r.id} blocked by a disproven condition`); best = 'F'; }
  }
  if (best === 'U') tr.push(`${pad} => cannot decide yet`);
  return best;
}
const status = k => KB.facts[k] ? (KB.facts[k].val ? 'T' : 'F') : 'U';
const derivedCount = () => Object.values(KB.facts).filter(f => !f.base).length;
function computeScore() { return KB.clues.size * 10 + derivedCount() * 5; }
if (typeof module !== 'undefined') module.exports = {KB, RULES, CLUES, SK, resetKB, addClue, prove, status, forwardChain, derivedCount};

// ===== 4. UI =====
const FACT2CLUE = {}; for (const [id, c] of Object.entries(CLUES)) c.f.forEach(f => FACT2CLUE[f] = id);
if (typeof document !== 'undefined') (function () {
  const app = document.getElementById('app'), live = document.getElementById('live');
  const S = {view:'title', tab:'loc', sel:'elena', asked:{}, visited:new Set(), pick:null, result:null, note:null, aiSeen:false};
  const NCL = Object.keys(CLUES).length, NLOC = Object.keys(LOCS).length;
  const TAGS = {T:'CONFIRMED',F:'DISPROVEN',U:'UNKNOWN'}, ICON = {T:'✓',F:'✗',U:'?'};
  const tag = st => `<span class="tag ${st}">${TAGS[st]}</span>`;
  const card = id => { const c = CLUES[id]; return `<article class="card"><h3>${c.t}</h3><p>${c.d}</p><p class="small"><b>Found at:</b> ${c.s}<br><b>Why it matters:</b> ${c.g}</p></article>`; };
  const interviewed = () => SK.filter(s => SUSP[s].t.some((_, i) => S.asked[s + i]));
  const provenSuspect = () => SK.find(s => prove('guilty_' + s) === 'T');

  // Plain-English reading of a fact's status (the status itself comes from the rule engine)
  function plain(x, s) {
    const st = status(x + '_' + s);
    const T = {motive:SUSP[s].motive, opportunity:'Was able to be at the scene during the window of death', means:'Held a master key to the locked study'};
    const F = {opportunity:'Cannot be the killer: verified alibi for the whole window'};
    const U = {motive:'Motive not established yet', opportunity:'Unknown: nothing yet places them at the scene or clears them', means:'Not established: no evidence of how they could enter the locked study'};
    return [st, st === 'T' ? T[x] : st === 'F' ? F[x] : U[x]];
  }
  function verdict(s) { // [class, label] derived from backward chaining on guilty_s
    const r = prove('guilty_' + s);
    if (r === 'T') return ['T', 'PROVEN GUILTY'];
    if (r === 'F') return ['F', status('alibi_' + s) === 'T' ? 'CLEARED - verified alibi' : 'RULED OUT'];
    return ['U', 'STILL POSSIBLE - more evidence needed'];
  }
  function nextAction() {
    const loc = Object.keys(LOCS).find(k => !S.visited.has(k));
    if (loc) return {t:`Search <b>${LOCS[loc][0]}</b> for physical evidence.`, tab:'loc', b:'Go to Locations'};
    const who = SK.find(s => !interviewed().includes(s));
    if (who) return {t:`Interview <b>${SUSP[who].n}</b>. Ask every question - answers can reveal evidence.`, tab:'sus', sel:who, b:'Interview ' + SUSP[who].n.split(' ')[0]};
    for (const s of SK) { const i = SUSP[s].t.findIndex((t, i) => t[2] && !KB.clues.has(t[2]));
      if (i >= 0) return {t:`Ask <b>${SUSP[s].n}</b>: "${SUSP[s].t[i][0]}" - this question can reveal a clue.`, tab:'sus', sel:s, b:'Ask ' + SUSP[s].n.split(' ')[0]}; }
    if (!S.aiSeen) return {t:'You have gathered everything. Open the <b>AI Analysis</b> to see what the evidence proves.', tab:'ai', b:'Open AI Analysis'};
    const p = provenSuspect();
    if (p) return {t:`The AI can prove <b>${SUSP[p].n}</b> guilty. You are ready to accuse.`, tab:'acc', b:'Make Accusation'};
    return {t:'Review the Evidence Board and AI Analysis for gaps.', tab:'ev', b:'Evidence Board'};
  }
  function tracker() {
    const steps = [['Search locations', S.visited.size, NLOC], ['Interview suspects', interviewed().length, SK.length], ['Collect clues', KB.clues.size, NCL], ['Check AI analysis', S.aiSeen ? 1 : 0, 1], ['Accuse', provenSuspect() ? 1 : 0, 1]];
    return `<ol class="trk" aria-label="Investigation progress">${steps.map((x, i) => `<li class="${x[1] >= x[2] ? 'done' : ''}"><span>${x[1] >= x[2] ? '✓' : i + 1}</span> ${x[0]}${x[2] > 1 ? ` <small>${x[1]}/${x[2]}</small>` : ''}</li>`).join('')}</ol>`;
  }
  // Collect clues, report what is new and what the forward-chaining engine derived from it.
  function gain(ids, where) {
    const before = new Set(Object.keys(KB.facts)), nw = ids.filter(id => addClue(id));
    if (!nw.length) { S.note = `<b>Nothing new.</b> ${where} - you already hold this evidence.`; say(S.note); return; }
    const der = Object.keys(KB.facts).filter(k => !before.has(k) && !KB.facts[k].base);
    S.note = `<b>New evidence discovered!</b>${nw.map(id => `<div>• <b>${CLUES[id].t}</b>: ${CLUES[id].d}<br><span class="small">Why it matters: ${CLUES[id].g}</span></div>`).join('')}${der.length ? `<div class="ai">AI deduced: ${der.map(k => (KB.facts[k].val ? '' : 'NOT ') + lbl(k)).join('; ')}</div>` : '<div class="ai small">The AI has no new deduction yet - more evidence is needed to connect this clue.</div>'}<button data-a="tab" data-t="ev">View Evidence Board</button><button data-a="tab" data-t="ai">See AI conclusions</button>`;
    say('New evidence discovered');
  }
  const say = m => { live.textContent = m.replace(/<[^>]+>/g, ' '); };

  const vTitle = () => `<section class="center"><p class="small">AI COURSE PROJECT - EXPERT SYSTEMS</p><h1>MINDHUNTER</h1><h2>The AI Interrogation Room</h2><p>Gather evidence. Let the AI prove who did it.</p><button class="pri big" data-a="start">Start Investigation</button><button class="big" data-a="how">How to Play</button></section>`;
  const STEPS = '<ol class="steps"><li><b>Search the locations</b> (Locations tab) to find physical evidence.</li><li><b>Interview each suspect</b> (Suspects tab). Ask every question - some answers reveal clues.</li><li><b>Review your clues</b> on the Evidence Board and Timeline.</li><li><b>Open the AI Analysis</b>. It shows who is cleared, who is still possible, and what evidence is missing.</li><li><b>Accuse</b> once the AI can prove one suspect: <i>Motive + Opportunity + Means</i>.</li></ol>';
  const vHow = () => `<section class="panel"><h2>How to Play</h2>${STEPS}<p class="small">The AI never guesses: a fact is CONFIRMED, DISPROVEN, or UNKNOWN. Missing evidence is UNKNOWN, not false.</p><button class="pri" data-a="${S.prev === 'game' ? 'back' : 'title'}">Back</button></section>`;
  const vBrief = () => `<section class="panel"><h2>Case Briefing</h2><p>At 11:00 PM, tech entrepreneur <b>Richard Blackwood</b> was found dead in his locked study, killed by a blow to the head. All four suspects were at the mansion that evening. You are the lead detective.</p><div class="grid">${SK.map(s => `<article class="card"><div class="avatar" aria-hidden="true">${SUSP[s].i}</div><h3>${SUSP[s].n}</h3><p class="small">${SUSP[s].r}</p><p>${SUSP[s].bio}</p></article>`).join('')}</div></section>
  <section class="panel"><h2>Your Mission - 5 Steps</h2>${STEPS}<p><button class="pri big" data-a="game">Begin Investigation</button></p></section>`;

  function tabLoc() { return `<div class="grid">${Object.entries(LOCS).map(([k, l]) => `<article class="card ${S.visited.has(k) ? 'doneC' : ''}"><h3>${l[0]} ${S.visited.has(k) ? '<span class="tag T">✓ Investigated</span>' : '<span class="tag U">Not searched</span>'}</h3><p>${l[1]}</p>${S.visited.has(k) ? l[2].map(card).join('') : `<button class="pri" data-a="loc" data-l="${k}">Search this location</button>`}</article>`).join('')}</div>`; }
  function tabSus() {
    const p = SUSP[S.sel];
    const topics = p.t.map((t, i) => { const a = S.asked[S.sel + i]; return `<div><button class="${a ? 'done' : ''}" data-a="ask" data-i="${i}">${a ? '✓ ' : ''}${t[0]}</button>${a ? `<div class="q"><b>${p.n}:</b> ${t[1]}${t[2] ? `<br><span class="small">📎 Evidence logged: ${CLUES[t[2]].t}</span>` : ''}</div>` : ''}</div>`; }).join('');
    const cnt = s => SUSP[s].t.filter((_, i) => S.asked[s + i]).length;
    return `<p class="small">Choose a suspect, then ask every question.</p><div class="grid">${SK.map(s => `<button class="card pick ${s === S.sel ? 'sel' : ''}" data-a="sel" data-s="${s}" aria-pressed="${s === S.sel}"><div class="avatar" aria-hidden="true">${SUSP[s].i}</div><b>${SUSP[s].n}</b><br><span class="small">${SUSP[s].r}<br>${cnt(s) === 3 ? '✓ ' : ''}Asked ${cnt(s)}/3</span></button>`).join('')}</div><div class="panel"><h2>${p.n}</h2><p>${p.bio}</p><p><b>Known grievance:</b> ${p.motive}</p><h3>Interrogation (${S.asked ? p.t.filter((_, i) => S.asked[S.sel + i]).length : 0}/3 asked)</h3>${topics}</div>`;
  }
  const tabEv = () => `<p class="small">${KB.clues.size} of ${NCL} clues collected. Each card explains why the clue matters.</p><div class="grid">${[...KB.clues].map(card).join('')}</div>${KB.clues.size ? '' : '<p class="panel">No evidence yet. Start by searching a location.</p>'}`;
  const tabTl = () => `<p class="small">Events appear as you find the evidence that confirms them.</p><div class="panel tl">${TL.map(e => !e[2] || KB.clues.has(e[2]) ? `<div><b>${e[0]}</b> - ${e[1]}</div>` : `<div class="small"><b>${e[0]}</b> - ??? (evidence missing)</div>`).join('')}</div>`;
  function tabAI() {
    const cards = SK.map(s => { const [c, v] = verdict(s), tr = [], miss = new Set(); prove('guilty_' + s, tr, miss);
      const need = [...miss].map(f => CLUES[FACT2CLUE[f]]).filter(Boolean);
      return `<article class="card v${c}"><h3>${SUSP[s].n}</h3><p class="verd ${c}">${v}</p><ul class="chk">${['motive','opportunity','means'].map(x => { const [st, t] = plain(x, s); return `<li class="${st}"><b>${ICON[st]}</b> ${t}</li>`; }).join('')}</ul>${c === 'U' && need.length ? `<p class="small"><b>To settle this, find:</b> ${[...new Set(need.map(n => n.t))].join(', ')}</p>` : ''}</article>`; }).join('');
    const base = Object.entries(KB.facts).filter(([, f]) => f.base), der = Object.entries(KB.facts).filter(([, f]) => !f.base);
    const det = SK.map(s => { const tr = [], miss = new Set(), r = prove('guilty_' + s, tr, miss); return `<details><summary>Backward chaining - is ${SUSP[s].n} guilty? ${TAGS[r]}</summary><div class="trace">${tr.join('\n')}</div>${r === 'U' ? `<p><b>Missing facts:</b> ${[...miss].map(lbl).join('; ')}</p>` : ''}</details>`; }).join('');
    const rules = KB.log.length ? `${KB.log.map(l => `[round ${l.round}] ${l.r.id} (${l.r.name})\n  ${ruleText(l.r)}`).join('\n')}` : 'No rule has fired yet.';
    const deduced = der.filter(([k]) => !k.startsWith('guilty') || KB.facts[k].val).map(([k, f]) => `<li>${f.val ? '' : 'NOT '}${lbl(k)}</li>`).join('');
    return `<p class="small">Green ✓ = confirmed, red ✗ = disproven, grey ? = unknown (not enough evidence - not the same as false).</p><div class="grid">${cards}</div>
    <div class="panel"><h3>What the AI has deduced so far</h3>${deduced ? `<ul>${deduced}</ul>` : '<p class="small">Nothing yet - collect evidence to give the AI facts to reason with.</p>'}</div>
    <details class="panel tech"><summary>Technical view: how the AI reasoned (for your viva)</summary>
    <h3>Knowledge base - known facts (${base.length})</h3>${base.map(([k, f]) => `<div>- ${lbl(k)} <span class="small">(${f.by})</span></div>`).join('') || '<p class="small">None.</p>'}
    <h3>Forward chaining - derived facts (${der.length})</h3><p class="small">After each clue, every rule whose IF-part is fully confirmed fires and adds its THEN-fact.</p>${der.map(([k, f]) => `<div class="${f.val ? 'T' : 'F'}">- ${f.val ? '' : 'NOT '}${lbl(k)} <span class="small">via ${f.by}</span></div>`).join('') || '<p class="small">None yet.</p>'}
    <h3>Rules fired</h3><div class="trace">${rules}</div>
    <h3>Backward chaining traces</h3><p class="small">Start from the goal "X is guilty" and recursively check what must be true.</p>${det}
    <details><summary>All ${RULES.length} rules in the knowledge base</summary><div class="trace">${RULES.map(r => r.id + ': ' + ruleText(r)).join('\n')}</div></details></details>`;
  }
  function tabAcc() {
    const p = provenSuspect();
    return `<div class="panel"><h2>Final Accusation</h2>${p ? `<p class="T">✓ The AI can prove a suspect guilty. You are ready.</p>` : `<p class="warn">⚠ The AI cannot yet prove anyone guilty. Accusing now is a guess - a wrong accusation costs points. Keep investigating, or check AI Analysis.</p>`}<p class="small">Click a suspect, then confirm.</p><div class="grid">${SK.map(s => { const [c, v] = verdict(s); return `<button class="card pick ${S.pick === s ? 'sel' : ''}" data-a="pick" data-s="${s}" aria-pressed="${S.pick === s}"><div class="avatar" aria-hidden="true">${SUSP[s].i}</div><b>${SUSP[s].n}</b><br><span class="small ${c}">AI: ${v}</span></button>`; }).join('')}</div>
    ${S.pick ? `<div class="next"><b>You are about to accuse ${SUSP[S.pick].n}.</b> This ends the case. <button class="pri" data-a="accuse">Confirm Accusation</button></div>` : '<p class="small">No suspect selected yet.</p>'}</div>`;
  }
  const TABS = [['loc','1','Locations',tabLoc,`${S.visited.size}/${NLOC}`,'Search each location for physical evidence.'],['sus','2','Suspects',tabSus,`${interviewed().length}/4`,'Interrogate suspects - their answers can reveal clues.'],['ev','3','Evidence Board',tabEv,`${KB.clues.size}/${NCL}`,'Review every clue you have collected.'],['tl','•','Timeline',tabTl,'','The night of the murder, rebuilt from your evidence.'],['ai','4','AI Analysis',tabAI,'','See what the expert system has concluded and what it still needs.'],['acc','5','Accuse',tabAcc,'','Name the killer when you are ready.']];
  function vGame() {
    const n = nextAction(), t = TABS.find(x => x[0] === S.tab);
    return `<header class="bar"><h2>MINDHUNTER</h2><span>Score ${computeScore()} <button data-a="how">Help</button></span></header>
    <div class="obj"><b>OBJECTIVE:</b> Find who killed Richard Blackwood. The AI must prove <i>Motive + Opportunity + Means</i> before you accuse.</div>${tracker()}
    <div class="next"><b>Suggested next step:</b> ${n.t} <button class="pri" data-a="go" data-t="${n.tab}" ${n.sel ? `data-s="${n.sel}"` : ''}>${n.b} →</button></div>
    <nav role="tablist" aria-label="Investigation">${TABS.map(x => `<button role="tab" aria-selected="${S.tab === x[0]}" data-a="tab" data-t="${x[0]}">${x[1]} ${x[2]}${x[4] ? ` <small>(${x[4]})</small>` : ''}</button>`).join('')}</nav>
    ${S.note ? `<div class="note" role="status">${S.note}</div>` : ''}<h2>${t[2]}</h2><p class="small">${t[5]}</p><section role="tabpanel">${t[3]()}</section>`;
  }
  function vResult() {
    const R = S.result, tr = [], miss = new Set(), st = prove('guilty_' + R.pick, tr, miss), [vc, vt] = verdict(R.pick);
    const missing = ['c1','c2','c4','c5'].filter(c => !KB.clues.has(c)).map(c => CLUES[c].t);
    return `<section class="panel"><h1>${R.ok ? 'CASE CLOSED' : 'WRONG SUSPECT'}</h1><p>You accused <b>${SUSP[R.pick].n}</b>. ${R.ok ? 'Correct - justice is served.' : `The real killer was <b>${SUSP[TRUTH].n}</b>.`}</p>
    <h3>What happened</h3><p>Noah Reed, about to be fired over missing security funds, used his master card at 10:48 PM to enter the locked study and kill Blackwood between 10:45 and 11:00. He then deleted the CCTV footage from the security console. Elena, Adrian and Mira all had motives, but each has a verified alibi for the whole window.</p>
    <h3>The AI's verdict on ${SUSP[R.pick].n}: <span class="${vc}">${vt}</span></h3><ul class="chk">${['motive','opportunity','means'].map(x => { const [s2, t] = plain(x, R.pick); return `<li class="${s2}"><b>${ICON[s2]}</b> ${t}</li>`; }).join('')}</ul>
    ${R.ok && missing.length ? `<p class="warn">You were right, but the AI could not fully prove it - you had not found: ${missing.join(', ')}.</p>` : ''}${st === 'U' && !R.ok ? `<p class="small">The evidence did not prove this suspect guilty.</p>` : ''}
    <h3>Score</h3><table><tr><td>Clues (${KB.clues.size} x 10)</td><td>${KB.clues.size * 10}</td></tr><tr><td>Derived facts (${derivedCount()} x 5)</td><td>${derivedCount() * 5}</td></tr><tr><td>Correct culprit</td><td>${R.ok ? 100 : 0}</td></tr><tr><td>Proven by the AI</td><td>${R.ok && st === 'T' ? 50 : 0}</td></tr><tr><td>Wrong accusation</td><td>${R.ok ? 0 : -50}</td></tr><tr><th>Final score</th><th>${R.score}</th></tr></table>
    <details><summary>Technical view: backward-chaining trace</summary><div class="trace">${tr.join('\n')}</div></details>
    <button class="pri big" data-a="start">Play Again</button><button data-a="title">Main Menu</button></section>`;
  }
  function render() { app.innerHTML = {title:vTitle, how:vHow, brief:vBrief, game:vGame, result:vResult}[S.view](); window.scrollTo(0, 0); }
  app.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const d = b.dataset;
    switch (d.a) {
      case 'start': resetKB(); Object.assign(S, {view:'brief', tab:'loc', sel:'elena', asked:{}, visited:new Set(), pick:null, result:null, note:null, aiSeen:false}); break;
      case 'title': S.view = 'title'; break;
      case 'how': S.prev = S.view; S.view = 'how'; break;
      case 'back': S.view = 'game'; break;
      case 'game': S.view = 'game'; S.tab = 'loc'; break;
      case 'tab': case 'go': S.tab = d.t; if (d.s) S.sel = d.s; if (d.t === 'ai') S.aiSeen = true; S.note = null; break;
      case 'sel': S.sel = d.s; S.note = null; break;
      case 'pick': S.pick = d.s; break;
      case 'ask': { const t = SUSP[S.sel].t[+d.i], k = S.sel + d.i; if (S.asked[k]) { S.note = '<b>Already asked.</b> The answer is shown below the question.'; break; } S.asked[k] = true; if (t[2]) gain([t[2]], 'This answer'); else S.note = `<b>${SUSP[S.sel].n} answered.</b> No new evidence, but the statement may be worth cross-checking against locations and logs.`; break; }
      case 'loc': if (S.visited.has(d.l)) { S.note = '<b>Already searched.</b>'; break; } S.visited.add(d.l); gain(LOCS[d.l][2], LOCS[d.l][0]); break;
      case 'accuse': { const ok = S.pick === TRUTH, proven = ok && prove('guilty_' + S.pick) === 'T'; S.result = {pick:S.pick, ok, score:Math.max(0, computeScore() + (ok ? 100 + (proven ? 50 : 0) : -50))}; S.view = 'result'; break; }
    }
    render();
  });
  render();
})();
