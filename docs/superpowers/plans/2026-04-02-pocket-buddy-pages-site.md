# Pocket Buddy Pages Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a static Pocket Buddy catalog site to GitHub Pages at `https://kaiknower.github.io/pocket-buddy/`.

**Architecture:** Add a self-contained static site under a dedicated folder, keep assets local, and point the CLI gallery link to the GitHub Pages URL. Use lightweight tests to lock the new gallery URL and required site entry file before enabling Pages.

**Tech Stack:** Static HTML/CSS/JS, Node.js `node:test`, GitHub Pages.

---

### Task 1: Lock Pages expectations with tests

**Files:**
- Modify: `test/buddy-reroll.test.mjs`
- Modify: `buddy-reroll.mjs`

- [ ] **Step 1: Write the failing test for the GitHub Pages gallery URL and site entry file**
- [ ] **Step 2: Run `node --test /home/chenzhi/pocket-buddy/test/buddy-reroll.test.mjs` and verify failure**
- [ ] **Step 3: Add minimal constants/exports so the new URL can be asserted**
- [ ] **Step 4: Re-run tests and verify pass**

### Task 2: Build the static catalog site

**Files:**
- Create: `site/index.html`
- Create: `site/styles.css`
- Create: `site/script.js`

- [ ] **Step 1: Build a single-page product-style catalog with hero, species gallery, rarity, traits, and CLI section**
- [ ] **Step 2: Keep it fully static and file-openable**
- [ ] **Step 3: Add a simple interactive flourish in client-side JS only**

### Task 3: Wire the CLI and docs to the new site

**Files:**
- Modify: `buddy-reroll.mjs`
- Modify: `README.md`

- [ ] **Step 1: Point gallery links to `https://kaiknower.github.io/pocket-buddy/`**
- [ ] **Step 2: Update README to mention the public site URL**
- [ ] **Step 3: Verify with `node --test ...` and `node buddy-reroll.mjs gallery`**

### Task 4: Publish through GitHub Pages

**Files:**
- Modify: repository Pages settings via GitHub CLI/API

- [ ] **Step 1: Enable Pages for the repository**
- [ ] **Step 2: Push the site content to `main`**
- [ ] **Step 3: Confirm the Pages URL response**
