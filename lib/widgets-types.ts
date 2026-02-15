import { Activity, FileCode, Palette } from "lucide-react"

export interface StreakData {
  username: string
  currentStreak: number
  longestStreak: number
  totalContributions: number
  contributionsThisYear: number
  publicRepos: number
  followers: number
  following: number
  joinedDate: string
  streakStartDate: string
  profileUrl: string
  avatarUrl: string
  topLanguages: string[]
  stars?: number
  forks?: number
  dataSource?: string
}

export interface CardTheme {
  backgroundColor: string
  textColor: string
  accentColor: string
  borderColor: string
  waterColor: string
  streakColor: string
}

export interface SkillSetTheme {
  backgroundColor: string
  textColor: string
  accentColor: string
  borderColor: string
  badgeColor: string
  badgeColor1: string
  badgeColor2: string
  badgeColor3: string
}

export type WidgetType = "streak" | "skill-set"

export const defaultTheme: CardTheme = {
  backgroundColor: "#1a1b27",
  textColor: "#ffffff",
  accentColor: "#00d4aa",
  borderColor: "#30363d",
  waterColor: "#00d4aa",
  streakColor: "#ff6b6b",
}

export const presetThemes: Record<string, CardTheme> = {
  dark: defaultTheme,
  ocean: {
    backgroundColor: "#0f172a",
    textColor: "#e2e8f0",
    accentColor: "#0ea5e9",
    borderColor: "#1e293b",
    waterColor: "#0ea5e9",
    streakColor: "#06b6d4",
  },
  sunset: {
    backgroundColor: "#451a03",
    textColor: "#fef3c7",
    accentColor: "#f59e0b",
    borderColor: "#92400e",
    waterColor: "#f59e0b",
    streakColor: "#dc2626",
  },
  forest: {
    backgroundColor: "#14532d",
    textColor: "#dcfce7",
    accentColor: "#22c55e",
    borderColor: "#166534",
    waterColor: "#22c55e",
    streakColor: "#15803d",
  },
  purple: {
    backgroundColor: "#581c87",
    textColor: "#f3e8ff",
    accentColor: "#a855f7",
    borderColor: "#7c3aed",
    waterColor: "#a855f7",
    streakColor: "#c084fc",
  },
}

/** Badge colors 1, 2, 4 from reference image (Git, Docker, Webpack-style). */
export const defaultSkillSetTheme: SkillSetTheme = {
  backgroundColor: "#1a1b27",
  textColor: "#e2e8f0",
  accentColor: "#22c55e",
  borderColor: "#30363d",
  badgeColor: "#334155",
  badgeColor1: "#DC5A42",
  badgeColor2: "#37A7D7",
  badgeColor3: "#3B72BC",
}

export const presetSkillSetThemes: Record<string, SkillSetTheme> = {
  default: defaultSkillSetTheme,
  ocean: {
    ...defaultSkillSetTheme,
    backgroundColor: "#0f172a",
    textColor: "#e2e8f0",
    accentColor: "#0ea5e9",
    borderColor: "#1e293b",
    badgeColor: "#1e3a5f",
    badgeColor1: "#0ea5e9",
    badgeColor2: "#06b6d4",
    badgeColor3: "#1e3a5f",
  },
  sunset: {
    ...defaultSkillSetTheme,
    backgroundColor: "#451a03",
    textColor: "#fef3c7",
    accentColor: "#f59e0b",
    borderColor: "#92400e",
    badgeColor: "#78350f",
    badgeColor1: "#dc2626",
    badgeColor2: "#f59e0b",
    badgeColor3: "#92400e",
  },
  forest: {
    ...defaultSkillSetTheme,
    backgroundColor: "#14532d",
    textColor: "#dcfce7",
    accentColor: "#22c55e",
    borderColor: "#166534",
    badgeColor: "#166534",
    badgeColor1: "#22c55e",
    badgeColor2: "#15803d",
    badgeColor3: "#166534",
  },
  purple: {
    ...defaultSkillSetTheme,
    backgroundColor: "#581c87",
    textColor: "#f3e8ff",
    accentColor: "#a855f7",
    borderColor: "#7c3aed",
    badgeColor: "#6d28d9",
    badgeColor1: "#a855f7",
    badgeColor2: "#c084fc",
    badgeColor3: "#6d28d9",
  },
}

export interface VisitorCountTheme {
  panelColor: string
  textColor: string
  labelColor: string
  lastDigitColor: string
  borderColor: string
  dividerColor: string
  backgroundColor: string
}

export const defaultVisitorCountTheme: VisitorCountTheme = {
  panelColor: "#1e1e1e",
  textColor: "#ffffff",
  labelColor: "#22f374",
  lastDigitColor: "#dc2626",
  borderColor: "#30363d",
  dividerColor: "#0a0a0a",
  backgroundColor: "#1a1b27",
}

export const presetVisitorCountThemes: Record<string, VisitorCountTheme> = {
  default: defaultVisitorCountTheme,
  ocean: {
    panelColor: "#0f172a",
    textColor: "#e2e8f0",
    labelColor: "#22f374",
    lastDigitColor: "#0ea5e9",
    borderColor: "#1e293b",
    dividerColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  forest: {
    panelColor: "#14532d",
    textColor: "#dcfce7",
    labelColor: "#22f374",
    lastDigitColor: "#22c55e",
    borderColor: "#166534",
    dividerColor: "#166534",
    backgroundColor: "#14532d",
  },
  sunset: {
    panelColor: "#451a03",
    textColor: "#fef3c7",
    labelColor: "#22f374",
    lastDigitColor: "#f59e0b",
    borderColor: "#92400e",
    dividerColor: "#92400e",
    backgroundColor: "#451a03",
  },
}

export const WIDGET_STEPS = [
  { id: "generator" as const, label: "Generate", icon: Activity },
  { id: "customize" as const, label: "Customize", icon: Palette },
  { id: "readme" as const, label: "Check", icon: FileCode },
]

export type StepId = (typeof WIDGET_STEPS)[number]["id"]
