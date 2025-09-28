// ARQUIVO: src/components/layout/app-layout.tsx

"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { SideNav } from './side-nav';
import { useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Se não estiver autenticado, redireciona para o login (proteção de rota)
  if (!isAuthenticated && typeof window !== 'undefined') {
    router.push('/login');
    return null; // Não renderiza nada enquanto redireciona
  }

  // Se estiver na rota de login, não precisa do layout
  if (!user) {
      return <>{children}</>;
  }

  // Renderiza o layout completo
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNav />
      
      {/* Conteúdo Principal (deixa espaço para o menu lateral de 64px) */}
      <main className="flex-1 ml-64 p-0">
        {children}
      </main>
    </div>
  );
};