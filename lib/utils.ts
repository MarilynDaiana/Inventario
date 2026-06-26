import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// lib/utils.ts

// Calcula el stock resultante de un movimiento cuidando que no baje de 0
export function calcularNuevoStock(stockActual: number, cantidadMovimiento: number, tipo: 'entrada' | 'salida'): number {
  if (cantidadMovimiento < 0) return stockActual;
  
  if (tipo === 'entrada') {
    return stockActual + cantidadMovimiento;
  }
  if (tipo === 'salida') {
    const resultado = stockActual - cantidadMovimiento;
    return resultado < 0 ? 0 : resultado; // El stock nunca puede ser negativo
  }
  return stockActual;
}

// Formatea un número como moneda local ARS
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
}