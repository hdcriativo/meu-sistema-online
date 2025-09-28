"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { mockCategorias, mockCaminhoes, mockUsuarios } from "@/lib/mock-data"
import { Categoria } from "@/lib/definitions"

const formSchema = z.object({
  type: z.enum(["receita", "despesa"]),
  category: z.string().min(2, { message: "A categoria deve ter pelo menos 2 caracteres." }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  amount: z.number().positive({ message: "O valor deve ser um número positivo." }),
  caminhaoId: z.string().optional(),
  userId: z.string().optional(),
})

export function FinanceiroForm({ onClose }: { onClose: () => void }) {
  const { user, empresa } = useAuth()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "receita",
      category: "",
      description: "",
      amount: 0,
      caminhaoId: "",
      userId: "",
    },
  })

  const filteredCategorias = mockCategorias.filter(
    (c) => c.type === form.watch("type") && c.empresaId === empresa?.id
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Novo lançamento financeiro:", values)
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Lançamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("category", "");
                  }}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="receita" />
                    </FormControl>
                    <FormLabel>Receita</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="despesa" />
                    </FormControl>
                    <FormLabel>Despesa</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Categoria</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? filteredCategorias.find((categoria) => categoria.name === field.value)?.name
                        : "Selecione uma categoria"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Buscar ou adicionar categoria..." />
                    <CommandEmpty>
                      {/* Ao digitar uma nova categoria, o valor já é atualizado no input */}
                      "{form.getValues("category")}" será adicionada ao salvar.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredCategorias.map((categoria) => (
                        <CommandItem
                          key={categoria.id}
                          value={categoria.name}
                          onSelect={() => {
                            form.setValue("category", categoria.name);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === categoria.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {categoria.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do lançamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar Lançamento</Button>
      </form>
    </Form>
  )
}