"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Calendar,
  Settings,
  DollarSign,
  Truck,
  Package,
  ClipboardList,
  Building2, // Adicionado para o ícone da logo
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, onLogout } = useAuth() // Adicionei onLogout, que é útil no layout

  if (!user) {
    return <p>Carregando...</p>
  }

  // --- O ITEM 'ORÇAMENTOS' FOI REMOVIDO DESTE ARRAY ---
  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: Home,
      roles: ["admin", "vendedor", "motorista"],
    },
    {
      href: "/agendamentos",
      label: "Agendamentos",
      icon: Calendar,
      roles: ["admin", "vendedor"],
    },
    {
      href: "/entregas",
      label: "Entregas",
      icon: Truck,
      roles: ["admin", "motorista"],
    },
    {
      href: "/financeiro", // O caminho foi corrigido para o diretório "app/financeiro"
      label: "Financeiro",
      icon: DollarSign,
      roles: ["admin"],
    },
    {
      href: "/admin/usuarios",
      label: "Usuários",
      icon: Users,
      roles: ["admin"],
    },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: Settings,
      roles: ["admin", "vendedor", "motorista"],
    },
  ]
  // --------------------------------------------------------

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Mini-Sidebar (Visível em telas maiores) */}
      <aside className="fixed inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base hover:bg-blue-700"
          >
            <Building2 className="h-4 w-4 text-white transition-all group-hover:scale-110" />
            <span className="sr-only">ConcreteFlow</span>
          </Link>
          
          {/* Itens de Navegação */}
          <TooltipProvider>
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                        isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
        
        {/* Botão de Logout (na Mini-Sidebar) */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="h-9 w-9 p-0 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:h-8 md:w-8"
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="sr-only">Sair</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      
      {/* Conteúdo Principal */}
      <div className="flex-grow sm:pl-14">
        {children}
      </div>
    </div>
  )
}
