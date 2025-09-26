import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link to="/login">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </Link>
          </div>

          <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Termos de Uso</CardTitle>
              <p className="text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
                <p className="text-muted-foreground">
                  Ao acessar e usar nossa plataforma de CRM e automação de WhatsApp, você 
                  concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
                <p className="text-muted-foreground">
                  Nossa plataforma oferece soluções de CRM, automação de mensagens, gestão de 
                  leads e funil de vendas. Os serviços incluem integração com WhatsApp, 
                  Facebook, Instagram e outras ferramentas de comunicação.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. Responsabilidades do Usuário</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Usar a plataforma em conformidade com as leis aplicáveis</li>
                  <li>Não enviar spam ou conteúdo inapropriado</li>
                  <li>Respeitar os limites de uso da API do WhatsApp</li>
                  <li>Manter seus dados de contato atualizados</li>
                </ul>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. Privacidade e Proteção de Dados</h2>
                <p className="text-muted-foreground">
                  Levamos a privacidade dos seus dados a sério. Todos os dados são armazenados 
                  de forma segura e em conformidade com a LGPD (Lei Geral de Proteção de 
                  Dados Pessoais). Para mais detalhes, consulte nossa Política de Privacidade.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">5. Limitações de Responsabilidade</h2>
                <p className="text-muted-foreground">
                  A plataforma é fornecida "como está" sem garantias de qualquer tipo. Não nos 
                  responsabilizamos por danos diretos ou indiretos resultantes do uso da plataforma.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">6. Modificações dos Termos</h2>
                <p className="text-muted-foreground">
                  Reservamos o direito de modificar estes termos a qualquer momento. As 
                  alterações entrarão em vigor imediatamente após a publicação na plataforma.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">7. Contato</h2>
                <p className="text-muted-foreground">
                  Para dúvidas sobre estes termos, entre em contato conosco através do 
                  email: <strong>contato@primezap.com.br</strong>
                </p>
              </section>

              <div className="pt-6 border-t">
                <Link to="/login">
                  <Button className="w-full">
                    Li e aceito os Termos de Uso
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}