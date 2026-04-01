const species = [
  { icon: "🦆", name: "duck", tier: "common", vibe: "Classic debugging sidekick.", trait: "steady" },
  { icon: "🪿", name: "goose", tier: "rare", vibe: "Loud, brave, slightly chaotic.", trait: "bold" },
  { icon: "🫧", name: "blob", tier: "rare", vibe: "Pure mystery in soft form.", trait: "weird" },
  { icon: "🐱", name: "cat", tier: "epic", vibe: "Quiet confidence with sharp judgment.", trait: "cool" },
  { icon: "🐉", name: "dragon", tier: "legendary", vibe: "Legend-tier terminal energy.", trait: "mythic" },
  { icon: "🐙", name: "octopus", tier: "rare", vibe: "Multitasking master of tentacles.", trait: "adapt" },
  { icon: "🦉", name: "owl", tier: "epic", vibe: "Late-night wisdom specialist.", trait: "wise" },
  { icon: "🐧", name: "penguin", tier: "uncommon", vibe: "Cool under pressure and compile time.", trait: "stable" },
  { icon: "🐢", name: "turtle", tier: "rare", vibe: "Slow build, stable output.", trait: "patient" },
  { icon: "🐌", name: "snail", tier: "common", vibe: "Unhurried but surprisingly resilient.", trait: "steady" },
  { icon: "👻", name: "ghost", tier: "legendary", vibe: "Floats through race conditions.", trait: "stealth" },
  { icon: "🦎", name: "axolotl", tier: "rare", vibe: "Odd, lovable, impossible to ignore.", trait: "cute" },
  { icon: "🦫", name: "capybara", tier: "epic", vibe: "Maximum calm in production.", trait: "calm" },
  { icon: "🌵", name: "cactus", tier: "uncommon", vibe: "Sharp edges, strong uptime.", trait: "tough" },
  { icon: "🤖", name: "robot", tier: "legendary", vibe: "Precise, relentless, a little smug.", trait: "exact" },
  { icon: "🐰", name: "rabbit", tier: "rare", vibe: "Fast hops between fixes.", trait: "fast" },
  { icon: "🍄", name: "mushroom", tier: "epic", vibe: "Soft glow with hidden power.", trait: "glow" },
  { icon: "🐈", name: "chonk", tier: "shiny", vibe: "Peak mass, peak presence.", trait: "heavy" },
]

const rarities = ["common", "uncommon", "rare", "epic", "legendary"]
const rarityStars = { common: "★", uncommon: "★★", rare: "★★★", epic: "★★★★", legendary: "★★★★★" }
const eyes = ["·", "✦", "×", "◉", "@", "°"]
const hats = ["none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", "tinyduck"]
const hatEmoji = { none: "—", crown: "👑", tophat: "🎩", propeller: "🧢", halo: "😇", wizard: "🧙", beanie: "⛑", tinyduck: "🐤" }

const state = {
  species: "dragon",
  rarity: "legendary",
  eye: "◉",
  hat: "wizard",
  shiny: true,
}

function renderSpeciesGrid() {
  const grid = document.getElementById("species-grid")
  if (!grid) return
  grid.innerHTML = species.map((buddy, index) => `
    <article class="species-card tier-${buddy.tier}" data-index="${index}">
      <div class="species-foil"></div>
      <div class="species-top">
        <div class="species-icon">${buddy.icon}</div>
        <span class="species-tag">${buddy.tier}</span>
      </div>
      <h3>${buddy.name}</h3>
      <p>${buddy.vibe}</p>
      <div class="species-traits">
        <span>${buddy.trait}</span>
        <span>${buddy.tier}</span>
      </div>
      <div class="species-footer">
        <span>Collectible card</span>
        <strong>${buddy.icon}</strong>
      </div>
    </article>
  `).join("")

  const cards = [...document.querySelectorAll(".species-card")]
  let active = 0
  function setActiveCard(index) {
    cards.forEach((card, i) => card.classList.toggle("active", i === index))
  }
  if (cards.length) {
    setActiveCard(active)
    setInterval(() => {
      active = (active + 1) % cards.length
      setActiveCard(active)
    }, 1400)
    cards.forEach((card, index) => {
      card.addEventListener("mouseenter", () => {
        active = index
        setActiveCard(active)
      })
    })
  }
}

