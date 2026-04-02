function withTranslate(x, y, scale, content, className = '') {
  return `<g class="${className}" transform="translate(${x} ${y}) scale(${scale})">${content}</g>`
}

export const hatOverlays = {
  none: () => '',
  crown: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<path d="M-26 4 L-18 -22 L0 -6 L18 -22 L26 4 L18 16 H-18 Z" fill="#facc15" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round" />',
    'overlay-hat overlay-hat-crown',
  ),
  tophat: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<ellipse cx="0" cy="10" rx="34" ry="8" fill="#0f172a" /><rect x="-20" y="-28" width="40" height="40" rx="6" fill="#111827" /><rect x="-20" y="-12" width="40" height="8" fill="#e11d48" />',
    'overlay-hat overlay-hat-tophat',
  ),
  propeller: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<ellipse cx="0" cy="4" rx="26" ry="14" fill="#60a5fa" /><path d="M0 -8 V-20" stroke="#0f172a" stroke-width="4" stroke-linecap="round" /><path d="M0 -20 C-18 -24 -22 -36 0 -30 C22 -36 18 -24 0 -20 Z" fill="#f87171" />',
    'overlay-hat overlay-hat-propeller',
  ),
  halo: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<ellipse cx="0" cy="-18" rx="30" ry="10" fill="none" stroke="#fde68a" stroke-width="6" /><ellipse cx="0" cy="-18" rx="40" ry="14" fill="#fde68a" opacity="0.18" />',
    'overlay-hat overlay-hat-halo',
  ),
  wizard: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<path d="M0 -48 L-28 10 H28 Z" fill="#4338ca" /><rect x="-22" y="6" width="44" height="8" rx="4" fill="#facc15" /><ellipse cx="0" cy="12" rx="40" ry="8" fill="#312e81" />',
    'overlay-hat overlay-hat-wizard',
  ),
  beanie: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<path d="M-30 8 C-30 -18 30 -18 30 8 Z" fill="#ef4444" /><rect x="-34" y="4" width="68" height="14" rx="7" fill="#fca5a5" /><circle cx="0" cy="-18" r="8" fill="#fee2e2" />',
    'overlay-hat overlay-hat-beanie',
  ),
  tinyduck: ({ x, y }, scale = 1) => withTranslate(
    x,
    y,
    scale,
    '<g transform="translate(0 -8)"><circle cx="0" cy="0" r="18" fill="#f6c343" /><ellipse cx="12" cy="3" rx="10" ry="6" fill="#f28c28" /><circle cx="-8" cy="-4" r="2.5" fill="#0f172a" /></g>',
    'overlay-hat overlay-hat-tinyduck',
  ),
}

export const eyeOverlays = {
  dot: (left, right) => `
    <circle cx="${left.x}" cy="${left.y}" r="4" fill="#0f172a" />
    <circle cx="${right.x}" cy="${right.y}" r="4" fill="#0f172a" />
  `,
  spark: (left, right) => `
    <path d="M${left.x} ${left.y - 7} L${left.x + 3} ${left.y - 1} L${left.x + 9} ${left.y} L${left.x + 3} ${left.y + 1} L${left.x} ${left.y + 7} L${left.x - 3} ${left.y + 1} L${left.x - 9} ${left.y} L${left.x - 3} ${left.y - 1} Z" fill="#ffffff" />
    <path d="M${right.x} ${right.y - 7} L${right.x + 3} ${right.y - 1} L${right.x + 9} ${right.y} L${right.x + 3} ${right.y + 1} L${right.x} ${right.y + 7} L${right.x - 3} ${right.y + 1} L${right.x - 9} ${right.y} L${right.x - 3} ${right.y - 1} Z" fill="#ffffff" />
  `,
  cross: (left, right) => `
    <path d="M${left.x - 6} ${left.y - 6} L${left.x + 6} ${left.y + 6} M${left.x + 6} ${left.y - 6} L${left.x - 6} ${left.y + 6}" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
    <path d="M${right.x - 6} ${right.y - 6} L${right.x + 6} ${right.y + 6} M${right.x + 6} ${right.y - 6} L${right.x - 6} ${right.y + 6}" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
  `,
  orb: (left, right) => `
    <circle cx="${left.x}" cy="${left.y}" r="8" fill="#f8fafc" />
    <circle cx="${left.x}" cy="${left.y}" r="4" fill="#0f172a" />
    <circle cx="${right.x}" cy="${right.y}" r="8" fill="#f8fafc" />
    <circle cx="${right.x}" cy="${right.y}" r="4" fill="#0f172a" />
  `,
  'glow-dot': (left, right) => `
    <circle cx="${left.x}" cy="${left.y}" r="10" fill="#38bdf8" opacity="0.28" />
    <circle cx="${left.x}" cy="${left.y}" r="5" fill="#0f172a" />
    <circle cx="${right.x}" cy="${right.y}" r="10" fill="#38bdf8" opacity="0.28" />
    <circle cx="${right.x}" cy="${right.y}" r="5" fill="#0f172a" />
  `,
  sleepy: (left, right) => `
    <path d="M${left.x - 8} ${left.y + 2} Q${left.x} ${left.y - 5} ${left.x + 8} ${left.y + 2}" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M${right.x - 8} ${right.y + 2} Q${right.x} ${right.y - 5} ${right.x + 8} ${right.y + 2}" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none" />
  `,
}

