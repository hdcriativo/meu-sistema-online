// components/servicos/NewServicoDialog.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// DEFINIÇÃO DO SCHEMA DE SERVIÇO
const formSchemaServico = z.object({
  servicoType: z.string().nonempty({ message: "Selecione o tipo de serviço." }),
  descricao: z.string().min(10, { message: "Detalhe o serviço em pelo menos 10 caracteres." }),
  dataAgendamento: z.string().nonempty({ message: "A data é obrigatória." }),
  endereco: z.string().min(5, { message: "O endereço é obrigatório." }),
  responsavel: z.string().min(2, { message: "O responsável deve ser informado." }),
})

type Servico = z.infer<typeof formSchemaServico> & { id: string, status: string }

type NewServicoFormProps = {
  onSuccess: (newServico: Servico) => void
}

export function NewServicoDialog({ onSuccess }: NewServicoFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<Servico>({
    resolver: zodResolver(formSchemaServico),
    defaultValues: {
      servicoType: "",
      descricao: "",
      dataAgendamento: "",
      endereco: "",
      responsavel: ""
    },
  })

  function onSubmit(values: Servico) {
    const newServico: Servico = {
      ...values,
      id: `servico-${Date.now()}`, 
      status: "pendente", 
    }
    
    onSuccess(newServico)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* CORREÇÃO: O botão é o Trigger, garantindo que ele abra o modal */}
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento de Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento de Serviço</DialogTitle>
          <DialogDescription>
            Agende um novo serviço (manutenção, inspeção, etc.).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="servicoType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manutencao_veiculo">Manutenção de Veículo</SelectItem>
                      <SelectItem value="inspecao_obra">Inspeção de Obra</SelectItem>
                      <SelectItem value="entrega_documentos">Entrega de Documentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Input placeholder="Detalhes do serviço e prioridade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dataAgendamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data/Hora</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do Local</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pela Execução</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do Motorista ou Técnico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Agendar Serviço</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}