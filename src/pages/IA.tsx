import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  MessageSquare,
  FileText,
  Image,
  Mic,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Download,
  Sparkles
} from 'lucide-react';

const IA: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const suggestResponse = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Resposta sugerida pela IA gerada!');
    setIsProcessing(false);
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inteligência Artificial</h1>
            <p className="text-muted-foreground">Automação inteligente para atendimento e análises</p>
          </div>
          <Button onClick={() => navigate('/ia/providers')} variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Provedores de IA
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens Analisadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15% este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respostas Sugeridas</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                89% de aceitação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Workflows em execução
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sugestão de Resposta</CardTitle>
                <CardDescription>
                  A IA analisa o contexto e sugere respostas personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem do Cliente</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cole aqui a mensagem do cliente para receber uma sugestão de resposta..."
                    rows={4}
                  />
                </div>
                <Button onClick={suggestResponse} disabled={isProcessing || !message}>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Sugerir Resposta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Análise de Texto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Análise de sentimento, intenção e classificação automática de mensagens
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Sentimento Positivo</span>
                      <Badge className="bg-green-500 text-white">68%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Neutro</span>
                      <Badge variant="secondary">22%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Negativo</span>
                      <Badge className="bg-red-500 text-white">10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Análise de Imagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reconhecimento e descrição automática de imagens enviadas
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Documentos</span>
                      <Badge variant="outline">156</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Produtos</span>
                      <Badge variant="outline">89</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Screenshots</span>
                      <Badge variant="outline">45</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automações Inteligentes</CardTitle>
                <CardDescription>
                  Configure automações baseadas em IA para diferentes cenários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Resposta Automática</h4>
                        <p className="text-sm text-muted-foreground">
                          Responde automaticamente perguntas frequentes
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium">Classificação de Tickets</h4>
                        <p className="text-sm text-muted-foreground">
                          Classifica automaticamente prioridade e categoria
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-orange-500" />
                      <div>
                        <h4 className="font-medium">Transcrição de Áudio</h4>
                        <p className="text-sm text-muted-foreground">
                          Converte mensagens de voz em texto automaticamente
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pausado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da IA</CardTitle>
                <CardDescription>
                  Ajuste o comportamento e parâmetros da inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo de IA</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>GPT-4 (Recomendado)</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Claude 3</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confiança Mínima</label>
                  <Input type="number" defaultValue="0.8" min="0" max="1" step="0.1" />
                  <p className="text-xs text-muted-foreground">
                    Nível mínimo de confiança para sugestões automáticas (0-1)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Idiomas Suportados</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Português</Badge>
                    <Badge>Inglês</Badge>
                    <Badge>Espanhol</Badge>
                    <Button size="sm" variant="outline">+ Adicionar</Button>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default IA;