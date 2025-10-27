import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Palette, Upload, Save, RotateCcw, Eye, Image as ImageIcon } from 'lucide-react';
import { useCustomization } from '@/stores/customization';

export default function Personalizacao() {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  
  const {
    brandName,
    tagline,
    logoUrl,
    faviconUrl,
    primaryColor,
    accentColor,
    backgroundColor,
    darkMode,
    setBrandName,
    setTagline,
    setLogoUrl,
    setFaviconUrl,
    setPrimaryColor,
    setAccentColor,
    setBackgroundColor,
    setDarkMode,
    reset,
  } = useCustomization();
  
  const [sidebarPosition, setSidebarPosition] = useState('left');
  const [compactMode, setCompactMode] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 2MB.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast({
          title: 'Logo atualizado!',
          description: 'Seu logo foi carregado com sucesso.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O favicon deve ter no máximo 1MB.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconUrl(reader.result as string);
        toast({
          title: 'Favicon atualizado!',
          description: 'Seu favicon foi carregado com sucesso.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Configurações salvas!',
      description: 'Suas personalizações foram aplicadas com sucesso.'
    });
  };

  const handleReset = () => {
    reset();
    setSidebarPosition('left');
    setCompactMode(false);
    toast({
      title: 'Configurações restauradas',
      description: 'Todas as personalizações foram resetadas para o padrão.'
    });
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Personalização</h1>
            <p className="text-muted-foreground">
              Customize a marca, cores e layout da plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar Padrão
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="brand" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brand">Marca</TabsTrigger>
            <TabsTrigger value="colors">Cores</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          {/* Aba Marca */}
          <TabsContent value="brand" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade da Marca</CardTitle>
                <CardDescription>
                  Personalize o nome, logotipo e slogan da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Nome da Empresa</Label>
                    <Input
                      id="brand-name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="PrimeZapAI"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Slogan / Subtítulo</Label>
                    <Input
                      id="tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="CRM & Omnichannel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logotipo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload do Logo
                      </Button>
                      {logoUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLogoUrl('')}
                        >
                          Remover Logo
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: PNG, JPG, SVG (máx. 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                      {faviconUrl ? (
                        <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                        className="hidden"
                        onChange={handleFaviconUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload do Favicon
                      </Button>
                      {faviconUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFaviconUrl('')}
                        >
                          Remover Favicon
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Ícone quadrado 32x32 ou 64x64 pixels
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Digite a mensagem que aparecerá no login..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Dados exibidos no rodapé e em emails automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email de Contato</Label>
                    <Input placeholder="contato@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input placeholder="+55 11 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input placeholder="Rua, Número - Cidade" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cores */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Esquema de Cores</CardTitle>
                <CardDescription>
                  Personalize as cores da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Cor Primária</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usada em botões, links e elementos principais
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Cor de Destaque</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#8b5cf6"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Usada em badges, notificações e destaques
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-3 items-center">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#0a0a0a"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cor de fundo principal da interface
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Temas Predefinidos</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'Azul', primary: '#6366f1', accent: '#8b5cf6' },
                      { name: 'Verde', primary: '#10b981', accent: '#059669' },
                      { name: 'Roxo', primary: '#8b5cf6', accent: '#a78bfa' },
                      { name: 'Laranja', primary: '#f97316', accent: '#fb923c' },
                    ].map((theme) => (
                      <Button
                        key={theme.name}
                        variant="outline"
                        className="h-16 flex flex-col gap-1"
                        onClick={() => {
                          setPrimaryColor(theme.primary);
                          setAccentColor(theme.accent);
                        }}
                      >
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                        <span className="text-xs">{theme.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Modo Escuro por Padrão</Label>
                    <p className="text-xs text-muted-foreground">
                      Ativa o tema escuro ao fazer login
                    </p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 border rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{brandName}</h3>
                      <p className="text-sm text-muted-foreground">{tagline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Botão Primário
                    </Button>
                    <Button variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
                      Botão Secundário
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Layout</CardTitle>
                <CardDescription>
                  Ajuste a disposição e comportamento da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Posição do Menu Lateral</Label>
                  <Select value={sidebarPosition} onValueChange={setSidebarPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Modo Compacto</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduz espaçamentos para exibir mais conteúdo
                    </p>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Menu Lateral Recolhido por Padrão</Label>
                    <p className="text-xs text-muted-foreground">
                      Inicia com o menu lateral minimizado
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Animações Reduzidas</Label>
                    <p className="text-xs text-muted-foreground">
                      Diminui animações para melhor performance
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Avançado */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CSS Personalizado</CardTitle>
                <CardDescription>
                  Adicione CSS customizado para personalizações avançadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="/* Seu CSS personalizado aqui */&#10;.custom-class {&#10;  color: #333;&#10;}"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Use com cuidado. CSS incorreto pode quebrar o layout da aplicação.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Script Personalizado</CardTitle>
                <CardDescription>
                  Adicione scripts personalizados (Google Analytics, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="<!-- Seu código HTML/JS aqui -->&#10;<script>&#10;  // Analytics, chatbots, etc.&#10;</script>"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Scripts serão adicionados ao &lt;head&gt; da página
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
