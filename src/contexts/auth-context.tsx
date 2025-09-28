// ARQUIVO: src/contexts/auth-context.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, mockUsers } from '@/lib/mock-data'; // Importamos a lista de usuários mockados
import { useRouter } from 'next/navigation';

// --- 1. DEFINIÇÃO DE TIPOS ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserRole | null;
}

// Inicializa o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 2. PROVEDOR DO CONTEXTO ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = (email: string) => {
    // Simula a busca do usuário no "banco de dados" (mockUsers)
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      setUser(foundUser);
      console.log(`Usuário logado: ${foundUser.name} (${foundUser.role})`);
      
      // Lógica de Redirecionamento CRÍTICA
      if (foundUser.role === 'motorista') {
        router.push('/entregas');
      } else {
        router.push('/orcamentos');
      }
    } else {
      alert('E-mail não encontrado ou inválido. Tente admin@flow.com, maria@flow.com ou joao@flow.com');
      setUser(null);
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;
  const role = user ? user.role : null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 3. HOOK CUSTOMIZADO ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};