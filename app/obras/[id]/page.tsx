import { notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockObras, mockClientes } from "@/lib/mock-data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipos de dados
type Obra = {
  id: string
  name: string
  clienteId: string
  address: string
  status: "planejamento" | "em_andamento" | "concluida"
  startDate: Date
  createdAt: Date
}

const statusVariant = (status: string) => {
  switch (status) {
    case "em_andamento":
      return "em_andamento"
    case "concluida":
      return "concluida"
    case "planejamento":
      return "planejamento"
    default:
      return "default"
  }
}

export default function ObraDetailsPage({ params }: { params: { id: string } }) {
  const obra = mockObras.find(o => o.id === params.id)
  const cliente = mockClientes.find(c => c.id === obra?.clienteId)

  if (!obra) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Detalhes da Obra</h1>
              <p className="text-muted-foreground">Informações sobre a obra: {obra.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Principais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{obra.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{cliente ? cliente.name : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium">{obra.address}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status e Datas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={statusVariant(obra.status)}>{obra.status.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início:</span>
                  <span className="font-medium">{format(new Date(obra.startDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span className="font-medium">{format(new Date(obra.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}