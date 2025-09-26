import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const provider = searchParams.get('provider') as 'google' | 'apple';
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  useEffect(() => {
    const handleCallback = async () => {
      if (error) {
        let message = 'Erro na autenticação';
        switch (error) {
          case 'access_denied':
            message = 'Acesso negado pelo usuário';
            break;
          case 'invalid_request':
            message = 'Solicitação inválida';
            break;
          case 'server_error':
            message = 'Erro no servidor de autenticação';
            break;
          case 'temporarily_unavailable':
            message = 'Serviço temporariamente indisponível';
            break;
          default:
            message = `Erro: ${error}`;
        }
        setErrorMessage(message);
        setStatus('error');
        return;
      }

      if (!provider || !code) {
        setErrorMessage('Parâmetros de autenticação inválidos');
        setStatus('error');
        return;
      }

      try {
        // Simular callback SSO (em produção seria uma chamada real)
        const response = await authService.ssoCallback({
          provider,
          code,
          state: state || '',
        });

        login(response.user, response.token);
        setStatus('success');
        
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo, ${response.user.name}!`,
        });

        // Aguardar um pouco para mostrar sucesso, depois redirecionar
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (error: any) {
        console.error('SSO callback error:', error);
        setErrorMessage(
          error.message || 'Erro ao processar autenticação. Tente novamente.'
        );
        setStatus('error');
      }
    };

    handleCallback();
  }, [provider, code, error, state, login, navigate, toast]);

  const handleRetry = () => {
    if (provider) {
      navigate('/login');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Processando autenticação...',
          description: `Finalizando login com ${provider === 'google' ? 'Google' : 'Apple'}`,
        };
      case 'success':
        return {
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para o dashboard...',
        };
      case 'error':
        return {
          title: 'Erro na autenticação',
          description: errorMessage,
        };
    }
  };

  const { title, description } = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {getStatusIcon()}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
              </div>

              {status === 'error' && (
                <Alert className="border-red-200 bg-red-50 text-left">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <Button onClick={handleRetry} className="w-full">
                    Tentar novamente
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-sm text-muted-foreground">
                  Por favor, aguarde enquanto processamos sua autenticação...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}