export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: "admin" | "motorista" | "vendedor" | "bombista" | "ajudante"
  empresaId: string
}

export interface Empresa {
  id: string
  name: string
  logoUrl?: string
}

export interface Cliente {
  id: string
  empresaId: string
  name: string
  email: string
  phone: string
  cnpj: string
}

export interface Caminhao {
  id: string
  placa: string
  modelo: string
  capacidadeM3: number
  empresaId: string
}

export interface Obra {
  id: string
  orcamentoId: string
  clienteId: string
  endereco: string
  tipoConcreto: string
  volumeM3: number
  observacoes?: string
  status: "ativa" | "concluida" | "cancelada"
  empresaId: string
}

export interface Orcamento {
  id: string
  clienteId: string
  obraId: string
  cliente?: Cliente
  empresaId: string
  createdAt: Date
  status: "pendente" | "aprovado" | "reprovado" | "pago"
  totalPrice: number
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

export interface FinanceiroMovimento {
  id: string
  type: "receita" | "despesa"
  category: string
  subcategory?: string
  description: string
  amount: number
  date: Date
  orcamentoId?: string
  caminhaoId?: string
  userId?: string
  status: "pendente" | "pago" | "vencido"
  createdAt: Date
  empresaId: string
}

export interface Categoria {
  id: string
  name: string
  type: "receita" | "despesa"
  empresaId: string
}