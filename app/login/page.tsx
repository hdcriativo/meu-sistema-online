// ARQUIVO: app/login/page.tsx

"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Pequeno delay para simular o processo de rede
    setTimeout(() => {
      // Chama a função login do contexto, que irá buscar o usuário e redirecionar
      login(email);
      setIsLoading(false);
    }, 1000); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Acesso ao ConcreteFlow</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Sistema de Gestão de Concretagem</p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email de Acesso</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@flow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
              <span className="font-semibold">E-mails de Teste:</span>
              <ul className="list-disc ml-4">
                <li>**admin@flow.com** (Redireciona para /orcamentos)</li>
                <li>**maria@flow.com** (Vendedor - Redireciona para /orcamentos)</li>
                <li>**joao@flow.com** (Motorista - Redireciona para /entregas)</li>
              </ul>
            </p>

          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}