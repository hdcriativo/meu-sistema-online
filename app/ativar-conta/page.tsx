'use client';

import { useRouter } from 'next/navigation';
import { PublicRegisterForm, PublicRegisterData } from '@/components/auth/public-register-form';

export default function AtivarContaPage() {
  const router = useRouter();

  const handleRegister = async (userData: PublicRegisterData) => {
    // Desestruturar todos os dados do formulário, incluindo a senha
    const { name, email, phone, role, companyName, password, notificationMethod } = userData;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviar todos os dados, incluindo a senha
        body: JSON.stringify({ name, email, phone, role, companyName, password, notificationMethod }),
      });

      const data = await response.json();
      console.log('Resposta do Backend:', data);

      if (response.ok) {
        if (data.status === 'ativo') {
          alert('Cadastro realizado com sucesso! Você é o administrador da sua nova empresa.');
          router.push('/login');
        } else if (data.status === 'pendente') {
          alert('Cadastro enviado para aprovação. Sua conta está pendente e precisa ser aprovada pelo administrador da empresa.');
          router.push('/login');
        } else {
          alert(data.message || 'Erro inesperado.');
        }
      } else {
        alert(data.message || 'Erro ao registrar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return <PublicRegisterForm onRegister={handleRegister} onBack={handleBack} />;
}