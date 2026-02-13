"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { defaultTheme, defaultSkillSetTheme } from "@/lib/widgets-types"
import type { StreakData, CardTheme, SkillSetTheme, StepId } from "@/lib/widgets-types"

interface StreakState {
  username: string
  streakData: StreakData | null
  loading: boolean
  theme: CardTheme
  activeTab: StepId
  cardImageError: boolean
  cardImageLoaded: boolean
  cardKey: number
  useEmbeddedAvatar: boolean
}

interface SkillSetState {
  skillSetActiveTab: StepId
  skillsInput: string
  skillSetGenerated: boolean
  skillSetTheme: SkillSetTheme
  skillSetCardKey: number
  skillSetUsername: string
}

interface WidgetsContextValue {
  streak: StreakState & {
    setUsername: (v: string) => void
    setStreakData: (v: StreakData | null) => void
    setLoading: (v: boolean) => void
    setTheme: (v: CardTheme | ((prev: CardTheme) => CardTheme)) => void
    setActiveTab: (v: StepId) => void
    setCardImageError: (v: boolean) => void
    setCardImageLoaded: (v: boolean) => void
    setCardKey: (v: number | ((prev: number) => number)) => void
    setUseEmbeddedAvatar: (v: boolean) => void
  }
  skillSet: SkillSetState & {
    setSkillSetActiveTab: (v: StepId) => void
    setSkillsInput: (v: string) => void
    setSkillSetGenerated: (v: boolean) => void
    setSkillSetTheme: (v: SkillSetTheme | ((prev: SkillSetTheme) => SkillSetTheme)) => void
    setSkillSetCardKey: (v: number | ((prev: number) => number)) => void
    setSkillSetUsername: (v: string) => void
  }
}

const WidgetsContext = createContext<WidgetsContextValue | null>(null)

export function WidgetsProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("")
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<CardTheme>(defaultTheme)
  const [activeTab, setActiveTab] = useState<StepId>("generator")
  const [cardImageError, setCardImageError] = useState(false)
  const [cardImageLoaded, setCardImageLoaded] = useState(false)
  const [cardKey, setCardKey] = useState(0)
  const [useEmbeddedAvatar, setUseEmbeddedAvatar] = useState(true)

  const [skillSetActiveTab, setSkillSetActiveTab] = useState<StepId>("generator")
  const [skillsInput, setSkillsInput] = useState("")
  const [skillSetGenerated, setSkillSetGenerated] = useState(false)
  const [skillSetTheme, setSkillSetTheme] = useState<SkillSetTheme>(defaultSkillSetTheme)
  const [skillSetCardKey, setSkillSetCardKey] = useState(0)
  const [skillSetUsername, setSkillSetUsername] = useState("")

  const value: WidgetsContextValue = {
    streak: {
      username,
      streakData,
      loading,
      theme,
      activeTab,
      cardImageError,
      cardImageLoaded,
      cardKey,
      useEmbeddedAvatar,
      setUsername,
      setStreakData,
      setLoading,
      setTheme,
      setActiveTab,
      setCardImageError,
      setCardImageLoaded,
      setCardKey,
      setUseEmbeddedAvatar,
    },
    skillSet: {
      skillSetActiveTab,
      skillsInput,
      skillSetGenerated,
      skillSetTheme,
      skillSetCardKey,
      skillSetUsername,
      setSkillSetActiveTab,
      setSkillsInput,
      setSkillSetGenerated,
      setSkillSetTheme,
      setSkillSetCardKey,
      setSkillSetUsername,
    },
  }

  return (
    <WidgetsContext.Provider value={value}>
      {children}
    </WidgetsContext.Provider>
  )
}

export function useWidgets() {
  const ctx = useContext(WidgetsContext)
  if (!ctx) throw new Error("useWidgets must be used within WidgetsProvider")
  return ctx
}
