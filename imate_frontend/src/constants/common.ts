/**
 * Question related constants
 */

// Difficulty levels (number values for API)
export const DIFFICULTY_LEVEL = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
} as const;

// Difficulty mapping: number to display text
export const DIFFICULTY_MAP = {
  0: 'Easy',
  1: 'Medium',
  2: 'Hard',
} as const;

// Difficulty levels (legacy string values)
export const COMMON_CODE = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  NEWEST: 'newest',
} as const;

// Difficulty colors
export const COMMON_COLOR = {
  EASY_QUESTION: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  MEDIUM_QUESTION: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  HARD_QUESTION: "bg-red-500/10 text-red-500 border-red-500/20",
  DEFAULT_QUESTION: "bg-slate-500/10 text-slate-500 border-slate-500/20",
} as const;

// Date format constants
export const COMMON_DATE = {
  JUST_NOW: 'Vừa xong',
  HOURS_AGO: 'giờ trước',
  ONE_DAY_AGO: '1 ngày trước',
  DAYS_AGO: 'ngày trước',
} as const;

export const LAYOUT = {
  MANAGEMENT: "management",
  MAIN: "main",
  NONE: "none",
} as const;

