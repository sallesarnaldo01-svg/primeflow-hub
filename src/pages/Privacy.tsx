import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Política de Privacidade</CardTitle>
              <p className="text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Informações que Coletamos</h2>
                <p className="text-muted-foreground">
                  Coletamos informações que você nos fornece diretamente, como nome, e-mail, 
                  telefone e dados de contatos de seus clientes. Também coletamos informações 
                  sobre o uso da plataforma para melhorar nossos serviços.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. Como Usamos suas Informações</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Fornecer e manter nossos serviços</li>
                  <li>Processar transações e enviar confirmações</li>
                  <li>Comunicar sobre atualizações e novos recursos</li>
                  <li>Melhorar a segurança e funcionalidade da plataforma</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. Compartilhamento de Informações</h2>
                <p className="text-muted-foreground">
                  Não vendemos, comercializamos ou transferimos suas informações pessoais para 
                  terceiros, exceto quando necessário para fornecer nossos serviços (como 
                  integração com WhatsApp) ou quando exigido por lei.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. Segurança dos Dados</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
                  proteger suas informações contra acesso não autorizado, alteração, divulgação 
                  ou destruição.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">5. Retenção de Dados</h2>
                <p className="text-muted-foreground">
                  Mantemos suas informações pelo tempo necessário para fornecer nossos serviços 
                  ou conforme exigido por lei. Você pode solicitar a exclusão de seus dados a 
                  qualquer momento.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">6. Seus Direitos (LGPD)</h2>
                <p className="text-muted-foreground">
                  Conforme a Lei Geral de Proteção de Dados, você tem direito a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Confirmar a existência de tratamento de dados</li>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li>Solicitar a exclusão de dados desnecessários</li>
                  <li>Revogar o consentimento</li>
                </ul>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">7. Cookies e Tecnologias Similares</h2>
                <p className="text-muted-foreground">
                  Usamos cookies e tecnologias similares para melhorar sua experiência, analisar 
                  o uso da plataforma e personalizar conteúdo. Você pode controlar o uso de 
                  cookies através das configurações do seu navegador.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">8. Alterações nesta Política</h2>
                <p className="text-muted-foreground">
                  Podemos atualizar esta política ocasionalmente. Notificaremos sobre mudanças 
                  significativas por e-mail ou através de aviso na plataforma.
                </p>
              </section>

              <Separator />

              <section className="space-y-4">
                <h2 className="text-xl font-semibold">9. Contato</h2>
                <p className="text-muted-foreground">
                  Para questões sobre privacidade ou para exercer seus direitos, entre em 
                  contato conosco:
                </p>
                <ul className="list-none space-y-1 text-muted-foreground">
                  <li><strong>E-mail:</strong> privacidade@primezap.com.br</li>
                  <li><strong>Telefone:</strong> (11) 9999-9999</li>
                  <li><strong>Endereço:</strong> São Paulo, SP - Brasil</li>
                </ul>
              </section>

              <div className="pt-6 border-t">
                <Link to="/login">
                  <Button className="w-full">
                    Li e aceito a Política de Privacidade
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