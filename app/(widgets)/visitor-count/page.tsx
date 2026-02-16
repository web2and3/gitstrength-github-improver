"use client"

import { useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { WIDGET_STEPS, presetVisitorCountThemes, defaultVisitorCountTheme } from "@/lib/widgets-types"
import type { VisitorCountTheme } from "@/lib/widgets-types"
import { useWidgets } from "@/contexts/widgets-context"
import { REPO_URL } from "@/lib/site-config"
import { HeaderBar } from "@/components/layout/header-bar"
import { MainContent } from "@/components/layout/main-content"
import { StepFooter } from "@/components/layout/step-footer"
import { VisitorCountFlow } from "@/components/widgets/visitor-count-flow"

export default function VisitorCountPage() {
  const { data: session } = useSession()
  const { visitorCount } = useWidgets()
  const {
    visitorCountActiveTab,
    setVisitorCountActiveTab,
    visitorCountKey,
    setVisitorCountKey,
    visitorCountGenerated,
    setVisitorCountGenerated,
    visitorCountTheme,
    setVisitorCountTheme,
    visitorCountCardKey,
    setVisitorCountCardKey,
  } = visitorCount

  const safeKey = visitorCountKey.trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const liveUrl =
    visitorCountGenerated && safeKey
      ? `${baseUrl}/api/visitor-count?key=${encodeURIComponent(safeKey)}&theme=${encodeURIComponent(JSON.stringify(visitorCountTheme))}`
      : ""
  const visitorCountCardUrl =
    liveUrl ? `${liveUrl}&t=${visitorCountCardKey}` : ""

  const updateVisitorCountThemeColor = useCallback(
    (property: keyof VisitorCountTheme, color: string) => {
      setVisitorCountTheme((prev) => ({ ...prev, [property]: color }))
      setVisitorCountCardKey((prev) => prev + 1)
    },
    [setVisitorCountTheme, setVisitorCountCardKey]
  )

  const applyVisitorCountPreset = useCallback(
    (presetName: string) => {
      setVisitorCountTheme(presetVisitorCountThemes[presetName] ?? defaultVisitorCountTheme)
      setVisitorCountCardKey((prev) => prev + 1)
    },
    [setVisitorCountTheme, setVisitorCountCardKey]
  )

  const generateVisitorCountReadme = useCallback(() => {
    if (!visitorCountGenerated || !safeKey) return ""
    const url = `${baseUrl}/api/visitor-count?key=${encodeURIComponent(safeKey)}&theme=${encodeURIComponent(JSON.stringify(visitorCountTheme))}`
    return `<div align="center">

[![Visitor Count](${url})](${REPO_URL})

</div>`
  }, [visitorCountGenerated, safeKey, visitorCountTheme, baseUrl])

  const copyVisitorCountReadme = useCallback(() => {
    const readme = generateVisitorCountReadme()
    if (readme) {
      navigator.clipboard.writeText(readme)
      toast.success("README copied")
    } else {
      toast.error("Generate your counter first")
    }
  }, [generateVisitorCountReadme])

  const steps = WIDGET_STEPS
  const stepIndex = steps.findIndex((s) => s.id === visitorCountActiveTab)
  const canGoNext = stepIndex < steps.length - 1
  const canGoBack = stepIndex > 0
  const canAdvance = visitorCountGenerated
  const goNext = () => {
    if (canGoNext && canAdvance) setVisitorCountActiveTab(steps[stepIndex + 1].id)
  }
  const goBack = () => {
    if (canGoBack) setVisitorCountActiveTab(steps[stepIndex - 1].id)
  }

  const githubLogin = session?.user && "login" in session.user ? (session.user as { login?: string }).login : undefined
  const usernameDisabled = !!githubLogin
  useEffect(() => {
    if (githubLogin) setVisitorCountKey(githubLogin)
  }, [githubLogin, setVisitorCountKey])

  return (
    <>
      <HeaderBar
        currentTab={visitorCountActiveTab}
        stepIndex={stepIndex}
        canAdvance={canAdvance}
        onStepClick={setVisitorCountActiveTab}
      />
      <MainContent>
        <VisitorCountFlow
          activeTab={visitorCountActiveTab}
          onTabChange={setVisitorCountActiveTab}
          visitorCountKey={visitorCountKey}
          setVisitorCountKey={setVisitorCountKey}
          visitorCountGenerated={visitorCountGenerated}
          setVisitorCountGenerated={setVisitorCountGenerated}
          visitorCountTheme={visitorCountTheme}
          visitorCountCardKey={visitorCountCardKey}
          setVisitorCountCardKey={setVisitorCountCardKey}
          visitorCountCardUrl={visitorCountCardUrl}
          visitorCountCardUrlLive={liveUrl}
          baseUrl={baseUrl}
          updateVisitorCountThemeColor={updateVisitorCountThemeColor}
          applyVisitorCountPreset={applyVisitorCountPreset}
          generateVisitorCountReadme={generateVisitorCountReadme}
          copyVisitorCountReadme={copyVisitorCountReadme}
          onGenerateSuccess={() => toast.success("Visitor counter generated")}
          onGenerateError={() => toast.error("Enter a key first")}
          usernameDisabled={usernameDisabled}
        />
      </MainContent>
      <StepFooter
        currentStepIndex={stepIndex}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        canAdvance={canAdvance}
        onBack={goBack}
        onNext={goNext}
      />
    </>
  )
}
