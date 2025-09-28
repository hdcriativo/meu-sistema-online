"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Truck, MapPin, CheckCircle, Clock, Ban } from "lucide-react"
import { mockEntregas, mockUsers, mockOrcamentos, mockObras } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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

export default function EntregasPage() {
  const { user, empresa } = useAuth()
  if (!user || !empresa) return null

  // Enriquecer dados de entrega com informações de motorista e obra
  const entregasCompletas = mockEntregas
    .filter(e => e.empresaId === empresa.id)
    .map(entrega => {
      const motorista = mockUsers.find(u => u.id === entrega.motoristId)
      const orcamento = mockOrcamentos.find(o => o.id === entrega.orcamentoId)
      const obra = orcamento ? mockObras.find(o => o.id === orcamento.obraId) : null
      return {
        ...entrega,
        motorista,
        orcamento,
        obra,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Entregas</h1>
              <p className="text-muted-foreground">Monitore o status de todas as entregas</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Entregas</CardTitle>
              <CardDescription>
                Lista completa de entregas realizadas pela sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entrega ID</TableHead>
                    <TableHead>Obra / Cliente</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entregasCompletas.map(entrega => (
                    <TableRow key={entrega.id}>
                      <TableCell className="font-medium">{entrega.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{entrega.obra?.name}</div>
                        <div className="text-sm text-muted-foreground">{entrega.obra?.cliente?.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                          {entrega.motorista?.name || "Não atribuído"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entrega.volumeEntregue} m³</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[entrega.status]}>
                          {statusText[entrega.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(entrega.startTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                      <TableCell>
                        {entrega.endTime
                          ? format(new Date(entrega.endTime), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                          : <Badge variant="secondary">Em andamento</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}