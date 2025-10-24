import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preCadastrosService } from '@/services/preCadastros';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Upload, Download, FileText, 
  CheckCircle, XCircle, Calendar, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PreCadastroDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: preCadastro, isLoading } = useQuery({
    queryKey: ['pre-cadastro', id],
    queryFn: () => preCadastrosService.getById(id!)
  });

  const { data: documentos = [] } = useQuery({
    queryKey: ['pre-cadastro-documentos', id],
    queryFn: () => preCadastrosService.getDocumentos(id!)
  });

  const { data: percentual } = useQuery({
    queryKey: ['pre-cadastro-percentual', id],
    queryFn: () => preCadastrosService.getPercentualDocumentacao(id!)
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => preCadastrosService.uploadDocumento(id!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-cadastro-documentos', id] });
      toast.success('Documento enviado com sucesso');
      setSelectedFile(null);
    }
  });

  const aprovarMutation = useMutation({
    mutationFn: (docId: string) => preCadastrosService.aprovarDocumento(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-cadastro-documentos', id] });
      toast.success('Documento aprovado');
    }
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ docId, motivo }: { docId: string; motivo: string }) => 
      preCadastrosService.rejeitarDocumento(docId, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-cadastro-documentos', id] });
      toast.success('Documento rejeitado');
    }
  });

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tipo', 'IMPORTACAO');
    formData.append('pessoa', 'TITULAR');
    
    await uploadMutation.mutateAsync(formData);
  };

  const handleDownloadAll = async (formato: 'zip' | 'pdf') => {
    try {
      const blob = await preCadastrosService.downloadDocumentos(id!, formato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pre-cadastro-${preCadastro?.numero}.${formato}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar documentos');
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (!preCadastro) return <div>Pré-cadastro não encontrado</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/pre-cadastros')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Pré-Cadastro #{preCadastro.numero}</h1>
          <p className="text-muted-foreground">{preCadastro.clienteNome}</p>
        </div>
        <Badge variant={preCadastro.situacao === 'APROVADO' ? 'default' : 'secondary'}>
          {preCadastro.situacao}
        </Badge>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList>
          <TabsTrigger value="dados">Dados do Financiamento</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({documentos.length})</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Data de Cadastro</Label>
                <p className="text-lg">{new Date(preCadastro.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Vencimento da Aprovação</Label>
                <p className="text-lg">
                  {preCadastro.dataVencimento 
                    ? new Date(preCadastro.dataVencimento).toLocaleDateString()
                    : 'Não definido'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Valores do Financiamento</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Valor Avaliação</Label>
                <p className="text-2xl font-bold">
                  R$ {preCadastro.valorAvaliacao.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <Label>Valor Aprovado</Label>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(preCadastro.valorAprovado || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <Label>Subsídio</Label>
                <p className="text-2xl font-bold">
                  R$ {(preCadastro.valorSubsidio || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <Label>FGTS</Label>
                <p className="text-2xl font-bold">
                  R$ {(preCadastro.valorFgts || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <Label>Total</Label>
                <p className="text-2xl font-bold text-primary">
                  R$ {(preCadastro.valorTotal || 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações de Renda</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Renda Mensal Bruta</Label>
                <p className="text-xl font-bold">
                  R$ {(preCadastro.rendaMensalBruta || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <Label>Renda Familiar Bruta</Label>
                <p className="text-xl font-bold">
                  R$ {(preCadastro.rendaFamiliarBruta || 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Parcelamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prazo de Financiamento</Label>
                <p className="text-xl font-bold">{preCadastro.prazoFinanciamento || 0} meses</p>
              </div>
              <div>
                <Label>Valor da Prestação</Label>
                <p className="text-xl font-bold">
                  R$ {(preCadastro.valorPrestacao || 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Status de Documentação</h3>
                <p className="text-sm text-muted-foreground">
                  {percentual?.percentual || 0}% dos documentos obrigatórios cadastrados
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadAll('zip')}>
                  <Download className="h-4 w-4 mr-2" />
                  ZIP
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadAll('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF Único
                </Button>
              </div>
            </div>

            <Progress value={percentual?.percentual || 0} className="mb-6" />

            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleFileUpload} disabled={!selectedFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Documento</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Pessoa</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Situação</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((doc: any) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc.nome}
                        </div>
                      </td>
                      <td className="p-4">{doc.tipo}</td>
                      <td className="p-4">{doc.pessoa}</td>
                      <td className="p-4">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <Badge variant={doc.situacao === 'APROVADO' ? 'default' : 'secondary'}>
                          {doc.situacao}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {doc.situacao === 'AGUARDANDO' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarMutation.mutate(doc.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejeitarMutation.mutate({ 
                                docId: doc.id, 
                                motivo: 'Documento ilegível' 
                              })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="visitas">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Agendamento de Visita/Atendimento</h3>
            </div>
            <Button>Agendar Nova Visita</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
