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
  FormDescription,
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
import { mockClientes, mockObras } from "@/lib/mock-data"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  clientName: z.string().min(2, { message: "O nome do cliente deve ter pelo menos 2 caracteres." }),
  telefone: z.string().optional(),
  address: z.string().min(5, { message: "O endereço deve ter pelo menos 5 caracteres." }),
  areaType: z.string().nonempty({ message: "Selecione o tipo de área." }),
  metrosCubicos: z.string().regex(/^\d+$/, { message: "A quantidade deve ser um número inteiro." }),
  hasBomba: z.boolean(),
  // 💥 CORREÇÃO ZOD: Permite que o campo seja opcional, mas se for preenchido, deve ser uma URL válida.
  locationLink: z.string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, {
        message: "O link de localização deve ser uma URL válida se preenchido.",
    }),
})

type NewObraFormProps = {
  onSuccess: (newObra: any) => void
}

export function NewObraDialog({ onSuccess }: NewObraFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      telefone: "",
      address: "",
      areaType: "",
      metrosCubicos: "",
      hasBomba: false,
      locationLink: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newClientId = `cliente-${mockClientes.length + 1}`
    
    const newClient = {
      id: newClientId,
      name: values.clientName,
      telefone: values.telefone,
      address: values.address
    }
    
    // Simulação de adição de cliente
    mockClientes.push(newClient) 

    const newObra = {
      id: (mockObras.length + 1).toString(),
      name: `Obra de ${values.clientName} - ${new Date().toLocaleDateString('pt-BR')}`,
      clienteId: newClientId,
      address: values.address,
      areaType: values.areaType,
      metrosCubicos: parseInt(values.metrosCubicos, 10),
      hasBomba: values.hasBomba,
      // Garante que o link vazio é tratado como undefined
      locationLink: values.locationLink || undefined, 
      status: "planejamento",
      startDate: new Date(),
      createdAt: new Date(),
    }
    
    onSuccess(newObra)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Obra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Obra</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar uma nova obra.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço da Obra</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores, 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="areaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Área</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="laje">Laje</SelectItem>
                      <SelectItem value="piso">Piso</SelectItem>
                      <SelectItem value="fundacao">Fundação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metrosCubicos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade (m³)</FormLabel>
                  <FormControl>
                    <Input placeholder="20" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasBomba"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Bomba de concreto</FormLabel>
                    <FormDescription>
                      Será utilizada bomba para a concretagem?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Localização (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://maps.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Cadastrar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}