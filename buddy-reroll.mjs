#!/usr/bin/env node

/**
 * Pocket Buddy
 *
 * Interactive pet reroller for Claude Code /buddy.
 * Just run it — no args needed. Guided step by step.
 *
 * Interactive:  npx pocket-buddy
 * CLI mode:     node buddy-reroll.mjs search --species duck --rarity legendary
 *
 * Cross-platform: Node.js (v16+) / Bun. Bilingual: EN / 中文.
 * Based on Claude Code 2.1.89 source analysis.
 */

import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, copyFileSync, realpathSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { createInterface } from 'node:readline'
import { execSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { buddyArtManifest } from './site/buddy-art/manifest.js'
import {
  buildSitePreviewData as buildSharedSitePreviewData,
  createBuddyTranscriptModel,
  RARITY_STARS,
  SPECIES_EMOJI,
  STAT_NAMES,
} from './site/preview-shared.js'

// ══════════════════════════════════════════════════════════
//  Constants
// ══════════════════════════════════════════════════════════

function loadPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
    if (typeof pkg.version === 'string' && pkg.version) return pkg.version
  } catch {}
  return '0.0.0'
}

const VERSION = loadPackageVersion()
const SALT = 'friend-2026-401'
const CONFIG_PATH = join(homedir(), '.claude.json')
const PREF_PATH = process.env.POCKET_BUDDY_PREF_PATH || join(homedir(), '.pocket-buddy.json')
const MIN_CLAUDE_VERSION = '2.1.89'
const GALLERY_URL = 'https://kaiknower.github.io/pocket-buddy/'
const DEFAULT_SEARCH_LIMIT = 5_000_000
const SEARCH_PROGRESS_INTERVAL = 500_000
const RANDOM_BYTES_LEN = 32

export const SPECIES = buddyArtManifest.species.map((item) => item.id)
const RARITIES = buddyArtManifest.rarities.map((item) => item.id)
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }
const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
export const EYES = buddyArtManifest.eyes.map((item) => item.symbol)
export const HATS = buddyArtManifest.hats.map((item) => item.id)
const RARITY_FLOOR = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 }
const SEARCH_VALUE_SETS = {
  species: new Set(SPECIES),
  rarity: new Set(RARITIES),
  eye: new Set(EYES),
  hat: new Set(HATS),
}
const HAT_EMOJI = {
  ...Object.fromEntries(buddyArtManifest.hats.map((item) => [item.id, item.symbol])),
}
const CRITERIA_KEYS = ['species', 'rarity', 'eye', 'hat', 'shiny']

// ══════════════════════════════════════════════════════════
//  ANSI Colors
// ══════════════════════════════════════════════════════════

const NO_COLOR = !!process.env.NO_COLOR || process.argv.includes('--no-color')
const IS_TTY = process.stdout.isTTY !== false
const ESC = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  white: '\x1b[37m', gray: '\x1b[90m',
}
const RARITY_CLR = { common: ESC.white, uncommon: ESC.green, rare: ESC.blue, epic: ESC.magenta, legendary: ESC.yellow }
const c = (code, text) => (!NO_COLOR && IS_TTY) ? `${code}${text}${ESC.reset}` : text

// ══════════════════════════════════════════════════════════
//  i18n
// ══════════════════════════════════════════════════════════

