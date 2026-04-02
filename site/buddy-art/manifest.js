const species = [
  {
    id: 'duck',
    label: 'Duck',
    family: 'round-critters',
    defaultRarity: 'common',
    vibe: 'Classic debugger companion with bright bill energy.',
    trait: 'steady',
    palette: { body: '#f6c343', accent: '#f28c28', shadow: '#8c5b12' },
  },
  {
    id: 'goose',
    label: 'Goose',
    family: 'tall-strange',
    defaultRarity: 'rare',
    vibe: 'Long-neck menace with fearless commit timing.',
    trait: 'bold',
    palette: { body: '#f3f6fb', accent: '#ff8f5a', shadow: '#7a8798' },
  },
  {
    id: 'blob',
    label: 'Blob',
    family: 'round-critters',
    defaultRarity: 'rare',
    vibe: 'Mystery mass with unstable but adorable posture.',
    trait: 'weird',
    palette: { body: '#7dd3fc', accent: '#38bdf8', shadow: '#14516a' },
  },
  {
    id: 'cat',
    label: 'Cat',
    family: 'upright-crews',
    defaultRarity: 'epic',
    vibe: 'Sharp-eyed reviewer with elegant disapproval.',
    trait: 'cool',
    palette: { body: '#9ca3af', accent: '#f9fafb', shadow: '#374151' },
  },
  {
    id: 'dragon',
    label: 'Dragon',
    family: 'mythic-sharp',
    defaultRarity: 'legendary',
    vibe: 'Terminal royalty with arcane uptime.',
    trait: 'mythic',
    palette: { body: '#34d399', accent: '#facc15', shadow: '#14532d' },
  },
  {
    id: 'octopus',
    label: 'Octopus',
    family: 'mythic-sharp',
    defaultRarity: 'rare',
    vibe: 'Eight-handed multitasker with suspiciously calm focus.',
    trait: 'adapt',
    palette: { body: '#c084fc', accent: '#f0abfc', shadow: '#581c87' },
  },
  {
    id: 'owl',
    label: 'Owl',
    family: 'mythic-sharp',
    defaultRarity: 'epic',
    vibe: 'Night-shift sage with zero patience for flaky tests.',
    trait: 'wise',
    palette: { body: '#b08968', accent: '#fbbf24', shadow: '#5b3716' },
  },
  {
    id: 'penguin',
    label: 'Penguin',
    family: 'round-critters',
    defaultRarity: 'uncommon',
    vibe: 'Cold-blooded release manager with polished slide timing.',
    trait: 'stable',
    palette: { body: '#111827', accent: '#f9fafb', shadow: '#000000' },
  },
  {
    id: 'turtle',
    label: 'Turtle',
    family: 'mythic-sharp',
    defaultRarity: 'rare',
    vibe: 'Slow pipeline guardian with rock-solid output.',
    trait: 'patient',
    palette: { body: '#84cc16', accent: '#bef264', shadow: '#3f6212' },
  },
  {
    id: 'snail',
    label: 'Snail',
    family: 'tall-strange',
    defaultRarity: 'common',
    vibe: 'Measured mover with a very serious shell backlog.',
    trait: 'steady',
    palette: { body: '#fb923c', accent: '#fdba74', shadow: '#9a3412' },
  },
  {
    id: 'ghost',
    label: 'Ghost',
    family: 'tall-strange',
    defaultRarity: 'legendary',
    vibe: 'Haunts race conditions and floats past blame.',
    trait: 'stealth',
    palette: { body: '#f8fafc', accent: '#7dd3fc', shadow: '#94a3b8' },
  },
  {
    id: 'axolotl',
    label: 'Axolotl',
    family: 'mythic-sharp',
    defaultRarity: 'rare',
    vibe: 'Friendly oddball with theatrical gill flourishes.',
    trait: 'cute',
    palette: { body: '#fda4af', accent: '#fb7185', shadow: '#881337' },
  },
  {
    id: 'capybara',
    label: 'Capybara',
    family: 'upright-crews',
    defaultRarity: 'epic',
    vibe: 'Production zen master with invincible calm.',
    trait: 'calm',
    palette: { body: '#c08457', accent: '#fed7aa', shadow: '#78350f' },
  },
  {
    id: 'cactus',
    label: 'Cactus',
    family: 'tall-strange',
    defaultRarity: 'uncommon',
    vibe: 'Prickly uptime specialist with a dry sense of humor.',
    trait: 'tough',
    palette: { body: '#4ade80', accent: '#bbf7d0', shadow: '#166534' },
  },
  {
    id: 'robot',
    label: 'Robot',
    family: 'upright-crews',
    defaultRarity: 'legendary',
    vibe: 'Hyper-precise executor with premium smugness.',
    trait: 'exact',
    palette: { body: '#94a3b8', accent: '#e2e8f0', shadow: '#334155' },
  },
  {
    id: 'rabbit',
    label: 'Rabbit',
    family: 'upright-crews',
    defaultRarity: 'rare',
    vibe: 'Fast hopper through regressions and fixes.',
    trait: 'fast',
    palette: { body: '#f5d0fe', accent: '#ffffff', shadow: '#86198f' },
  },
  {
    id: 'mushroom',
    label: 'Mushroom',
    family: 'tall-strange',
    defaultRarity: 'epic',
    vibe: 'Soft-glow forager with hidden boss energy.',
    trait: 'glow',
    palette: { body: '#ef4444', accent: '#fef3c7', shadow: '#7f1d1d' },
  },
  {
    id: 'chonk',
    label: 'Chonk',
    family: 'round-critters',
    defaultRarity: 'legendary',
    vibe: 'Maximum presence and unreasonable self-belief.',
    trait: 'heavy',
    palette: { body: '#f59e0b', accent: '#fde68a', shadow: '#92400e' },
  },
]

