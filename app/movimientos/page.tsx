'use client';

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { MovementsView } from "@/components/movements-view"
import RegistrarMovimientoModal from "@/components/RegistrarMovimientoModal"

export default function MovementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Estado para forzar la actualización del componente hijo
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMovimientoExitoso = () => {
    // Al incrementar el contador, React vuelve a renderizar MovementsView de inmediato
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      <DashboardShell
        title="Historial de movimientos"
        description="Entradas y salidas de stock registradas para auditoría."
      >
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white hover:bg-zinc-200 px-4 py-2 text-sm font-medium text-black transition shadow-sm"
            >
              + Registrar movimiento
            </button>
          </div>

          {/* Le pasamos la key para forzar el re-render instantáneo al guardar */}
          <MovementsView key={refreshKey} />
        </div>
      </DashboardShell>

      <RegistrarMovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMovimientoExitoso}
      />
    </>
  )
}