let L = 'en'
const I = {
  banner:          { en: 'Pocket Buddy',                     zh: 'Pocket Buddy 电子宠物' },
  banner_tagline:  { en: 'Fast pet picking for Claude Code /buddy', zh: '给 Claude Code /buddy 用的快速选宠工具' },
  runtime_bun:     { en: 'Runtime: Bun ✓',                    zh: '运行时: Bun ✓' },
  runtime_node:    { en: 'Runtime: Node.js (wyhash fallback)', zh: '运行时: Node.js (wyhash 回退)' },
  // Menu
  menu_title:      { en: 'What would you like to do?',        zh: '你想做什么？' },
  menu_random:     { en: '🎲  Random roll',                   zh: '🎲  随机抽取' },
  menu_targeted:   { en: '🎯  Targeted hunt',                 zh: '🎯  定向搜索' },
  menu_tools:      { en: '🧰  Tools',                         zh: '🧰  工具' },
  menu_search:     { en: '🔍  Search for a buddy',            zh: '🔍  搜索宠物' },
  menu_check:      { en: '👀  Check current buddy',           zh: '👀  查看当前宠物' },
  menu_gallery:    { en: '📋  Species gallery',               zh: '📋  物种图鉴' },
  menu_selftest:   { en: '🧪  Self-test hash',                zh: '🧪  自检 Hash' },
  menu_lang:       { en: '🌐  Switch language',               zh: '🌐  切换语言' },
  menu_exit:       { en: '👋  Exit',                          zh: '👋  退出' },
  tools_title:     { en: 'Tools',                            zh: '工具' },
  tools_settings:  { en: '⚙️  Settings',                     zh: '⚙️  设置' },
  tools_back:      { en: '↩️  Back',                         zh: '↩️  返回' },
  settings_title:  { en: 'Settings',                         zh: '设置' },
  open_gallery:    { en: '🌐  Open web gallery',             zh: '🌐  打开网页图鉴' },
  gallery_title:   { en: 'Pocket Buddy Species Gallery',     zh: 'Pocket Buddy 物种图鉴' },
  gallery_hint:    { en: 'Each card previews how a species can look in the CLI.', zh: '每张卡片都预览该物种在 CLI 里的展示效果。' },
  gallery_opening: { en: 'Opening buddy gallery: {0}',       zh: '正在打开网页图鉴: {0}' },
  gallery_manual:  { en: 'Open this link manually: {0}',     zh: '请手动打开这个链接: {0}' },
  next_title:      { en: 'What next?',                       zh: '下一步做什么？' },
  next_apply:      { en: 'Apply this buddy',                 zh: '应用这个宠物' },
  next_retry:      { en: 'Search again',                     zh: '重新搜索' },
  next_tools:      { en: 'Open tools',                       zh: '打开工具' },
  next_exit:       { en: 'Exit',                             zh: '退出' },
  soul_title:      { en: 'Name and personality',            zh: '名字和个性' },
  soul_auto:       { en: 'Auto-generate with Claude Code',  zh: '由 Claude Code 自动生成' },
  soul_custom:     { en: 'Write custom name and personality', zh: '自定义名字和个性' },
  soul_keep:       { en: 'Keep existing saved soul',         zh: '保留当前已保存的灵魂' },
  soul_auto_desc:  { en: 'Best for a fresh buddy with generated soul', zh: '适合直接交给 Claude 自动生成灵魂' },
  soul_custom_desc:{ en: 'Set the exact name and personality yourself', zh: '自己指定名字和个性' },
  soul_keep_desc:  { en: 'Reuse the currently saved soul fields', zh: '沿用当前已保存的灵魂字段' },
  soul_auto_note:  { en: 'Name and personality will be generated on first /buddy.', zh: '第一次运行 /buddy 时会自动生成名字和个性。' },
  soul_keep_note:  { en: 'Keeping the existing saved name and personality.', zh: '保留当前已保存的名字和个性。' },
  choose_number:   { en: 'Choose a number',                  zh: '输入编号继续' },
  choose_any:      { en: 'Press Enter for Any',              zh: '直接回车表示不限' },
  // Search interactive
  si_species:      { en: 'Pick a species (or Enter to skip):',  zh: '选择物种 (回车跳过):' },
  si_rarity:       { en: 'Pick rarity (or Enter for auto-best):', zh: '选择稀有度 (回车自动找最好):' },
  si_auto_best:    { en: 'Auto (find highest rarity)',         zh: '自动 (找最高稀有度)' },
  si_eye:          { en: 'Pick eyes (or Enter to skip):',      zh: '选择眼睛 (回车跳过):' },
  si_hat:          { en: 'Pick hat (or Enter to skip):',       zh: '选择帽子 (回车跳过):' },
  si_any:          { en: 'Any',                                zh: '不限' },
  si_shiny:        { en: 'Require shiny? [y/N]:',             zh: '要求闪光? [y/N]:' },
  si_limit:        { en: 'Max attempts (default 5000000):',    zh: '最大迭代次数 (默认 5000000):' },
  si_apply_ask:    { en: 'Apply this buddy to your config? [Y/n]:', zh: '将此宠物写入配置? [Y/n]:' },
  si_applied:      { en: 'Done! Restart Claude Code and run /buddy.', zh: '完成! 重启 Claude Code 并输入 /buddy。' },
  si_skipped:      { en: 'Not applied. You can apply later with:', zh: '未写入。你可以稍后运行:' },
  si_again:        { en: 'Search again? [Y/n]:',              zh: '再搜一次? [Y/n]:' },
  si_back:         { en: 'Back to menu.',                      zh: '返回菜单。' },
  // Check
  chk_oauth_cur:   { en: '🔍 Current Buddy (OAuth):',         zh: '🔍 当前宠物 (OAuth):' },
  chk_oauth_warn:  { en: '⚠ OAuth active — this is what /buddy shows.', zh: '⚠ OAuth 已登录 — 这是 /buddy 显示的宠物。' },
  chk_after:       { en: '🔄 After apply (userID):',          zh: '🔄 apply 后 (userID):' },
  chk_cur:         { en: '🔍 Current Buddy (userID):',        zh: '🔍 当前宠物 (userID):' },
  chk_none:        { en: 'No config found. Search for a buddy first!', zh: '未找到配置。先搜索一个宠物吧!' },
  chk_no_id:       { en: 'No userID or OAuth account found.',  zh: '未找到 userID 或 OAuth 账号。' },
  // Gallery
  gal_species:     { en: '📋 All 18 Species:',                zh: '📋 全部 18 个物种:' },
  gal_rarities:    { en: '🎲 Rarities:',                      zh: '🎲 稀有度:' },
  gal_eyes:        { en: '👀 Eyes:',                           zh: '👀 眼睛:' },
  gal_hats:        { en: '🎩 Hats:',                          zh: '🎩 帽子:' },
  gal_shiny:       { en: 'Shiny: 1% chance. Common pets have no hats.', zh: '闪光: 1% 概率。普通品质没有帽子。' },
  // Search engine
  s_target:        { en: '🎯 Searching:',                     zh: '🎯 搜索:' },
  s_found:         { en: '→ Found:',                           zh: '→ 命中:' },
  s_done:          { en: 'Searched {0} in {1}s',               zh: '已搜索 {0} 次, 耗时 {1}s' },
  s_no_match:      { en: '✗ No match found. Try relaxing criteria.', zh: '✗ 未找到。试试放宽条件。' },
  s_best:          { en: '✓ BEST RESULT',                     zh: '✓ 最佳结果' },
  s_node_warn:     { en: '⚠ Node.js mode — use Bun for guaranteed accuracy.', zh: '⚠ Node.js 模式 — 建议用 Bun 确保准确。' },
  scan_title:      { en: 'Pet Scan',                          zh: '宠物扫描' },
  scan_target:     { en: 'Target',                            zh: '目标' },
  scan_progress:   { en: 'Scanning {0} seeds  {1}s',          zh: '扫描 {0} 个种子  {1}s' },
  result_title:    { en: 'Hatch Result',                      zh: '孵化结果' },
  // Apply
  a_preview:       { en: 'Preview:',                           zh: '预览:' },
  a_backup:        { en: 'Backup:',                            zh: '备份:' },
  a_oauth:         { en: 'OAuth → removed accountUuid (login unaffected)', zh: 'OAuth → 已移除 accountUuid (登录不受影响)' },
  a_ok:            { en: '✓ Config updated!',                  zh: '✓ 配置已更新!' },
  a_restart:       { en: 'Restart Claude Code → /buddy',       zh: '重启 Claude Code → /buddy' },
  // Version
  v_ok:            { en: 'Claude Code {0} ✓',                 zh: 'Claude Code {0} ✓' },
  v_old:           { en: '✗ Claude Code {0} too old! Need >= {1}. Run: claude update', zh: '✗ Claude Code {0} 过旧! 需要 >= {1}。运行: claude update' },
  v_unknown:       { en: '⚠ Cannot detect Claude Code version. Need >= {0}.', zh: '⚠ 无法检测版本。需要 >= {0}。' },
  // Selftest
  t_title:         { en: '🧪 Self-Test: Hash',                zh: '🧪 自检: Hash' },
  t_ok:            { en: '✓ All match! wyhash-js accurate.',  zh: '✓ 全部匹配! wyhash-js 准确。' },
  t_fail:          { en: '✗ Mismatch! Use Bun for reliable results.', zh: '✗ 不匹配! 请用 Bun 运行。' },
  t_no_bun:        { en: '⚠ Install Bun to verify: curl -fsSL https://bun.sh/install | bash', zh: '⚠ 安装 Bun 验证: curl -fsSL https://bun.sh/install | bash' },
  // Lang
  lang_saved:      { en: '✓ Language: English',               zh: '✓ 语言: 中文' },
  // DIY soul
  diy_name:        { en: 'Give it a name (Enter to skip):',    zh: '给它取个名字 (回车跳过):' },
  diy_personality:  { en: 'Describe its personality (Enter to skip):', zh: '写一句性格描述 (回车跳过):' },
  diy_set:         { en: '✓ Custom soul applied: {0}',         zh: '✓ 自定义灵魂已写入: {0}' },
  diy_skip:        { en: 'Soul will be auto-generated by Claude on first /buddy.', zh: '灵魂将在首次 /buddy 时由 Claude 自动生成。' },
  // Menu
  menu_diy:        { en: '✏️   Customize name/personality',     zh: '✏️   自定义名字/性格' },
  menu_patch:      { en: '🔓  Full customize (patch cli.js)',   zh: '🔓  完全自定义 (patch cli.js)' },
  diy_no_buddy:    { en: 'No buddy found. Search and apply one first!', zh: '未找到宠物。先搜索并 apply 一个吧!' },
  diy_current:     { en: 'Current buddy:',                     zh: '当前宠物:' },
  diy_done:        { en: '✓ Buddy soul updated!',              zh: '✓ 宠物灵魂已更新!' },
  diy_cur_name:    { en: 'Current name: {0}',                  zh: '当前名字: {0}' },
  diy_cur_pers:    { en: 'Current personality: {0}',            zh: '当前性格: {0}' },
  // Patch
  patch_title:     { en: '🔓 Full Customize (patch mode)',      zh: '🔓 完全自定义 (patch 模式)' },
  patch_desc:      { en: 'This patches Claude Code cli.js so config values override computed bones.\n  You can set ANY species, rarity, eyes, hat, shiny, and stats.', zh: '此功能修改 Claude Code 的 cli.js，让配置值覆盖计算值。\n  可以自定义任意物种、稀有度、眼睛、帽子、闪光和属性。' },
  patch_npm_only:  { en: '⚠ Only works with npm global install (npm i -g @anthropic-ai/claude-code).\n  Does NOT work with native binary install (cli.anthropic.com).', zh: '⚠ 仅适用于 npm 全局安装 (npm i -g @anthropic-ai/claude-code)。\n  不适用于原生二进制安装 (cli.anthropic.com)。' },
  patch_not_found: { en: '✗ Claude Code cli.js not found at npm global path.\n  Install via: npm i -g @anthropic-ai/claude-code', zh: '✗ 未在 npm 全局路径找到 Claude Code cli.js。\n  安装方法: npm i -g @anthropic-ai/claude-code' },
  patch_already:   { en: '✓ Already patched!',                 zh: '✓ 已经 patch 过了!' },
  patch_backup:    { en: 'Backup: {0}',                        zh: '备份: {0}' },
  patch_ok:        { en: '✓ cli.js patched! Config values now override computed bones.', zh: '✓ cli.js 已 patch! 配置值现在可以覆盖计算值。' },
  patch_fail:      { en: '✗ Could not find the target pattern in cli.js. Version mismatch?', zh: '✗ 未在 cli.js 中找到目标代码。版本不匹配？' },
  patch_restore:   { en: 'Restore original: cp {0} {1}',       zh: '恢复原版: cp {0} {1}' },
  patch_species:   { en: 'Species (Enter = keep current):',    zh: '物种 (回车保持当前):' },
  patch_rarity:    { en: 'Rarity (Enter = keep current):',     zh: '稀有度 (回车保持当前):' },
  patch_eye:       { en: 'Eyes (Enter = keep current):',       zh: '眼睛 (回车保持当前):' },
  patch_hat:       { en: 'Hat (Enter = keep current):',        zh: '帽子 (回车保持当前):' },
  patch_shiny_q:   { en: 'Shiny? [y/N/Enter=keep]:',          zh: '闪光? [y/N/回车保持]:' },
  patch_stat:      { en: '{0} (0-100, Enter = keep):',         zh: '{0} (0-100, 回车保持):' },
  patch_written:   { en: '✓ Custom companion written! Restart Claude Code → /buddy', zh: '✓ 自定义宠物已写入! 重启 Claude Code → /buddy' },
  patch_confirm:   { en: 'Proceed with patch? [Y/n]:',         zh: '确认 patch? [Y/n]:' },
  patch_tele_q:    { en: 'Unlock speech bubbles? (bypasses telemetry check) [y/N]:', zh: '解锁气泡反应? (跳过遥测检查) [y/N]:' },
  patch_tele_ok:   { en: '✓ Speech bubbles unlocked!',         zh: '✓ 气泡反应已解锁!' },
  patch_tele_done: { en: '✓ Speech bubbles already unlocked.', zh: '✓ 气泡反应已解锁。' },
  // Hash mode
  hash_detected:   { en: 'Hash: {0}',                         zh: 'Hash: {0}' },
  hash_fnv:        { en: 'FNV-1a (npm install detected)',      zh: 'FNV-1a (检测到 npm 安装)' },
  hash_wyhash:     { en: 'wyhash (native install detected)',   zh: 'wyhash (检测到原生安装)' },
  hash_override:   { en: 'Override with --hash fnv1a or --hash wyhash', zh: '可用 --hash fnv1a 或 --hash wyhash 覆盖' },
  // Prompt
  press_enter:     { en: 'Press Enter to continue...',         zh: '按回车继续...' },
}

