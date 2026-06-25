import { DashboardShell } from "@/components/dashboard-shell"
import { ProductForm } from "@/components/product-form"
import { MOCK_PRODUCTS } from "@/lib/mock-data"

export default async function ProductFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  // In edit mode we look the product up from mock data. Replace with a
  // Supabase query by id once the backend is connected.
  const product = id ? MOCK_PRODUCTS.find((p) => p.id === id) : undefined
  const isEditing = Boolean(product)

  return (
    <DashboardShell
      title={isEditing ? "Editar producto" : "Nuevo producto"}
      description={
        isEditing
          ? "Actualiza la información del producto seleccionado."
          : "Completa el formulario para registrar un nuevo producto."
      }
    >
      <ProductForm product={product} />
    </DashboardShell>
  )
}
