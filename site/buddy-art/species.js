import { speciesById } from './manifest.js'

function bodyGroup(content) {
  return `<g class="species-shell">${content}</g>`
}

function makeMaster(config) {
  const species = speciesById[config.id]
  return {
    id: config.id,
    family: config.family,
    viewBox: '0 0 240 240',
    headAnchor: config.headAnchor,
    headScale: config.headScale ?? 1,
    eyeLeft: config.eyeLeft,
    eyeRight: config.eyeRight,
    bodyBounds: config.bodyBounds,
    floatOrigin: config.floatOrigin,
    renderBody() {
      const palette = species.palette
      return bodyGroup(config.template(palette))
    },
  }
}

export const speciesMasters = [
  makeMaster({
    id: 'duck',
    family: 'round-critters',
    headAnchor: { x: 120, y: 46 },
    eyeLeft: { x: 105, y: 86 },
    eyeRight: { x: 135, y: 86 },
    bodyBounds: { x: 42, y: 34, width: 156, height: 166, rx: 74 },
    floatOrigin: { x: 120, y: 118 },
    template: (p) => `
      <ellipse cx="120" cy="142" rx="70" ry="52" fill="${p.body}" />
      <circle cx="118" cy="88" r="40" fill="${p.body}" />
      <ellipse cx="150" cy="100" rx="28" ry="20" fill="${p.accent}" />
      <ellipse cx="119" cy="138" rx="46" ry="30" fill="#ffffff" opacity="0.22" />
      <ellipse cx="165" cy="102" rx="18" ry="10" fill="#f97316" />
    `,
  }),
  makeMaster({
    id: 'goose',
    family: 'tall-strange',
    headAnchor: { x: 132, y: 34 },
    eyeLeft: { x: 122, y: 78 },
    eyeRight: { x: 140, y: 78 },
    bodyBounds: { x: 58, y: 32, width: 126, height: 172, rx: 56 },
    floatOrigin: { x: 122, y: 110 },
    template: (p) => `
      <ellipse cx="112" cy="148" rx="52" ry="42" fill="${p.body}" />
      <path d="M116 120 C112 92 118 64 132 42 C139 31 151 31 157 42 C147 57 142 86 143 120 Z" fill="${p.body}" />
      <circle cx="146" cy="72" r="26" fill="${p.body}" />
      <ellipse cx="167" cy="84" rx="18" ry="10" fill="${p.accent}" />
      <rect x="104" y="178" width="8" height="26" rx="4" fill="${p.shadow}" />
      <rect x="130" y="178" width="8" height="26" rx="4" fill="${p.shadow}" />
    `,
  }),
  makeMaster({
    id: 'blob',
    family: 'round-critters',
    headAnchor: { x: 120, y: 42 },
    eyeLeft: { x: 102, y: 92 },
    eyeRight: { x: 138, y: 92 },
    bodyBounds: { x: 46, y: 40, width: 148, height: 158, rx: 72 },
    floatOrigin: { x: 120, y: 122 },
    template: (p) => `
      <path d="M60 120 C60 70 89 46 123 46 C158 46 186 74 184 118 C182 158 163 192 122 192 C80 192 58 161 60 120 Z" fill="${p.body}" />
      <path d="M90 62 C105 51 136 51 154 70" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.24" />
      <circle cx="90" cy="166" r="8" fill="${p.accent}" opacity="0.65" />
      <circle cx="156" cy="166" r="8" fill="${p.accent}" opacity="0.65" />
    `,
  }),
  makeMaster({
    id: 'cat',
    family: 'upright-crews',
    headAnchor: { x: 120, y: 40 },
    eyeLeft: { x: 102, y: 82 },
    eyeRight: { x: 138, y: 82 },
    bodyBounds: { x: 52, y: 30, width: 136, height: 176, rx: 64 },
    floatOrigin: { x: 120, y: 118 },
    template: (p) => `
      <path d="M78 61 L94 30 L112 62 Z" fill="${p.body}" />
      <path d="M162 61 L146 30 L128 62 Z" fill="${p.body}" />
      <circle cx="120" cy="86" r="42" fill="${p.body}" />
      <rect x="74" y="120" width="92" height="64" rx="30" fill="${p.body}" />
      <path d="M164 138 C188 146 189 182 164 188" stroke="${p.shadow}" stroke-width="12" stroke-linecap="round" fill="none" />
      <ellipse cx="120" cy="128" rx="34" ry="24" fill="#ffffff" opacity="0.16" />
    `,
  }),
  makeMaster({
    id: 'dragon',
    family: 'mythic-sharp',
    headAnchor: { x: 120, y: 38 },
    eyeLeft: { x: 102, y: 86 },
    eyeRight: { x: 138, y: 86 },
    bodyBounds: { x: 38, y: 30, width: 164, height: 182, rx: 72 },
    floatOrigin: { x: 120, y: 116 },
    template: (p) => `
      <path d="M72 58 L86 28 L104 60 Z" fill="${p.accent}" />
      <path d="M168 58 L154 28 L136 60 Z" fill="${p.accent}" />
      <circle cx="120" cy="88" r="44" fill="${p.body}" />
      <path d="M68 130 C80 108 94 106 102 128 L88 160 L62 156 Z" fill="${p.accent}" opacity="0.8" />
      <path d="M172 130 C160 108 146 106 138 128 L152 160 L178 156 Z" fill="${p.accent}" opacity="0.8" />
      <rect x="78" y="118" width="84" height="62" rx="30" fill="${p.body}" />
      <path d="M156 166 C184 170 186 192 166 200" stroke="${p.shadow}" stroke-width="12" stroke-linecap="round" fill="none" />
    `,
  }),
  makeMaster({
    id: 'octopus',
    family: 'mythic-sharp',
    headAnchor: { x: 120, y: 42 },
    eyeLeft: { x: 104, y: 90 },
    eyeRight: { x: 136, y: 90 },
    bodyBounds: { x: 36, y: 40, width: 168, height: 168, rx: 72 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <circle cx="120" cy="94" r="44" fill="${p.body}" />
      <path d="M72 136 C54 146 50 162 56 176" stroke="${p.body}" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M96 142 C82 152 78 170 84 182" stroke="${p.body}" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M120 146 C120 160 116 176 108 186" stroke="${p.body}" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M144 142 C158 152 162 170 156 182" stroke="${p.body}" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M168 136 C186 146 190 162 184 176" stroke="${p.body}" stroke-width="16" stroke-linecap="round" fill="none" />
      <ellipse cx="120" cy="120" rx="26" ry="16" fill="#ffffff" opacity="0.18" />
    `,
  }),
  makeMaster({
    id: 'owl',
    family: 'mythic-sharp',
    headAnchor: { x: 120, y: 34 },
    eyeLeft: { x: 102, y: 84 },
    eyeRight: { x: 138, y: 84 },
    bodyBounds: { x: 50, y: 28, width: 140, height: 180, rx: 64 },
    floatOrigin: { x: 120, y: 118 },
    template: (p) => `
      <path d="M84 56 L96 28 L108 58 Z" fill="${p.shadow}" />
      <path d="M156 56 L144 28 L132 58 Z" fill="${p.shadow}" />
      <circle cx="120" cy="88" r="44" fill="${p.body}" />
      <path d="M76 128 C92 106 104 104 120 128" fill="${p.accent}" opacity="0.82" />
      <path d="M164 128 C148 106 136 104 120 128" fill="${p.accent}" opacity="0.82" />
      <ellipse cx="120" cy="146" rx="44" ry="42" fill="${p.body}" />
      <polygon points="120,106 108,120 132,120" fill="#f59e0b" />
    `,
  }),
  makeMaster({
    id: 'penguin',
    family: 'round-critters',
    headAnchor: { x: 120, y: 42 },
    eyeLeft: { x: 104, y: 88 },
    eyeRight: { x: 136, y: 88 },
    bodyBounds: { x: 50, y: 34, width: 140, height: 172, rx: 66 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <ellipse cx="120" cy="140" rx="60" ry="60" fill="${p.body}" />
      <circle cx="120" cy="88" r="40" fill="${p.body}" />
      <ellipse cx="120" cy="126" rx="42" ry="54" fill="${p.accent}" />
      <polygon points="120,108 106,116 120,124 134,116" fill="#f59e0b" />
      <ellipse cx="74" cy="128" rx="12" ry="30" fill="${p.body}" />
      <ellipse cx="166" cy="128" rx="12" ry="30" fill="${p.body}" />
    `,
  }),
  makeMaster({
    id: 'turtle',
    family: 'mythic-sharp',
    headAnchor: { x: 120, y: 54 },
    eyeLeft: { x: 103, y: 96 },
    eyeRight: { x: 137, y: 96 },
    bodyBounds: { x: 42, y: 48, width: 156, height: 150, rx: 72 },
    floatOrigin: { x: 120, y: 126 },
    template: (p) => `
      <ellipse cx="120" cy="132" rx="70" ry="52" fill="${p.shadow}" />
      <ellipse cx="120" cy="132" rx="58" ry="44" fill="${p.body}" />
      <circle cx="120" cy="92" r="36" fill="${p.body}" />
      <circle cx="78" cy="154" r="16" fill="${p.body}" />
      <circle cx="162" cy="154" r="16" fill="${p.body}" />
      <circle cx="84" cy="116" r="12" fill="${p.body}" />
      <circle cx="156" cy="116" r="12" fill="${p.body}" />
      <path d="M96 126 H144 M120 104 V160" stroke="${p.accent}" stroke-width="10" stroke-linecap="round" opacity="0.45" />
    `,
  }),
  makeMaster({
    id: 'snail',
    family: 'tall-strange',
    headAnchor: { x: 116, y: 34 },
    eyeLeft: { x: 104, y: 84 },
    eyeRight: { x: 128, y: 84 },
    bodyBounds: { x: 46, y: 46, width: 148, height: 156, rx: 66 },
    floatOrigin: { x: 120, y: 124 },
    template: (p) => `
      <path d="M70 148 C70 110 96 96 132 96 C162 96 182 116 182 148 C182 166 166 180 146 180 H96 C82 180 70 168 70 148 Z" fill="${p.body}" />
      <circle cx="96" cy="112" r="36" fill="${p.accent}" />
      <circle cx="96" cy="112" r="22" fill="${p.body}" opacity="0.35" />
      <path d="M126 92 C126 68 134 52 142 38" stroke="${p.body}" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M102 90 C102 66 94 50 84 38" stroke="${p.body}" stroke-width="8" stroke-linecap="round" fill="none" />
      <circle cx="142" cy="36" r="8" fill="${p.accent}" />
      <circle cx="84" cy="36" r="8" fill="${p.accent}" />
    `,
  }),
  makeMaster({
    id: 'ghost',
    family: 'tall-strange',
    headAnchor: { x: 120, y: 38 },
    eyeLeft: { x: 104, y: 88 },
    eyeRight: { x: 136, y: 88 },
    bodyBounds: { x: 50, y: 36, width: 140, height: 170, rx: 64 },
    floatOrigin: { x: 120, y: 118 },
    template: (p) => `
      <path d="M120 46 C156 46 182 76 182 114 V188 L164 176 L148 190 L132 174 L120 190 L106 174 L90 188 L74 176 L58 188 V114 C58 76 84 46 120 46 Z" fill="${p.body}" />
      <path d="M88 64 C104 52 136 52 152 64" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" opacity="0.32" />
      <ellipse cx="120" cy="146" rx="46" ry="34" fill="${p.accent}" opacity="0.16" />
    `,
  }),
  makeMaster({
    id: 'axolotl',
    family: 'mythic-sharp',
    headAnchor: { x: 120, y: 42 },
    eyeLeft: { x: 102, y: 88 },
    eyeRight: { x: 138, y: 88 },
    bodyBounds: { x: 44, y: 40, width: 152, height: 164, rx: 70 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <circle cx="120" cy="90" r="42" fill="${p.body}" />
      <path d="M90 84 L62 62 L82 92 Z" fill="${p.accent}" />
      <path d="M90 102 L56 102 L82 110 Z" fill="${p.accent}" />
      <path d="M150 84 L178 62 L158 92 Z" fill="${p.accent}" />
      <path d="M150 102 L184 102 L158 110 Z" fill="${p.accent}" />
      <ellipse cx="120" cy="146" rx="56" ry="38" fill="${p.body}" />
      <path d="M164 150 C184 156 188 176 176 188" stroke="${p.shadow}" stroke-width="10" stroke-linecap="round" fill="none" />
    `,
  }),
  makeMaster({
    id: 'capybara',
    family: 'upright-crews',
    headAnchor: { x: 120, y: 40 },
    eyeLeft: { x: 104, y: 86 },
    eyeRight: { x: 138, y: 86 },
    bodyBounds: { x: 48, y: 36, width: 144, height: 170, rx: 68 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <rect x="72" y="48" width="96" height="70" rx="34" fill="${p.body}" />
      <rect x="60" y="110" width="108" height="64" rx="30" fill="${p.body}" />
      <ellipse cx="88" cy="68" rx="10" ry="12" fill="${p.shadow}" />
      <ellipse cx="152" cy="68" rx="10" ry="12" fill="${p.shadow}" />
      <ellipse cx="120" cy="132" rx="38" ry="24" fill="#ffffff" opacity="0.14" />
    `,
  }),
  makeMaster({
    id: 'cactus',
    family: 'tall-strange',
    headAnchor: { x: 120, y: 30 },
    eyeLeft: { x: 104, y: 88 },
    eyeRight: { x: 136, y: 88 },
    bodyBounds: { x: 62, y: 28, width: 116, height: 176, rx: 40 },
    floatOrigin: { x: 120, y: 116 },
    template: (p) => `
      <rect x="88" y="42" width="64" height="142" rx="30" fill="${p.body}" />
      <rect x="60" y="88" width="28" height="58" rx="14" fill="${p.body}" />
      <rect x="152" y="74" width="28" height="52" rx="14" fill="${p.body}" />
      <path d="M84 58 L72 48 M164 58 L176 48 M76 96 L62 102 M174 92 L186 98 M106 176 L96 192 M134 176 L144 192" stroke="${p.accent}" stroke-width="6" stroke-linecap="round" />
      <ellipse cx="120" cy="78" rx="20" ry="10" fill="#ffffff" opacity="0.1" />
    `,
  }),
  makeMaster({
    id: 'robot',
    family: 'upright-crews',
    headAnchor: { x: 120, y: 34 },
    eyeLeft: { x: 104, y: 86 },
    eyeRight: { x: 136, y: 86 },
    bodyBounds: { x: 50, y: 30, width: 140, height: 178, rx: 28 },
    floatOrigin: { x: 120, y: 118 },
    template: (p) => `
      <rect x="76" y="48" width="88" height="68" rx="18" fill="${p.body}" />
      <rect x="66" y="118" width="108" height="60" rx="18" fill="${p.body}" />
      <rect x="114" y="28" width="12" height="20" rx="6" fill="${p.accent}" />
      <circle cx="120" cy="24" r="10" fill="${p.accent}" />
      <rect x="84" y="132" width="72" height="18" rx="9" fill="${p.accent}" opacity="0.28" />
      <rect x="82" y="178" width="12" height="22" rx="6" fill="${p.shadow}" />
      <rect x="146" y="178" width="12" height="22" rx="6" fill="${p.shadow}" />
    `,
  }),
  makeMaster({
    id: 'rabbit',
    family: 'upright-crews',
    headAnchor: { x: 120, y: 24 },
    eyeLeft: { x: 104, y: 82 },
    eyeRight: { x: 136, y: 82 },
    bodyBounds: { x: 50, y: 20, width: 140, height: 184, rx: 64 },
    floatOrigin: { x: 120, y: 116 },
    template: (p) => `
      <rect x="90" y="20" width="20" height="52" rx="10" fill="${p.body}" />
      <rect x="130" y="20" width="20" height="52" rx="10" fill="${p.body}" />
      <circle cx="120" cy="86" r="42" fill="${p.body}" />
      <ellipse cx="120" cy="146" rx="52" ry="40" fill="${p.body}" />
      <circle cx="92" cy="166" r="12" fill="#ffffff" opacity="0.18" />
      <circle cx="148" cy="166" r="12" fill="#ffffff" opacity="0.18" />
    `,
  }),
  makeMaster({
    id: 'mushroom',
    family: 'tall-strange',
    headAnchor: { x: 120, y: 20 },
    eyeLeft: { x: 104, y: 98 },
    eyeRight: { x: 136, y: 98 },
    bodyBounds: { x: 46, y: 18, width: 148, height: 186, rx: 70 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <ellipse cx="120" cy="74" rx="74" ry="46" fill="${p.body}" />
      <rect x="88" y="92" width="64" height="86" rx="28" fill="#f5e7cf" />
      <circle cx="86" cy="68" r="10" fill="${p.accent}" />
      <circle cx="120" cy="52" r="12" fill="${p.accent}" />
      <circle cx="154" cy="68" r="10" fill="${p.accent}" />
      <ellipse cx="120" cy="128" rx="18" ry="22" fill="#ffffff" opacity="0.16" />
    `,
  }),
  makeMaster({
    id: 'chonk',
    family: 'round-critters',
    headAnchor: { x: 120, y: 36 },
    eyeLeft: { x: 104, y: 82 },
    eyeRight: { x: 136, y: 82 },
    bodyBounds: { x: 32, y: 30, width: 176, height: 176, rx: 82 },
    floatOrigin: { x: 120, y: 120 },
    template: (p) => `
      <path d="M78 58 L92 30 L106 60 Z" fill="${p.body}" />
      <path d="M162 58 L148 30 L134 60 Z" fill="${p.body}" />
      <circle cx="120" cy="86" r="42" fill="${p.body}" />
      <ellipse cx="120" cy="148" rx="78" ry="56" fill="${p.body}" />
      <ellipse cx="120" cy="144" rx="54" ry="34" fill="#ffffff" opacity="0.14" />
      <path d="M168 150 C194 156 196 188 170 194" stroke="${p.shadow}" stroke-width="12" stroke-linecap="round" fill="none" />
    `,
  }),
]

export const speciesMasterById = Object.fromEntries(speciesMasters.map((item) => [item.id, item]))

export function getSpeciesMaster(id) {
  return speciesMasterById[id] || speciesMasterById.dragon
}
