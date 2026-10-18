// Colour pairs the site puts text on. Each value mirrors a variable in globals.css, and a unit
// test checks both that they match and that every pair meets WCAG AA (4.5:1).

export const TOKENS = {
  canvas: '#f6f7f9',
  surface: '#ffffff',
  surface2: '#eef0f4',
  ink: '#0f1720',
  ink2: '#3b4452',
  muted: '#5b6473',
  blue: '#1f4fd1',
  blueWash: '#e9effd',
  amber: '#94540a',
  amberWash: '#fdf3de',
  red: '#b42318',
  redWash: '#fdecea',
  green: '#146c34',
  greenWash: '#e7f4ec',
  codeBg: '#0f1720',
  codeInk: '#e5e9f0',
  codeMuted: '#97a3b6',
} as const

export type Token = keyof typeof TOKENS

export const TEXT_PAIRS: readonly [Token, Token][] = [
  ['ink', 'canvas'],
  ['ink2', 'canvas'],
  ['muted', 'canvas'],
  ['muted', 'surface'],
  ['ink2', 'surface2'],
  ['blue', 'surface'],
  ['blue', 'blueWash'],
  ['amber', 'amberWash'],
  ['amber', 'surface'],
  ['red', 'redWash'],
  ['green', 'greenWash'],
  ['surface', 'blue'],
  ['codeInk', 'codeBg'],
  ['codeMuted', 'codeBg'],
]

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

export function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}
