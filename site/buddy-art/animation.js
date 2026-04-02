const familyPresets = {
  'round-critters': { floatY: 5, floatDuration: 4.6, breatheX: 0.98, breatheY: 1.02 },
  'upright-crews': { floatY: 4, floatDuration: 4.2, breatheX: 0.985, breatheY: 1.018 },
  'tall-strange': { floatY: 6, floatDuration: 5.1, breatheX: 0.99, breatheY: 1.015 },
  'mythic-sharp': { floatY: 5, floatDuration: 4.9, breatheX: 0.985, breatheY: 1.02 },
}

export function getAnimationPreset(family) {
  return familyPresets[family] || familyPresets['round-critters']
}

export function motionStyle(master) {
  const preset = getAnimationPreset(master.family)
  return [
    `--buddy-float-y:${preset.floatY}px`,
    `--buddy-float-duration:${preset.floatDuration}s`,
    `--buddy-breathe-x:${preset.breatheX}`,
    `--buddy-breathe-y:${preset.breatheY}`,
    `transform-origin:${master.floatOrigin.x}px ${master.floatOrigin.y}px`,
  ].join(';')
}
