"use client"; // Esta linha é crucial e deve ser a primeira do arquivo.

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Empresa, Orcamento, UserRole, PublicRegisterData, ChatMessage, Entrega, Agendamento, FinanceiroMovimento } from "@/lib/types";
import { mockEmpresas, mockUsers, mockOrcamentos, mockAgendamentos, mockEntregas, mockFinanceiroMovimentos, mockChatMessages } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  empresa: Empresa | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  publicRegister: (userData: PublicRegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isVendedor: boolean;
  isMotorista: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Carregar usuário e empresa do localStorage
    const storedUser = localStorage.getItem("currentUser");
    const storedEmpresa = localStorage.getItem("currentEmpresa");
    if (storedUser && storedEmpresa) {
      setUser(JSON.parse(storedUser));
      setEmpresa(JSON.parse(storedEmpresa));
    }
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const foundUser = mockUsers.find((u) => u.email === email && u.senha === senha);
      if (!foundUser) {
        throw new Error("Email ou senha inválidos");
      }
      if (foundUser.statusConta !== "ativo") {
        throw new Error("Sua conta ainda não está ativa. Aguardando aprovação do administrador.");
      }
      const userEmpresa = mockEmpresas.find((e) => e.id === foundUser.empresaId);
      if (!userEmpresa) {
        throw new Error("Empresa não encontrada para este usuário.");
      }
      setUser(foundUser);
      setEmpresa(userEmpresa);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      localStorage.setItem("currentEmpresa", JSON.stringify(userEmpresa));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setEmpresa(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentEmpresa");
    router.push("/login");
  };

  const generateActivationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const publicRegister = async (userData: PublicRegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const existingUser = mockUsers.find((u) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Email já cadastrado no sistema");
      }

      let empresaId = "";
      let newCompanyName = userData.companyName.trim();

      const existingCompany = mockEmpresas.find(e => e.nome === newCompanyName);

      if (existingCompany) {
        empresaId = existingCompany.id;
      } else {
        const newEmpresa: Empresa = {
          id: `emp${mockEmpresas.length + 1}`,
          nome: newCompanyName,
          cnpj: `${Date.now().toString().slice(-8)}/0001-${Math.floor(Math.random() * 100).toString().padStart(2, "0")}`,
          createdAt: new Date(),
          isActive: true,
        };
        mockEmpresas.push(newEmpresa);
        empresaId = newEmpresa.id;
      }
      
      const activationToken = generateActivationToken();
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        name: userData.name,
        email: userData.email,
        senha: userData.password, // Adiciona a senha
        phone: userData.phone,
        role: existingCompany ? userData.role : "admin",
        isActive: existingCompany ? false : true,
        statusConta: existingCompany ? "pendente" : "ativo",
        activationToken,
        activationTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        empresaId,
      };

      mockUsers.push(newUser);
      console.log(`✅ Cadastro para ${newUser.name} realizado. Status: ${newUser.statusConta}.`);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    empresa,
    login,
    logout,
    publicRegister,
    isLoading,
    error,
    isAdmin: user?.role === "admin",
    isVendedor: user?.role === "vendedor",
    isMotorista: user?.role === "motorista",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};