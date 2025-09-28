// Tipos de dados para o sistema de gestão de concretagem

export type UserRole = "admin" | "vendedor" | "motorista"

export interface Empresa {
  id: string
  nome: string
  cnpj: string
  endereco?: string
  telefone?: string
  email?: string
  createdAt: Date
  isActive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  createdAt: Date
  isActive: boolean
  isPendingApproval?: boolean
  passwordHash?: string
  activationToken?: string
  activationTokenExpires?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdBy?: string // ID do admin que criou o usuário
  lastLogin?: Date
  empresaId: string
  empresa?: Empresa
}

export interface Cliente {
  id: string
  name: string
  email: string
  phone: string
  address: string
  cpfCnpj: string
  createdAt: Date
  empresaId: string
}

export interface Obra {
  id: string
  name: string
  clienteId: string
  cliente?: Cliente
  address: string
  status: "planejamento" | "em_andamento" | "concluida" | "cancelada"
  startDate: Date
  endDate?: Date
  createdAt: Date
  empresaId: string
}

export interface Orcamento {
  id: string
  obraId: string
  obra?: Obra
  vendedorId: string
  vendedor?: User
  volumeM3: number
  tipoConcreto: string
  resistencia: string
  pricePerM3: number
  totalPrice: number
  status: "rascunho" | "enviado" | "aprovado" | "rejeitado"
  validUntil: Date
  createdAt: Date
  updatedAt: Date
  empresaId: string
}

export interface Agendamento {
  id: string
  orcamentoId: string
  orcamento?: Orcamento
  motoristId?: string
  motorista?: User
  scheduledDate: Date
  scheduledTime: string
  status: "agendado" | "em_transito" | "entregue" | "cancelado"
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  empresaId: string
}

export interface Entrega {
  id: string
  agendamentoId: string
  agendamento?: Agendamento
  motoristId: string
  motorista?: User
  startTime: Date
  endTime?: Date
  volumeEntregue: number
  observacoes?: string
  assinatura?: string
  fotos?: string[]
  status: "iniciada" | "concluida" | "problema"
  createdAt: Date
  empresaId: string
}

export interface FinanceiroMovimento {
  id: string
  type: "receita" | "despesa"
  category: string
  description: string
  amount: number
  date: Date
  orcamentoId?: string
  status: "pendente" | "pago" | "vencido"
  createdAt: Date
  empresaId: string
}

export interface ChatMessage {
  id: string
  fromUserId: string
  fromUser?: User
  toUserId?: string
  toUser?: User
  message: string
  type: "text" | "image" | "file"
  isGroup: boolean
  groupName?: string
  createdAt: Date
  readAt?: Date
  empresaId: string
}
