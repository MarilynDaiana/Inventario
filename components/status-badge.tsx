import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, type ProductStatus } from "@/lib/types"

const STATUS_STYLES: Record<ProductStatus, string> = {
  in_stock: "border border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  low_stock: "border border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  out_of_stock: "border border-destructive/20 bg-destructive/10 text-destructive",
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="ghost" className={cn("gap-1.5", STATUS_STYLES[status])}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "in_stock" && "bg-emerald-600 dark:bg-emerald-400",
          status === "low_stock" && "bg-amber-600 dark:bg-amber-400",
          status === "out_of_stock" && "bg-destructive",
        )}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