function t(key, ...args) {
  const msg = I[key]?.[L] || I[key]?.['en'] || key
  return args.length ? msg.replace(/\{(\d+)\}/g, (_, i) => args[+i] ?? '') : msg
}

// ══════════════════════════════════════════════════════════
//  Prompt Helpers
// ══════════════════════════════════════════════════════════

function ask(question) {
  return new Promise(resolve => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, ans => { rl.close(); resolve(ans.trim()) })
  })
}

async function select(title, items, allowSkip = false) {
  console.log(`\n${c(ESC.gray, '  ────────────────────────────────────────')}`)
  console.log(`  ${c(ESC.bold + ESC.cyan, title)}`)
  console.log(c(ESC.dim, `  ${allowSkip ? t('choose_any') : t('choose_number')}`))
  console.log(c(ESC.gray, '  ────────────────────────────────────────'))
  items.forEach((item, i) => console.log(`    ${c(ESC.cyan, `[${i + 1}]`)} ${item}`))
  if (allowSkip) console.log(`    ${c(ESC.dim, `[Enter] ${t('si_any')}`)}`)
  const ans = await ask(`\n  ${c(ESC.cyan, '›')} `)
  if (ans === '' && allowSkip) return -1
  const idx = parseInt(ans) - 1
  return idx >= 0 && idx < items.length ? idx : (allowSkip ? -1 : 0)
}

function normalizeBooleanInput(answer, defaultValue = false, allowBlank = true) {
  const raw = (answer || '').trim().toLowerCase()
  if (!raw) return defaultValue
  if (raw === 'y' || raw === 'yes' || raw === '1') return true
  if (raw === 'n' || raw === 'no' || raw === '0') return false
  return allowBlank ? defaultValue : false
}

function parseBoolInput(answer, defaultValue = false) {
  return normalizeBooleanInput(answer, defaultValue, true)
}

function parseTriStateBoolInput(answer) {
  const raw = (answer || '').trim().toLowerCase()
  if (raw === 'y' || raw === 'yes' || raw === '1') return true
  if (raw === 'n' || raw === 'no' || raw === '0') return false
  return null
}

function parsePositiveInt(answer, fallback, min = 1) {
  const n = Number.parseInt(answer, 10)
  if (!Number.isFinite(n) || Number.isNaN(n) || n < min) return fallback
  return n
}

export function normalizeHashMode(value) {
  switch ((value || '').toLowerCase()) {
    case 'fnv':
    case 'fnv1a':
    case 'fnv-1a':
      return 'fnv1a'
    case 'wyhash':
    case 'bun':
    case 'native':
      return 'wyhash'
    default:
      return null
  }
}

async function confirm(question, defaultYes = true) {
  const ans = await ask(`  ${question} `)
  return normalizeBooleanInput(ans, defaultYes, true)
}

// ══════════════════════════════════════════════════════════
//  Language Persistence
// ══════════════════════════════════════════════════════════

export function loadLang() {
  const idx = process.argv.indexOf('--lang')
  if (idx !== -1) {
    const v = (process.argv[idx + 1] || '').toLowerCase()
    return (v === 'zh' || v === 'cn') ? 'zh' : 'en'
  }
  return loadPreference().lang || 'en'
}

function loadPreference() {
  try {
    const d = JSON.parse(readFileSync(PREF_PATH, 'utf8'))
    if (d && typeof d === 'object') return d
  } catch {}
  return {}
}

function savePreference(update) {
  const current = loadPreference()
  writeFileSync(PREF_PATH, JSON.stringify({ ...current, ...update }, null, 2), 'utf8')
}

function saveLang(lang) {
  savePreference({ lang })
}

async function pickLang() {
  console.log('')
  console.log(c(ESC.bold + ESC.cyan, `  ${t('banner')}`) + c(ESC.dim, ` v${VERSION}`))
  console.log(`\n  ${c(ESC.bold, '🌐 Select language / 选择语言:')}\n`)
  console.log(`    ${c(ESC.cyan, '[1]')} English`)
  console.log(`    ${c(ESC.cyan, '[2]')} 中文`)
  const ans = await ask(`\n  ${c(ESC.cyan, '>')} `)
  const lang = ans.trim() === '2' ? 'zh' : 'en'
  saveLang(lang)
  console.log(c(ESC.green, `\n  ${lang === 'zh' ? I.lang_saved.zh : I.lang_saved.en}`))
  return lang
}

// ══════════════════════════════════════════════════════════
//  wyhash (pure JS, final v4)
// ══════════════════════════════════════════════════════════

const M64 = (1n << 64n) - 1n
const WYP = [0xa0761d6478bd642fn, 0xe7037ed1a0b428dbn, 0x8ebc6af09c88c6e3n, 0x589965cc75374cc3n]
function _wymix(A, B) { const r = (A & M64) * (B & M64); return ((r >> 64n) ^ r) & M64 }
function _wyr8(p, i) {
  return BigInt(p[i])|(BigInt(p[i+1])<<8n)|(BigInt(p[i+2])<<16n)|(BigInt(p[i+3])<<24n)|
    (BigInt(p[i+4])<<32n)|(BigInt(p[i+5])<<40n)|(BigInt(p[i+6])<<48n)|(BigInt(p[i+7])<<56n)
}
function _wyr4(p, i) { return BigInt(p[i])|(BigInt(p[i+1])<<8n)|(BigInt(p[i+2])<<16n)|(BigInt(p[i+3])<<24n) }
function _wyr3(p, i, k) { return (BigInt(p[i])<<16n)|(BigInt(p[i+(k>>1)])<<8n)|BigInt(p[i+k-1]) }
function wyhash(key, seed = 0n) {
  const len = key.length; seed = (seed ^ _wymix(seed ^ WYP[0], WYP[1])) & M64; let a, b
  if (len <= 16) {
    if (len >= 4) { a = ((_wyr4(key,0)<<32n)|_wyr4(key,((len>>3)<<2)))&M64; b = ((_wyr4(key,len-4)<<32n)|_wyr4(key,len-4-((len>>3)<<2)))&M64 }
    else if (len > 0) { a = _wyr3(key,0,len); b = 0n } else { a = 0n; b = 0n }
  } else {
    let i = len, p = 0
    if (i > 48) { let s1 = seed, s2 = seed; do { seed = _wymix(_wyr8(key,p)^WYP[1],_wyr8(key,p+8)^seed); s1 = _wymix(_wyr8(key,p+16)^WYP[2],_wyr8(key,p+24)^s1); s2 = _wymix(_wyr8(key,p+32)^WYP[3],_wyr8(key,p+40)^s2); p+=48;i-=48 } while(i>48); seed=(seed^s1^s2)&M64 }
    while (i > 16) { seed = _wymix(_wyr8(key,p)^WYP[1],_wyr8(key,p+8)^seed); i-=16; p+=16 }
    a = _wyr8(key,p+i-16); b = _wyr8(key,p+i-8)
  }
  a=(a^WYP[1])&M64; b=(b^seed)&M64; const r=(a&M64)*(b&M64); a=r&M64; b=(r>>64n)&M64
  return _wymix((a^WYP[0]^BigInt(len))&M64,(b^WYP[1])&M64)
}

