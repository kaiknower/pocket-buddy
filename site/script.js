import {
  buddyArtManifest,
  defaultBuddyState,
  eyeById,
  hatById,
  normalizeBuddyState,
  rarityById,
  speciesById,
} from './buddy-art/manifest.js'
import { renderBuddySvg } from './buddy-art/renderer.js'

const state = { ...defaultBuddyState }

const heroStates = {
  dragon: { species: 'dragon', rarity: 'legendary', eye: 'glow-dot', hat: 'wizard', shiny: false },
  owl: { species: 'owl', rarity: 'epic', eye: 'orb', hat: 'halo', shiny: false },
  chonk: { species: 'chonk', rarity: 'legendary', eye: 'spark', hat: 'crown', shiny: true },
}

function buildStats(seedText) {
  const base = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return {
    DEBUGGING: 45 + (base % 40),
    PATIENCE: 25 + ((base * 3) % 55),
    CHAOS: 20 + ((base * 5) % 60),
    WISDOM: 30 + ((base * 7) % 55),
    SNARK: 15 + ((base * 11) % 70),
  }
}

function bar(value) {
  const filled = Math.max(1, Math.round(value / 5))
  return `${'█'.repeat(filled)}${'░'.repeat(20 - filled)} ${value}`
}

function rarityClass(currentState) {
  return currentState.shiny ? 'tier-shiny' : `tier-${currentState.rarity}`
}

function chipLabel(type, value) {
  if (type === 'species') {
    const species = speciesById[value]
    return `${species.label}`
  }
  if (type === 'rarity') {
    const rarity = rarityById[value]
    return `${rarity.stars} ${rarity.label}`
  }
  if (type === 'eye') {
    const eye = eyeById[value]
    return `${eye.symbol} ${eye.label}`
  }
  const hat = hatById[value]
  return `${hat.symbol} ${hat.label}`
}

function makeChip(containerId, values, currentValue, type, onPick) {
  const node = document.getElementById(containerId)
  if (!node) return
  node.innerHTML = values.map((value) => `
    <button class="option-chip ${value === currentValue ? 'active' : ''}" type="button" data-value="${value}">
      ${chipLabel(type, value)}
    </button>
  `).join('')
  node.querySelectorAll('.option-chip').forEach((button) => {
    button.addEventListener('click', () => onPick(button.dataset.value))
  })
}

function mountHeroRenders() {
  document.querySelectorAll('[data-buddy-hero]').forEach((node, index) => {
    const species = node.getAttribute('data-buddy-hero')
    const heroState = heroStates[species] || defaultBuddyState
    node.innerHTML = renderBuddySvg(heroState, { idPrefix: `hero-${species}-${index}`, variant: 'hero' })
  })
}

function renderSpeciesGrid() {
  const grid = document.getElementById('species-grid')
  if (!grid) return

  grid.innerHTML = buddyArtManifest.species.map((buddy, index) => `
    <article class="species-card tier-${buddy.defaultRarity}" data-index="${index}">
      <div class="species-foil"></div>
      <div class="species-top">
        <div class="species-render" data-species-render="${buddy.id}"></div>
        <span class="species-tag">${buddy.defaultRarity}</span>
      </div>
      <h3>${buddy.label}</h3>
      <p>${buddy.vibe}</p>
      <div class="species-traits">
        <span>${buddy.trait}</span>
        <span>${buddy.family.replace(/-/g, ' ')}</span>
      </div>
      <div class="species-footer">
        <span>Collectible card</span>
        <strong>${rarityById[buddy.defaultRarity].stars}</strong>
      </div>
    </article>
  `).join('')

  grid.querySelectorAll('[data-species-render]').forEach((node, index) => {
    const species = node.getAttribute('data-species-render')
    const buddy = speciesById[species]
    const eye = buddyArtManifest.eyes[index % buddyArtManifest.eyes.length].id
    const hat = buddy.defaultRarity === 'common'
      ? 'none'
      : buddyArtManifest.hats[(index % (buddyArtManifest.hats.length - 1)) + 1].id
    node.innerHTML = renderBuddySvg({
      species,
      rarity: buddy.defaultRarity,
      eye,
      hat,
      shiny: species === 'chonk',
    }, { idPrefix: `grid-${species}-${index}`, variant: 'card' })
  })

  const cards = [...document.querySelectorAll('.species-card')]
  let active = 0
  function setActiveCard(index) {
    cards.forEach((card, i) => card.classList.toggle('active', i === index))
  }
  if (cards.length) {
    setActiveCard(active)
    setInterval(() => {
      active = (active + 1) % cards.length
      setActiveCard(active)
    }, 1400)
    cards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        active = index
        setActiveCard(active)
      })
    })
  }
}

