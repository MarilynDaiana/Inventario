"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { MetricCards } from "@/components/metric-cards"
import { StatusBadge } from "@/components/status-badge"
import { formatCurrency, formatNumber } from "@/lib/format"
import { CATEGORIES } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"

const ALL_CATEGORIES = "all"

export function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Cargar datos en tiempo real desde Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("activo", true)
          .order("nombre", { ascending: true })

        if (error) {
          console.error("❌ ERROR DETALLADO DE SUPABASE:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          return
        }

        if (!data) {
          console.log("No se devolvieron datos de Supabase.")
          return
        }

        const mappedProducts: Product[] = data.map((p: any) => {
          let currentStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
          
          if (p.stock === 0) {
            currentStatus = "out_of_stock"
          } else if (p.stock <= 5) {
            currentStatus = "low_stock"
          }

          return {
            id: p.id,
            name: p.nombre,
            sku: p.sku,
            description: p.descripcion || "",
            category: p.categoria,
            price: Number(p.precio),
            stock: p.stock,
            status: currentStatus,
            imageUrl: p.imagen_url || "", // 🟢 CORRECCIÓN: Mapeamos la columna de la BD
          }
        })

        setProducts(mappedProducts)
      } catch (err: any) {
        console.error("❌ ERROR DE EXCEPCIÓN EN JAVASCRIPT:", err.message, err.stack)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Lógica unificada y limpia para el Soft Delete
  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return

    try {
      const { error } = await supabase
        .from("productos")
        .update({ activo: false })
        .eq("id", deleteTarget.id)

      if (error) {
        console.error("❌ Error al aplicar Soft Delete:", error)
        toastMessage && setToastMessage("Error: No se pudo dar de baja el producto.")
        return
      }

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setToastMessage(`Producto "${deleteTarget.name}" dado de baja correctamente.`)
      setTimeout(() => setToastMessage(null), 3000)

    } catch (err) {
      console.error("❌ Excepción al intentar dar de baja:", err)
    } finally {
      setDeleteTarget(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      const matchesCategory = category === ALL_CATEGORIES || p.category === category
      return matchesQuery && matchesCategory
    })
  }, [products, query, category])

  return (
    <div className="flex flex-col gap-6">
      <MetricCards products={products} />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU…"
              className="pl-8"
              aria-label="Buscar productos"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v as string)}>
              <SelectTrigger className="w-48" aria-label="Filtrar por categoría">
                <SelectValue>
                  {(value: string) =>
                    value === ALL_CATEGORIES ? "Todas las categorías" : value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button render={<Link href="/productos/nuevo" />} nativeButton={false}>
              <Plus className="size-4" data-icon="inline-start" />
              Agregar producto
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    Cargando inventario desde Supabase...
                  </TableCell>
                </TableRow>
              ) : filtered.map((product) => (
                <TableRow key={product.id}>
                  {/* 🟢 CELDA DE LA IMAGEN CON FALLBACK */}
                  <TableCell>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-[#1a1a1e]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-zinc-600" />
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(product.stock)}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/productos/nuevo?id=${product.id}`} />}
                      nativeButton={false}
                      aria-label={`Editar ${product.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                      aria-label={`Eliminar ${product.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    No se encontraron productos con los filtros actuales o la base de datos está vacía.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Mostrando {formatNumber(filtered.length)} de {formatNumber(products.length)} productos
        </div>
      </Card>

      {/* MODAL DE CONFIRMACIÓN */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 shadow-xl border border-border bg-popover text-popover-foreground animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              ¿Confirmar baja del producto?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Estás por dar de baja <span className="font-medium text-foreground">"{deleteTarget.name}"</span>. 
              El producto dejará de mostrarse en la grilla del inventario pero se conservará su historial de movimientos.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDeleteProduct}
              >
                Confirmar Baja
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TOAST / NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border border-border/40 text-sm font-medium flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)} 
            className="opacity-70 hover:opacity-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}