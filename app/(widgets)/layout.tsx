import type { ReactNode } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { WidgetsProvider } from "@/contexts/widgets-context"

export default function WidgetsLayout({ children }: { children: ReactNode }) {
  return (
    <WidgetsProvider>
      <AppShell>{children}</AppShell>
    </WidgetsProvider>
  )
}
