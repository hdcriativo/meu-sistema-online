"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface AgendamentoCalendarProps {
  agendamentos: any[] // Agendamentos enriquecidos
}

const statusColors = {
  agendado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  em_transito: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  entregue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function AgendamentoCalendar({ agendamentos }: AgendamentoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const getAgendamentosForDate = (date: Date) => {
    return agendamentos.filter((agendamento) => {
      const agendamentoDate = new Date(agendamento.scheduledDate)
      return agendamentoDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayAgendamentos = getAgendamentosForDate(day.date)
            const isToday = day.date.toDateString() === today.toDateString()

            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border border-border rounded-lg ${
                  day.isCurrentMonth ? "bg-background" : "bg-muted/30"
                } ${isToday ? "ring-2 ring-primary" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  } ${isToday ? "text-primary font-bold" : ""}`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayAgendamentos.slice(0, 2).map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="text-xs p-1 rounded bg-card border border-border hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{agendamento.cliente?.name}</span>
                        <Badge className={`${statusColors[agendamento.status]} text-xs px-1 py-0`} variant="secondary">
                          {agendamento.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {agendamento.scheduledTime}
                      </div>
                    </div>
                  ))}

                  {dayAgendamentos.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayAgendamentos.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
