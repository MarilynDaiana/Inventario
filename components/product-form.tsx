"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { ImageIcon, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"
import type { Product, ProductFormValues } from "@/lib/types"

type Errors = Partial<Record<keyof ProductFormValues, string>>

interface ProductFormProps {
  // Cuando se provee, el formulario se comporta en modo "edición".
  product?: Product
}

const EMPTY: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  category: "",
  price: 0,
  stock: 0,
  imageUrl: "",
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(product)

  const [values, setValues] = useState<ProductFormValues>(
    product
      ? {
          name: product.name,
          sku: product.sku,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          imageUrl: (product as any).imagen_url || product.imageUrl || "",
        }
      : EMPTY,
  )
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  
  // Estado local para almacenar el archivo seleccionado antes de subirlo
  const [imageFile, setImageFile] = useState<File | null>(null)

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Errors = {}
    if (!values.name.trim()) next.name = "El nombre es obligatorio."
    if (!values.sku.trim()) next.sku = "El SKU es obligatorio."
    if (!values.category) next.category = "Selecciona una categoría."
    if (values.price < 0 || Number.isNaN(values.price)) next.price = "Ingresa un precio válido."
    if (values.stock < 0 || Number.isNaN(values.stock) || !Number.isInteger(values.stock))
      next.stock = "El stock debe ser un entero positivo."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Función interna para subir el archivo seleccionado al Storage
  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    // Creamos un nombre único usando un timestamp para evitar colisiones
    const fileName = `${Date.now()}.${fileExt}`

    // 1. Subir la imagen real al bucket público 'productos'
    const { error: uploadError } = await supabase.storage
      .from("productos")
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // 2. Resolver la URL pública que generó Supabase
    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      let finalImageUrl = values.imageUrl

      // Si el usuario seleccionó un archivo físico nuevo, lo subimos primero
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      }

      // Preparamos el objeto con los nombres exactos de la base de datos, mapeando la imagen
      const databasePayload = {
        nombre: values.name,
        sku: values.sku,
        descripcion: values.description,
        categoria: values.category,
        precio: values.price,
        stock: values.stock,
        imagen_url: finalImageUrl, // Guardamos la URL pública en la tabla de productos
      }

      if (isEditing && product) {
        // Modo edición: actualiza el registro correspondiente
        const { error } = await supabase
          .from("productos")
          .update(databasePayload)
          .eq("id", product.id)

        if (error) throw error
      } else {
        // Modo creación: inserta un registro nuevo y retorna el elemento creado
        const { data: nuevoProducto, error: errorProducto } = await supabase
          .from("productos")
          .insert([databasePayload])
          .select()
          .single()

        if (errorProducto) throw errorProducto

        // Si se insertó el producto, disparamos automáticamente el historial
        if (nuevoProducto) {
          const { error: errorMovimiento } = await supabase
            .from("movimientos")
            .insert([
              {
                producto_id: nuevoProducto.id,
                tipo: "entrada",
                cantidad: Number(nuevoProducto.stock),
                motivo: "Carga inicial de producto",
              },
            ])

          if (errorMovimiento) {
            console.error("❌ Error real en movimientos:", errorMovimiento.message, errorMovimiento.details)
          }
        }
      }

      // Redirigir al dashboard principal e invalidar la caché para ver el cambio
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Error al guardar en Supabase:", err)
      alert("Hubo un problema al guardar el producto. Revisá la consola.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej. Teclado Mecánico RGB"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <FieldError>{errors.name}</FieldError> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={values.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="Ej. TM-RGB-204"
              className="font-mono"
              aria-invalid={Boolean(errors.sku)}
            />
            {errors.sku ? <FieldError>{errors.sku}</FieldError> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Breve descripción del producto…"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select value={values.category} onValueChange={(v) => update("category", v as string)}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.category)}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category ? <FieldError>{errors.category}</FieldError> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={Number.isNaN(values.price) ? "" : values.price}
                onChange={(e) => update("price", e.target.valueAsNumber)}
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price ? <FieldError>{errors.price}</FieldError> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                step="1"
                value={Number.isNaN(values.stock) ? "" : values.stock}
                onChange={(e) => update("stock", e.target.valueAsNumber)}
                aria-invalid={Boolean(errors.stock)}
                disabled={isEditing} // Tradicionalmente no alteras stock inicial directo en edición
              />
              {errors.stock ? <FieldError>{errors.stock}</FieldError> : null}
            </div>
          </div>

          {/* Sección de Carga de Imagen por Archivo Real */}
          <div className="grid gap-2">
            <Label>Imagen del Producto</Label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Contenedor de Vista Previa */}
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-zinc-800 bg-[#1a1a1e] text-zinc-500">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Previsualización"
                    className="size-full object-cover"
                  />
                ) : values.imageUrl ? (
                  <img
                    src={values.imageUrl}
                    alt="Imagen de Supabase"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6 text-zinc-600" />
                )}
              </div>

              {/* Selector e Input de Archivo Físico */}
              <div className="flex-1">
                <div className="relative flex items-center justify-center rounded-lg border border-zinc-800 bg-[#121214] p-3 text-center transition hover:border-zinc-700 cursor-pointer">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Upload className="size-4 text-zinc-500" />
                    <span>{imageFile ? "Cambiar foto" : "Subir imagen desde el equipo"}</span>
                  </div>
                </div>
                {imageFile && (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    ✓ Imagen seleccionada: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
            <Button variant="outline" type="button" render={<Link href="/" />} nativeButton={false}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
              {isEditing ? "Guardar cambios" : "Guardar producto"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className={cn("text-xs font-medium text-destructive")}>{children}</p>
}