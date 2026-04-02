# SVG Buddy Art System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the website's emoji-based buddy presentation with a reusable SVG art system, while keeping CLI output text-first and synchronizing its species/trait terminology with the shared manifest.

**Architecture:** Keep the repo static and lightweight. Add a browser-side `site/buddy-art/` module set that owns species metadata, SVG composition, overlays, and animation presets, then refit the current `site/script.js` and `site/index.html` to consume that renderer. Update CLI copy to read from the same manifest-exported labels instead of duplicating species and rarity wording.

**Tech Stack:** Static HTML/CSS/ES modules, inline SVG, Node.js ESM CLI, built-in `node:test`.

---

## File Structure

### New files

- `site/buddy-art/manifest.js`
  Shared species, rarity, eye, hat, and finish metadata. Must be safe to import in both browser code and CLI tests.
- `site/buddy-art/species.js`
  The 18 species master definitions, including silhouette SVG fragments and required anchor contracts.
- `site/buddy-art/overlays.js`
  Reusable SVG fragments for hats, eye styles, rarity aura, and shiny effects.
- `site/buddy-art/animation.js`
  Idle animation presets and reusable timing/style helpers for composed SVG output.
- `site/buddy-art/renderer.js`
  The composition engine that turns manifest state into inline SVG strings for preview stage, avatar card, hero cards, and gallery cards.
- `docs/superpowers/plans/2026-04-02-svg-buddy-art-system.md`
  This plan file.

### Modified files

- `site/index.html`
  Replace emoji render slots with renderer mount points and trim hard-coded visual copies that no longer match the new data model.
- `site/script.js`
  Stop hard-coding species card emoji output; import the new manifest and renderer and wire builder/gallery state through them.
- `site/styles.css`
  Add renderer shell styles, inline SVG sizing rules, animation helpers, and rarity/glow presentation adjustments around the new art system.
- `buddy-reroll.mjs`
  Read shared species/trait/rarity display labels from the manifest instead of duplicating site vocabulary.
- `test/buddy-reroll.test.mjs`
  Add tests for manifest completeness, renderer usage markers, and CLI/site terminology sync.
- `README.md`
  Refresh the web preview description if needed so it no longer claims emoji-based preview behavior.

## Task 1: Lock the shared art contract with tests

**Files:**
- Modify: `test/buddy-reroll.test.mjs`
- Create: `site/buddy-art/manifest.js`

- [ ] **Step 1: Write failing tests for manifest completeness and terminology sync**

```js
test('buddy art manifest exposes 18 species, 5 rarities, and shared trait labels', async () => {
  const { buddyArtManifest } = await import('../site/buddy-art/manifest.js')
  assert.equal(buddyArtManifest.species.length, 18)
  assert.deepEqual(
    buddyArtManifest.rarities.map((item) => item.id),
    ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  )
  assert.equal(buddyArtManifest.hats.some((item) => item.id === 'wizard'), true)
  assert.equal(buddyArtManifest.eyes.some((item) => item.id === 'glow-dot'), true)
})
```

- [ ] **Step 2: Run the test and verify it fails because the manifest module does not exist yet**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: FAIL with a module-not-found or missing export error for `../site/buddy-art/manifest.js`

- [ ] **Step 3: Add the minimal manifest module**

```js
export const buddyArtManifest = {
  rarities: [
    { id: 'common', label: 'common', stars: '★' },
    { id: 'uncommon', label: 'uncommon', stars: '★★' },
    { id: 'rare', label: 'rare', stars: '★★★' },
    { id: 'epic', label: 'epic', stars: '★★★★' },
    { id: 'legendary', label: 'legendary', stars: '★★★★★' },
  ],
  hats: [
    { id: 'none', label: 'none' },
    { id: 'wizard', label: 'wizard' },
  ],
  eyes: [
    { id: 'glow-dot', label: 'glow dot' },
  ],
  species: [
    { id: 'duck', label: 'Duck' },
    { id: 'goose', label: 'Goose' },
    { id: 'blob', label: 'Blob' },
    { id: 'cat', label: 'Cat' },
    { id: 'dragon', label: 'Dragon' },
    { id: 'octopus', label: 'Octopus' },
    { id: 'owl', label: 'Owl' },
    { id: 'penguin', label: 'Penguin' },
    { id: 'turtle', label: 'Turtle' },
    { id: 'snail', label: 'Snail' },
    { id: 'ghost', label: 'Ghost' },
    { id: 'axolotl', label: 'Axolotl' },
    { id: 'capybara', label: 'Capybara' },
    { id: 'cactus', label: 'Cactus' },
    { id: 'robot', label: 'Robot' },
    { id: 'rabbit', label: 'Rabbit' },
    { id: 'mushroom', label: 'Mushroom' },
    { id: 'chonk', label: 'Chonk' },
  ],
}
```