function randomSeed() {
  return randomBytes(RANDOM_BYTES_LEN).toString('hex')
}

// ══════════════════════════════════════════════════════════
//  Hash / PRNG / Roll
// ══════════════════════════════════════════════════════════

const IS_BUN = typeof globalThis.Bun !== 'undefined'
function hashWyhash(s) { return IS_BUN ? Number(BigInt(Bun.hash(s))&0xffffffffn) : Number(wyhash(Buffer.from(s,'utf8'))&0xffffffffn) }
function fnv1a(s) { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)} return h>>>0 }

// Detect whether the user's Claude Code uses wyhash (native/Bun) or FNV-1a (npm/Node.js)
// Native install: Bun binary at ~/.local/share/claude/versions/
// npm install: JS at npm root -g/@anthropic-ai/claude-code/cli.js
let HASH_MODE = 'auto' // 'wyhash' | 'fnv1a' | 'auto'

function detectClaudeInstall(hashModeOverride) {
  const hashMode = normalizeHashMode(hashModeOverride)
  if (hashMode) return hashMode
  // Check saved preference
  try {
    const d = JSON.parse(readFileSync(PREF_PATH, 'utf8'))
    if (d.hashMode === 'fnv1a' || d.hashMode === 'wyhash') return d.hashMode
  } catch {}
  // Auto-detect: which `claude` binary would run?
  try {
    const whichOut = execSync('which claude', { timeout: 3000, encoding: 'utf8' }).trim()
    if (whichOut) {
      const real = realpathSync(whichOut)
      // npm install: path contains node_modules or cli.js
      if (real.includes('node_modules') || real.endsWith('.js')) return 'fnv1a'
      // Native: path contains /versions/ (Bun binary)
      if (real.includes('/versions/')) return 'wyhash'
    }
  } catch {}
  // Fallback: check if npm package exists
  try {
    const npmRoot = execSync('npm root -g', { timeout: 3000, encoding: 'utf8' }).trim()
    if (existsSync(join(npmRoot, '@anthropic-ai', 'claude-code', 'cli.js'))) {
      // npm installed, but also check native
      const nativeDir = join(homedir(), '.local', 'share', 'claude', 'versions')
      if (existsSync(nativeDir) && readdirSync(nativeDir).some(f => /^\d+\.\d+\.\d+$/.test(f))) {
        return 'wyhash' // Both exist, native takes priority in PATH usually
      }
      return 'fnv1a'
    }
  } catch {}
  return 'wyhash' // Default to native
}

function hashString(s) {
  if (HASH_MODE === 'fnv1a') return fnv1a(s)
  return hashWyhash(s)
}
function mulberry32(seed) { let a=seed>>>0; return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296} }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)] }
function rollRarity(rng) { let roll=rng()*100; for(const r of RARITIES){roll-=RARITY_WEIGHTS[r];if(roll<0)return r} return 'common' }
function rollStats(rng, rarity) {
  const floor=RARITY_FLOOR[rarity], peak=pick(rng,STAT_NAMES); let dump=pick(rng,STAT_NAMES); while(dump===peak)dump=pick(rng,STAT_NAMES)
  const s={}; for(const n of STAT_NAMES){if(n===peak)s[n]=Math.min(100,floor+50+Math.floor(rng()*30));else if(n===dump)s[n]=Math.max(1,floor-10+Math.floor(rng()*15));else s[n]=floor+Math.floor(rng()*40)} return s
}
function rollBuddy(userId) {
  const rng=mulberry32(hashString(userId+SALT)),rarity=rollRarity(rng)
  return{rarity,species:pick(rng,SPECIES),eye:pick(rng,EYES),hat:rarity==='common'?'none':pick(rng,HATS),shiny:rng()<0.01,stats:rollStats(rng,rarity)}
}

export function buildPreviewBuddy(config = {}) {
  const rarity = config.rarity || 'legendary'
  const seed = hashString(JSON.stringify(config) + SALT)
  const rng = mulberry32(seed)
  return {
    species: config.species || 'dragon',
    rarity,
    eye: config.eye || pick(rng, EYES),
    hat: rarity === 'common' ? 'none' : (config.hat || pick(rng, HATS)),
    shiny: config.shiny ?? false,
    stats: rollStats(rng, rarity),
  }
}

function getShowcaseConfig(species, index) {
  const rarity = ['common', 'uncommon', 'rare', 'epic', 'legendary'][index % 5]
  const eye = EYES[index % EYES.length]
  const hat = rarity === 'common' ? 'none' : HATS[(index + 1) % HATS.length]
  const shiny = species === 'chonk' || species === 'dragon'
  return { species, rarity, eye, hat, shiny }
}

export function buildSitePreviewData(config = {}) {
  return buildSharedSitePreviewData(config)
}

// ══════════════════════════════════════════════════════════
//  Display
// ══════════════════════════════════════════════════════════

function divider(style = '─', width = 40) {
  return c(ESC.gray, `  ${style.repeat(width)}`)
}

function statBar(v, w=20) { const f=Math.round((v/100)*w); return `${c(v>=80?ESC.green:v>=50?ESC.yellow:v>=30?ESC.white:ESC.red,'█'.repeat(f)+'░'.repeat(w-f))} ${v}` }
export function formatBuddyCard(b, uid, verbose = true, options = {}) {
  const useColor = options.color ?? true
  const lines = createBuddyTranscriptModel(b, uid, verbose).map((line) => {
    switch (line.kind) {
      case 'divider':
        return useColor ? c(ESC.gray, line.text) : line.text
      case 'dividerSoft':
        return useColor ? c(ESC.gray, line.text) : line.text
      case 'title':
        return useColor ? c(RARITY_CLR[b.rarity] + ESC.bold, line.text) : line.text
      case 'rarity': {
        const text = line.shiny ? `${line.text}  ✨ SHINY` : line.text
        if (!useColor) return text
        return c(RARITY_CLR[b.rarity], line.text) + (line.shiny ? c(ESC.yellow + ESC.bold, '  ✨ SHINY') : '')
      }
      case 'muted':
        return useColor ? c(ESC.dim, line.text) : line.text
      case 'statName': {
        if (!useColor) return line.text
        return `  ${c(ESC.dim, line.statName.padEnd(10))} ${statBar(line.statValue)}`
      }
      default:
        return line.text
    }
  })
  return ['', ...lines, ''].join('\n')
}
function formatBuddy(b, uid, verbose=true) {
  return formatBuddyCard(b, uid, verbose)
}
export function getHeroBannerText() {
  const hashLabel = HASH_MODE === 'fnv1a' ? 'FNV-1a (npm install)' : 'wyhash (native install)'
  return [
    '',
    divider('═', 42),
    c(ESC.bold + ESC.cyan, `  ${t('banner')}`) + c(ESC.dim, ` v${VERSION}`),
    c(ESC.dim, `  ${t('banner_tagline')}`),
    divider('═', 42),
    c(ESC.dim, `  ${IS_BUN ? t('runtime_bun') : t('runtime_node')} | Hash: ${hashLabel}`),
    '',
  ].join('\n')
}

export function getPocketBuddyVersion() {
  return VERSION
}

function banner() {
  console.log(getHeroBannerText())
}

export function getSearchConsoleHeader(targetText) {
  return [
    '',
    divider('═', 42),
    c(ESC.bold + ESC.yellow, `  ${t('scan_title')}`),
    c(ESC.dim, `  ${t('scan_target')}  ${targetText}`),
    divider('═', 42),
    '',
  ].join('\n')
}

export function getSearchProgressLine(attempts, seconds) {
  return c(ESC.dim, `  ${t('scan_progress', attempts.toLocaleString(), seconds.toFixed(1))}`)
}

export function getResultBannerText() {
  return [
    '',
    c(ESC.bold + ESC.green, '  ╔════════════════════════════════════╗'),
    c(ESC.bold + ESC.green, `  ║ ${t('result_title').padEnd(34)} ║`),
    c(ESC.bold + ESC.green, '  ╚════════════════════════════════════╝'),
  ].join('\n')
}

export function getInteractiveEntryPoint() {
  return 'home'
}

