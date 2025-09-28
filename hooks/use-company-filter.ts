"use client"

import { useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useCompanyFilter() {
  const { user, empresa } = useAuth()

  const filterByCompany = useMemo(() => {
    if (!user || !empresa) {
      return {
        users: <T extends { empresaId?: string }>(items: T[]) => [] as T[],
        clientes: <T extends { empresaId?: string }>(items: T[]) => [] as T[],
        obras: <T extends { empresaId?: string }>(items: T[]) => [] as T[],
        orcamentos: <T extends { empresaId?: string }>(items: T[]) => [] as T[],
        agendamentos: <T extends { empresaId?: string }>(items: T[]) => [] as T[],
      }
    }

    return {
      users: <T extends { empresaId?: string }>(items: T[]) => items.filter((item) => item.empresaId === empresa.id),

      clientes: <T extends { empresaId?: string }>(items: T[]) => items.filter((item) => item.empresaId === empresa.id),

      obras: <T extends { empresaId?: string }>(items: T[]) => items.filter((item) => item.empresaId === empresa.id),

      orcamentos: <T extends { empresaId?: string }>(items: T[]) =>
        items.filter((item) => item.empresaId === empresa.id),

      agendamentos: <T extends { empresaId?: string }>(items: T[]) =>
        items.filter((item) => item.empresaId === empresa.id),
    }
  }, [user, empresa])

  return {
    ...filterByCompany,
    currentCompany: empresa,
    currentUser: user,
    isMultiCompany: true, // Sistema sempre multiempresa agora
  }
}
