"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50/80">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
