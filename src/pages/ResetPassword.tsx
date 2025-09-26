import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';

const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data);
      setEmailSent(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o e-mail. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      setIsLoading(true);
      try {
        await authService.resetPassword({ email });
        toast({
          title: 'E-mail reenviado!',
          description: 'Verifique sua caixa de entrada novamente.',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível reenviar o e-mail.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {emailSent ? 'E-mail Enviado!' : 'Esqueceu sua senha?'}
              </CardTitle>
              <CardDescription className="text-base">
                {emailSent
                  ? 'Enviamos um link para redefinir sua senha'
                  : 'Digite seu e-mail para receber um link de redefinição'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Enviamos um e-mail com as instruções para{' '}
                    <strong>{getValues('email')}</strong>. 
                    Verifique também sua pasta de spam.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Reenviando...' : 'Reenviar e-mail'}
                  </Button>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao login
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>

                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}