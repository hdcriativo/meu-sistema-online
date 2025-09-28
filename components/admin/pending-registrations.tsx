// components/admin/pending-registrations.tsx
// Corrigido: Adicionada checagem de nulo (|| []) para evitar o erro fatal de .filter() durante o prerendering.

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserCheck, UserX, Mail, Phone, Clock } from "lucide-react"
import type { User } from "@/lib/types" // Certifique-se de que o tipo User está importado

// O componente agora espera a lista e a função de mudança de status
interface PendingRegistrationsProps {
    allUsers?: User[]; // Tornando opcional para evitar erro se não for fornecido
    onStatusChange: (userId: string, status: 'approved' | 'rejected') => void; 
}

// Removendo estados locais de loading/message para simplificar a comunicação entre componentes
export function PendingRegistrations({ allUsers, onStatusChange }: PendingRegistrationsProps) {

  // FIX CRÍTICO: Usa 'allUsers || []' para garantir que .filter() é chamado em um array, não em 'undefined'.
  const pendingUsers = useMemo(() => {
    return (allUsers || []).filter((user) => user.isPendingApproval && !user.isActive);
  }, [allUsers]);

  const handleApprove = (userId: string) => {
    // Chama a função de callback do componente pai (page.tsx)
    onStatusChange(userId, 'approved'); 
  }

  const handleReject = (userId: string) => {
    // Chama a função de callback do componente pai (page.tsx)
    onStatusChange(userId, 'rejected');
  }
  
  // Adicionando uma função auxiliar para formatação segura de data
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Data não disponível';
    try {
      // Nota: user.createdAt deve ser um Date object ou string conversível em Date
      return `${new Date(date).toLocaleDateString("pt-BR")} às ${new Date(date).toLocaleTimeString("pt-BR")}`;
    } catch {
      return 'Data Inválida';
    }
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Nenhum cadastro pendente de aprovação</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => (
        <div key={user.id} className="border rounded-lg p-4 space-y-3 bg-white dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{user.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="capitalize text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {user.role}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Solicitado em: {formatDate(user.createdAt)}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
                size="sm"
                onClick={() => handleApprove(user.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleReject(user.id)}
            >
              <UserX className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
