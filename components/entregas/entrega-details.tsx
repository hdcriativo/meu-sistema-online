"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Building,
  User,
  Package,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Pencil,
  Truck,
} from "lucide-react"
import { Entrega, Orcamento } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { mockOrcamentos, mockUsers, mockObras, mockClientes } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

interface EntregaDetailsProps {
  entrega: Entrega
}

const statusColors = {
  iniciada: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  concluida: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  problema: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusText = {
  iniciada: "Iniciada",
  concluida: "Concluída",
  problema: "Com Problema",
}

export function EntregaDetails({ entrega }: EntregaDetailsProps) {
  const { empresa } = useAuth()
  if (!empresa) return null

  // Dados mockados para demonstração
  const orcamento = mockOrcamentos.find((o) => o.id === entrega.orcamentoId)
  const motorista = mockUsers.find((u) => u.id === entrega.motoristId)
  const obra = orcamento ? mockObras.find((o) => o.id === orcamento.obraId) : null
  const cliente = obra ? mockClientes.find((c) => c.id === obra.clienteId) : null

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Detalhes da Entrega</CardTitle>
        <Badge className={statusColors[entrega.status]}>{statusText[entrega.status]}</Badge>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Início: {format(new Date(entrega.startTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
        {entrega.endTime && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>
              Fim: {format(new Date(entrega.endTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Motorista</p>
              <p className="text-sm text-muted-foreground">{motorista?.name || "Não atribuído"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Obra</p>
              <p className="text-sm text-muted-foreground">{obra?.name || "Não informado"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Endereço</p>
              <p className="text-sm text-muted-foreground">{obra?.address || "Não informado"}</p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Volume de Concreto</p>
              <p className="text-sm text-muted-foreground">{entrega.volumeEntregue} m³</p>
            </div>
          </div>
        </div>
        {entrega.observacoes && (
          <>
            <Separator />
            <div>
              <p className="font-semibold text-foreground">Observações</p>
              <p className="text-sm text-muted-foreground mt-2">{entrega.observacoes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}