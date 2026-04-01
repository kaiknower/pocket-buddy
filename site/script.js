const species = [
  { icon: "🦆", name: "Duck", rarity: "classic", vibe: "Classic debugging sidekick.", trait: "steady" },
  { icon: "🪿", name: "Goose", rarity: "rare menace", vibe: "Loud, brave, slightly chaotic.", trait: "bold" },
  { icon: "🫧", name: "Blob", rarity: "mystery", vibe: "Pure mystery in soft form.", trait: "weird" },
  { icon: "🐱", name: "Cat", rarity: "sharp", vibe: "Quiet confidence with sharp judgment.", trait: "cool" },
  { icon: "🐉", name: "Dragon", rarity: "legend", vibe: "Legend-tier terminal energy.", trait: "mythic" },
  { icon: "🐙", name: "Octopus", rarity: "multi", vibe: "Multitasking master of tentacles.", trait: "adapt" },
  { icon: "🦉", name: "Owl", rarity: "epic", vibe: "Late-night wisdom specialist.", trait: "wise" },
  { icon: "🐧", name: "Penguin", rarity: "cool", vibe: "Cool under pressure and compile time.", trait: "stable" },
  { icon: "🐢", name: "Turtle", rarity: "rare", vibe: "Slow build, stable output.", trait: "patient" },
  { icon: "🐌", name: "Snail", rarity: "slow", vibe: "Unhurried but surprisingly resilient.", trait: "steady" },
  { icon: "👻", name: "Ghost", rarity: "legend", vibe: "Floats through race conditions.", trait: "stealth" },
  { icon: "🦎", name: "Axolotl", rarity: "odd", vibe: "Odd, lovable, impossible to ignore.", trait: "cute" },
  { icon: "🦫", name: "Capybara", rarity: "epic", vibe: "Maximum calm in production.", trait: "calm" },
  { icon: "🌵", name: "Cactus", rarity: "spiky", vibe: "Sharp edges, strong uptime.", trait: "tough" },
  { icon: "🤖", name: "Robot", rarity: "legend", vibe: "Precise, relentless, a little smug.", trait: "exact" },
  { icon: "🐰", name: "Rabbit", rarity: "quick", vibe: "Fast hops between fixes.", trait: "fast" },
  { icon: "🍄", name: "Mushroom", rarity: "epic", vibe: "Soft glow with hidden power.", trait: "glow" },
  { icon: "🐈", name: "Chonk", rarity: "shiny", vibe: "Peak mass, peak presence.", trait: "heavy" },
]

const grid = document.getElementById("species-grid")

if (grid) {
  grid.innerHTML = species.map((buddy, index) => `
    <article class="species-card" data-index="${index}">
      <div class="species-top">
        <div class="species-icon">${buddy.icon}</div>
        <span class="species-tag">${buddy.rarity}</span>
      </div>
      <h3>${buddy.name}</h3>
      <p>${buddy.vibe}</p>
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