function renderPreview() {
  const currentState = normalizeBuddyState(state)
  const species = speciesById[currentState.species]
  const rarity = rarityById[currentState.rarity]
  const eye = eyeById[currentState.eye]
  const hat = hatById[currentState.hat]
  const stats = buildStats(`${currentState.species}-${currentState.rarity}-${currentState.eye}-${currentState.hat}-${currentState.shiny}`)
  const preview = document.getElementById('cli-preview')
  const previewMode = document.getElementById('preview-mode')
  const previewShell = document.querySelector('.preview-shell')
  const previewStage = document.querySelector('[data-buddy-stage]')
  const avatar = document.getElementById('preview-avatar')
  const avatarRender = document.querySelector('[data-buddy-avatar]')
  const avatarName = document.getElementById('preview-avatar-name')
  const avatarMeta = document.getElementById('preview-avatar-meta')
  const avatarStars = document.getElementById('preview-avatar-stars')
  const avatarTraits = document.getElementById('preview-avatar-traits')

  if (previewMode) previewMode.textContent = 'web-preview'
  if (previewShell) previewShell.className = `preview-shell ${rarityClass(currentState)}`
  if (previewStage) previewStage.innerHTML = renderBuddySvg(currentState, { idPrefix: 'stage-preview', variant: 'stage' })
  if (avatar) avatar.className = `preview-avatar ${rarityClass(currentState)}`
  if (avatarRender) avatarRender.innerHTML = renderBuddySvg(currentState, { idPrefix: 'avatar-preview', variant: 'avatar' })
  if (avatarName) avatarName.textContent = species.label
  if (avatarMeta) avatarMeta.textContent = `${rarity.label} · ${hat.label} · ${currentState.shiny ? 'shiny' : 'standard'}`
  if (avatarStars) avatarStars.textContent = `${rarity.stars}${currentState.shiny ? ' ✨' : ''}`
  if (avatarTraits) {
    avatarTraits.innerHTML = [
      `<span>${eye.symbol} ${eye.label}</span>`,
      `<span>${hat.symbol} ${hat.label}</span>`,
      `<span>${currentState.shiny ? '✨ shiny' : 'standard'}</span>`,
    ].join('')
  }

  if (!preview) return
  preview.textContent = [
    '══════════════════════════════════════════════',
    `${species.label.toUpperCase()}`,
    `${rarity.stars} ${rarity.label}${currentState.shiny ? '  ✨ SHINY' : ''}`,
    '──────────────────────────────────────────────',
    `Trait  Eyes ${eye.symbol}   Hat ${hat.symbol} ${hat.label}`,
    'Power',
    `DEBUGGING  ${bar(stats.DEBUGGING)}`,
    `PATIENCE   ${bar(stats.PATIENCE)}`,
    `CHAOS      ${bar(stats.CHAOS)}`,
    `WISDOM     ${bar(stats.WISDOM)}`,
    `SNARK      ${bar(stats.SNARK)}`,
    '──────────────────────────────────────────────',
    `Seed   ${currentState.species}-${currentState.rarity}-${currentState.eye}-${currentState.hat}-${currentState.shiny ? 'shiny' : 'plain'}`,
    '══════════════════════════════════════════════',
  ].join('\n')
}

function initBuilder() {
  makeChip('species-options', buddyArtManifest.species.map((item) => item.id), state.species, 'species', (value) => {
    state.species = value
    initBuilder()
  })

  makeChip('rarity-options', buddyArtManifest.rarities.map((item) => item.id), state.rarity, 'rarity', (value) => {
    state.rarity = value
    if (value === 'common') state.hat = 'none'
    initBuilder()
  })

  makeChip('eye-options', buddyArtManifest.eyes.map((item) => item.id), state.eye, 'eye', (value) => {
    state.eye = value
    initBuilder()
  })

  const availableHats = state.rarity === 'common'
    ? ['none']
    : buddyArtManifest.hats.map((item) => item.id)
  if (!availableHats.includes(state.hat)) state.hat = availableHats[0]

  makeChip('hat-options', availableHats, state.hat, 'hat', (value) => {
    state.hat = value
    initBuilder()
  })

  const shinyToggle = document.getElementById('shiny-toggle')
  if (shinyToggle) {
    shinyToggle.textContent = state.shiny ? 'On ✨' : 'Off'
    shinyToggle.classList.toggle('active', state.shiny)
    shinyToggle.onclick = () => {
      state.shiny = !state.shiny
      initBuilder()
    }
  }

  renderPreview()
}

mountHeroRenders()
renderSpeciesGrid()
initBuilder()
