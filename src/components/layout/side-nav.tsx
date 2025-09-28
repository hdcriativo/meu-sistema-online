// ARQUIVO: src/components/layout/side-nav.tsx

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LayoutDashboard, Users, Truck, DollarSign, LogOut } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: ('admin' | 'vendedor' | 'motorista')[];
}

const navItems: NavItem[] = [
  { href: '/orcamentos', label: 'Orçamentos', icon: <DollarSign className="h-5 w-5" />, roles: ['admin', 'vendedor'] },
  { href: '/entregas', label: 'Entregas', icon: <Truck className="h-5 w-5" />, roles: ['admin', 'motorista', 'vendedor'] },
  { href: '/admin/usuarios', label: 'Usuários', icon: <Users className="h-5 w-5" />, roles: ['admin'] },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'vendedor'] },
];

export function SideNav() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null; // Não exibe o menu se não estiver logado

  // Filtra itens de navegação com base na role do usuário
  const filteredNavItems = navItems.filter(item => item.roles.includes(role!));

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white h-full fixed top-0 left-0 p-4 border-r border-gray-700">
      
      {/* Título/Logo */}
      <div className="text-xl font-bold mb-8 p-2 border-b border-gray-700">
        ConcreteFlow
      </div>

      {/* Navegação */}
      <nav className="flex-grow space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé com Informações e Logout */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-sm font-semibold mb-2 text-gray-400">
            {user.name} ({role})
        </div>
        <button
          onClick={logout}
          className="flex items-center p-3 w-full rounded-lg text-left text-red-400 hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
}