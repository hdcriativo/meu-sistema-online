"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockOrcamentos, mockObras, mockClientes, mockUsers } from "@/lib/mock-data"

interface AgendamentoFormProps {
  onClose: () => void
}

export function AgendamentoForm({ onClose }: AgendamentoFormProps) {
  const [formData, setFormData] = useState({
    orcamentoId: "",
    motoristId: "",
    scheduledDate: "",
    scheduledTime: "",
    observacoes: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Agendamento criado:", formData)
      onClose()
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedOrcamento = mockOrcamentos.find((o) => o.id === formData.orcamentoId)
  const selectedObra = selectedOrcamento ? mockObras.find((o) => o.id === selectedOrcamento.obraId) : null
  const selectedCliente = selectedObra ? mockClientes.find((c) => c.id === selectedObra.clienteId) : null
  const motoristas = mockUsers.filter((u) => u.role === "motorista")

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seleção de Orçamento */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="orcamento">Orçamento Aprovado</Label>
          <Select value={formData.orcamentoId} onValueChange={(value) => handleInputChange("orcamentoId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um orçamento aprovado" />
            </SelectTrigger>
            <SelectContent>
              {mockOrcamentos
                .filter((o) => o.status === "aprovado")
                .map((orcamento) => {
                  const obra = mockObras.find((ob) => ob.id === orcamento.obraId)
                  const cliente = obra ? mockClientes.find((c) => c.id === obra.clienteId) : null
                  return (
                    <SelectItem key={orcamento.id} value={orcamento.id}>
                      <div>
                        <div className="font-medium">{cliente?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {obra?.name} - {orcamento.volumeM3}m³
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
            </SelectContent>
          </Select>
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Data da Entrega</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
            required
          />
        </div>

        {/* Horário */}
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">Horário</Label>
          <Input
            id="scheduledTime"
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
            required
          />
        </div>

        {/* Motorista */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="motorista">Motorista</Label>
          <Select value={formData.motoristId} onValueChange={(value) => handleInputChange("motoristId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um motorista" />
            </SelectTrigger>
            <SelectContent>
              {motoristas.map((motorista) => (
                <SelectItem key={motorista.id} value={motorista.id}>
                  <div>
                    <div className="font-medium">{motorista.name}</div>
                    <div className="text-sm text-muted-foreground">{motorista.phone}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => handleInputChange("observacoes", e.target.value)}
          placeholder="Instruções especiais para a entrega..."
          rows={3}
        />
      </div>

      {/* Resumo do Orçamento Selecionado */}
      {selectedOrcamento && selectedObra && selectedCliente && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Resumo da Entrega</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <div className="font-medium">{selectedCliente.name}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Obra:</span>
              <div className="font-medium">{selectedObra.name}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Volume:</span>
              <div className="font-medium">{selectedOrcamento.volumeM3}m³</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <div className="font-medium">{selectedOrcamento.tipoConcreto}</div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Endereço:</span>
              <div className="font-medium">{selectedObra.address}</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !formData.orcamentoId}>
          {isLoading ? "Criando..." : "Criar Agendamento"}
        </Button>
      </div>
    </form>
  )
}
