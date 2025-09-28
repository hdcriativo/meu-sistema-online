"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockObras, mockClientes } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { NewObraDialog } from "@/components/obras/new-obra-dialog"

// Tipos de dados
type Obra = {
  id: string
  name: string
  clienteId: string
  address: string
  status: "planejamento" | "em_andamento" | "concluida"
  startDate: Date
  createdAt: Date
  areaType?: string
  metrosCubicos?: number
  hasBomba?: boolean
  locationLink?: string
}

type Cliente = {
  id: string
  name: string
  telefone?: string
  address?: string
}

const statusVariant = (status: string) => {
  switch (status) {
    case "em_andamento":
      return "em_andamento"
    case "concluida":
    case "planejamento":
      return status
    default:
      return "default"
  }
}

// Definição das colunas da tabela
const columns: ColumnDef<Obra>[] = [
  {
    accessorKey: "clienteId",
    header: "Nome do Cliente",
    cell: ({ row }) => {
      const obra = row.original
      const cliente = mockClientes.find(c => c.id === obra.clienteId)
      return cliente ? cliente.name : "N/A"
    },
  },
  {
    accessorKey: "address",
    header: "Endereço",
  },
  {
    accessorKey: "areaType",
    header: "Tipo de Área",
  },
  {
    accessorKey: "metrosCubicos",
    header: "m³",
  },
  {
    accessorKey: "hasBomba",
    header: "Bomba",
    cell: ({ row }) => {
      const hasBomba = row.original.hasBomba
      return hasBomba ? "Sim" : "Não"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={statusVariant(status)}>
          {status.replace(/_/g, " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: "Início",
    cell: ({ row }) => format(new Date(row.getValue("startDate")), "dd/MM/yyyy", { locale: ptBR }),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      // @ts-ignore: Acessando a função passada via meta para abrir o modal
      const { openConfirmDelete } = table.options.meta || {} 
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <span className="h-4 w-4">...</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/obras/${row.original.id}`}>Ver detalhes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            {/* NOVO: Chama a função para abrir o modal de exclusão */}
            <DropdownMenuItem 
              onClick={() => openConfirmDelete && openConfirmDelete(row.original)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function ObrasPage() {
  const [data, setData] = useState(mockObras)
  // ESTADOS PARA CONTROLE DE EXCLUSÃO
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [obraToDelete, setObraToDelete] = useState<Obra | null>(null) // Obra selecionada

  const handleNewObra = (newObra: Obra) => {
    setData(prevData => [...prevData, newObra])
  }

  // FUNÇÃO QUE EXECUTA A EXCLUSÃO
  const handleDeleteObra = (obraId: string) => {
    setData(prevData => prevData.filter(obra => obra.id !== obraId))
    setIsConfirmingDelete(false)
    setObraToDelete(null)
  }
  
  // FUNÇÃO QUE ABRE O MODAL DE CONFIRMAÇÃO
  const openConfirmDelete = (obra: Obra) => {
    setObraToDelete(obra)
    setIsConfirmingDelete(true)
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Obras</h1>
              <p className="text-muted-foreground">Gerencie todas as obras da sua empresa</p>
            </div>
            <NewObraDialog onSuccess={handleNewObra} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Obras</CardTitle>
            </CardHeader>
            <CardContent>
              {/* AJUSTE: Passando a função openConfirmDelete via 'meta' para a tabela */}
              <DataTable 
                columns={columns} 
                data={data} 
                meta={{ openConfirmDelete }} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente a obra{" "}
              <span className="font-bold text-red-600">{obraToDelete?.name}</span> do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => obraToDelete && handleDeleteObra(obraToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir Obra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}