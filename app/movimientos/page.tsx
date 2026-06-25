import { DashboardShell } from "@/components/dashboard-shell"
import { MovementsView } from "@/components/movements-view"

export default function MovementsPage() {
  return (
    <DashboardShell
      title="Historial de movimientos"
      description="Entradas y salidas de stock registradas para auditoría."
    >
      <MovementsView />
    </DashboardShell>
  )
}
