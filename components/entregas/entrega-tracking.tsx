"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineIcon,
} from "@/components/ui/timeline"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Truck, MapPin, Clock } from "lucide-react"
import { Entrega } from "@/lib/types"
import { format, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EntregaTrackingProps {
  entrega: Entrega
}

export function EntregaTracking({ entrega }: EntregaTrackingProps) {
  const isConcluida = entrega.status === "concluida"
  const now = new Date()

  // Gerar um mock de eventos de rastreamento para demonstração
  const timelineEvents = [
    {
      id: "1",
      icon: Truck,
      title: "Entrega Iniciada",
      description: "Motorista iniciou a rota para o local da obra.",
      date: new Date(entrega.startTime),
      status: "completo",
    },
    {
      id: "2",
      icon: MapPin,
      title: "Chegada no Local",
      description: "Motorista chegou ao destino.",
      date: isConcluida ? new Date(entrega.startTime.getTime() + 60 * 60 * 1000) : null, // 1h depois do início (mock)
      status: isConcluida ? "completo" : isBefore(new Date(), new Date(entrega.startTime.getTime() + 60 * 60 * 1000)) ? "pendente" : "ativo",
    },
    {
      id: "3",
      icon: CheckCircle,
      title: "Entrega Concluída",
      description: "Entrega finalizada e comprovada pelo cliente.",
      date: isConcluida ? new Date(entrega.endTime!) : null,
      status: isConcluida ? "completo" : "pendente",
    },
  ]

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Rastreamento da Entrega</CardTitle>
        <CardDescription>
          Visualize o progresso da entrega em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <Timeline>
          {timelineEvents.map((event) => (
            <TimelineItem key={event.id} status={event.status as any}>
              <TimelineHeader>
                <TimelineTitle>{event.title}</TimelineTitle>
                <TimelineDescription>
                  {event.description}
                </TimelineDescription>
                {event.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(event.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </TimelineHeader>
              <TimelineIcon>
                <event.icon className="h-4 w-4" />
              </TimelineIcon>
              <TimelineConnector />
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}