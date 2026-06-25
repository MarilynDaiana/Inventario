import type { ReactNode } from "react"

import { AppSidebar, MobileTopNav } from "@/components/app-sidebar"

interface DashboardShellProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function DashboardShell({ title, description, actions, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopNav />
        <header className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="min-w-0">
            <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
