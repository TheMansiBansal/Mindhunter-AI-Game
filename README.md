# MINDHUNTER: The AI Interrogation Room
A noir detective game driven by a real rule-based expert system (HTML/CSS/vanilla JS, no server).

## What's new (v2)
Numbered mission steps, progress tracker, suggested next action, persistent objective, per-action feedback (new evidence, why it matters, what the AI deduced), plain-English AI Analysis with the technical rules/traces inside an expandable section, and a confirm step before accusing.

## Run
Unzip and open `index.html` in any modern browser. Use the "Start Investigation" button, then the tabs: Suspects (interrogate), Locations (investigate), Evidence Board, Timeline, AI Analysis, Accuse.

## Story
Richard Blackwood is killed in his locked study at ~11 PM. Suspects: Elena Cross (partner), Adrian Vale (nephew), Dr. Mira Shah (physician), Noah Reed (security head). Exactly one is provable as guilty.

## Files
- `index.html` page shell, `style.css` noir theme
- `script.js`: section 1 DATA, 2 KNOWLEDGE BASE + RULES, 3 INFERENCE ENGINE, 4 UI
- `README.md`

## AI concepts
- **Knowledge representation**: facts are keys such as `card_noah`, `alibi_elena` stored as CONFIRMED / DISPROVEN; absent = UNKNOWN (never assumed false).
- **Rules**: `IF motive AND opportunity AND means THEN guilty`; `IF alibi THEN NOT opportunity`.
- **Forward chaining** (`forwardChain`): after each clue, fire every rule whose conditions hold until no new facts appear; each firing is logged.
- **Backward chaining** (`prove`): starts from `guilty_X`, recursively proves sub-goals, prints a trace and lists missing leaf facts.

Examples: `IF tod_window AND call_elena THEN alibi_elena` (forward). Goal `guilty_noah` needs `motive_noah`, `opportunity_noah`, `means_noah` (backward).

## Viva demo
1. Open AI Analysis (all UNKNOWN). 2. Collect autopsy + study door log: opportunity(Noah) appears via forward chaining. 3. Expand Noah's backward-chaining trace to show the missing motive/means. 4. Collect alibis and watch the other suspects become DISPROVEN. 5. Accuse and read the proof trace.

## Limitations
Single case, fixed suspect set, text-only portraits (initial avatars).
