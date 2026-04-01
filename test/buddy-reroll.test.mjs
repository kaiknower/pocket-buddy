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
  assert.deepEqual(mod.getToolsModes(), ['check', 'gallery', 'preview', 'patch', 'web-gallery', 'selftest', 'settings', 'back', 'exit'])
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

test('preview helper builds a matching buddy card shape', async () => {
  const mod = await importFresh()
  const preview = mod.buildPreviewBuddy({
    species: 'duck',
    rarity: 'epic',
    eye: '◉',
    hat: 'wizard',
    shiny: true,
  })
  assert.equal(preview.species, 'duck')
  assert.equal(preview.rarity, 'epic')
  assert.equal(preview.eye, '◉')
  assert.equal(preview.hat, 'wizard')
  assert.equal(preview.shiny, true)
  assert.equal(typeof preview.stats.DEBUGGING, 'number')
})

test('retro search helpers expose pet-console framing', async () => {
  const mod = await importFresh()
  assert.match(mod.getSearchConsoleHeader('dragon legendary'), /Pet Scan/)
  assert.match(mod.getSearchConsoleHeader('dragon legendary'), /Target/)
  assert.match(mod.getSearchProgressLine(123456, 4.2), /Scanning/)
  assert.match(mod.getSearchProgressLine(123456, 4.2), /123,456/)
  assert.match(mod.getResultBannerText(), /Hatch Result/)
})

test('package metadata uses pocket-buddy naming', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, 'pocket-buddy')
  assert.ok(pkg.bin['pocket-buddy'])
})

test('static site entry file exists for GitHub Pages', () => {
  const site = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8')
  assert.match(site, /Pocket Buddy/)
  assert.match(site, /Buddy Gallery/)
})
