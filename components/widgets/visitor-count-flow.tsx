"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Copy, Palette, Code, Activity, RefreshCw } from "lucide-react"
import { WIDGET_STEPS, presetVisitorCountThemes, defaultVisitorCountTheme } from "@/lib/widgets-types"
import type { VisitorCountTheme, StepId } from "@/lib/widgets-types"

const RESERVED_KEY = "web2and3"

function normalizeKey(key: string): string {
  return key.trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 64)
}

interface VisitorCountFlowProps {
  activeTab: StepId
  onTabChange: (value: StepId) => void
  visitorCountKey: string
  setVisitorCountKey: (v: string) => void
  visitorCountGenerated: boolean
  setVisitorCountGenerated: (v: boolean) => void
  visitorCountTheme: VisitorCountTheme
  visitorCountCardKey: number
  setVisitorCountCardKey: (fn: (prev: number) => number) => void
  visitorCountCardUrl: string
  /** Same as card URL but without t= (use for Copy URL / Open so each load increments) */
  visitorCountCardUrlLive: string
  /** Origin for API requests (e.g. window.location.origin) */
  baseUrl: string
  updateVisitorCountThemeColor: (key: keyof VisitorCountTheme, color: string) => void
  applyVisitorCountPreset: (name: string) => void
  generateVisitorCountReadme: () => string
  copyVisitorCountReadme: () => void
  onGenerateSuccess: () => void
  onGenerateError: () => void
  /** When true, key is taken from logged-in user and input is disabled */
  usernameDisabled?: boolean
  /** Logged-in GitHub username; when "web2and3", the reserved key is allowed */
  loggedInUsername?: string
}

export function VisitorCountFlow({
  activeTab,
  onTabChange,
  visitorCountKey,
  setVisitorCountKey,
  visitorCountGenerated,
  setVisitorCountGenerated,
  visitorCountTheme,
  visitorCountCardKey,
  setVisitorCountCardKey,
  visitorCountCardUrl,
  visitorCountCardUrlLive,
  baseUrl,
  updateVisitorCountThemeColor,
  applyVisitorCountPreset,
  generateVisitorCountReadme,
  copyVisitorCountReadme,
  onGenerateSuccess,
  onGenerateError,
  usernameDisabled = false,
  loggedInUsername,
}: VisitorCountFlowProps) {
  const steps = WIDGET_STEPS
  const [mounted, setMounted] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [inputValue, setInputValue] = useState(visitorCountKey)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    setInputValue(visitorCountKey)
  }, [visitorCountKey])

  const normalizedKey = normalizeKey(inputValue)
  const isReservedKey =
    normalizedKey === RESERVED_KEY && loggedInUsername !== RESERVED_KEY

  const handleGenerate = async () => {
    if (!normalizedKey) {
      onGenerateError()
      return
    }
    if (isReservedKey) {
      toast.error("This key is reserved")
      return
    }
    setVisitorCountKey(normalizedKey)
    setGenerating(true)
    try {
      const url = `${baseUrl}/api/visitor-count?key=${encodeURIComponent(normalizedKey)}&preview=1&format=json`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const count = typeof data?.count === "number" ? data.count : 0
        if (count > 0) {
          toast.info(`This key is already in use with ${count} visitors. Your card will continue from this count.`)
        }
      }
    } catch {
      // ignore; we still allow generate
    }
    setVisitorCountGenerated(true)
    setVisitorCountCardKey((prev) => prev + 1)
    onGenerateSuccess()
    setGenerating(false)
  }

  if (!mounted) {
    return (
      <div className="w-full space-y-6" aria-hidden>
        <div className="inline-flex h-10 w-full items-center justify-center rounded-md bg-muted p-1" />
        <div className="min-h-[320px] rounded-md bg-muted/50" />
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const idx = steps.findIndex((s) => s.id === value)
        if (idx <= 0 || visitorCountGenerated) onTabChange(value as StepId)
      }}
      className="w-full"
    >
      <TabsContent value="generator" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              {usernameDisabled ? "Your visitor counter" : "Enter counter key"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usernameDisabled && (
              <p className="text-sm text-muted-foreground">
                Using your account: <strong>{inputValue || visitorCountKey}</strong>
              </p>
            )}
            {!usernameDisabled && (
              <p className="text-sm text-muted-foreground">
                Use a unique key per profile or repo (e.g. your username). Only letters, numbers, hyphen, underscore.
              </p>
            )}
            {isReservedKey && (
              <p className="text-sm text-amber-600 font-medium">
                This key is reserved and cannot be used.
              </p>
            )}
            <div className="flex gap-2 flex-wrap items-end">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Input
                  id="vc-key"
                  placeholder="e.g. my-username or my-repo"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={usernameDisabled}
                />
              </div>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !normalizedKey || isReservedKey}
                className="bg-green-600 hover:bg-green-700"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {visitorCountGenerated && visitorCountCardUrl && (
          <Card className="shadow-lg overflow-hidden border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Visitor counter (flip-digit style)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => navigator.clipboard.writeText(visitorCountCardUrlLive)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  onClick={() => window.open(visitorCountCardUrlLive, "_blank")}
                  size="sm"
                  variant="outline"
                >
                  View / Open
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this URL in your README. The count increases each time the image is loaded (e.g. when someone visits your profile).
              </p>
              <div className="flex justify-center p-4 rounded-lg">
                <img
                  key={visitorCountCardKey}
                  src={visitorCountCardUrl}
                  alt="Visitor count"
                  className="max-h-[200px] w-auto"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="customize" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-green-600" />
              Customize Your Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Preset themes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {Object.entries(presetVisitorCountThemes).map(([name, preset]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyVisitorCountPreset(name)}
                    className="capitalize"
                    style={{
                      backgroundColor: preset.backgroundColor,
                      color: preset.textColor,
                      borderColor: preset.borderColor,
                    }}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  ["backgroundColor", "Card background"],
                  ["panelColor", "Digit panel"],
                  ["textColor", "Digit text"],
                  ["labelColor", "Visitors label"],
                  ["lastDigitColor", "Last digit (highlight)"],
                  ["borderColor", "Frame border"],
                  ["dividerColor", "Divider"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id={key}
                      type="color"
                      value={visitorCountTheme[key]}
                      onChange={(e) => updateVisitorCountThemeColor(key, e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={visitorCountTheme[key]}
                      onChange={(e) => updateVisitorCountThemeColor(key, e.target.value)}
                      placeholder={defaultVisitorCountTheme[key]}
                    />
                  </div>
                </div>
              ))}
            </div>
            {visitorCountGenerated && visitorCountCardUrl && (
              <div className="border-t pt-6">
                <Label className="text-base font-medium">Live preview</Label>
                <div className="flex justify-center p-4 mt-4 rounded-lg">
                  <img
                    key={visitorCountCardKey}
                    src={visitorCountCardUrl}
                    alt="Visitor count"
                    className="max-h-[200px] w-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="readme" className="space-y-6 mt-0">
        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              Embed / Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={copyVisitorCountReadme} size="sm" className="bg-green-600 hover:bg-green-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy README
              </Button>
              {visitorCountCardUrlLive && (
                <Button onClick={() => window.open(visitorCountCardUrlLive, "_blank")} size="sm" variant="outline">
                  Test card URL
                </Button>
              )}
            </div>
            <Textarea
              value={generateVisitorCountReadme()}
              readOnly
              className="min-h-[200px] font-mono text-sm"
              placeholder="Generate your visitor counter first to see the embed code."
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