export function getHomeModes() {
  return ['random-roll', 'targeted-hunt', 'tools']
}

export function getToolsModes() {
  return ['check', 'gallery', 'patch', 'web-gallery', 'selftest', 'settings', 'back', 'exit']
}

export function getPostSearchActions() {
  return ['apply', 'retry', 'tools', 'exit']
}

export function getSoulModes() {
  return ['auto', 'custom', 'keep']
}

export function getSoulModeChoices(hasSavedSoul) {
  const choices = [
    `✨ ${t('soul_auto')}  ${c(ESC.dim, `- ${t('soul_auto_desc')}`)}`,
    `✏️  ${t('soul_custom')}  ${c(ESC.dim, `- ${t('soul_custom_desc')}`)}`,
  ]
  if (hasSavedSoul) choices.push(`💾 ${t('soul_keep')}  ${c(ESC.dim, `- ${t('soul_keep_desc')}`)}`)
  return choices
}

export function getGalleryLink() {
  return { label: 'Buddy Gallery', url: GALLERY_URL }
}

export function getHelpText() {
  return [
    '  pocket-buddy                → Start choosing a buddy',
    '  pocket-buddy search ...     → Search with CLI filters',
    '  pocket-buddy check [userID] → Show the current or provided buddy',
    '  pocket-buddy apply <userID> → Save a buddy into Claude config',
    '  pocket-buddy gallery        → Print the species gallery',
    '  pocket-buddy selftest       → Run hash self-checks',
    '  pocket-buddy lang           → Switch language',
    '  pocket-buddy patch          → Patch full override mode',
    '',
    '  -h, --help                 → Show help',
    '  -V, --version              → Show version',
    '  --hash <fnv1a|wyhash>      → Force hash mode',
    '  --species/-s  --rarity/-r  --eye/-e  --hat <id|none>  --shiny  --not-shiny  --limit/-l  --json  --lang <en|zh>',
    '',
  ].map((line) => c(ESC.dim, line)).join('\n')
}

export function getApplyCommandHint(userId) {
  return `  pocket-buddy apply ${userId}\n`
}

function openExternalUrl(url) {
  try {
    if (process.platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' })
    } else if (process.platform === 'win32') {
      execSync(`cmd /c start "" "${url}"`, { stdio: 'ignore' })
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' })
    }
    return true
  } catch {
    return false
  }
}

// ══════════════════════════════════════════════════════════
//  Config / Version
// ══════════════════════════════════════════════════════════

function readConfig() { if(!existsSync(CONFIG_PATH))return null; try{return JSON.parse(readFileSync(CONFIG_PATH,'utf8'))}catch{return null} }
function compareVersions(a, b) { const pa=a.split('.').map(Number),pb=b.split('.').map(Number); for(let i=0;i<3;i++){if((pa[i]||0)>(pb[i]||0))return 1;if((pa[i]||0)<(pb[i]||0))return-1} return 0 }
function getClaudeVersion() {
  try { for(const p of [join(homedir(),'.local','bin','claude'),'/usr/local/bin/claude']){if(!existsSync(p))continue;try{const m=realpathSync(p).match(/(\d+\.\d+\.\d+)/);if(m)return m[1]}catch{}}
    const d=join(homedir(),'.local','share','claude','versions'); if(existsSync(d)){const v=readdirSync(d).filter(f=>/^\d+\.\d+\.\d+$/.test(f)).sort(compareVersions);if(v.length)return v[v.length-1]} } catch{}
  try{const m=execSync('claude --version',{timeout:5000,encoding:'utf8'}).match(/(\d+\.\d+\.\d+)/);if(m)return m[1]}catch{} return null
}
function checkVersion() {
  const v=getClaudeVersion()
  if(!v){console.log(c(ESC.yellow,`  ${t('v_unknown',MIN_CLAUDE_VERSION)}`));return'unknown'}
  if(compareVersions(v,MIN_CLAUDE_VERSION)<0){console.log(c(ESC.red+ESC.bold,`  ${t('v_old',v,MIN_CLAUDE_VERSION)}`));return'outdated'}
  console.log(c(ESC.dim,`  ${t('v_ok',v)}`));return'ok'
}
function doApply(newUid, soul = null) {
  const cfg=readConfig()||{}, isOAuth=!!cfg.oauthAccount?.accountUuid
  if(existsSync(CONFIG_PATH)){const bak=CONFIG_PATH+`.bak.${Date.now()}`;copyFileSync(CONFIG_PATH,bak);console.log(c(ESC.dim,`  ${t('a_backup')} ${bak}`))}
  if(isOAuth){const old=cfg.oauthAccount.accountUuid;delete cfg.oauthAccount.accountUuid;console.log(c(ESC.cyan,`  ${t('a_oauth')}`));console.log(c(ESC.dim,`  Old UUID: ${old}\n`))}
  cfg.userID=newUid
  if (soul && (soul.name || soul.personality)) {
    // Write custom soul — bones are always regenerated by Claude Code, but name/personality persist
    cfg.companion = { name: soul.name || '', personality: soul.personality || '', hatchedAt: Date.now() }
    console.log(c(ESC.magenta, `  ${t('diy_set', soul.name || '?')}`))
  } else {
    delete cfg.companion // Let Claude generate soul on first /buddy
    console.log(c(ESC.dim, `  ${t('diy_skip')}`))
  }
  writeFileSync(CONFIG_PATH,JSON.stringify(cfg,null,2),'utf8')
  console.log(c(ESC.green+ESC.bold,`  ${t('a_ok')}`));console.log(c(ESC.yellow,`  ${t('a_restart')}\n`))
}

function doCustomizeSoul(name, personality) {
  const cfg = readConfig()
  if (!cfg || !cfg.companion) return false
  if(existsSync(CONFIG_PATH)){const bak=CONFIG_PATH+`.bak.${Date.now()}`;copyFileSync(CONFIG_PATH,bak)}
  if (name) cfg.companion.name = name
  if (personality) cfg.companion.personality = personality
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8')
  return true
}

function getSavedSoul() {
  const cfg = readConfig()
  if (!cfg?.companion) return null
  const { name, personality } = cfg.companion
  if (!name && !personality) return null
  return { name, personality }
}

async function chooseSoulMode() {
  const savedSoul = getSavedSoul()
  const items = getSoulModeChoices(!!savedSoul)
  const modes = ['auto', 'custom']
  if (savedSoul) {
    modes.push('keep')
  }

  const choice = await select(t('soul_title'), items)
  return modes[choice] || 'auto'
}

// ══════════════════════════════════════════════════════════
//  Search Engine
// ══════════════════════════════════════════════════════════

function matchesCriteria(buddy, cr) {
  if(cr.species&&buddy.species!==cr.species)return false;if(cr.rarity&&buddy.rarity!==cr.rarity)return false
  if(cr.eye&&buddy.eye!==cr.eye)return false;if(cr.hat&&buddy.hat!==cr.hat)return false
  if(cr.shiny!=null&&buddy.shiny!==cr.shiny)return false;return true
}

export function normalizeSearchCriteria(filters = {}) {
  const normalized = {}
  const invalid = []
  const input = { ...filters }
  for (const key of CRITERIA_KEYS) {
    if (!(key in input)) continue
    const value = input[key]
    if (key === 'shiny') {
      if (typeof value === 'boolean') normalized.shiny = value
      else if (value != null) invalid.push(`--${key} expects boolean`)
      continue
    }
    if (typeof value !== 'string' || !SEARCH_VALUE_SETS[key].has(value)) {
      invalid.push(value == null ? `--${key} is required` : `--${key} invalid value: ${value}`)
      continue
    }
    normalized[key] = value
  }
  return { normalized, invalid }
}
function doSearch(criteria, limit=DEFAULT_SEARCH_LIMIT) {
  const results=[],start=Date.now();let best=null
  for(let i=0;i<limit;i++){
    const uid=randomSeed(),buddy=rollBuddy(uid)
    if(matchesCriteria(buddy,criteria)){
      if(!criteria.rarity){
        if(!best||RARITY_RANK[buddy.rarity]>RARITY_RANK[best.buddy.rarity]){
          best={uid,buddy,attempts:i+1};results.push(best)
          console.log(c(RARITY_CLR[buddy.rarity],`  ${t('s_found')} ${RARITY_STARS[buddy.rarity]} ${buddy.rarity} ${buddy.species}${buddy.shiny?' ✨':''}` + c(ESC.dim,` @ ${(i+1).toLocaleString()}`)))
          if(buddy.rarity==='legendary')break
        }
      } else { results.push({uid,buddy,attempts:i+1})
        console.log(c(RARITY_CLR[buddy.rarity],`  ${t('s_found')} ${RARITY_STARS[buddy.rarity]} ${buddy.rarity} ${buddy.species}${buddy.shiny?' ✨':''}` + c(ESC.dim,` @ ${(i+1).toLocaleString()}`)))
        break
      }
    }
    if(i>0&&i%SEARCH_PROGRESS_INTERVAL===0&&IS_TTY){const el=(Date.now()-start)/1000;console.log(getSearchProgressLine(i, el))}
  }
  console.log(c(ESC.dim,`\n  ${t('s_done',limit.toLocaleString(),((Date.now()-start)/1000).toFixed(2))}`))
  return results
}