function makeChip(containerId, values, currentValue, formatter, onPick) {
  const node = document.getElementById(containerId)
  if (!node) return
  node.innerHTML = values.map((value) => `
    <button class="option-chip ${value === currentValue ? "active" : ""}" type="button" data-value="${value}">
      ${formatter(value)}
    </button>
  `).join("")
  node.querySelectorAll(".option-chip").forEach((button) => {
    button.addEventListener("click", () => onPick(button.dataset.value))
  })
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
  return `${"█".repeat(filled)}${"░".repeat(20 - filled)} ${value}`
}

function renderPreview() {
  const preview = document.getElementById("cli-preview")
  const previewMode = document.getElementById("preview-mode")
  const speciesData = species.find((item) => item.name === state.species) || species[0]
  const stats = buildStats(`${state.species}-${state.rarity}-${state.eye}-${state.hat}-${state.shiny}`)
  const rarityLabel = `${rarityStars[state.rarity]} ${state.rarity}${state.shiny ? "  ✨ SHINY" : ""}`
  const hatLabel = `${hatEmoji[state.hat]} ${state.hat}`
  const seed = `${state.species}-${state.rarity}-${state.eye}-${state.hat}-${state.shiny ? "shiny" : "plain"}`

  if (previewMode) previewMode.textContent = "web-preview"
  if (!preview) return
  preview.textContent = [
    "══════════════════════════════════════════════",
    `${speciesData.icon}  ${state.species.toUpperCase()}`,
    `${rarityLabel}`,
    "──────────────────────────────────────────────",
    `Trait  Eyes ${state.eye}   Hat ${hatLabel}`,
    "Power",
    `DEBUGGING  ${bar(stats.DEBUGGING)}`,
    `PATIENCE   ${bar(stats.PATIENCE)}`,
    `CHAOS      ${bar(stats.CHAOS)}`,
    `WISDOM     ${bar(stats.WISDOM)}`,
    `SNARK      ${bar(stats.SNARK)}`,
    "──────────────────────────────────────────────",
    `Seed   ${seed}`,
    "══════════════════════════════════════════════",
  ].join("\n")
}

function initBuilder() {
  makeChip("species-options", species.map((s) => s.name), state.species, (value) => {
    const found = species.find((item) => item.name === value)
    return `${found.icon} ${value}`
  }, (value) => {
    state.species = value
    initBuilder()
  })

  makeChip("rarity-options", rarities, state.rarity, (value) => `${rarityStars[value]} ${value}`, (value) => {
    state.rarity = value
    if (value === "common") state.hat = "none"
    initBuilder()
  })

  makeChip("eye-options", eyes, state.eye, (value) => value, (value) => {
    state.eye = value
    initBuilder()
  })

  const availableHats = state.rarity === "common" ? ["none"] : hats
  if (!availableHats.includes(state.hat)) state.hat = availableHats[0]
  makeChip("hat-options", availableHats, state.hat, (value) => `${hatEmoji[value]} ${value}`, (value) => {
    state.hat = value
    initBuilder()
  })

  const shinyToggle = document.getElementById("shiny-toggle")
  if (shinyToggle) {
    shinyToggle.textContent = state.shiny ? "On ✨" : "Off"
    shinyToggle.classList.toggle("active", state.shiny)
    shinyToggle.onclick = () => {
      state.shiny = !state.shiny
      initBuilder()
    }
  }

  renderPreview()
}

renderSpeciesGrid()
initBuilder()
