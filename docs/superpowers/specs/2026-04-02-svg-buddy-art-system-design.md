# SVG Buddy Art System Design

Date: 2026-04-02
Project: Pocket Buddy
Status: Approved for planning

## Goal

Replace the current emoji-based website preview and gallery with a unified SVG buddy art system that feels close to `spawnabuddy`: toy-like silhouettes, strong rarity presentation, soft glow, and lightweight idle animation.

The system must satisfy these hard requirements:

- all 18 species have their own visual identity and dedicated SVG art
- `hat`, `eyes`, and `shiny` are programmatic overlays, not hand-authored per-combination outputs
- the website preview builder and species gallery use the same renderer
- CLI terminology stays in sync with the website data model
- backward compatibility with the previous visual species system is out of scope

## User Decisions Captured

- Visual target: closely match the finish and presentation quality of `spawnabuddy`
- Delivery model: hybrid system, not static one-off art and not pure procedural geometry
- Animation: included in the first implementation, not deferred
- Species variation: large silhouette differences are preferred over heavily shared body templates
- Species roster: a full rewrite was allowed, but this design keeps the current 18 species slugs because the visual goal can be achieved without expanding copy and data churn
- CLI scope: CLI remains text-first, but species naming and rarity wording must come from the new shared data model
- Compatibility: no migration layer for old values

## Scope

In scope:

- website preview builder art
- website species gallery art
- shared species and trait manifest used by website and CLI copy
- layered SVG renderer for species, hat, eyes, rarity aura, and shiny effects
- lightweight idle animation for rendered buddies

Out of scope for this phase:

- README card generation
- social share cards
- exporting downloadable SVG files from the CLI
- migration support for legacy saved species values

## Core Model

The new system separates visual concerns into four independent axes:

1. `species`
The creature identity and base silhouette.

2. `rarity`
The rarity presentation layer: stars, aura, glow intensity, accent color, and card treatment.

3. `traits`
Programmatic overlays such as hats and eye styles.

4. `finish`
Special finishing effects. In v1 this means `shiny`, which remains independent from base rarity.

This replaces the current mixed model where species cards imply a baked-in rarity and `chonk` is treated like a `shiny` tier. After this redesign:

- there are exactly five base rarities: `common`, `uncommon`, `rare`, `epic`, `legendary`
- `shiny` is a boolean finish, not a sixth rarity tier
- every species can render at any rarity
- the gallery can still assign a curated default rarity per species card, but that is presentation data, not a rule of the art system

## Architecture

The SVG buddy art system is split into three layers.

### 1. Species Masters

Each of the 18 species gets a dedicated master definition:

- base body SVG fragments
- face-safe area definition
- hat anchor definition
- shiny mask bounds
- idle animation origin
- optional accessory motion zones such as ears, tails, horns, tentacles, or floating edges

These masters are hand-authored. They are not generated from a generic body template.

### 2. Trait Overlays

Traits are reusable SVG overlay definitions:

- hats: `none`, `crown`, `tophat`, `propeller`, `halo`, `wizard`, `beanie`, `tinyduck`
- eyes: one vector style per current eye trait
- shiny: sweep, edge highlight, sparkles, and pulse layers
- rarity aura: glow, edge foil, and backdrop accents per rarity

Trait overlays are rendered by the composition engine using species-provided anchor data and small family-level correction tables. No species-specific combination art is authored.

### 3. Renderer

A single renderer composes the final inline SVG for:

- builder preview stage
- builder avatar card
- gallery species cards

The renderer is site-first and buildless. It must work inside the current static `site/` structure without adding a framework or asset pipeline.

## Proposed File Layout

The implementation should keep the site static and browser-runnable:

```text
site/
  buddy-art/
    manifest.js
    renderer.js
    species.js
    overlays.js
    animation.js
```

Responsibilities:

- `manifest.js`: shared species, rarity, eye, hat, and finish metadata
- `species.js`: 18 master definitions and their anchor data
- `overlays.js`: reusable hat, eye, rarity aura, and shiny fragments
- `renderer.js`: SVG composition functions used by the website UI
- `animation.js`: reusable idle animation presets and helper timing values

This design intentionally keeps the art in JavaScript-exported SVG fragments instead of external SVG fetches. That avoids async asset loading complexity and keeps the static site deploy simple.

## Species Organization

The 18 species remain the current internal slugs but are visually re-authored into four families:

- `round critters`: `duck`, `blob`, `penguin`, `chonk`
- `upright mammals and synthetic`: `cat`, `rabbit`, `capybara`, `robot`
- `tall and strange forms`: `goose`, `cactus`, `mushroom`, `ghost`, `snail`
- `mythic and sharp forms`: `dragon`, `owl`, `octopus`, `turtle`, `axolotl`

This family grouping is for asset production and anchor tuning only. It does not mean species share the same body template. The desired result is:

- obvious silhouette separation at a glance
- one coherent universe of shape language
- enough anchor consistency that hats and eyes can still be applied by code

## Visual Language

The art direction should follow these rules:

- rounded, collectible, slightly overbuilt toy proportions
- clear head/body read from a medium-small card size
- strong contour readability before internal detail
- low-detail faces with expressive eye overlays
- soft gradients, controlled highlights, and restrained texture
- rarity color and glow should frame the species, not repaint the species body itself

The renderer should aim closer to a premium collectible card feel than to retro pixel-art or plain mascot illustration.

## Layering Rules

Render order is fixed:

1. `rarity aura`
2. `species back accents and shadow`
3. `species body`
4. `species face details`
5. `eyes overlay`
6. `hat overlay`
7. `shiny fx`
8. `foreground sparkles`

This order is mandatory for all render targets so the preview and gallery stay visually consistent.

## Anchor Contract

Every species master must expose the same anchor schema:

- `headAnchor`: primary hat attachment point
- `headScale`: default scale reference for hats
- `eyeLeft`
- `eyeRight`
- `bodyBounds`: clipping and effect bounds for shiny and glow overlays
- `floatOrigin`: transform origin for idle movement
- `family`: family identifier for correction tables

Optional anchors may exist for species-specific motion zones, but the standard anchors above are required for every species.

If a species cannot satisfy the standard schema cleanly, the species art is considered invalid and must be redesigned rather than patched ad hoc.

## Animation Model

The first version includes lightweight motion, not full character animation.

Required motion behaviors:

- body float: gentle vertical drift
- body breathe: subtle scale change
- appendage motion where applicable: ears, tails, horns, tentacles, or edges
- hat follow-through: slight lag relative to the body
- rarity pulse: low-frequency aura breathing
- shiny pulse: occasional sweep and spark activity

Constraints:

- animation must be CSS/SVG friendly and run without a canvas pipeline
- motion must remain readable on the current static site
- the idle loop should feel alive but not distracting
- all motion should degrade gracefully if animation is disabled

## Data Synchronization With CLI

The CLI will not render SVG, but it must stop owning species and rarity display text separately from the site.

The shared manifest becomes the source of truth for:

- species slugs and display names
- rarity names and star strings
- hat names
- eye labels
- shiny labeling

The CLI keeps ASCII output, but its labels and terminology should come from the same data layer used by the website.

## Failure Handling

This system should fail early during development:

- missing species anchors are validation failures
- missing overlay definitions are validation failures
- invalid rarity or trait values should fall back to a known-safe default only in the runtime UI, never silently in tests

The browser renderer may display a minimal fallback buddy for invalid runtime state, but the test suite should treat missing art contracts as hard failures.

## Testing Strategy

The implementation plan should include automated checks for:

- manifest completeness across all 18 species
- required anchor presence per species
- render coverage for every species with at least one non-default hat, eye style, and shiny state
- rarity rendering coverage for all five rarities
- snapshot-style verification of composed SVG output strings
- site integration checks confirming the builder and gallery both use the shared renderer

Visual correctness should be validated through deterministic SVG output rather than screenshot testing in the first pass.

## Rollout Notes

The redesign replaces the current emoji presentation on the website. The existing site builder structure can stay, but these parts are expected to change:

- hero featured buddies should use SVG render output, not emoji blocks
- preview stage and avatar should use the shared renderer
- species gallery cards should use the shared renderer
- species default rarity on gallery cards becomes curated display metadata instead of fixed species truth

The CLI remains operational throughout; only its display copy source changes.

## Summary

Pocket Buddy will gain a single, reusable SVG buddy art system with:

- 18 dedicated species masters
- code-driven `hat`, `eyes`, `rarity`, and `shiny` overlays
- first-pass idle animation
- a shared manifest for website and CLI naming
- no compatibility layer for the previous visual species model

This is the smallest design that can realistically achieve the requested visual quality without creating a hand-authored combination explosion.