// ══════════════════════════════════════════════════════════
//  Interactive Mode
// ══════════════════════════════════════════════════════════

async function interactiveSearch(criteriaOverride = null) {
  // 1. Species
  const criteria = criteriaOverride ? { ...criteriaOverride } : {}
  let limit = DEFAULT_SEARCH_LIMIT

  if (!criteriaOverride) {
    const spItems = SPECIES.map(s => `${SPECIES_EMOJI[s]}  ${s}`)
    const spIdx = await select(t('si_species'), spItems, true)
    const species = spIdx >= 0 ? SPECIES[spIdx] : null

    const rarItems = [t('si_auto_best'), ...RARITIES.map(r => `${c(RARITY_CLR[r], RARITY_STARS[r])} ${r} (${RARITY_WEIGHTS[r]}%)`)]
    const rarIdx = await select(t('si_rarity'), rarItems)
    const rarity = rarIdx > 0 ? RARITIES[rarIdx - 1] : null

    const eyeItems = EYES.map(e => `  ${e}`)
    const eyeIdx = await select(t('si_eye'), eyeItems, true)
    const eye = eyeIdx >= 0 ? EYES[eyeIdx] : null

    const hatItems = HATS.map(h => `${HAT_EMOJI[h]}  ${h}`)
    const hatIdx = await select(t('si_hat'), hatItems, true)
    const hat = hatIdx >= 0 ? HATS[hatIdx] : null

    const shinyAns = await ask(`\n  ${t('si_shiny')} `)
    const shiny = parseTriStateBoolInput(shinyAns)

    const limAns = await ask(`  ${t('si_limit')} `)
    limit = parsePositiveInt(limAns, DEFAULT_SEARCH_LIMIT)

    if (species) criteria.species = species
    if (rarity) criteria.rarity = rarity
    if (eye) criteria.eye = eye
    if (hat) criteria.hat = hat
    if (shiny !== null) criteria.shiny = shiny
  }

  if (Object.keys(criteria).length === 0) {
    criteria.rarity = 'legendary' // default: find any legendary
  }

  // Build display
  const parts = []
  if (criteria.shiny) parts.push('✨')
  if (criteria.rarity) parts.push(criteria.rarity)
  if (criteria.species) parts.push(`${SPECIES_EMOJI[criteria.species]} ${criteria.species}`)
  if (criteria.eye) parts.push(`eye:${criteria.eye}`)
  if (criteria.hat) parts.push(`hat:${criteria.hat}`)

  console.log(getSearchConsoleHeader(parts.join(' ')))
  if (!IS_BUN) console.log(c(ESC.yellow, `  ${t('s_node_warn')}\n`))

  const results = doSearch(criteria, limit)

  if (results.length === 0) {
    console.log(c(ESC.red + ESC.bold, `\n  ${t('s_no_match')}\n`))
    return
  }

  const best = results[results.length - 1]
  console.log(getResultBannerText())
  console.log(formatBuddy(best.buddy, best.uid))

  return best
}

async function interactiveRandomRoll() {
  const uid = randomSeed()
  const buddy = rollBuddy(uid)
  console.log(getSearchConsoleHeader('official random roll'))
  console.log(getSearchProgressLine(1, 0))
  console.log(getResultBannerText())
  console.log(formatBuddy(buddy, uid))
  return { uid, buddy, attempts: 1 }
}

async function interactiveCheck() {
  const cfg = readConfig()
  if (!cfg) { console.log(c(ESC.yellow, `\n  ${t('chk_none')}\n`)); return }
  const oauthUuid = cfg.oauthAccount?.accountUuid, localUid = cfg.userID
  if (oauthUuid) {
    console.log(c(ESC.bold, `\n  ${t('chk_oauth_cur')}`))
    console.log(formatBuddy(rollBuddy(oauthUuid), oauthUuid))
    console.log(c(ESC.yellow, `  ${t('chk_oauth_warn')}\n`))
    if (localUid) { console.log(c(ESC.bold, `  ${t('chk_after')}`)); console.log(formatBuddy(rollBuddy(localUid), localUid)) }
  } else if (localUid) {
    console.log(c(ESC.bold, `\n  ${t('chk_cur')}`))
    console.log(formatBuddy(rollBuddy(localUid), localUid))
  } else { console.log(c(ESC.red, `\n  ${t('chk_no_id')}\n`)) }
  checkVersion()
}

function interactiveGallery() {
  console.log(`\n  ${c(ESC.bold + ESC.cyan, t('gallery_title'))}`)
  console.log(c(ESC.dim, `  ${t('gallery_hint')}\n`))
  SPECIES.forEach((species, index) => {
    const config = getShowcaseConfig(species, index)
    const buddy = buildPreviewBuddy(config)
    console.log(formatBuddy(buddy, null, true))
  })
}

function interactiveWebGallery() {
  const { url } = getGalleryLink()
  console.log(c(ESC.cyan, `\n  ${t('gallery_opening', url)}\n`))
  if (!openExternalUrl(url)) console.log(c(ESC.yellow, `  ${t('gallery_manual', url)}\n`))
}

function interactiveSelftest() {
  console.log(c(ESC.bold, `\n  ${t('t_title')}\n`))
  const tests = ['hello', 'test-user-id' + SALT, randomSeed() + SALT]
  let ok = true
  for (const s of tests) {
    const js = Number(wyhash(Buffer.from(s, 'utf8')) & 0xffffffffn)
    if (IS_BUN) {
      const bh = Number(BigInt(Bun.hash(s)) & 0xffffffffn), m = js === bh; if (!m) ok = false
      console.log(`  ${m ? c(ESC.green,'✓') : c(ESC.red,'✗')} "${s.substring(0,30)}${s.length>30?'...':''}"  Bun:${bh} JS:${js}`)
    } else { console.log(`  ● "${s.substring(0,30)}${s.length>30?'...':''}"  wyhash:${js} fnv1a:${fnv1a(s)}`) }
  }
  console.log('')
  if (IS_BUN) console.log(c(ok ? ESC.green+ESC.bold : ESC.red+ESC.bold, `  ${ok ? t('t_ok') : t('t_fail')}\n`))
  else console.log(c(ESC.yellow, `  ${t('t_no_bun')}\n`))
}

async function interactiveDiy() {
  const cfg = readConfig()
  const uid = cfg?.oauthAccount?.accountUuid ? null : cfg?.userID
  if (!uid) { console.log(c(ESC.yellow, `\n  ${t('diy_no_buddy')}\n`)); return }
  const buddy = rollBuddy(uid)
  const stored = cfg?.companion

  console.log(c(ESC.bold, `\n  ${t('diy_current')}`))
  console.log(formatBuddy(buddy, null, false))

  if (stored?.name) console.log(c(ESC.dim, `  ${t('diy_cur_name', stored.name)}`))
  if (stored?.personality) console.log(c(ESC.dim, `  ${t('diy_cur_pers', stored.personality.substring(0, 60) + (stored.personality.length > 60 ? '...' : ''))}`))
  console.log('')

  const newName = await ask(`  ${c(ESC.magenta, '✏️')} ${t('diy_name')} `)
  const newPers = await ask(`  ${c(ESC.magenta, '✏️')} ${t('diy_personality')} `)

  if (!newName && !newPers) { console.log(c(ESC.dim, `\n  ${t('diy_skip')}\n`)); return }

  if (doCustomizeSoul(newName || undefined, newPers || undefined)) {
    console.log(c(ESC.green + ESC.bold, `\n  ${t('diy_done')}`))
    if (newName) console.log(c(ESC.magenta, `  Name: ${newName}`))
    if (newPers) console.log(c(ESC.magenta, `  Personality: ${newPers}`))
    console.log(c(ESC.yellow, `\n  ${t('a_restart')}`))
  } else {
    console.log(c(ESC.yellow, `\n  ${t('diy_no_buddy')}\n`))
  }
}

