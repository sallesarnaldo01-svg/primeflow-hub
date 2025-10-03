import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Eye } from 'lucide-react';

interface ToolBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ToolBuilder({ value, onChange }: ToolBuilderProps) {
  const [showPreview, setShowPreview] = useState(false);

  const generatePrompt = () => {
    try {
      const schema = JSON.parse(value);
      const properties = schema.properties || {};
      
      const paramsList = Object.entries(properties)
        .map(([key, prop]: [string, any]) => {
          return `- ${key} (${prop.type}): ${prop.description || 'N/A'}`;
        })
        .join('\n');

      return `Você tem acesso à ferramenta com os seguintes parâmetros:\n\n${paramsList}\n\nUse esta ferramenta quando apropriado.`;
    } catch {
      return 'JSON inválido';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={!showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPreview(false)}
        >
          <Code className="mr-2 h-4 w-4" />
          Editor
        </Button>
        <Button
          variant={showPreview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPreview(true)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
      </div>

      {!showPreview ? (
        <div>
          <Label>JSON Schema</Label>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-xs"
            rows={12}
            placeholder={JSON.stringify(
              {
                type: 'object',
                properties: {
                  cnpj: {
                    type: 'string',
                    description: 'CNPJ da empresa',
                  },
                },
                required: ['cnpj'],
              },
              null,
              2
            )}
          />
        </div>
      ) : (
        <Card className="p-4">
          <div className="mb-3">
            <Badge>Prompt para LLM</Badge>
          </div>
          <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded">
            {generatePrompt()}
          </pre>
        </Card>
      )}
    </div>
  );
}
