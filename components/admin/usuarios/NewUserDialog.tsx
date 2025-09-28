// components/usuarios/NewUserDialog.tsx
"use client" // 🚨 ESSENCIAL para componentes que usam hooks e interação

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
  DialogTrigger, // ✅ Necessário para o botão funcionar
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
import { UserPlus, Save } from "lucide-react" 

// --- SCHEMA DE VALIDAÇÃO ---
const formSchemaUser = z.object({
  name: z.string().min(2, { message: "O nome é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  role: z.enum(["admin", "vendedor", "motorista"], {
      required_error: "Selecione o tipo de usuário (Motorista/Vendedor/Admin)."
  }),
})

type NewUserForm = z.infer<typeof formSchemaUser>
type UserData = NewUserForm & { id: string }

type NewUserDialogProps = {
  onSuccess: (newUser: UserData) => void
}

export function NewUserDialog({ onSuccess }: NewUserDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<NewUserForm>({
    resolver: zodResolver(formSchemaUser),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "vendedor",
    },
  })

  function onSubmit(values: NewUserForm) {
    // Simula a criação de ID e dados adicionais
    const newUser: UserData = {
      ...values,
      id: `user-${Math.random().toString(36).substring(2, 9)}`, // ID único
    }
    
    onSuccess(newUser)
    form.reset()
    setOpen(false) // Fecha o modal após o sucesso
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 💥 O DialogTrigger envolve o Button com asChild para adicionar o evento de clique */}
      <DialogTrigger asChild> 
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-5 w-5 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastro de Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* 1. NOME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maria da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. E-MAIL */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 3. SENHA */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Inicial</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 4. TIPO (ROLE) */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo/Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo do usuário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="motorista">Motorista</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="mt-4">
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
