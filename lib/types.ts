// Shared domain types for the inventory management system.
// These are intentionally framework-agnostic so they can be reused
// once a real Supabase client / API layer is wired in.

export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock"

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl: string
  status: ProductStatus
}

export type MovementType = "entrada" | "salida"

export interface Movement {
  id: string
  date: string // ISO string
  productId: string
  productName: string
  type: MovementType
  quantity: number
  reason: string
}

// Payload used by the create/edit form (no id / derived status).
export interface ProductFormValues {
  name: string
  sku: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl: string
}

// Stock thresholds used to derive a product's status.
export const LOW_STOCK_THRESHOLD = 5

export function deriveStatus(stock: number): ProductStatus {
  if (stock <= 0) return "out_of_stock"
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock"
  return "in_stock"
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  in_stock: "En stock",
  low_stock: "Stock bajo",
  out_of_stock: "Sin stock",
}

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
}
