import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { simulacoesService } from '@/services/simulacoes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SimuladorProps {
  leadId?: string;
  preCadastroId?: string;
}

export default function SimuladorFinanciamento({ leadId, preCadastroId }: SimuladorProps) {
  const [dados, setDados] = useState({
    valorImovel: 0,
    valorEntrada: 0,
    prazoMeses: 360,
    taxaJuros: 10.5,
    valorFgts: 0,
    valorSubsidio: 0,
    sistemaAmortizacao: 'SAC' as 'SAC' | 'PRICE'
  });

  const [resultado, setResultado] = useState<any>(null);

  const calcularMutation = useMutation({
    mutationFn: () => simulacoesService.calcular({ ...dados, leadId, preCadastroId }),
    onSuccess: (data) => {
      setResultado(data);
      toast.success('Simulação calculada com sucesso');
    }
  });

  const salvarMutation = useMutation({
    mutationFn: () => simulacoesService.salvar({ ...dados, ...resultado, leadId, preCadastroId }),
    onSuccess: () => {
      toast.success('Simulação salva com sucesso');
    }
  });

  const gerarPdfMutation = useMutation({
    mutationFn: (id: string) => simulacoesService.gerarPdf(id),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulacao-financiamento.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF gerado com sucesso');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Simulador de Financiamento</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Valor do Imóvel</Label>
            <Input
              type="number"
              value={dados.valorImovel}
              onChange={(e) => setDados({ ...dados, valorImovel: Number(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label>Valor de Entrada</Label>
            <Input
              type="number"
              value={dados.valorEntrada}
              onChange={(e) => setDados({ ...dados, valorEntrada: Number(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label>Prazo (meses)</Label>
            <Input
              type="number"
              value={dados.prazoMeses}
              onChange={(e) => setDados({ ...dados, prazoMeses: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Taxa de Juros (% ao ano)</Label>
            <Input
              type="number"
              step="0.1"
              value={dados.taxaJuros}
              onChange={(e) => setDados({ ...dados, taxaJuros: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label>Valor FGTS</Label>
            <Input
              type="number"
              value={dados.valorFgts}
              onChange={(e) => setDados({ ...dados, valorFgts: Number(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label>Subsídio</Label>
            <Input
              type="number"
              value={dados.valorSubsidio}
              onChange={(e) => setDados({ ...dados, valorSubsidio: Number(e.target.value) })}
              placeholder="R$ 0,00"
            />
          </div>

          <div>
            <Label>Sistema de Amortização</Label>
            <Select
              value={dados.sistemaAmortizacao}
              onValueChange={(value: 'SAC' | 'PRICE') => 
                setDados({ ...dados, sistemaAmortizacao: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAC">SAC</SelectItem>
                <SelectItem value="PRICE">PRICE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => calcularMutation.mutate()} disabled={calcularMutation.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular
          </Button>
          {resultado && (
            <>
              <Button variant="outline" onClick={() => salvarMutation.mutate()}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              {resultado.id && (
                <Button variant="outline" onClick={() => gerarPdfMutation.mutate(resultado.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {resultado && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultado da Simulação</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor a Financiar</Label>
              <p className="text-2xl font-bold">
                R$ {resultado.valorFinanciado?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <Label>Valor da Parcela</Label>
              <p className="text-2xl font-bold text-primary">
                R$ {resultado.valorPrestacao?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <Label>Total de Juros</Label>
              <p className="text-xl font-bold">
                R$ {((resultado.valorTotal || 0) - (resultado.valorFinanciado || 0)).toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <Label>Total a Pagar</Label>
              <p className="text-xl font-bold">
                R$ {resultado.valorTotal?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="col-span-2">
              <Label>Renda Mínima Requerida (30% da renda)</Label>
              <p className="text-2xl font-bold text-orange-600">
                R$ {resultado.rendaMinimaRequerida?.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
