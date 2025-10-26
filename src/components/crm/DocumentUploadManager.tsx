import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  File, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentUploadManagerProps {
  entityType: 'lead' | 'deal' | 'pre_cadastro';
  entityId: string;
  onDocumentChange?: () => void;
}

export function DocumentUploadManager({ entityType, entityId, onDocumentChange }: DocumentUploadManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('');

  const documentTypes = [
    'RG',
    'CPF',
    'Comprovante de Renda',
    'Comprovante de Residência',
    'Certidão de Nascimento',
    'Certidão de Casamento',
    'FGTS',
    'Declaração IR',
    'Contrato Social',
    'Outro'
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!selectedType) {
      toast({
        title: 'Tipo de documento',
        description: 'Selecione o tipo do documento antes de fazer upload',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${entityType}/${entityId}/${Date.now()}_${selectedType}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documentos')
          .getPublicUrl(fileName);

        toast({
          title: 'Upload concluído',
          description: `${file.name} foi enviado com sucesso`
        });
      }

      onDocumentChange?.();
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const analyzeWithAI = async (documentId: string) => {
    try {
      toast({
        title: 'CVMagic | Analisando...',
        description: 'A IA está analisando o documento'
      });

      const { data, error } = await supabase.functions.invoke('ai-document-analyzer', {
        body: { documentId }
      });

      if (error) throw error;

      toast({
        title: 'Análise concluída',
        description: 'Documento analisado com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro na análise',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Documentos</CardTitle>
        <CardDescription>
          Upload, visualização e aprovação de documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={uploading || !selectedType}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !selectedType}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Formatos aceitos: PDF, JPG, PNG (máx. 10MB por arquivo)
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div>
          <h4 className="font-semibold mb-3">Documentos Enviados</h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum documento enviado ainda</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <File className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            doc.situacao === 'APROVADO' ? 'default' :
                            doc.situacao === 'REJEITADO' ? 'destructive' :
                            doc.situacao === 'PENDENTE' ? 'secondary' : 'outline'
                          }>
                            {doc.situacao === 'APROVADO' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {doc.situacao === 'REJEITADO' && <XCircle className="h-3 w-3 mr-1" />}
                            {doc.situacao === 'PENDENTE' && <Clock className="h-3 w-3 mr-1" />}
                            {doc.situacao || 'Aguardando'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => analyzeWithAI(doc.id)}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Document Progress */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso da Documentação</span>
            <span className="text-sm font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            0 de 10 documentos obrigatórios enviados
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
