import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Layout is provided by ProtectedRoute
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppQRDialog } from '@/components/WhatsAppQRDialog';
import { MultiChannelComposer } from '@/components/MultiChannelComposer';
import { whatsappService } from '@/services/whatsapp';
import { integrationsService } from '@/services/integrations';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import {
  Phone,
  MessageCircle,
  Hash,
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Smartphone,
  Globe,
  Key,
  RefreshCw,
  Settings,
  Activity,
  Instagram,
  Send,
} from 'lucide-react';

const connections = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: Phone,
    status: 'connected',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    device: 'iPhone 13 Pro',
    lastSync: '2 minutos atrás',
    phone: '+55 11 99999-9999',
    features: ['Mensagens', 'Mídia', 'Etiquetas', 'Status'],
  },
  {
    id: 'facebook',
    name: 'Facebook Pages',
    icon: MessageCircle,
    status: 'connected',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    pages: ['Empresa LTDA', 'Loja Virtual'],
    lastSync: '5 minutos atrás',
    features: ['Mensagens', 'Comentários', 'Posts'],
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    icon: Hash,
    status: 'disconnected',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    account: '@empresa_oficial',
    lastSync: 'Há 2 dias',
    features: ['Direct', 'Comentários', 'Stories'],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'connecting':
      return <Activity className="h-5 w-5 text-yellow-600 animate-pulse" />;
    case 'disconnected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-600" />;
  }
};

export default function Conexoes() {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [whatsappConnections, setWhatsappConnections] = useState<any[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    loadConnections();

    // Listen for real-time updates
    socket.on('connection:status', (data: any) => {
      loadConnections();
    });

    return () => {
      socket.off('connection:status');
    };
  }, []);

  const loadConnections = async () => {
    try {
      const integrations = await integrationsService.getIntegrations();
      const whatsapp = integrations.filter((i: any) => i.provider === 'whatsapp');
      setWhatsappConnections(whatsapp);
    } catch (error) {
      console.error('Failed to load connections', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      const connection = await whatsappService.initiateConnection('WhatsApp Principal');
      setSelectedConnectionId(connection.id);
      setQrDialogOpen(true);
      toast.success('Conexão iniciada. Aguarde o QR Code...');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar conexão');
    }
  };

  const handleShowQR = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setQrDialogOpen(true);
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await whatsappService.disconnect(connectionId);
      toast.success('WhatsApp desconectado');
      loadConnections();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desconectar');
    }
  };

  const handleSendMessage = async (data: any) => {
    try {
      const whatsappConnection = whatsappConnections.find(
        c => c.status === 'CONNECTED' || c.status === 'connected'
      );
      
      if (!whatsappConnection) {
        toast.error('Nenhuma conexão WhatsApp disponível. Conecte seu WhatsApp primeiro.');
        return;
      }

      if (!data.content || data.content.trim() === '') {
        toast.error('Digite uma mensagem para enviar');
        return;
      }

      if (data.bulkContacts && data.bulkContacts.length > 0) {
        const result = await whatsappService.sendBulkMessages(whatsappConnection.id, {
          contacts: data.bulkContacts,
          message: {
            text: data.content,
          },
          delayMs: data.delayBetweenMs || 1000,
        });

        toast.success(
          `Disparo iniciado! ${result.totalContacts} mensagens serão enviadas em aproximadamente ${result.estimatedTime} segundos.`
        );
        setShowComposer(false);
        loadConnections();
      } else {
        toast.error('Adicione contatos para o disparo em massa');
      }
    } catch (error: any) {
      console.error('Error sending bulk messages:', error);
      toast.error(error.message || 'Erro ao enviar mensagem');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conexões</h1>
            <p className="text-muted-foreground">
              Gerenciar integrações com canais de comunicação
            </p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurações Gerais
          </Button>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Conectados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Desconectado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">1.2k</p>
                  <p className="text-sm text-muted-foreground">Mensagens hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Conexões */}
        <div className="space-y-4">
          {connections.map((connection) => {
            const Icon = connection.icon;
            return (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${connection.bgColor}`}>
                        <Icon className={`h-6 w-6 ${connection.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{connection.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(connection.status)}
                          <span className="text-sm text-muted-foreground capitalize">
                            {connection.status === 'connected' ? 'Conectado' : 'Desconectado'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {connection.lastSync}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={connection.status === 'connected'}
                        disabled={connection.status === 'connecting'}
                      />
                      <Button variant="outline" size="sm">
                        {connection.status === 'connected' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reconectar
                          </>
                        ) : (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* WhatsApp específico */}
                  {connection.id === 'whatsapp' && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          WhatsApp conectado com sucesso. Dispositivo: {connection.device}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Número conectado</Label>
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{connection.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Dispositivo</Label>
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span>{connection.device}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {connection.status === 'connected' ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleShowQR(connection.id)}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver QR Code
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowComposer(true)}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Mensagens
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDisconnect(connection.id)}
                            >
                              Desconectar
                            </Button>
                          </>
                        ) : (
                          <Button onClick={handleConnectWhatsApp}>
                            <QrCode className="h-4 w-4 mr-2" />
                            Conectar WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Facebook específico */}
                  {connection.id === 'facebook' && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Facebook conectado. {connection.pages?.length} páginas vinculadas.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label>Páginas conectadas</Label>
                        <div className="space-y-2">
                          {connection.pages?.map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span>{page}</span>
                              </div>
                              <Badge variant="secondary">Ativa</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Renovar Token
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Gerenciar Páginas
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Instagram específico */}
                  {connection.id === 'instagram' && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Instagram desconectado. Clique em "Conectar" para vincular sua conta.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label>Conta Business</Label>
                        <Input 
                          placeholder="@sua_conta_business" 
                          defaultValue={connection.account}
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button>
                          <Instagram className="h-4 w-4 mr-2" />
                          Conectar Instagram
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Recursos disponíveis */}
                  <div>
                    <Label className="text-sm font-medium">Recursos disponíveis</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {connection.features.map((feature) => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* WhatsApp QR Dialog */}
        <WhatsAppQRDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          connectionId={selectedConnectionId}
          onConnected={loadConnections}
        />

        {/* Bulk Message Composer */}
        {showComposer && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-background rounded-lg shadow-2xl border">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Disparo em Massa - WhatsApp</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>
                  Fechar
                </Button>
              </div>
              <div className="p-4">
                <MultiChannelComposer
                  channels={['whatsapp']}
                  onSend={handleSendMessage}
                />
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}