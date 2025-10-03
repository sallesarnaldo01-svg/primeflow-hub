import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Trash2, FileText, Search } from 'lucide-react';
import { knowledgeService, KnowledgeDocument } from '@/services/knowledge';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await knowledgeService.list();
      setDocuments(data);
    } catch (error) {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    try {
      toast.loading('Processando documento...');
      await knowledgeService.create({
        name: selectedFile.name,
        type: selectedFile.type,
        fileUrl: '', // Will be uploaded separately
        tags: [],
      });
      toast.success('Documento processado com sucesso');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao processar documento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await knowledgeService.delete(id);
      toast.success('Documento deletado');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao deletar documento');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const results = await knowledgeService.search(searchQuery);
      toast.success(`${results.length} resultados encontrados`);
    } catch (error) {
      toast.error('Erro na busca');
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
          <p className="text-muted-foreground">
            Upload de documentos para RAG (Retrieval-Augmented Generation)
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <Badge variant="outline">{doc.type}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg"
                onChange={(e) =>
                  setSelectedFile(e.target.files?.[0] || null)
                }
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedFile.name}
                </p>
              )}
            </div>
            <Button className="w-full" onClick={handleUpload}>
              Processar Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
