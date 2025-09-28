import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes Tailwind e outras classes de forma inteligente.
 * @param inputs classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$).
 * @param amount O valor a ser formatado.
 */
export function formatCurrency(amount: number | string | bigint): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  
  // Usa Intl.NumberFormat para formatação de moeda
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um objeto Date ou string de data para o formato DD/MM/AAAA.
 * @param date A data a ser formatada.
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}
