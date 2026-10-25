# MINDHUNTER: The AI Interrogation Room

A noir detective browser game where the evidence is judged by a real **rule-based expert system**. You collect clues; the AI reasons over them with **forward chaining** and **backward chaining** and tells you who can, and cannot, be proven guilty.

*College AI course project: Knowledge Representation, Rule-Based Expert Systems, Forward and Backward Chaining.*

---

## 1. Inspiration
- **Classic whodunits (Cluedo/Clue, Agatha Christie):** a closed circle of suspects, each with a motive, and one culprit determined by logic.
- **Deduction-driven detective games (Return of the Obra Dinn, Her Story):** the player pieces the truth together from evidence rather than being told.
- **Film noir:** the charcoal, red and muted-gold look, with a single-lamp interrogation-room mood.
- **Classic expert systems (MYCIN, Prolog-style reasoning):** knowledge held as IF-THEN rules, with a transparent explanation of how a conclusion was reached.
- **The core idea:** a detective's reasoning ("he had a motive, the chance and the means") maps naturally onto rules, so the game can show AI reasoning instead of hiding it.

## 2. Tech Stack
- **HTML5:** page shell (`index.html`).
- **CSS3:** noir theme, responsive grid, focus styles, reduced-motion support (`style.css`).
- **Vanilla JavaScript (ES6):** game data, knowledge base, inference engine and UI (`script.js`).
- **No backend, build tools, frameworks, paid services or AI APIs.** The "AI" is hand-written, readable JavaScript.
- **Runs offline:** open `index.html` in any modern browser.

## 3. Run It
- Unzip and double-click `index.html`.
- Or in VS Code: open the folder, install **Live Server**, right-click `index.html` and choose **Open with Live Server**.

## 4. Story
- Tech entrepreneur **Richard Blackwood** is found dead in his locked study at 11:00 PM.
- **Suspects:** Elena Cross (business partner), Adrian Vale (nephew), Dr. Mira Shah (physician), Noah Reed (head of security).
- Everyone has a motive, but only one suspect satisfies **Motive + Opportunity + Means**. The evidence uniquely supports that suspect.

## 5. How to Play
- **Locations:** search 4 places for physical evidence.
- **Suspects:** ask each suspect 3 questions; some answers reveal clues.
- **Evidence Board and Timeline:** review clues and the rebuilt night.
- **AI Analysis:** plain-English verdicts per suspect, plus an expandable technical view.
- **Accuse:** pick a suspect and confirm. Scoring rewards clues, AI deductions and a proven accusation.
- The **progress tracker** and **Suggested next step** box guide you throughout.

## 6. AI Concepts Used

### Knowledge Representation
- **Facts** are named atoms, e.g. `card_noah`, `alibi_elena`, `motive_adrian`.
- Each fact has one of three states:
  - **CONFIRMED:** supported by evidence or a fired rule.
  - **DISPROVEN:** contradicted by a rule (e.g. an alibi).
  - **UNKNOWN:** simply absent from the knowledge base.
- **Open-world reasoning:** missing evidence is never treated as false.

### Inference Rules (IF-THEN)
- Each rule is an object: `{id, name, if:[conditions], then, val}`.
- Examples:
  - `IF tod_window AND call_elena THEN alibi_elena`
  - `IF alibi_X THEN NOT opportunity_X`
  - `IF tod_window AND card_noah THEN opportunity_noah`
  - `IF master_X THEN means_X`
  - `IF motive_X AND opportunity_X AND means_X THEN guilty_X`
- The **same rules** are applied to all four suspects.

### Forward Chaining (data-driven)
- Function: `forwardChain()`.
- Trigger: runs every time a clue is added.
- Process:
  - Scan all rules; fire any whose conditions are all CONFIRMED.
  - Add the conclusion as a new fact (duplicates are blocked).
  - Repeat until nothing new can be derived.
- Output: a log of fired rules by round, shown in the technical view.

### Backward Chaining (goal-driven)
- Function: `prove(goal)`.
- Process:
  - Start from a goal such as `guilty_noah`.
  - Find rules that conclude it, then recursively prove each condition.
  - Return **T** (proven), **F** (disproven) or **U** (unknown).
- Output:
  - A readable trace of every sub-goal.
  - A list of **missing facts** that would settle an unknown goal.

### Explainability
- Every derived fact records which rule produced it.
- Plain-English verdicts, fired-rule logs and proof traces explain every conclusion.

## 7. How It Works (Flow)
- **1. Player action:** search a location or ask a question.
- **2. Clue added:** `addClue(id)` converts the clue into base facts (no duplicates).
- **3. Forward chaining:** derives alibis, opportunities, means, motives.
- **4. UI refresh:** the banner shows the new clue, why it matters and what the AI deduced; the AI Analysis updates.
- **5. Backward chaining:** `prove('guilty_X')` produces each suspect's verdict and missing evidence.
- **6. Accusation:** compared with the truth, and also checked against what the AI could prove, for scoring.

## 8. Code Structure (`script.js`)
- **Section 1, DATA:** suspects, clues, locations, timeline.
- **Section 2, KNOWLEDGE BASE and RULES:** fact labels, rule definitions, KB object.
- **Section 3, INFERENCE ENGINE:** `addClue`, `forwardChain`, `prove`, scoring.
- **Section 4, UI:** views, tabs, guidance, feedback, event handling.

## 9. Viva Demo Script
- **Step 1:** Open **AI Analysis** with no evidence: all suspects are STILL POSSIBLE (unknown, not false).
- **Step 2:** Collect the autopsy and study door log: forward chaining derives `opportunity_noah`.
- **Step 3:** Expand Noah's **backward-chaining trace**: it lists missing motive and means.
- **Step 4:** Collect the alibi clues: other suspects become CLEARED via `alibi -> NOT opportunity`.
- **Step 5:** Accuse Noah and read the proof trace on the result screen.
- **Be ready to explain:** forward vs backward chaining, why unknown is not false, and why the culprit is unique.

## 10. Known Limitations
- Single fixed case with four suspects.
- Initial-letter avatars instead of artwork.
- No save/load between sessions.
- Rules are hand-written, not learned; this is a symbolic AI project by design.
