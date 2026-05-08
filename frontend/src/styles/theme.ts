/**
 * Soppadop Design System — Modern color palette
 * Inspired by Linear, Vercel, Notion
 *
 * Principles:
 *   - Warm neutrals (stone-based, not gray)
 *   - Indigo as primary accent (modern, trustworthy)
 *   - Rose for destructive actions (soft red)
 *   - Emerald for success
 *   - Amber for warnings
 *   - Each semantic color has 50-950 shades
 */

export const theme = {
  /* ─── Base ───────────────────────────────────────────────────── */
  bg:        '#fafaf9',       // warm off-white
  bgSubtle:  '#f5f5f4',       // slightly darker bg for alternating sections
  surface:   '#ffffff',
  surfaceAlt:'#fafaf9',

  /* ─── Text ───────────────────────────────────────────────────── */
  ink:       '#0c0a09',       // near-black with warm tint
  inkSoft:   '#44403c',       // secondary text
  muted:     '#78716c',       // tertiary / placeholder
  faint:     '#a8a29e',       // disabled / subtle

  /* ─── Borders ────────────────────────────────────────────────── */
  border:    '#e7e5e4',       // default border
  borderLt:  '#f5f5f4',       // subtle divider
  borderDk:  '#d6d3d1',       // stronger border

  /* ─── Primary: Indigo ────────────────────────────────────────── */
  primary:      '#6366f1',
  primaryHover: '#4f46e5',
  primarySoft:  '#eef2ff',
  primaryRing:  '#c7d2fe',
  primaryText:  '#4338ca',

  /* ─── Accent: Violet (for branding / special elements) ──────── */
  accent:       '#8b5cf6',
  accentHover:  '#7c3aed',
  accentSoft:   '#f5f3ff',
  accentRing:   '#ddd6fe',
  accentText:   '#6d28d9',

  /* ─── Rose (destructive / logout) ────────────────────────────── */
  rose:       '#f43f5e',
  roseHover:  '#e11d48',
  roseSoft:   '#fff1f2',
  roseRing:   '#fecdd3',
  roseText:   '#be123c',

  /* ─── Emerald (success / active) ─────────────────────────────── */
  emerald:       '#10b981',
  emeraldHover:  '#059669',
  emeraldSoft:   '#ecfdf5',
  emeraldRing:   '#a7f3d0',
  emeraldText:   '#047857',

  /* ─── Amber (warning) ────────────────────────────────────────── */
  amber:       '#f59e0b',
  amberHover:  '#d97706',
  amberSoft:   '#fffbeb',
  amberRing:   '#fde68a',
  amberText:   '#b45309',

  /* ─── Sky (info / secondary actions) ─────────────────────────── */
  sky:       '#0ea5e9',
  skyHover:  '#0284c7',
  skySoft:   '#f0f9ff',
  skyRing:   '#bae6fd',
  skyText:   '#0369a1',

  /* ─── Teal (management group) ────────────────────────────────── */
  teal:       '#14b8a6',
  tealSoft:   '#f0fdfa',
  tealRing:   '#99f6e4',
  tealText:   '#0d9488',

  /* ─── Footer / Dark surfaces ─────────────────────────────────── */
  dark:       '#1c1917',
  darkSoft:   '#292524',
  darkMuted:  'rgba(255,255,255,0.45)',

  /* ─── Shadows ────────────────────────────────────────────────── */
  shadowSm:  '0 1px 2px rgba(12,10,9,0.04)',
  shadowMd:  '0 4px 12px rgba(12,10,9,0.06)',
  shadowLg:  '0 12px 32px rgba(12,10,9,0.08)',
  shadowXl:  '0 20px 48px rgba(12,10,9,0.10)',

  /* ─── Gradients ──────────────────────────────────────────────── */
  gradPrimary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  gradAccent:  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  gradWarm:    'linear-gradient(135deg, #f59e0b, #f43f5e)',
  gradCool:    'linear-gradient(135deg, #0ea5e9, #6366f1)',
  gradDark:    'linear-gradient(135deg, #1c1917, #292524)',
} as const

export type Theme = typeof theme
