import {
  buddyArtManifest,
  defaultBuddyState,
  eyeById,
  hatById,
  normalizeBuddyState,
  rarityById,
  speciesById,
} from './buddy-art/manifest.js'
import { renderBuddyAsciiPreview } from './buddy-preview-ascii.js'
import { buildSitePreviewData, formatBuddyTranscript } from './preview-shared.js'
import { renderBuddySvg } from './buddy-art/renderer.js'

const state = { ...defaultBuddyState }
let previewFrame = 0
let previewAnimationId = null
let previewAnimationState = null

const heroStates = {
  dragon: { species: 'dragon', rarity: 'legendary', eye: 'glow-dot', hat: 'wizard', shiny: false },
  owl: { species: 'owl', rarity: 'epic', eye: 'orb', hat: 'halo', shiny: false },
  chonk: { species: 'chonk', rarity: 'legendary', eye: 'spark', hat: 'crown', shiny: true },
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
  const previewData = buildSitePreviewData(currentState)
  const preview = document.getElementById('cli-preview')
  const previewMode = document.getElementById('preview-mode')
  const previewShell = document.querySelector('.preview-shell')
  const previewRender = document.querySelector('[data-buddy-render]')
  const previewName = document.getElementById('preview-name')
  const previewSpecies = document.getElementById('preview-species')
  const previewPersonality = document.getElementById('preview-personality')
  const previewStats = document.getElementById('preview-stats')
  const previewTraits = document.getElementById('preview-traits')
  const previewShiny = document.getElementById('preview-shiny')
  const previewRarityBadge = document.getElementById('preview-rarity-badge')

  if (previewMode) previewMode.textContent = 'spawn-style'
  if (previewShell) previewShell.className = `preview-shell ${rarityClass(currentState)}`
  previewAnimationState = previewData
  if (previewRender) {
    previewRender.innerHTML = ''
    const art = document.createElement('pre')
    art.className = `preview-ascii-buddy ${previewData.shiny ? 'is-shiny' : ''}`
    art.textContent = renderBuddyAsciiPreview({
      species: previewData.species,
      eye: previewData.eye,
      hat: previewData.hat,
    }, previewFrame)
    previewRender.appendChild(art)
  }
  if (previewName) previewName.textContent = previewData.name
  if (previewSpecies) previewSpecies.textContent = previewData.speciesLabel
  if (previewPersonality) previewPersonality.textContent = `"${previewData.personality}"`
  if (previewRarityBadge) previewRarityBadge.textContent = `${previewData.rarityStars} ${previewData.rarityLabel}`
  if (previewShiny) {
    previewShiny.hidden = !previewData.shiny
  }
  if (previewStats) {
    previewStats.innerHTML = Object.entries(previewData.stats).map(([label, value]) => `
      <div class="preview-stat-row">
        <div class="preview-stat-copy">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
        <div class="preview-stat-bar">
          <span style="width: ${value}%"></span>
        </div>
      </div>
    `).join('')
  }
  if (previewTraits) {
    previewTraits.innerHTML = [
      `<div class="preview-trait-pill"><span>Eyes</span><strong>${previewData.eye}</strong></div>`,
      `<div class="preview-trait-pill"><span>Hat</span><strong>${previewData.hatLabel}</strong></div>`,
    ].join('')
  }

  if (!preview) return
  preview.textContent = formatBuddyTranscript(previewData.buddy, previewData.seedLabel, true)
  ensurePreviewAnimation()
}

function ensurePreviewAnimation() {
  if (previewAnimationId || typeof window === 'undefined') return
  previewAnimationId = window.setInterval(() => {
    const previewRender = document.querySelector('[data-buddy-render]')
    if (!previewRender || !previewAnimationState) return
    previewFrame = (previewFrame + 1) % 3
    const art = previewRender.querySelector('.preview-ascii-buddy')
    if (!art) return
    art.textContent = renderBuddyAsciiPreview({
      species: previewAnimationState.species,
      eye: previewAnimationState.eye,
      hat: previewAnimationState.hat,
    }, previewFrame)
  }, 500)
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