const rarities = [
  { id: 'common', label: 'common', stars: '★', chance: '60%', aura: ['#d9e3f0', '#7b8ba3'] },
  { id: 'uncommon', label: 'uncommon', stars: '★★', chance: '25%', aura: ['#9dfc7f', '#1d6f33'] },
  { id: 'rare', label: 'rare', stars: '★★★', chance: '10%', aura: ['#73b7ff', '#1d4ed8'] },
  { id: 'epic', label: 'epic', stars: '★★★★', chance: '4%', aura: ['#ff93d9', '#9d2fb5'] },
  { id: 'legendary', label: 'legendary', stars: '★★★★★', chance: '1%', aura: ['#ffd66e', '#ff8f1f'] },
]

const eyes = [
  { id: 'dot', label: 'dot', symbol: '·' },
  { id: 'spark', label: 'spark', symbol: '✦' },
  { id: 'cross', label: 'cross', symbol: '×' },
  { id: 'orb', label: 'orb', symbol: '◉' },
  { id: 'glow-dot', label: 'glow dot', symbol: '@' },
  { id: 'sleepy', label: 'sleepy', symbol: '°' },
]

const hats = [
  { id: 'none', label: 'none', symbol: '—' },
  { id: 'crown', label: 'crown', symbol: '👑' },
  { id: 'tophat', label: 'tophat', symbol: '🎩' },
  { id: 'propeller', label: 'propeller', symbol: '🧢' },
  { id: 'halo', label: 'halo', symbol: '😇' },
  { id: 'wizard', label: 'wizard', symbol: '🧙' },
  { id: 'beanie', label: 'beanie', symbol: '⛑' },
  { id: 'tinyduck', label: 'tinyduck', symbol: '🐤' },
]

export const buddyArtManifest = {
  species,
  rarities,
  eyes,
  hats,
  finishes: [{ id: 'standard', label: 'standard' }, { id: 'shiny', label: 'shiny' }],
}

export const speciesById = Object.fromEntries(species.map((item) => [item.id, item]))
export const rarityById = Object.fromEntries(rarities.map((item) => [item.id, item]))
export const eyeById = Object.fromEntries(eyes.map((item) => [item.id, item]))
export const hatById = Object.fromEntries(hats.map((item) => [item.id, item]))

export const defaultBuddyState = {
  species: 'dragon',
  rarity: 'legendary',
  eye: 'orb',
  hat: 'wizard',
  shiny: true,
}

export function normalizeBuddyState(partial = {}) {
  const state = { ...defaultBuddyState, ...partial }
  if (!speciesById[state.species]) state.species = defaultBuddyState.species
  if (!rarityById[state.rarity]) state.rarity = defaultBuddyState.rarity
  if (!eyeById[state.eye]) state.eye = defaultBuddyState.eye
  if (!hatById[state.hat]) state.hat = defaultBuddyState.hat
  state.shiny = !!state.shiny
  return state
}