- [ ] **Step 4: Re-run the test until the manifest contract passes**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: PASS for the new manifest assertions

- [ ] **Step 5: Commit the contract lock**

```bash
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system add test/buddy-reroll.test.mjs site/buddy-art/manifest.js
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system commit -m "test: lock buddy art manifest contract"
```

## Task 2: Build species masters and reusable overlays

**Files:**
- Create: `site/buddy-art/species.js`
- Create: `site/buddy-art/overlays.js`
- Modify: `site/buddy-art/manifest.js`
- Test: `test/buddy-reroll.test.mjs`

- [ ] **Step 1: Write failing tests for species anchors and overlay availability**

```js
test('every species master exposes required anchors', async () => {
  const { speciesMasters } = await import('../site/buddy-art/species.js')
  for (const master of speciesMasters) {
    assert.ok(master.headAnchor)
    assert.ok(master.eyeLeft)
    assert.ok(master.eyeRight)
    assert.ok(master.bodyBounds)
    assert.ok(master.floatOrigin)
  }
})

test('overlay libraries cover hats, eyes, rarity, and shiny', async () => {
  const { hatOverlays, eyeOverlays, rarityAuras, shinyOverlay } = await import('../site/buddy-art/overlays.js')
  assert.ok(hatOverlays.wizard)
  assert.ok(eyeOverlays['glow-dot'])
  assert.ok(rarityAuras.legendary)
  assert.ok(shinyOverlay)
})
```

- [ ] **Step 2: Run the test file and verify failure**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: FAIL because species masters and overlays are missing or incomplete

- [ ] **Step 3: Implement the species master schema and overlay fragments**

```js
export const speciesMasters = [
  {
    id: 'duck',
    family: 'round',
    viewBox: '0 0 240 240',
    headAnchor: { x: 120, y: 74 },
    eyeLeft: { x: 104, y: 102 },
    eyeRight: { x: 136, y: 102 },
    bodyBounds: { x: 42, y: 40, width: 156, height: 158, rx: 72 },
    floatOrigin: { x: 120, y: 122 },
    renderBody: () => '<g class="species-body"><ellipse cx="120" cy="134" rx="72" ry="56" /><circle cx="120" cy="88" r="42" /></g>',
  },
]
```

- [ ] **Step 4: Re-run tests until the master and overlay contracts pass**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: PASS for species anchor and overlay checks

- [ ] **Step 5: Commit the art primitives**

```bash
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system add site/buddy-art/species.js site/buddy-art/overlays.js site/buddy-art/manifest.js test/buddy-reroll.test.mjs
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system commit -m "feat: add buddy art species masters"
```

## Task 3: Build the SVG renderer and idle animation helpers

**Files:**
- Create: `site/buddy-art/animation.js`
- Create: `site/buddy-art/renderer.js`
- Test: `test/buddy-reroll.test.mjs`

- [ ] **Step 1: Write failing tests for composed SVG output**

```js
test('renderer composes species, rarity, eyes, hat, and shiny into a single svg', async () => {
  const { renderBuddySvg } = await import('../site/buddy-art/renderer.js')
  const svg = renderBuddySvg({
    species: 'dragon',
    rarity: 'legendary',
    eye: 'glow-dot',
    hat: 'wizard',
    shiny: true,
  })

  assert.match(svg, /<svg/)
  assert.match(svg, /data-species="dragon"/)
  assert.match(svg, /data-rarity="legendary"/)
  assert.match(svg, /data-hat="wizard"/)
  assert.match(svg, /data-shiny="true"/)
})
```

- [ ] **Step 2: Run tests and verify failure because the renderer is not present**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: FAIL with missing module/export errors for `renderer.js`

- [ ] **Step 3: Implement the renderer and animation helpers**

