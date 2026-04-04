import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

async function importFresh(env = {}) {
  const previous = new Map()
  for (const [key, value] of Object.entries(env)) {
    previous.set(key, process.env[key])
    process.env[key] = value
  }

  try {
    return await import(`../buddy-reroll.mjs?test=${Date.now()}-${Math.random()}`)
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('loadLang defaults to English when no preference exists', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pocket-buddy-pref-'))
  const prefPath = join(dir, 'pref.json')

  try {
    const mod = await importFresh({ POCKET_BUDDY_PREF_PATH: prefPath })
    assert.equal(mod.loadLang(), 'en')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('saved language preference overrides the default', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pocket-buddy-pref-'))
  const prefPath = join(dir, 'pref.json')
  writeFileSync(prefPath, JSON.stringify({ lang: 'zh' }), 'utf8')

  try {
    const mod = await importFresh({ POCKET_BUDDY_PREF_PATH: prefPath })
    assert.equal(mod.loadLang(), 'zh')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('interactive mode starts with quick-start search', async () => {
  const mod = await importFresh()
  assert.equal(mod.getInteractiveEntryPoint(), 'home')
  assert.deepEqual(mod.getHomeModes(), ['random-roll', 'targeted-hunt', 'tools'])
  assert.deepEqual(mod.getToolsModes(), ['check', 'gallery', 'patch', 'web-gallery', 'selftest', 'settings', 'back', 'exit'])
  assert.deepEqual(mod.getPostSearchActions(), ['apply', 'retry', 'tools', 'exit'])
  assert.deepEqual(mod.getSoulModes(), ['auto', 'custom', 'keep'])
  assert.equal(mod.getSoulModeChoices(false).length, 2)
  assert.equal(mod.getSoulModeChoices(true).length, 3)
})

test('gallery opens an external web guide', async () => {
  const mod = await importFresh()
  const gallery = mod.getGalleryLink()
  assert.equal(gallery.label, 'Buddy Gallery')
  assert.equal(gallery.url, 'https://kaiknower.github.io/pocket-buddy/')
})

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

test('every species master exposes required anchors', async () => {
  const { speciesMasters } = await import('../site/buddy-art/species.js')
  assert.equal(speciesMasters.length, 18)
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

test('hero banner and buddy card use the enhanced display framing', async () => {
  const mod = await importFresh()
  assert.match(mod.getHeroBannerText(), /Pocket Buddy/)
  assert.match(mod.getHeroBannerText(), /Fast pet picking/)
  const card = mod.formatBuddyCard({
    rarity: 'legendary',
    species: 'dragon',
    eye: '◉',
    hat: 'wizard',
    shiny: true,
    stats: { DEBUGGING: 99, PATIENCE: 88, CHAOS: 77, WISDOM: 66, SNARK: 55 },
  }, 'abc123')
  assert.match(card, /Trait/)
  assert.match(card, /Power/)
  assert.match(card, /Seed/)
})

test('shared preview data and formatter support the site preview', async () => {
  const mod = await importFresh()
  const preview = mod.buildSitePreviewData({
    species: 'dragon',
    rarity: 'legendary',
    eye: '◉',
    hat: 'wizard',
    shiny: true,
  })

  assert.equal(preview.species, 'dragon')
  assert.equal(preview.rarity, 'legendary')
  assert.equal(preview.hat, 'wizard')
  assert.equal(preview.shiny, true)
  assert.equal(typeof preview.seedLabel, 'string')
  assert.equal(typeof preview.name, 'string')
  assert.equal(typeof preview.personality, 'string')
  assert.match(mod.formatBuddyCard(preview.buddy, preview.seedLabel, true, { color: false }), /DRAGON/)
})

test('plain text buddy formatter strips ansi color codes when requested', async () => {
  const mod = await importFresh()
  const output = mod.formatBuddyCard({
    rarity: 'legendary',
    species: 'dragon',
    eye: '◉',
    hat: 'wizard',
    shiny: true,
    stats: { DEBUGGING: 99, PATIENCE: 88, CHAOS: 77, WISDOM: 66, SNARK: 55 },
  }, 'dragon-legendary', true, { color: false })

  assert.match(output, /DRAGON/)
  assert.doesNotMatch(output, /\x1b\[/)
})

test('retro search helpers expose pet-console framing', async () => {
  const mod = await importFresh()
  assert.match(mod.getSearchConsoleHeader('dragon legendary'), /Pet Scan/)
  assert.match(mod.getSearchConsoleHeader('dragon legendary'), /Target/)
  assert.match(mod.getSearchProgressLine(123456, 4.2), /Scanning/)
  assert.match(mod.getSearchProgressLine(123456, 4.2), /123,456/)
  assert.match(mod.getResultBannerText(), /Hatch Result/)
})

test('cli metadata exports mirror the shared buddy art manifest', async () => {
  const mod = await importFresh()
  const { buddyArtManifest } = await import('../site/buddy-art/manifest.js')
  assert.deepEqual(mod.SPECIES, buddyArtManifest.species.map((item) => item.id))
  assert.deepEqual(mod.HATS, buddyArtManifest.hats.map((item) => item.id))
  assert.deepEqual(mod.EYES, buddyArtManifest.eyes.map((item) => item.symbol))
})

test('package metadata uses pocket-buddy naming', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, 'pocket-buddy')
  assert.ok(pkg.bin['pocket-buddy'])
})

test('static site entry file uses renderer mount points for SVG buddy art', () => {
  const site = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8')
  assert.match(site, /Pocket Buddy/)
  assert.match(site, /Buddy Gallery/)
  assert.match(site, /Build your buddy/i)
  assert.match(site, /Your Buddy/i)
  assert.match(site, /data-buddy-result/i)
  assert.match(site, /data-buddy-render/i)
  assert.match(site, /preview-personality/i)
  assert.match(site, /preview-stats/i)
  assert.match(site, /preview-traits/i)
  assert.doesNotMatch(site, /data-buddy-stage/i)
  assert.doesNotMatch(site, /data-buddy-avatar/i)
  assert.match(site, /data-buddy-hero/i)
  assert.match(site, /data-species-render/i)
  assert.match(site, /type="module"/i)
})

test('site script uses shared preview helpers instead of hand-built preview text', () => {
  const script = readFileSync(new URL('../site/script.js', import.meta.url), 'utf8')
  assert.match(script, /import\s*\{[\s\S]*eyeById[\s\S]*\}\s*from '\.\/buddy-art\/manifest\.js'/)
  assert.match(script, /buildSitePreviewData/)
  assert.match(script, /formatBuddyTranscript/)
  assert.match(script, /previewPersonality/)
  assert.match(script, /previewStats/)
})

test('preview styling uses unified result classes instead of legacy stage and avatar classes', () => {
  const css = readFileSync(new URL('../site/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.preview-result-card\b/)
  assert.match(css, /\.preview-result-render\b/)
  assert.match(css, /\.preview-stat-row\b/)
  assert.match(css, /\.preview-result-badge\b/)
  assert.doesNotMatch(css, /\.preview-pet-stage\b/)
  assert.doesNotMatch(css, /\.preview-avatar\b/)
})

test('static site busts CSS and JS caches for deploys', () => {
  const site = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8')
  assert.match(site, /styles\.css\?v=/i)
  assert.match(site, /script\.js\?v=/i)
})
