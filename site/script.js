const species = [
  { icon: "🦆", name: "Duck", tier: "common", rarity: "classic", vibe: "Classic debugging sidekick.", trait: "steady", eyes: "◉", hat: "none" },
  { icon: "🪿", name: "Goose", tier: "rare", rarity: "rare menace", vibe: "Loud, brave, slightly chaotic.", trait: "bold", eyes: "✦", hat: "crown" },
  { icon: "🫧", name: "Blob", tier: "rare", rarity: "mystery", vibe: "Pure mystery in soft form.", trait: "weird", eyes: "@", hat: "halo" },
  { icon: "🐱", name: "Cat", tier: "epic", rarity: "sharp", vibe: "Quiet confidence with sharp judgment.", trait: "cool", eyes: "×", hat: "tophat" },
  { icon: "🐉", name: "Dragon", tier: "legendary", rarity: "legend", vibe: "Legend-tier terminal energy.", trait: "mythic", eyes: "◉", hat: "wizard" },
  { icon: "🐙", name: "Octopus", tier: "rare", rarity: "multi", vibe: "Multitasking master of tentacles.", trait: "adapt", eyes: "°", hat: "beanie" },
  { icon: "🦉", name: "Owl", tier: "epic", rarity: "epic", vibe: "Late-night wisdom specialist.", trait: "wise", eyes: "✦", hat: "halo" },
  { icon: "🐧", name: "Penguin", tier: "uncommon", rarity: "cool", vibe: "Cool under pressure and compile time.", trait: "stable", eyes: "·", hat: "propeller" },
  { icon: "🐢", name: "Turtle", tier: "rare", rarity: "rare", vibe: "Slow build, stable output.", trait: "patient", eyes: "@", hat: "none" },
  { icon: "🐌", name: "Snail", tier: "common", rarity: "slow", vibe: "Unhurried but surprisingly resilient.", trait: "steady", eyes: "·", hat: "none" },
  { icon: "👻", name: "Ghost", tier: "legendary", rarity: "legend", vibe: "Floats through race conditions.", trait: "stealth", eyes: "✦", hat: "wizard" },
  { icon: "🦎", name: "Axolotl", tier: "rare", rarity: "odd", vibe: "Odd, lovable, impossible to ignore.", trait: "cute", eyes: "°", hat: "tinyduck" },
  { icon: "🦫", name: "Capybara", tier: "epic", rarity: "epic", vibe: "Maximum calm in production.", trait: "calm", eyes: "◉", hat: "beanie" },
  { icon: "🌵", name: "Cactus", tier: "uncommon", rarity: "spiky", vibe: "Sharp edges, strong uptime.", trait: "tough", eyes: "×", hat: "none" },
  { icon: "🤖", name: "Robot", tier: "legendary", rarity: "legend", vibe: "Precise, relentless, a little smug.", trait: "exact", eyes: "@", hat: "crown" },
  { icon: "🐰", name: "Rabbit", tier: "rare", rarity: "quick", vibe: "Fast hops between fixes.", trait: "fast", eyes: "·", hat: "propeller" },
  { icon: "🍄", name: "Mushroom", tier: "epic", rarity: "epic", vibe: "Soft glow with hidden power.", trait: "glow", eyes: "◉", hat: "halo" },
  { icon: "🐈", name: "Chonk", tier: "shiny", rarity: "shiny", vibe: "Peak mass, peak presence.", trait: "heavy", eyes: "✦", hat: "tophat" },
]

const grid = document.getElementById("species-grid")

if (grid) {
  grid.innerHTML = species.map((buddy, index) => `
    <article class="species-card tier-${buddy.tier}" data-index="${index}">
      <div class="species-foil"></div>
      <div class="species-top">
        <div class="species-icon">${buddy.icon}</div>
        <span class="species-tag">${buddy.rarity}</span>
      </div>
      <h3>${buddy.name}</h3>
      <p>${buddy.vibe}</p>
      <div class="species-traits">
        <span>${buddy.eyes}</span>
        <span>${buddy.hat}</span>
      </div>
      <div class="species-footer">
        <span>Buddy soul</span>
        <strong>${buddy.trait}</strong>
      </div>
    </article>
  `).join("")
}

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
