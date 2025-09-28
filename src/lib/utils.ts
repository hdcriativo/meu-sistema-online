// ARQUIVO: src/lib/utils.ts

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * É robusta contra valores nulos, indefinidos ou NaN, retornando R$ 0,00.
 */
export const formatCurrency = (value: number | null | undefined): string => {
  // Garante que o valor é um número válido (ou 0 se for null/undefined/NaN)
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  
  return `R$ ${numericValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};