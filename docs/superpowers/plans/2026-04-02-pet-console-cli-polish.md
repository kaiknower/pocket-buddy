# Pet Console CLI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Pocket Buddy search flow feel more like a retro digital pet console without changing the core search/apply behavior.

**Architecture:** Keep the current single-file CLI, but introduce a few exported presentation helpers for the search header, scan progress, and result card framing. Lock the new look with focused `node:test` assertions so future wording/layout changes stay intentional.

**Tech Stack:** Node.js ESM CLI, built-in `node:test`, ANSI terminal styling.

---

### Task 1: Lock the new presentation helpers with tests

**Files:**
- Modify: `test/buddy-reroll.test.mjs`
- Modify: `buddy-reroll.mjs`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test /home/chenzhi/pocket-buddy/test/buddy-reroll.test.mjs` and verify the helper is missing**
- [ ] **Step 3: Add minimal exported helpers for retro search header/progress/result labels**
- [ ] **Step 4: Re-run the test and verify it passes**

### Task 2: Apply the retro pet-console styling

**Files:**
- Modify: `buddy-reroll.mjs`

- [ ] **Step 1: Route interactive search display through the new helpers**
- [ ] **Step 2: Add compact “scan” and “hatch/result” wording around progress and result output**
- [ ] **Step 3: Keep all existing apply/tools logic unchanged**
- [ ] **Step 4: Re-run `node /home/chenzhi/pocket-buddy/buddy-reroll.mjs help` as a smoke check**

### Task 3: Refresh README preview to match the new terminal look

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the terminal preview block to reflect the retro console styling**
- [ ] **Step 2: Re-run tests so the repo finishes in a verified state**
