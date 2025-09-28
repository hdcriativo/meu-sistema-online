// ARQUIVO: src/lib/types.ts

export type UserRole = 'admin' | 'vendedor' | 'motorista';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Obra {
  id: string;
  name: string;
  cliente: string;
  endereco: string;
  vendedorId: string; // Link para o User
}

export interface Produto {
  id: string;
  name: string;
  unidade: 'm3' | 'servico' | 'un';
  price: number; // Preço unitário base
}

export interface OrcamentoItem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Orcamento {
  id: string;
  obraId: string;
  vendedorId: string;
  dataCriacao: string;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'em_revisao';
  itens: OrcamentoItem[];
  observacao?: string;
}

export interface Entrega {
    id: string;
    orcamentoId: string; // Orçamento relacionado
    motoristaId: string; // Motorista responsável
    status: 'agendada' | 'em_rota' | 'finalizada' | 'cancelada';
    local: string;
    volumeAgendado: number;
    volumeRealizado: number | null; // Volume real entregue (coletado no campo)
    dataEntrega: string;
}

export interface Agendamento {
    id: string;
    orcamentoId: string;
    dataAgendamento: string;
    localEntrega: string;
    volumeTotalM3: number;
}