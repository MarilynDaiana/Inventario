import { notFound } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductForm } from "@/components/product-form"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"

export default async function ProductFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  let product: Product | undefined = undefined

  // Si viene un ID en la URL, significa que estamos editando
  if (id) {
    const { data: productoDb, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single()

    // Si hay un error o no encuentra el producto, tiramos un 404 controlado
    if (error || !productoDb) {
      notFound()
    }

    // 1. Calculamos el estado de manera dinámica según el stock real
    let currentStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
    if (productoDb.stock === 0) {
      currentStatus = "out_of_stock"
    } else if (productoDb.stock <= 5) {
      currentStatus = "low_stock"
    }
    // Mapeamos los datos de Postgres a la interfaz del Frontend
    product = {
      id: productoDb.id,
      name: productoDb.nombre,
      sku: productoDb.sku,
      description: productoDb.descripcion || "",
      category: productoDb.categoria,
      price: Number(productoDb.precio),
      stock: productoDb.stock,
      status: currentStatus,
      imageUrl: productoDb.imagen_url || "",
    }
  }

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