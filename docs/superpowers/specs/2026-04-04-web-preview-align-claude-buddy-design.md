# Web Preview Align Claude Buddy Design

Date: 2026-04-04
Project: Pocket Buddy
Status: Drafted for review

## Goal

Make the website builder preview match the final Claude Code buddy result much more closely.

The current site preview is split into three separate presentation layers:

- a decorative stage
- a website-specific avatar card
- a CLI text block

That structure produces a result that feels like a marketing mockup instead of the actual buddy result a user expects after applying a build. The redesign should keep the SVG buddy renderer, but the preview surface must read as one unified result instead of a web-only composition.

## User Decision Captured

- The alignment target is not only the terminal `<pre>` output.
- The entire preview area, including the current stage and avatar card, should move toward Claude Code's final buddy presentation language.
- Keeping the current website-specific avatar/stage composition is not acceptable.

## Scope

In scope:

- preview area markup in `site/index.html`
- preview styling in `site/styles.css`
- preview composition logic in `site/script.js`
- shared result formatting helpers exported from `buddy-reroll.mjs`
- tests that lock the preview structure and shared formatter usage

Out of scope:

- changes to the CLI search/apply flow
- changes to buddy generation rules
- replacing the SVG art system itself
- gallery card redesign outside the preview builder section

## Problem Summary

The website currently renders the preview through two different systems:

1. a custom web-only visual card stack with stage, avatar, stars, traits, and meta copy
2. a manually assembled CLI text block that resembles the terminal card but is not generated from the same helper

This creates two consistency failures:

- the visual hierarchy does not resemble the final Claude Code buddy result
- the text preview can drift from the actual CLI formatter because it is assembled independently

## Design

The builder preview should become a single result surface with two tightly related layers:

1. `companion display`
This is the visual focal point. It uses the existing SVG renderer, but only once, inside a simplified result container that reads like the buddy itself rather than a marketing stage. The container may keep lightweight framing and rarity treatment, but it must remove the current separate stage and profile card split.

2. `terminal transcript`
This is the canonical CLI-style text output. It must be generated from the same formatter helper used by the CLI, not manually rebuilt inside the site script.

The overall outcome should feel like: "this is the same buddy result, shown visually above and textually below," not "this page has an art card plus a separate preview."

## Structural Changes

### 1. Replace the current dual visual stack

Remove the following preview-specific UI concepts from the builder result area:

- separate stage backdrop layer
- separate avatar card with duplicated metadata
- trait pill list under the avatar
- web-only stars/meta rows that duplicate terminal information

Replace them with one result card that contains:

- a single SVG buddy render
- one compact identity line
- one compact state line for rarity and shiny state when needed

This keeps the preview visual, but eliminates the second design language that currently competes with the CLI card.

### 2. Share the CLI formatter

The site should not hand-build the `<pre>` text anymore. `buddy-reroll.mjs` already owns the terminal result framing through `formatBuddyCard()`. That function should become the single source of truth for the terminal-style preview.

The web layer may still choose whether to include ANSI colors or not, but the line content, ordering, and wording should come from the shared helper.

### 3. Share preview-ready data

The site currently computes seed text and stats locally. The redesign should move toward one shared preview payload shape so the visual layer and terminal layer read from the same normalized values:

- `species`
- `rarity`
- `eye`
- `hat`
- `shiny`
- `stats`
- `seedLabel`

This can be implemented either by extending an existing helper in `buddy-reroll.mjs` or by introducing a small exported helper that returns preview-ready result data for both environments.

## Data Flow

The preview flow should become:

1. normalize the current builder state
2. derive shared preview data from that state
3. render the single visual companion surface from that shared data
4. render the terminal transcript from the shared formatter using the same data

The website should stop owning independent wording for:

- rarity display lines
- seed lines
- trait summary lines
- result card ordering

## Styling Direction

The new result surface should feel closer to a companion reveal than to a promo card. That means:

- calmer background treatment
- less ornamental chrome
- stronger focus on the buddy itself
- monospace and terminal framing reserved for the transcript area
- rarity treatment expressed through border/glow emphasis rather than extra metadata widgets

The SVG buddy art remains valuable and should stay visible, but it should be framed as the buddy result, not as a separate hero illustration.

## Testing Strategy

The implementation should add or update tests that verify:

- the site preview uses a shared CLI formatter instead of manually composing result lines
- the preview DOM no longer depends on the old stage/avatar split
- the site still mounts the SVG render target for the preview
- the shared preview helper returns stable fields required by both the visual and terminal layers

## Risks

### Module boundary risk

`buddy-reroll.mjs` is a CLI entry file. Exporting more presentation helpers from it is acceptable for this repo size, but the implementation should keep the added surface small and presentation-focused so the site does not become coupled to interactive CLI behavior.

### Styling regression risk

The current preview section is visually dense. Simplifying it may initially feel less flashy. That is acceptable because the target is fidelity to the real buddy result, not maximal decoration.

### Drift risk

If the site keeps any handwritten duplicate result strings, the problem will return. The implementation must reduce duplicate formatting logic rather than just restyle the existing duplication.

## Success Criteria

This work is successful when:

- the preview area reads as one buddy result rather than three separate widgets
- the text transcript matches the CLI formatter output
- selecting species, rarity, eye, hat, and shiny updates both the visual result and transcript from the same data
- the overall preview feels materially closer to Claude Code's final buddy presentation than the current website card stack