// ══════════════════════════════════════════════════════════
//  Patch Mode — Full Customize (npm install only)
// ══════════════════════════════════════════════════════════

function findCliJs() {
  // Common npm global paths
  const candidates = []
  try {
    const out = execSync('npm root -g', { timeout: 5000, encoding: 'utf8' }).trim()
    if (out && !out.includes('Unknown')) candidates.push(join(out, '@anthropic-ai', 'claude-code', 'cli.js'))
  } catch {}
  candidates.push(
    join(homedir(), '.npm-global', 'lib', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
    join('/usr', 'local', 'lib', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
    join('/usr', 'lib', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
    // Windows
    join(process.env.APPDATA || '', 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
  )
  for (const p of candidates) { if (existsSync(p)) return p }
  return null
}

const PATCH_PATTERN_BEFORE = /if\(!(\w)\)return;let\{bones:(\w)\}=\w+\(\w+\(\)\);return\{\.\.\.\1,\.\.\.\2\}/
const PATCH_PATTERN_AFTER = /if\(!(\w)\)return;let\{bones:(\w)\}=\w+\(\w+\(\)\);return\{\.\.\.\2,\.\.\.\1\}/

function checkPatchStatus(cliPath) {
  const content = readFileSync(cliPath, 'utf8')
  if (PATCH_PATTERN_AFTER.test(content)) return 'patched'
  if (PATCH_PATTERN_BEFORE.test(content)) return 'unpatched'
  return 'unknown'
}

function applyPatch(cliPath) {
  let content = readFileSync(cliPath, 'utf8')
  const match = content.match(PATCH_PATTERN_BEFORE)
  if (!match) return false
  const stored = match[1], bones = match[2]
  content = content.replace(PATCH_PATTERN_BEFORE, (m) =>
    m.replace(`{...${stored},...${bones}}`, `{...${bones},...${stored}}`)
  )
  writeFileSync(cliPath, content, 'utf8')
  return true
}

// Telemetry bypass for buddy_react speech bubbles
// Pattern: if(T7()!=="firstParty")return null;if(wY())return null;let O=w8()
const TELE_PATTERN = /if\(\w+\(\)!=="firstParty"\)return null;if\((\w+)\(\)\)return null;(let \w=\w+\(\))/
const TELE_PATCHED = /if\(\w+\(\)!=="firstParty"\)return null;(let \w=\w+\(\))/

function checkTelePatch(cliPath) {
  const content = readFileSync(cliPath, 'utf8')
  if (TELE_PATCHED.test(content) && !TELE_PATTERN.test(content)) return 'patched'
  if (TELE_PATTERN.test(content)) return 'unpatched'
  return 'unknown'
}

function applyTelePatch(cliPath) {
  let content = readFileSync(cliPath, 'utf8')
  const match = content.match(TELE_PATTERN)
  if (!match) return false
  // Remove the telemetry check: if(wY())return null;
  content = content.replace(TELE_PATTERN, (m, teleFunc, letPart) =>
    m.replace(`if(${teleFunc}())return null;${letPart}`, letPart)
  )
  writeFileSync(cliPath, content, 'utf8')
  return true
}

async function interactivePatch() {
  console.log(c(ESC.bold, `\n  ${t('patch_title')}\n`))
  console.log(c(ESC.dim, `  ${t('patch_desc')}\n`))
  console.log(c(ESC.yellow, `  ${t('patch_npm_only')}\n`))

  const cliPath = findCliJs()
  if (!cliPath) {
    console.log(c(ESC.red, `  ${t('patch_not_found')}\n`))
    return
  }
  console.log(c(ESC.dim, `  cli.js: ${cliPath}\n`))

  const status = checkPatchStatus(cliPath)
  if (status === 'patched') {
    console.log(c(ESC.green, `  ${t('patch_already')}`))
  } else if (status === 'unpatched') {
    if (!(await confirm(t('patch_confirm'), true))) return
    // Backup
    const bakPath = cliPath + '.original'
    if (!existsSync(bakPath)) {
      copyFileSync(cliPath, bakPath)
      console.log(c(ESC.dim, `  ${t('patch_backup', bakPath)}`))
    }
    if (applyPatch(cliPath)) {
      console.log(c(ESC.green + ESC.bold, `  ${t('patch_ok')}`))
      console.log(c(ESC.dim, `  ${t('patch_restore', bakPath, cliPath)}\n`))
    } else {
      console.log(c(ESC.red, `  ${t('patch_fail')}\n`))
      return
    }
  } else {
    console.log(c(ESC.red, `  ${t('patch_fail')}\n`))
    return
  }

  // Optional: telemetry bypass for speech bubbles
  const teleStatus = checkTelePatch(cliPath)
  if (teleStatus === 'patched') {
    console.log(c(ESC.green, `  ${L === 'zh' ? '✓ 气泡反应已解锁 (遥测检查已跳过)' : '✓ Speech bubbles unlocked (telemetry check bypassed)'}`))
  } else if (teleStatus === 'unpatched') {
    const teleQ = L === 'zh'
      ? '解锁宠物气泡反应? (关闭遥测的用户需要此补丁) [y/N]:'
      : 'Unlock buddy speech bubbles? (needed if telemetry is off) [y/N]:'
    if (await confirm(teleQ, false)) {
      if (applyTelePatch(cliPath)) {
        console.log(c(ESC.green, `  ${L === 'zh' ? '✓ 气泡反应已解锁!' : '✓ Speech bubbles unlocked!'}`))
      } else {
        console.log(c(ESC.yellow, `  ${L === 'zh' ? '✗ 未找到遥测检查代码' : '✗ Telemetry check pattern not found'}`))
      }
    }
  }

  // Now offer full customization
  console.log(c(ESC.bold, `\n  ✏️  ${L === 'zh' ? '设置自定义宠物属性:' : 'Set custom companion attributes:'}\n`))

  const cfg = readConfig() || {}
  const stored = cfg.companion || {}

  // Species
  const spItems = SPECIES.map(s => `${SPECIES_EMOJI[s]}  ${s}`)
  const spIdx = await select(t('patch_species'), spItems, true)
  const species = spIdx >= 0 ? SPECIES[spIdx] : stored.species

  // Rarity
  const rarItems = RARITIES.map(r => `${c(RARITY_CLR[r], RARITY_STARS[r])} ${r}`)
  const rarIdx = await select(t('patch_rarity'), rarItems, true)
  const rarity = rarIdx >= 0 ? RARITIES[rarIdx] : stored.rarity

  // Eye
  const eyeItems = EYES.map(e => `  ${e}`)
  const eyeIdx = await select(t('patch_eye'), eyeItems, true)
  const eye = eyeIdx >= 0 ? EYES[eyeIdx] : stored.eye

  // Hat
  const hatItems = HATS.map(h => `${HAT_EMOJI[h]}  ${h}`)
  const hatIdx = await select(t('patch_hat'), hatItems, true)
  const hat = hatIdx >= 0 ? HATS[hatIdx] : stored.hat

  // Shiny
  const shinyAns = await ask(`  ${t('patch_shiny_q')} `)
  const shiny = parseTriStateBoolInput(shinyAns) ?? stored.shiny

  // Stats
  const stats = { ...(stored.stats || {}) }
  for (const sn of STAT_NAMES) {
    const cur = stats[sn] ?? '?'
    const ans = await ask(`  ${t('patch_stat', `${sn} [${cur}]`)} `)
    if (ans !== '') { const v = parsePositiveInt(ans, null, 0); if (v !== null) stats[sn] = Math.max(0, Math.min(100, v)) }
  }

  // Name + personality
  const nameAns = await ask(`\n  ${c(ESC.magenta, '✏️')} ${t('diy_name')} `)
  const persAns = await ask(`  ${c(ESC.magenta, '✏️')} ${t('diy_personality')} `)

  // Build companion
  const companion = {
    name: nameAns || stored.name || 'Buddy',
    personality: persAns || stored.personality || 'A mysterious creature.',
    hatchedAt: stored.hatchedAt || Date.now(),
  }
  if (species) companion.species = species
  if (rarity) companion.rarity = rarity
  if (eye) companion.eye = eye
  if (hat !== undefined) companion.hat = hat
  if (shiny !== undefined) companion.shiny = shiny
  if (Object.keys(stats).length) companion.stats = stats

  // Write
  if (existsSync(CONFIG_PATH)) {
    copyFileSync(CONFIG_PATH, CONFIG_PATH + `.bak.${Date.now()}`)
  }
  cfg.companion = companion
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8')

  console.log('')
  console.log(c(ESC.green + ESC.bold, `  ${t('patch_written')}`))
  const preview = { species, rarity, eye, hat, shiny, stats, name: companion.name }
  console.log(c(ESC.dim, `  ${JSON.stringify(preview)}\n`))
}

async function interactiveMode() {
  banner()

  while (true) {
    const route = await select(t('menu_title'), [
      t('menu_random'),
      t('menu_targeted'),
      t('menu_tools'),
      t('menu_exit'),
    ])

    if (route === 2) {
      await interactiveToolsMenu()
      banner()
      continue
    }
    if (route === 3) {
      console.log('')
      return
    }

    const best = route === 0 ? await interactiveRandomRoll() : await interactiveSearch()
    if (!best) continue

    while (true) {
      const action = await select(t('next_title'), [
        t('next_apply'),
        t('next_retry'),
        t('next_tools'),
        t('next_exit'),
      ])

      if (action === 0) {
        const verStatus = checkVersion()
        if (verStatus !== 'outdated') {
          let soul = null
          const soulMode = await chooseSoulMode()
          if (soulMode === 'custom') {
            console.log('')
            const customName = await ask(`  ${c(ESC.magenta, '✏️')} ${t('diy_name')} `)
            const customPers = await ask(`  ${c(ESC.magenta, '✏️')} ${t('diy_personality')} `)
            soul = (customName || customPers) ? { name: customName, personality: customPers } : null
          } else if (soulMode === 'keep') {
            soul = getSavedSoul()
            console.log(c(ESC.dim, `  ${t('soul_keep_note')}`))
          } else {
            console.log(c(ESC.dim, `  ${t('soul_auto_note')}`))
          }
          doApply(best.uid, soul)
          console.log(c(ESC.green + ESC.bold, `  ${t('si_applied')}\n`))
        }
        return
      }

      if (action === 1) break
      if (action === 2) {
        await interactiveToolsMenu()
        banner()
        console.log(formatBuddy(best.buddy, best.uid))
        continue
      }
      console.log('')
      return
    }
  }
}

async function interactiveToolsMenu() {
  while (true) {
    const choice = await select(t('tools_title'), [
      t('menu_check'),
      t('menu_diy'),
      t('menu_gallery'),
      t('menu_patch'),
      t('open_gallery'),
      t('menu_selftest'),
      t('tools_settings'),
      t('tools_back'),
      t('menu_exit'),
    ])

    switch (choice) {
      case 0:
        await interactiveCheck()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 1:
        await interactiveDiy()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 2:
        interactiveGallery()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 3:
        await interactivePatch()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 4:
        interactiveWebGallery()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 5:
        interactiveSelftest()
        await ask(`\n  ${c(ESC.dim, t('press_enter'))} `)
        break
      case 6:
        await interactiveSettings()
        break
      case 7:
        return
      default:
        console.log('')
        process.exit(0)
    }
  }
}

async function interactiveSettings() {
  while (true) {
    const choice = await select(t('settings_title'), [t('menu_lang'), t('tools_back')])
    if (choice === 0) L = await pickLang()
    else return
  }
}

// ══════════════════════════════════════════════════════════
//  CLI Mode (backward compat)
// ══════════════════════════════════════════════════════════

function parseArgs(argv) {
  const args = { command: null, filters: {}, options: {} }
  const cmds = ['search', 'check', 'apply', 'gallery', 'selftest', 'help', 'lang', 'patch', 'version']
  let i = 0
  for (; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-h' || a === '--help') { args.command = 'help'; continue }
    if (a === '-V' || a === '--version') { args.command = 'version'; continue }
    if (a === '--lang') { i++; continue }
    if (!a.startsWith('-') && cmds.includes(a)) { args.command = a; i++; break }
  }
  for (; i < argv.length; i++) {
    const a = argv[i], n = argv[i + 1]
    switch (a) {
      case '--species': case '-s': args.filters.species = n; i++; break
      case '--rarity': case '-r': args.filters.rarity = n; i++; break
      case '--eye': case '-e': args.filters.eye = n; i++; break
      case '--hat': args.filters.hat = n; i++; break
      case '--shiny': args.filters.shiny = true; break
      case '--not-shiny': args.filters.shiny = false; break
      case '--limit': case '-l': args.options.limit = parsePositiveInt(n, null); i++; break
      case '--hash': args.options.hashMode = normalizeHashMode(n); i++; break
      case '--json': args.options.json = true; break
      case '--lang': i++; break
      default: if (!a.startsWith('-') && (args.command === 'apply' || args.command === 'check')) args.options.userId = a
    }
  }
  return args
}

function cliSearch(cr, opts) {
  banner()
  const { normalized, invalid } = normalizeSearchCriteria(cr)
  if (invalid.length) {
    console.log(c(ESC.red, `  Invalid filter options. ${invalid.join('; ')}`))
    return
  }
  if (!normalized.species && !normalized.rarity && !normalized.eye && !normalized.hat && normalized.shiny == null) { console.log(c(ESC.red, '  Need at least one filter.\n')); return }
  if (!IS_BUN) console.log(c(ESC.yellow, `  ${t('s_node_warn')}\n`))
  const parts = []; if (normalized.shiny) parts.push('✨'); if (normalized.rarity) parts.push(normalized.rarity); if (normalized.species) parts.push(`${SPECIES_EMOJI[normalized.species]} ${normalized.species}`); if (normalized.eye) parts.push(`eye:${normalized.eye}`); if (normalized.hat) parts.push(`hat:${normalized.hat}`)
  const limit = opts.limit || DEFAULT_SEARCH_LIMIT
  console.log(c(ESC.bold, `  ${t('s_target')} ${parts.join(' ')}\n`))
  const results = doSearch(normalized, limit)
  if (!results.length) { console.log(c(ESC.red, `\n  ${t('s_no_match')}\n`)); return }
  const best = results[results.length - 1]
  if (opts.json) { console.log(JSON.stringify(results.map(r => ({ userId: r.uid, buddy: r.buddy, attempts: r.attempts })), null, 2)); return }
  console.log(c(ESC.bold + ESC.green, `\n  ════════════════════════════════════\n  ${t('s_best')}\n  ════════════════════════════════════`))
  console.log(formatBuddy(best.buddy, best.uid))
  console.log(c(ESC.cyan, getApplyCommandHint(best.uid)))
}

function showVersion() {
  console.log(c(ESC.dim, `  pocket-buddy v${VERSION}`))
}

// ══════════════════════════════════════════════════════════
//  Main
// ══════════════════════════════════════════════════════════

async function main() {
  const lang = loadLang()
  const args = parseArgs(process.argv.slice(2))
  const hasCmd = args.command || Object.keys(args.filters).length > 0

  L = lang

  // Detect hash mode
  HASH_MODE = detectClaudeInstall(args.options.hashMode)
  if (args.options.hashMode) savePreference({ hashMode: args.options.hashMode })

  // No arguments → interactive mode
  if (!hasCmd) { await interactiveMode(); return }

  // CLI mode
  switch (args.command) {
    case 'search': cliSearch(args.filters, args.options); break
    case 'check': banner(); if(args.options.userId){console.log(c(ESC.bold,`  ${t('chk_cur')}`));console.log(formatBuddy(rollBuddy(args.options.userId),args.options.userId))}else{await interactiveCheck()} break
    case 'apply': banner(); if(!args.options.userId){console.log(c(ESC.red,'  Usage: apply <userID>\n'));break}; checkVersion()!=='outdated'&&doApply(args.options.userId); break
    case 'gallery': banner(); interactiveGallery(); break
    case 'selftest': banner(); interactiveSelftest(); break
    case 'patch': await interactivePatch(); break
    case 'lang': await pickLang(); break
    case 'version': showVersion(); break
    case 'help': default:
      if (Object.keys(args.filters).length > 0) cliSearch(args.filters, args.options)
      else {
        banner()
        console.log(getHelpText())
      }
  }
}

const IS_MAIN = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (IS_MAIN) main()
