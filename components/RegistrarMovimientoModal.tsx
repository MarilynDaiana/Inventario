'use client';

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { calcularNuevoStock } from '@/lib/utils';

interface Producto {
  id: string;
  nombre: string;
  stock: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistrarMovimientoModal({ isOpen, onClose, onSuccess }: Props) {
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState('');
  const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar los productos para el selector desplegable
  useEffect(() => {
    async function cargarProductos() {
      const { data } = await supabase
        .from('productos')
        .select('id, nombre, stock')
        .eq('activo', true)
        .order('nombre');
      if (data) setProductos(data);
    }
    if (isOpen) cargarProductos();
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId || cantidad <= 0) {
      alert('Por favor, selecciona un producto y una cantidad válida.');
      return;
    }

    setLoading(true);

    try {
      // 1. Obtener el stock actual en tiempo real del producto seleccionado
      const productoSeleccionado = productos.find(p => p.id === productoId);
      if (!productoSeleccionado) return;

      // 2. Calcular el nuevo stock con la función utilitaria testeada
      const nuevoStock = calcularNuevoStock(productoSeleccionado.stock, cantidad, tipo);

      // 3. Insertar el movimiento en Supabase (Auditoría)
      const { error: errorMovimiento } = await supabase
        .from('movimientos')
        .insert({
          producto_id: productoId,
          tipo,
          cantidad,
          motivo: motivo || (tipo === 'entrada' ? 'Carga manual' : 'Ajuste / Venta manual')
        });

      if (errorMovimiento) throw errorMovimiento;

      // 4. Actualizar el stock acumulado en la tabla de Productos
      const { error: errorProducto } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', productoId);

      if (errorProducto) throw errorProducto;

      // Resetear formulario y avisar éxito
      setProductoId('');
      setCantidad(0);
      setMotivo('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      alert('Ocurrió un error al procesar el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-[#121214] border border-zinc-800 p-6 text-zinc-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <h2 className="text-xl font-semibold tracking-tight">⚙️ Registrar Movimiento</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Producto */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Seleccionar Producto</label>
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="w-full rounded-lg bg-[#1a1a1e] border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
              required
            >
              <option value="">-- Elige un producto --</option>
              {productos.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.nombre} (Stock actual: {prod.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo de Operación</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'entrada' | 'salida')}
              className="w-full rounded-lg bg-[#1a1a1e] border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              <option value="entrada">📥 Entrada (Sumar Stock)</option>
              <option value="salida">📤 Salida / Venta (Descontar Stock)</option>
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad || ''}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg bg-[#1a1a1e] border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
              placeholder="Ej: 5"
              required
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Motivo / Descripción</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-lg bg-[#1a1a1e] border border-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600"
              placeholder="Ej: Venta en mostrador, Ajuste por rotura, etc."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-white hover:bg-zinc-200 px-4 py-2 text-sm font-medium text-black transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}