"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftRight, Boxes, LayoutDashboard, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/productos/nuevo", label: "Nuevo producto", icon: Plus },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="size-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">Inventario</span>
          <span className="text-xs text-muted-foreground">Gestión de stock</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button render={<Link href="/productos/nuevo" />} nativeButton={false} className="w-full">
          <Plus className="size-4" data-icon="inline-start" />
          Agregar producto
        </Button>
      </div>
    </aside>
  )
}

export function MobileTopNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-sidebar px-3 py-2 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
