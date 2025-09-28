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
import { Calendar } from "lucide-react" 

// 1. ZOD SCHEMA ATUALIZADO PARA CONCRETAGEM
const formSchemaConcretagem = z.object({
  nomeCliente: z.string().min(2, { message: "O nome do cliente é obrigatório." }),
  telefone: z.string().min(8, { message: "O telefone do cliente é obrigatório." }),
  enderecoObra: z.string().min(5, { message: "O endereço da obra é obrigatório." }),
  
  // Use z.coerce.number para garantir que a entrada seja um número válido
  quantidadeM3: z.coerce.number({ invalid_type_error: "A quantidade deve ser um número válido." })
    .min(0.1, { message: "A quantidade mínima é 0.1 m³." }),
    
  // Campo de seleção para 'Sim' ou 'Não'
  usaBomba: z.string({ required_error: "Selecione se usará bomba." }), 
  
  dataAgendamento: z.string().nonempty({ message: "A data e hora são obrigatórias." }),
})

type ConcretagemForm = z.infer<typeof formSchemaConcretagem>
// Tipo que será devolvido para a página principal
type AgendamentoData = ConcretagemForm & { id: string, status: string }

type NewAgendamentoFormProps = {
  onSuccess: (newAgendamento: AgendamentoData) => void
}

export function NewServicoDialog({ onSuccess }: NewAgendamentoFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<ConcretagemForm>({
    resolver: zodResolver(formSchemaConcretagem),
    defaultValues: {
      nomeCliente: "",
      telefone: "",
      enderecoObra: "",
      // Valores padrões para number e string (select)
      quantidadeM3: 0, 
      usaBomba: "",
      dataAgendamento: "",
    },
  })

  function onSubmit(values: ConcretagemForm) {
    // ⚠️ Simulação de agendamento. Em produção, substitua pela chamada API.
    const newAgendamento: AgendamentoData = {
      ...values,
      id: `concreto-${Date.now()}`, 
      status: "pendente",
    }
    
    console.log("Agendamento de Concretagem enviado:", newAgendamento);

    // Envia os dados para a função handleNewAgendamento na página principal
    onSuccess(newAgendamento) 
    form.reset()
    setOpen(false) // Fecha o modal após o sucesso
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Calendar className="h-5 w-5 mr-2" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento de Concretagem</DialogTitle>
          <DialogDescription>
            Insira os detalhes da obra e do concreto para agendar a entrega.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* 1. Nome do Cliente */}
            <FormField
              control={form.control}
              name="nomeCliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Telefone */}
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(XX) 9XXXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. Endereço da Obra */}
            <FormField
              control={form.control}
              name="enderecoObra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço da Obra</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Bairro, Cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. Quantidade em M³ */}
            <FormField
              control={form.control}
              name="quantidadeM3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume (m³)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0.1"
                      placeholder="Ex: 5.5" 
                      // Transforma o valor para string antes de passar para o Input
                      {...field}
                      value={field.value === 0 ? "" : field.value} 
                      onChange={e => {
                        // Converte o valor de volta para número (ou null/NaN se vazio)
                        const value = parseFloat(e.target.value)
                        field.onChange(isNaN(value) ? 0 : value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Uso de Bomba */}
            <FormField
              control={form.control}
              name="usaBomba"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usa Bomba?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione Sim ou Não" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 6. Data/Hora do Agendamento */}
            <FormField
              control={form.control}
              name="dataAgendamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data/Hora da Entrega</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="mt-4">Agendar Concretagem</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}