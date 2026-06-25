"use client"

import { useMemo, useState } from "react"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatDateTime, formatNumber } from "@/lib/format"
import { MOCK_MOVEMENTS } from "@/lib/mock-data"
import { MOVEMENT_LABELS, type Movement, type MovementType } from "@/lib/types"

const ALL = "all"

export function MovementsView() {
  // Local state seeded with mock data — swap for a Supabase query later.
  const [movements] = useState<Movement[]>(MOCK_MOVEMENTS)
  const [filter, setFilter] = useState<string>(ALL)

  const sorted = useMemo(
    () =>
      [...movements]
        .filter((m) => filter === ALL || m.type === filter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [movements, filter],
  )

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <p className="text-sm text-muted-foreground">
          Registro de auditoría de entradas y salidas de stock
        </p>
        <Select value={filter} onValueChange={(v) => setFilter(v as string)}>
          <SelectTrigger className="w-40" aria-label="Filtrar por tipo">
            <SelectValue>
              {(value: string) =>
                value === "entrada" ? "Entradas" : value === "salida" ? "Salidas" : "Todos"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="salida">Salidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(m.date)}
                </TableCell>
                <TableCell className="font-medium text-foreground">{m.productName}</TableCell>
                <TableCell>
                  <MovementTag type={m.type} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    m.type === "entrada"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {m.type === "entrada" ? "+" : "−"}
                  {formatNumber(m.quantity)}
                </TableCell>
                <TableCell className="text-muted-foreground">{m.reason}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  No hay movimientos para mostrar.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function MovementTag({ type }: { type: MovementType }) {
  const isEntry = type === "entrada"
  const Icon = isEntry ? ArrowDownLeft : ArrowUpRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        isEntry
          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      <Icon className="size-3" />
      {MOVEMENT_LABELS[type]}
    </span>
  )
}
