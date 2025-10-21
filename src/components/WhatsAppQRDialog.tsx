import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, QrCode, Smartphone, Wifi, RefreshCw } from 'lucide-react';
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

const QR_TIMEOUT = 60000; // 60 seconds
const STATUS_CHECK_INTERVAL = 2000; // 2 seconds
const MAX_RETRY_ATTEMPTS = 3;

export function WhatsAppQRDialog({ open, onOpenChange, connectionId, onConnected }: WhatsAppQRDialogProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'qr' | 'connected' | 'error' | 'timeout'>('loading');
  const [error, setError] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (open && connectionId) {
      console.log('[QR Dialog] Opening dialog for connection:', connectionId);
      loadQRCode();
      
      const statusInterval = setInterval(checkStatus, STATUS_CHECK_INTERVAL);
      const timeoutTimer = setTimeout(() => {
        if (status === 'qr' || status === 'loading') {
          console.log('[QR Dialog] QR Code timeout');
          setStatus('timeout');
          setError('QR Code expirou. Clique em "Gerar Novo QR Code" para tentar novamente.');
          toast.warning('QR Code expirado');
        }
      }, QR_TIMEOUT);

      return () => {
        clearInterval(statusInterval);
        clearTimeout(timeoutTimer);
      };
    } else {
      // Reset state when dialog closes
      console.log('[QR Dialog] Resetting state');
      setQrCode('');
      setStatus('loading');
      setError('');
      setDeviceInfo({});
      setRetryCount(0);
    }
  }, [open, connectionId, status]);

  const loadQRCode = useCallback(async () => {
    if (!connectionId) return;
    
    try {
      console.log('[QR Dialog] Loading QR Code...');
      setStatus('loading');
      setError('');
      
      const { qrCode: qr, status: connStatus } = await whatsappService.getQRCode(connectionId);
      console.log('[QR Dialog] QR Code response:', { hasQR: !!qr, status: connStatus });
      
      if (qr) {
        // QR code vem diretamente do provider como base64
        const qrSrc = qr.startsWith('data:image') ? qr : `data:image/png;base64,${qr}`;
        setQrCode(qrSrc);
        setStatus('qr');
        console.log('[QR Dialog] QR Code loaded successfully');
      } else if (connStatus === 'CONNECTED') {
        console.log('[QR Dialog] Already connected');
        setStatus('connected');
        const statusData = await whatsappService.getConnectionStatus(connectionId);
        setDeviceInfo({
          phone: statusData.phone,
          device: statusData.device,
        });
        onConnected?.();
      } else {
        // QR not ready yet, try again
        console.log('[QR Dialog] QR not ready, retrying in 1s...');
        setTimeout(loadQRCode, 1000);
      }
    } catch (err: any) {
      console.error('[QR Dialog] Error loading QR code:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao carregar QR Code');
      setStatus('error');
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        toast.error(`Erro ao carregar QR Code. Tentativa ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadQRCode();
        }, 2000);
      } else {
        toast.error('Falha ao carregar QR Code após várias tentativas');
      }
    }
  }, [connectionId, retryCount, onConnected]);

  const checkStatus = useCallback(async () => {
    if (!connectionId || status === 'connected' || status === 'error' || status === 'timeout') return;
    
    try {
      const connection = await whatsappService.getConnectionStatus(connectionId);
      console.log('[QR Dialog] Connection status:', connection.status);
      
      if (connection.status === 'CONNECTED') {
        console.log('[QR Dialog] Connected successfully!');
        setStatus('connected');
        setDeviceInfo({
          phone: connection.phone,
          device: connection.device,
        });
        toast.success('WhatsApp conectado com sucesso!');
        onConnected?.();
        setTimeout(() => onOpenChange(false), 2000);
      } else if (connection.status === 'ERROR') {
        console.error('[QR Dialog] Connection error');
        setStatus('error');
        setError('Erro ao conectar. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('[QR Dialog] Error checking status:', err);
    }
  }, [connectionId, status, onConnected, onOpenChange]);

  const handleRetry = useCallback(() => {
    console.log('[QR Dialog] Manual retry triggered');
    setRetryCount(0);
    setStatus('loading');
    loadQRCode();
  }, [loadQRCode]);

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

          {(status === 'error' || status === 'timeout') && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <div>
                <p className="text-lg font-semibold text-destructive">
                  {status === 'timeout' ? 'QR Code Expirado' : 'Erro ao conectar'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <Button 
                onClick={handleRetry} 
                variant="outline"
                disabled={retryCount >= MAX_RETRY_ATTEMPTS && status === 'error'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar novo QR Code
                {retryCount > 0 && status === 'error' && ` (${retryCount}/${MAX_RETRY_ATTEMPTS})`}
              </Button>
              {retryCount >= MAX_RETRY_ATTEMPTS && status === 'error' && (
                <p className="text-xs text-destructive mt-2">
                  Máximo de tentativas atingido. Por favor, feche e tente novamente.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
