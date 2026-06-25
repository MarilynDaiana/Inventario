import type { LucideIcon } from "lucide-react"
import { AlertTriangle, DollarSign, Package, Tag } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/format"
import { LOW_STOCK_THRESHOLD, type Product } from "@/lib/types"

interface Metric {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accent?: boolean
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{metric.hint}</p>
        </div>
        <div
          className={
            metric.accent
              ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          }
        >
          <Icon className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCards({ products }: { products: Product[] }) {
  const totalProducts = products.length
  const lowStock = products.filter((p) => p.status === "low_stock" || p.status === "out_of_stock").length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const categories = new Set(products.map((p) => p.category)).size

  const metrics: Metric[] = [
    {
      label: "Total de productos",
      value: formatNumber(totalProducts),
      hint: "Productos registrados",
      icon: Package,
    },
    {
      label: "Stock bajo",
      value: formatNumber(lowStock),
      hint: `Umbral ≤ ${LOW_STOCK_THRESHOLD} unidades`,
      icon: AlertTriangle,
      accent: lowStock > 0,
    },
    {
      label: "Valor del inventario",
      value: formatCurrency(totalValue),
      hint: "Precio × stock disponible",
      icon: DollarSign,
    },
    {
      label: "Categorías",
      value: formatNumber(categories),
      hint: "Categorías activas",
      icon: Tag,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  )
}
