import {
  defaultBuddyState,
  buddyArtManifest,
  eyeById,
  hatById,
  normalizeBuddyState,
  rarityById,
  speciesById,
} from './buddy-art/manifest.js'

const eyeBySymbol = Object.fromEntries(buddyArtManifest.eyes.map((item) => [item.symbol, item]))

export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK']

export const SPECIES_EMOJI = {
  duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
  octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
  ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
  rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
}

export const RARITY_STARS = Object.fromEntries(
  buddyArtManifest.rarities.map((item) => [item.id, item.stars]),
)

export function normalizePreviewState(partial = {}) {
  const incoming = { ...defaultBuddyState, ...partial }
  if (eyeBySymbol[incoming.eye]) incoming.eye = eyeBySymbol[incoming.eye].id
  const state = normalizeBuddyState(incoming)
  if (state.rarity === 'common') state.hat = 'none'
  return state
}

export function buildPreviewStats(seedText) {
  const base = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return {
    DEBUGGING: 45 + (base % 40),
    PATIENCE: 25 + ((base * 3) % 55),
    CHAOS: 20 + ((base * 5) % 60),
    WISDOM: 30 + ((base * 7) % 55),
    SNARK: 15 + ((base * 11) % 70),
  }
}

export function buildSitePreviewData(config = {}) {
  const renderState = normalizePreviewState(config)
  const species = speciesById[renderState.species]
  const rarity = rarityById[renderState.rarity]
  const eye = eyeById[renderState.eye]
  const hat = hatById[renderState.hat]
  const seedLabel = `${renderState.species}-${renderState.rarity}-${renderState.eye}-${renderState.hat}-${renderState.shiny ? 'shiny' : 'plain'}`
  const stats = buildPreviewStats(seedLabel)
  const buddy = {
    species: renderState.species,
    rarity: renderState.rarity,
    eye: eye.symbol,
    hat: renderState.hat,
    shiny: renderState.shiny,
    stats,
  }

  return {
    species: renderState.species,
    speciesLabel: species.label,
    rarity: renderState.rarity,
    rarityLabel: rarity.label,
    rarityStars: rarity.stars,
    eye: eye.symbol,
    eyeId: eye.id,
    eyeLabel: eye.label,
    hat: renderState.hat,
    hatSymbol: hat.symbol,
    hatLabel: hat.label,
    shiny: renderState.shiny,
    stats,
    seedLabel,
    buddy,
    renderState,
  }
}

export function createBuddyTranscriptModel(buddy, uid, verbose = true) {
  const lines = [
    { kind: 'divider', text: `  ${'═'.repeat(46)}` },
    { kind: 'title', text: `  ${SPECIES_EMOJI[buddy.species] || '?'}  ${buddy.species.toUpperCase()}` },
    { kind: 'rarity', text: `  ${RARITY_STARS[buddy.rarity]} ${buddy.rarity}`, shiny: buddy.shiny },
    { kind: 'dividerSoft', text: `  ${'─'.repeat(46)}` },
    { kind: 'muted', text: `  Trait  Eyes ${buddy.eye}   Hat ${hatById[buddy.hat]?.symbol || '—'} ${buddy.hat}` },
  ]

  if (verbose) {
    lines.push({ kind: 'muted', text: '  Power' })
    for (const [name, value] of Object.entries(buddy.stats)) {
      lines.push({
        kind: 'statName',
        statName: name,
        statValue: value,
        text: `  ${name.padEnd(10)} ${formatBuddyBar(value)}`,
      })
    }
  }

  if (uid) {
    lines.push({ kind: 'dividerSoft', text: `  ${'─'.repeat(46)}` })
    lines.push({ kind: 'muted', text: `  Seed   ${uid}` })
  }

  lines.push({ kind: 'divider', text: `  ${'═'.repeat(46)}` })
  return lines
}

export function formatBuddyTranscript(buddy, uid, verbose = true) {
  const lines = createBuddyTranscriptModel(buddy, uid, verbose).map((line) => {
    if (line.kind === 'rarity' && line.shiny) return `${line.text}  ✨ SHINY`
    return line.text
  })
  return ['', ...lines, ''].join('\n')
}

function formatBuddyBar(value, width = 20) {
  const filled = Math.round((value / 100) * width)
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${value}`
}