export const rarityAuras = {
  common: (bounds) => `
    <rect x="${bounds.x - 10}" y="${bounds.y - 10}" width="${bounds.width + 20}" height="${bounds.height + 20}" rx="${bounds.rx + 12}" fill="#d9e3f0" opacity="0.08" />
  `,
  uncommon: (bounds) => `
    <rect x="${bounds.x - 12}" y="${bounds.y - 12}" width="${bounds.width + 24}" height="${bounds.height + 24}" rx="${bounds.rx + 14}" fill="#9dfc7f" opacity="0.12" />
    <rect x="${bounds.x - 6}" y="${bounds.y - 6}" width="${bounds.width + 12}" height="${bounds.height + 12}" rx="${bounds.rx + 8}" fill="none" stroke="#9dfc7f" stroke-width="4" opacity="0.28" />
  `,
  rare: (bounds) => `
    <rect x="${bounds.x - 14}" y="${bounds.y - 14}" width="${bounds.width + 28}" height="${bounds.height + 28}" rx="${bounds.rx + 16}" fill="#73b7ff" opacity="0.14" />
    <rect x="${bounds.x - 6}" y="${bounds.y - 6}" width="${bounds.width + 12}" height="${bounds.height + 12}" rx="${bounds.rx + 8}" fill="none" stroke="#73b7ff" stroke-width="5" opacity="0.3" />
  `,
  epic: (bounds) => `
    <rect x="${bounds.x - 16}" y="${bounds.y - 16}" width="${bounds.width + 32}" height="${bounds.height + 32}" rx="${bounds.rx + 18}" fill="#ff93d9" opacity="0.16" />
    <rect x="${bounds.x - 8}" y="${bounds.y - 8}" width="${bounds.width + 16}" height="${bounds.height + 16}" rx="${bounds.rx + 10}" fill="none" stroke="#ff93d9" stroke-width="5" opacity="0.34" />
  `,
  legendary: (bounds) => `
    <rect x="${bounds.x - 18}" y="${bounds.y - 18}" width="${bounds.width + 36}" height="${bounds.height + 36}" rx="${bounds.rx + 20}" fill="#ffd66e" opacity="0.18" />
    <rect x="${bounds.x - 8}" y="${bounds.y - 8}" width="${bounds.width + 16}" height="${bounds.height + 16}" rx="${bounds.rx + 10}" fill="none" stroke="#ffd66e" stroke-width="6" opacity="0.38" />
  `,
}

export function shinyOverlay(bounds, gradientId = 'buddy-shiny-sheen') {
  return `
    <g class="overlay-shiny">
      <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="${bounds.rx}" fill="url(#${gradientId})" opacity="0.22" />
      <path d="M${bounds.x + bounds.width * 0.2} ${bounds.y + bounds.height * 0.15} L${bounds.x + bounds.width * 0.32} ${bounds.y + bounds.height * 0.28} L${bounds.x + bounds.width * 0.48} ${bounds.y + bounds.height * 0.12}" stroke="#e0fbff" stroke-width="6" stroke-linecap="round" />
      <circle cx="${bounds.x + bounds.width * 0.76}" cy="${bounds.y + bounds.height * 0.24}" r="5" fill="#f8fdff" />
      <circle cx="${bounds.x + bounds.width * 0.84}" cy="${bounds.y + bounds.height * 0.38}" r="3" fill="#f8fdff" opacity="0.8" />
    </g>
  `
}
