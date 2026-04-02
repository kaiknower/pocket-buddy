import { normalizeBuddyState, eyeById, hatById, rarityById, speciesById } from './manifest.js'
import { getSpeciesMaster } from './species.js'
import { eyeOverlays, hatOverlays, rarityAuras, shinyOverlay } from './overlays.js'
import { motionStyle } from './animation.js'

function slugify(value) {
  return String(value).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

function defs(prefix, rarity) {
  const [from, to] = rarity.aura
  return `
    <defs>
      <radialGradient id="${prefix}-backdrop" cx="50%" cy="40%" r="64%">
        <stop offset="0%" stop-color="${from}" stop-opacity="0.68" />
        <stop offset="100%" stop-color="${to}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="${prefix}-shiny-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="42%" stop-color="#ffffff" stop-opacity="0.24" />
        <stop offset="55%" stop-color="#ffffff" stop-opacity="0.65" />
        <stop offset="72%" stop-color="#ffffff" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
  `
}

function renderEyes(state, master) {
  const render = eyeOverlays[state.eye] || eyeOverlays.dot
  return `<g class="overlay-eyes">${render(master.eyeLeft, master.eyeRight)}</g>`
}

function renderHat(state, master) {
  const render = hatOverlays[state.hat] || hatOverlays.none
  return render(master.headAnchor, master.headScale)
}

export function renderBuddySvg(inputState, options = {}) {
  const state = normalizeBuddyState(inputState)
  const species = speciesById[state.species]
  const rarity = rarityById[state.rarity]
  const eye = eyeById[state.eye]
  const hat = hatById[state.hat]
  const master = getSpeciesMaster(state.species)
  const prefix = slugify(options.idPrefix || `${state.species}-${state.rarity}-${state.hat}-${state.eye}-${state.shiny ? 'shiny' : 'plain'}`)
  const shinyId = `${prefix}-shiny-sheen`
  const aura = (rarityAuras[state.rarity] || rarityAuras.common)(master.bodyBounds)
  const title = options.title || `${species.label} ${rarity.label}${state.shiny ? ' shiny' : ''}`

  return `
    <svg
      class="buddy-svg buddy-svg--${options.variant || 'stage'}"
      viewBox="${master.viewBox}"
      role="img"
      aria-label="${title}"
      data-species="${state.species}"
      data-rarity="${state.rarity}"
      data-hat="${state.hat}"
      data-eye="${state.eye}"
      data-eye-symbol="${eye.symbol}"
      data-hat-symbol="${hat.symbol}"
      data-shiny="${state.shiny}"
    >
      <title>${title}</title>
      ${defs(prefix, rarity)}
      <g class="buddy-backdrop">
        <ellipse cx="120" cy="120" rx="98" ry="98" fill="url(#${prefix}-backdrop)" opacity="0.72" />
      </g>
      <g class="buddy-rarity-aura">${aura}</g>
      <g class="buddy-actor" style="${motionStyle(master)}">
        <g class="buddy-body">${master.renderBody(state)}</g>
        ${renderEyes(state, master)}
        ${renderHat(state, master)}
        ${state.shiny ? shinyOverlay(master.bodyBounds, shinyId) : ''}
      </g>
      <g class="buddy-foreground">
        <circle cx="176" cy="52" r="4" fill="#ffffff" opacity="0.76" />
        <circle cx="62" cy="78" r="2.5" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  `.trim()
}
