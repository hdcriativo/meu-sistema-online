import { Categoria, FinanceiroMovimento, Orcamento, User, Caminhao, Cliente, Obra, Agendamento } from "@/lib/definitions";

export const mockUsuarios: User[] = [
  { id: "user-1", name: "João Silva", email: "joao@exemplo.com", role: "motorista", empresaId: "empresa-1" },
  { id: "user-2", name: "Maria Souza", email: "maria@exemplo.com", role: "bombista", empresaId: "empresa-1" },
  { id: "user-3", name: "Pedro Santos", email: "pedro@exemplo.com", role: "ajudante", empresaId: "empresa-1" },
  { id: "user-4", name: "Ana Paula", email: "ana@exemplo.com", role: "admin", empresaId: "empresa-1" },
];

export const mockCaminhoes: Caminhao[] = [
  { id: "truck-1", placa: "ABC-1234", modelo: "Mercedes-Benz Axor", capacidadeM3: 10, empresaId: "empresa-1" },
  { id: "truck-2", placa: "XYZ-5678", modelo: "Volvo FMX", capacidadeM3: 12, empresaId: "empresa-1" },
];

export const mockCategorias: Categoria[] = [
  { id: "cat-1", name: "Venda de Concreto", type: "receita", empresaId: "empresa-1" },
  { id: "cat-2", name: "Aluguel de Bomba", type: "receita", empresaId: "empresa-1" },
  { id: "cat-3", name: "Salário", type: "despesa", empresaId: "empresa-1" },
  { id: "cat-4", name: "Combustível", type: "despesa", empresaId: "empresa-1" },
  { id: "cat-5", name: "Manutenção", type: "despesa", empresaId: "empresa-1" },
  { id: "cat-6", name: "Insumo", type: "despesa", empresaId: "empresa-1" },
];

export const mockClientes: Cliente[] = [
  { id: "cliente-1", name: "Construtora A", email: "a@construtora.com", phone: "11987654321", cnpj: "12345678000190", empresaId: "empresa-1" },
  { id: "cliente-2", name: "Engenheiro B", email: "b@engenheiro.com", phone: "11987654322", cnpj: "12345678000191", empresaId: "empresa-1" },
  { id: "cliente-3", name: "Arquiteta C", email: "c@arquiteta.com", phone: "11987654323", cnpj: "12345678000192", empresaId: "empresa-1" },
];

export const mockObras: Obra[] = [
  { id: "obra-1", orcamentoId: "orc-1", clienteId: "cliente-1", endereco: "Rua das Obras, 100", tipoConcreto: "Concreto Estrutural", volumeM3: 15, status: "ativa", empresaId: "empresa-1" },
  { id: "obra-2", orcamentoId: "orc-2", clienteId: "cliente-2", endereco: "Av. Principal, 500", tipoConcreto: "Concreto de Alto Desempenho", volumeM3: 25, status: "ativa", empresaId: "empresa-1" },
];

export const mockOrcamentos: Orcamento[] = [
  { id: "orc-1", clienteId: "cliente-1", obraId: "obra-1", empresaId: "empresa-1", totalPrice: 4500, createdAt: new Date("2025-09-20T09:00:00Z"), status: "pago" },
  { id: "orc-2", clienteId: "cliente-2", obraId: "obra-2", empresaId: "empresa-1", totalPrice: 7500, createdAt: new Date("2025-09-23T15:00:00Z"), status: "pendente" },
  { id: "orc-3", clienteId: "cliente-3", obraId: "obra-3", empresaId: "empresa-1", totalPrice: 3000, createdAt: new Date("2025-09-24T10:00:00Z"), status: "aprovado" },
];

export const mockAgendamentos: Agendamento[] = [
  { id: "agend-1", orcamentoId: "orc-1", motoristId: "user-1", scheduledDate: new Date("2025-09-26T08:00:00Z"), scheduledTime: "08:00", status: "agendado", createdAt: new Date("2025-09-25T10:00:00Z"), updatedAt: new Date("2025-09-25T10:00:00Z"), empresaId: "empresa-1" },
  { id: "agend-2", orcamentoId: "orc-2", scheduledDate: new Date("2025-09-27T14:00:00Z"), scheduledTime: "14:00", status: "agendado", createdAt: new Date("2025-09-25T11:00:00Z"), updatedAt: new Date("2025-09-25T11:00:00Z"), empresaId: "empresa-1" },
];

export const mockFinanceiroMovimentos: FinanceiroMovimento[] = [
  { id: "mov-1", empresaId: "empresa-1", type: "receita", category: "Venda de Concreto", description: "Venda para Obra A - 15m³", amount: 4500.00, date: new Date("2025-09-20T10:00:00Z"), status: "pago", createdAt: new Date("2025-09-20T10:00:00Z") },
  { id: "mov-2", empresaId: "empresa-1", type: "despesa", category: "Combustível", description: "Abastecimento Caminhão #3", amount: 550.00, date: new Date("2025-09-21T09:30:00Z"), status: "pago", createdAt: new Date("2025-09-21T09:30:00Z") },
  { id: "mov-3", empresaId: "empresa-1", type: "receita", category: "Aluguel de Bomba", description: "Aluguel de bomba para Obra B", amount: 1500.00, date: new Date("2025-09-22T14:00:00Z"), status: "pago", createdAt: new Date("2025-09-22T14:00:00Z") },
  { id: "mov-4", empresaId: "empresa-1", type: "receita", category: "Venda de Concreto", description: "Venda para Obra C - 25m³", amount: 7500.00, date: new Date("2025-09-23T16:00:00Z"), status: "pendente", createdAt: new Date("2025-09-23T16:00:00Z") },
  { id: "mov-5", empresaId: "empresa-2", type: "receita", category: "Venda de Concreto", description: "Venda para Obra Z - 30m³", amount: 9000.00, date: new Date("2025-09-23T11:00:00Z"), status: "pago", createdAt: new Date("2025-09-23T11:00:00Z") },
  { id: "mov-6", empresaId: "empresa-1", type: "despesa", category: "Salário", description: "Pagamento quinzenal - João Silva", amount: 2500.00, date: new Date("2025-09-24T12:00:00Z"), status: "pago", userId: "user-1", createdAt: new Date("2025-09-24T12:00:00Z") },
  { id: "mov-7", empresaId: "empresa-1", type: "despesa", category: "Manutenção", description: "Troca de óleo e filtros", amount: 320.00, date: new Date("2025-09-24T14:00:00Z"), status: "pago", caminhaoId: "truck-1", createdAt: new Date("2025-09-24T14:00:00Z") },
  { id: "mov-8", empresaId: "empresa-1", type: "despesa", category: "Insumo", description: "Compra de concreto na Usina ConcreteMax", amount: 1500.00, date: new Date("2025-09-25T08:00:00Z"), status: "pendente", createdAt: new Date("2025-09-25T08:00:00Z") },
];