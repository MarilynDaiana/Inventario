// lib/utils.test.ts
import { describe, test, expect } from 'vitest';
import { calcularNuevoStock, formatearMoneda } from './utils';

describe('Pruebas Unitarias - Lógica de Inventario', () => {
  
  test('Debería incrementar el stock correctamente en una entrada', () => {
    const resultado = calcularNuevoStock(10, 5, 'entrada');
    expect(resultado).toBe(15);
  });

  test('Debería disminuir el stock correctamente en una salida', () => {
    const resultado = calcularNuevoStock(10, 4, 'salida');
    expect(resultado).toBe(6);
  });

  test('No debería permitir stock negativo si la salida supera al stock actual', () => {
    const resultado = calcularNuevoStock(5, 12, 'salida');
    expect(resultado).toBe(0);
  });

  test('Debería formatear el precio incluyendo el símbolo de pesos', () => {
    const precioFormateado = formatearMoneda(1250);
    expect(precioFormateado).toContain('$');
  });
});