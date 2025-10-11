import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Zap,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Database,
  Globe,
  Shield,
  Check,
  Plus,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

const integrations = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Conecte sua conta do WhatsApp Business para conversas unificadas",
    icon: MessageSquare,
    category: "comunicacao",
    status: "connected",
    color: "bg-green-500"
  },
  {
    id: "email",
    name: "Email (SMTP/IMAP)",
    description: "Configure servidor de email para envio e recebimento",
    icon: Mail,
    category: "comunicacao",
    status: "disconnected",
    color: "bg-blue-500"
  },
  {
    id: "google",
    name: "Google Workspace",
    description: "Gmail, Google Calendar, Google Drive",
    icon: Calendar,
    category: "produtividade",
    status: "connected",
    color: "bg-orange-500"
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Processamento de pagamentos e assinaturas",
    icon: CreditCard,
    category: "pagamentos",
    status: "disconnected",
    color: "bg-purple-500"
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Gateway de pagamento brasileiro",
    icon: CreditCard,
    category: "pagamentos",
    status: "disconnected",
    color: "bg-blue-400"
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatize workflows com milhares de apps",
    icon: Zap,
    category: "automacao",
    status: "disconnected",
    color: "bg-orange-400"
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sincronize contatos e deals",
    icon: Database,
    category: "crm",
    status: "disconnected",
    color: "bg-orange-600"
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Integração com CRM Salesforce",
    icon: Database,
    category: "crm",
    status: "disconnected",
    color: "bg-blue-600"
  }
];

const webhooks = [
  {
    id: "1",
    name: "Sistema Externo - Leads",
    url: "https://api.meusite.com/webhook/leads",
    events: ["lead.created", "lead.updated"],
    status: "active"
  },
  {
    id: "2", 
    name: "Notificações Mobile",
    url: "https://push.firebase.com/webhook",
    events: ["message.received", "deal.closed"],
    status: "inactive"
  }
];

export default function Integracoes() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const categories = [
    { id: "todos", name: "Todas", count: integrations.length },
    { id: "comunicacao", name: "Comunicação", count: 2 },
    { id: "produtividade", name: "Produtividade", count: 1 },
    { id: "pagamentos", name: "Pagamentos", count: 2 },
    { id: "automacao", name: "Automação", count: 1 },
    { id: "crm", name: "CRM Externo", count: 2 }
  ];

  const filteredIntegrations = selectedCategory === "todos" 
    ? integrations 
    : integrations.filter(int => int.category === selectedCategory);

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setIsConfigOpen(true);
  };

  const handleToggleIntegration = (integrationId, enabled) => {
    toast({
      title: enabled ? "Integração ativada" : "Integração desativada",
      description: `${integrations.find(i => i.id === integrationId)?.name} foi ${enabled ? 'conectada' : 'desconectada'} com sucesso.`
    });
  };

  const handleSaveWebhook = () => {
    toast({
      title: "Webhook configurado",
      description: "O webhook foi configurado com sucesso."
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Integrações</h1>
            <p className="text-muted-foreground">
              Conecte ferramentas externas para expandir as funcionalidades
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Integração
          </Button>
        </div>

        <Tabs defaultValue="integracoes">
          <TabsList>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="api">API & Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="integracoes" className="space-y-6">
            {/* Filtros por categoria */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Grid de integrações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id} className="relative">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                      <div className={`p-2 rounded-lg ${integration.color} text-white mr-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge 
                          variant={integration.status === "connected" ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {integration.status === "connected" ? "Conectado" : "Desconectado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        {integration.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <Switch
                          checked={integration.status === "connected"}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnect(integration)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks Configurados</CardTitle>
                <CardDescription>
                  Configure URLs para receber notificações em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                          {webhook.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      <div className="flex gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button onClick={handleSaveWebhook} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chaves de API</CardTitle>
                  <CardDescription>
                    Gerencie tokens de acesso para integração via API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Mantenha suas chaves de API seguras e não as compartilhe publicamente.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">Chave de API Pública</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="api-key"
                          value="pk_live_abc123...xyz789"
                          readOnly
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          Copiar
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="secret-key">Chave Secreta</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="secret-key"
                          type="password"
                          value="sk_live_def456...abc123"
                          readOnly
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          Revelar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button>
                      Regenerar Chaves
                    </Button>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentação da API
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                  <CardDescription>
                    Monitoramento de uso da API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Requisições hoje</span>
                      <span className="font-medium">1.247 / 10.000</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "12.47%" }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Reset em: 23h 45m</span>
                      <span>Plano: Professional</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de configuração */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Configurar {selectedIntegration?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta integração requer configuração de credenciais externas.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="api-key-input">API Key</Label>
                <Input id="api-key-input" placeholder="Cole sua chave de API aqui" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input 
                  id="webhook-url" 
                  value="https://app.meucrm.com/webhooks/integration"
                  readOnly 
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsConfigOpen(false)}>
                  Salvar Configuração
                </Button>
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
}