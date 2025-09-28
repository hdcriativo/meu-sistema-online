// components/usuarios/PendingRegistrations.tsx (Corrigido para usar props)
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserCheck, UserX, Mail, Phone, Clock } from "lucide-react"
import type { User } from "@/lib/types" // Certifique-se de que o tipo User está importado

interface PendingRegistrationsProps {
    allUsers: User[]; // Lista completa de usuários da empresa
    onStatusChange: (userId: string, status: 'approved' | 'rejected') => void; // Callback para atualizar o estado principal
}

export function PendingRegistrations({ allUsers, onStatusChange }: PendingRegistrationsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 💥 Filtra usuários pendentes no useMemo
  const pendingUsers = useMemo(() => {
    return allUsers.filter((user) => user.isPendingApproval && !user.isActive);
  }, [allUsers]);

  const handleApprove = async (userId: string) => {
    setIsLoading(true)
    setMessage("")

    try {
      // Simular aprovação (Chamada API real deveria ocorrer aqui)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // 💥 CHAMA A FUNÇÃO PROP PARA ATUALIZAR O ESTADO PRINCIPAL
      onStatusChange(userId, 'approved'); 

      setMessage("Usuário aprovado! Link de ativação será enviado.");
    } catch (error) {
      setMessage("Erro ao aprovar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (userId: string) => {
    setIsLoading(true)
    setMessage("")

    try {
      // Simular rejeição (Chamada API real deveria ocorrer aqui)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 💥 CHAMA A FUNÇÃO PROP PARA ATUALIZAR O ESTADO PRINCIPAL
      onStatusChange(userId, 'rejected');

      setMessage("Cadastro rejeitado e removido do sistema.");
    } catch (error) {
      setMessage("Erro ao rejeitar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Cadastros Pendentes</span>
          </CardTitle>
          <CardDescription>Gerencie solicitações de acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Nenhum cadastro pendente de aprovação</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Cadastros Pendentes</span>
          <Badge variant="secondary">{pendingUsers.length}</Badge>
        </CardTitle>
        <CardDescription>Analise e aprove novos usuários que solicitaram acesso</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert>
              <AlertTitle>Status:</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {pendingUsers.map((user) => (
          <div key={user.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Solicitado em: {user.createdAt ? user.createdAt.toLocaleDateString("pt-BR") : 'Data não disponível'} às{" "}
              {user.createdAt ? user.createdAt.toLocaleTimeString("pt-BR") : ''}
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleApprove(user.id)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)} disabled={isLoading}>
                <UserX className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}