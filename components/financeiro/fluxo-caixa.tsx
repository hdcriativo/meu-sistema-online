"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { mockFinanceiroMovimentos, mockOrcamentos, mockCaminhoes, mockUsuarios } from "@/lib/mock-data"
import { mockClientes } from "@/lib/mock-clientes"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  pago: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  vencido: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function FluxoCaixa() {
  const { user, empresa } = useAuth()
  if (!user || !empresa) return null

  const movimentos = mockFinanceiroMovimentos.filter(m => m.empresaId === empresa.id);

  const totalReceita = movimentos
    .filter(m => m.type === "receita")
    .reduce((sum, mov) => sum + mov.amount, 0);

  const totalDespesa = movimentos
    .filter(m => m.type === "despesa")
    .reduce((sum, mov) => sum + mov.amount, 0);

  const saldo = totalReceita - totalDespesa;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movimentos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movimentos">Movimentações</TabsTrigger>
          <TabsTrigger value="orcamentos-faturamento">Orçamentos (Faturamento)</TabsTrigger>
        </TabsList>
        <TabsContent value="movimentos">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações</CardTitle>
              <CardDescription>
                Lista de receitas e despesas registradas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((mov) => {
                    let detalhes = '';
                    if (mov.userId) {
                      const usuario = mockUsuarios.find(u => u.id === mov.userId);
                      detalhes = usuario ? `Usuário: ${usuario.name}` : 'Usuário Desconhecido';
                    }
                    if (mov.caminhaoId) {
                      const caminhao = mockCaminhoes.find(c => c.id === mov.caminhaoId);
                      detalhes = caminhao ? `Caminhão: ${caminhao.modelo} (${caminhao.placa})` : 'Caminhão Desconhecido';
                    }

                    return (
                      <TableRow key={mov.id}>
                        <TableCell>{format(new Date(mov.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium">{mov.description}</TableCell>
                        <TableCell>{mov.category}</TableCell>
                        <TableCell>{detalhes}</TableCell>
                        <TableCell className={`${mov.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {mov.type === 'receita' ? '+' : '-'} R$ {mov.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orcamentos-faturamento">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos para Faturamento</CardTitle>
              <CardDescription>
                Gerencie orçamentos que precisam ser faturados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orçamento ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrcamentos.filter(o => o.empresaId === empresa.id).map(orc => {
                    const cliente = mockClientes.find(c => c.id === orc.clienteId);
                    return (
                      <TableRow key={orc.id}>
                        <TableCell className="font-medium">{orc.id}</TableCell>
                        <TableCell>{cliente?.name}</TableCell>
                        <TableCell>{format(new Date(orc.createdAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>R$ {orc.totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[orc.status]}>
                            {orc.status.charAt(0).toUpperCase() + orc.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}