```js
export function renderBuddySvg(state, options = {}) {
  const species = getSpeciesMaster(state.species)
  return `
    <svg viewBox="${species.viewBox}" data-species="${state.species}" data-rarity="${state.rarity}" data-hat="${state.hat}" data-shiny="${state.shiny}">
      ${renderRarityAura(state)}
      ${species.renderBody(state)}
      ${renderEyes(state, species)}
      ${renderHat(state, species)}
      ${state.shiny ? renderShiny(state, species) : ''}
    </svg>
  `.trim()
}
```

- [ ] **Step 4: Re-run tests until composed SVG snapshots pass**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: PASS for renderer composition assertions

- [ ] **Step 5: Commit the renderer**

```bash
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system add site/buddy-art/animation.js site/buddy-art/renderer.js test/buddy-reroll.test.mjs
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system commit -m "feat: add svg buddy renderer"
```

## Task 4: Rewire the static site to use the renderer

**Files:**
- Modify: `site/index.html`
- Modify: `site/script.js`
- Modify: `site/styles.css`
- Test: `test/buddy-reroll.test.mjs`

- [ ] **Step 1: Write a failing integration test that checks the site now uses renderer mount points**

```js
test('site markup includes renderer mount targets instead of emoji preview slots', async () => {
  const site = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8')
  assert.match(site, /data-buddy-stage/)
  assert.match(site, /data-buddy-avatar/)
  assert.match(site, /type="module"/)
})
```

- [ ] **Step 2: Run tests and verify the site integration assertions fail**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: FAIL because `index.html` still contains emoji-based preview nodes

- [ ] **Step 3: Replace emoji stage nodes with renderer mount points and import the art modules in `site/script.js`**

```js
import { buddyArtManifest } from './buddy-art/manifest.js'
import { renderBuddySvg } from './buddy-art/renderer.js'

function mountHtml(node, html) {
  node.innerHTML = html
}
```

- [ ] **Step 4: Add CSS rules for inline SVG stage sizing, gallery card render sizing, glow clipping, and idle animation classes**

```css
[data-buddy-stage] svg,
[data-buddy-avatar] svg,
.species-render svg {
  width: 100%;
  height: auto;
  display: block;
}
```

- [ ] **Step 5: Re-run tests and do a browserless smoke check**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: PASS

Run: `node /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/buddy-reroll.mjs gallery`

Expected: outputs the Pocket Buddy gallery URL without runtime errors

- [ ] **Step 6: Commit the site integration**

```bash
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system add site/index.html site/script.js site/styles.css test/buddy-reroll.test.mjs
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system commit -m "feat: wire site to svg buddy art renderer"
```

## Task 5: Sync CLI terminology and finish verification

**Files:**
- Modify: `buddy-reroll.mjs`
- Modify: `README.md`
- Modify: `test/buddy-reroll.test.mjs`

- [ ] **Step 1: Write a failing test that proves CLI metadata now comes from the shared manifest**

```js
test('cli metadata exports mirror the shared buddy art manifest', async () => {
  const cli = await import('../buddy-reroll.mjs')
  const { buddyArtManifest } = await import('../site/buddy-art/manifest.js')
  assert.equal(cli.EYES.length, buddyArtManifest.eyes.length)
  assert.equal(cli.HATS.includes('wizard'), true)
})
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`

Expected: FAIL because the CLI still hard-codes metadata separately

- [ ] **Step 3: Refactor CLI metadata loading and adjust README wording if it mentions emoji preview behavior**

```js
import { buddyArtManifest } from './site/buddy-art/manifest.js'

export const EYES = buddyArtManifest.eyes.map((item) => item.symbol)
export const HATS = buddyArtManifest.hats.map((item) => item.id)
```

- [ ] **Step 4: Run full verification**

Run: `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`
Expected: PASS

Run: `npm run selftest`
Expected: PASS

- [ ] **Step 5: Commit the CLI/data sync**

```bash
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system add buddy-reroll.mjs README.md test/buddy-reroll.test.mjs
git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system commit -m "feat: sync cli metadata with buddy art manifest"
```

## Final Verification

- [ ] Run `git -C /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system status --short` and verify only intended files changed.
- [ ] Run `node --test /home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system/test/buddy-reroll.test.mjs`.
- [ ] Run `npm run selftest` from `/home/chenzhi/.config/superpowers/worktrees/pocket-buddy/feature-svg-buddy-art-system`.
- [ ] Manually inspect `site/index.html`, `site/script.js`, and `site/styles.css` to confirm the renderer is the single source for preview and gallery art.
