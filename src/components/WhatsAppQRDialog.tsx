import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, QrCode, Smartphone, Wifi } from 'lucide-react';
import { whatsappService } from '@/services/whatsapp';
import { toast } from 'sonner';

interface WhatsAppQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId?: string;
  onConnected?: () => void;
}

interface DeviceInfo {
  phone?: string;
  device?: string;
  platform?: string;
  battery?: number;
}

export function WhatsAppQRDialog({ open, onOpenChange, connectionId, onConnected }: WhatsAppQRDialogProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});

  useEffect(() => {
    if (open && connectionId) {
      loadQRCode();
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [open, connectionId]);

  const loadQRCode = async () => {
    if (!connectionId) return;
    
    try {
      setStatus('loading');
      const { qrCode: qr } = await whatsappService.getQRCode(connectionId);
      if (qr) {
        // QR code vem diretamente do Venom Bot como base64
        const qrSrc = qr.startsWith('data:image') ? qr : `data:image/png;base64,${qr}`;
        setQrCode(qrSrc);
        setStatus('qr');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar QR Code');
      setStatus('error');
    }
  };

  const checkStatus = async () => {
    if (!connectionId) return;
    
    try {
      const connection = await whatsappService.getConnectionStatus(connectionId);
      
      if (connection.status === 'CONNECTED') {
        setStatus('connected');
        setDeviceInfo({
          phone: connection.phone,
          device: connection.device,
        });
        toast.success('WhatsApp conectado com sucesso!');
        setTimeout(() => {
          onConnected?.();
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Gerando QR Code via Venom Bot...</p>
              <Badge variant="outline" className="mt-2">
                <Wifi className="h-3 w-3 mr-1" />
                Inicializando conexão
              </Badge>
            </div>
          )}

          {status === 'qr' && (
            <div className="space-y-4 w-full">
              <Card>
                <CardContent className="p-4">
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Aguardando leitura
                  </Badge>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Como conectar:</p>
                  <ol className="text-xs text-muted-foreground text-left space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Abra o WhatsApp no seu celular</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Toque em Mais opções (⋮) ou Configurações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Toque em "Aparelhos conectados"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Toque em "Conectar um aparelho"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">5.</span>
                      <span>Aponte a câmera para este QR Code</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="text-center space-y-4 w-full">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
              <div>
                <p className="text-lg font-semibold text-green-600">✓ Conectado com sucesso!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Seu WhatsApp está pronto para uso
                </p>
              </div>

              {/* Mostrar informações do dispositivo conectado */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Número:
                    </span>
                    <span className="font-mono font-semibold">
                      {deviceInfo.phone || 'Carregando...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Dispositivo:
                    </span>
                    <span className="font-semibold">
                      {deviceInfo.device || 'WhatsApp Web'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <div>
                <p className="text-lg font-semibold text-destructive">Erro ao conectar</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <Button onClick={loadQRCode} variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Gerar novo QR Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
