import { DashboardShell } from "@/components/dashboard-shell"
import { InventoryDashboard } from "@/components/inventory-dashboard"

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard de inventario"
      description="Resumen general y listado de productos en stock."
    >
      <InventoryDashboard />
    </DashboardShell>
  )
}
