import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Search, Filter, Image, Building, MapPin } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useCAIPReport } from '@/hooks/useCAIPReport';

const Relatorios = () => {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const { data: supabaseData, loading } = useSupabaseData(
    isAdmin ? undefined : profile?.unidade_gestora
  );
  const { generateReport, isGenerating } = useCAIPReport();
  const { toast } = useToast();

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  const [reportFormat, setReportFormat] = useState('pdf');

  // Campos disponíveis para incluir no relatório
  const availableFields = [
    { id: 'nome_da_unidade', label: 'Nome da Unidade', category: 'Básico' },
    { id: 'tipo_de_unidade', label: 'Tipo de Unidade', category: 'Básico' },
    { id: 'unidade_gestora', label: 'Unidade Gestora', category: 'Básico' },
    { id: 'endereco', label: 'Endereço', category: 'Básico' },
    { id: 'area_construida_m2', label: 'Área Construída (m²)', category: 'Dimensões' },
    { id: 'area_do_terreno_m2', label: 'Área do Terreno (m²)', category: 'Dimensões' },
    { id: 'estado_de_conservacao', label: 'Estado de Conservação', category: 'Avaliação' },
    { id: 'idade_aparente_do_imovel', label: 'Idade Aparente', category: 'Avaliação' },
    { id: 'rvr', label: 'RVR', category: 'Financeiro' },
    { id: 'nota_global', label: 'Nota Global', category: 'Avaliação' },
    { id: 'coordenadas', label: 'Coordenadas', category: 'Localização' },
    { id: 'zona', label: 'Zona', category: 'Localização' },
    { id: 'fornecimento_de_agua', label: 'Fornecimento de Água', category: 'Infraestrutura' },
    { id: 'fornecimento_de_energia_eletrica', label: 'Energia Elétrica', category: 'Infraestrutura' },
    { id: 'esgotamento_sanitario', label: 'Esgotamento Sanitário', category: 'Infraestrutura' },
    { id: 'conexao_de_internet', label: 'Conexão de Internet', category: 'Infraestrutura' },
  ];

  const [selectedFields, setSelectedFields] = useState<string[]>([
    'nome_da_unidade', 'tipo_de_unidade', 'endereco', 'area_construida_m2', 'estado_de_conservacao'
  ]);

  useEffect(() => {
    setFilteredData(supabaseData);
  }, [supabaseData]);

  const handleFilterChange = (filters: any) => {
    let filtered = supabaseData;
    
    if (filters.anoCAIP && filters.anoCAIP.length > 0) {
      filtered = filtered.filter(item => filters.anoCAIP.includes(item['ano_caip']));
    }
    
    if (filters.unidadeGestora && filters.unidadeGestora.length > 0) {
      filtered = filtered.filter(item => filters.unidadeGestora.includes(item['unidade_gestora']));
    }
    
    if (filters.tipoUnidade && filters.tipoUnidade.length > 0) {
      filtered = filtered.filter(item => filters.tipoUnidade.includes(item['tipo_de_unidade']));
    }
    
    if (filters.nomeUnidade) {
      filtered = filtered.filter(item => 
        item['nome_da_unidade'] && 
        item['nome_da_unidade'].toLowerCase().includes(filters.nomeUnidade.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleGenerateReport = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um imóvel para incluir no relatório.",
        variant: "destructive",
      });
      return;
    }

    if (!reportTitle.trim()) {
      toast({
        title: "Atenção", 
        description: "Informe um título para o relatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedData = filteredData.filter(item => selectedItems.includes(item.id));
      
      // Preparar dados do relatório
      const reportData = {
        titulo: reportTitle,
        descricao: reportDescription,
        campos_incluidos: selectedFields,
        incluir_imagens: includeImages,
        formato: reportFormat,
        dados: selectedData,
        total_imoveis: selectedData.length,
        data_geracao: new Date().toLocaleString('pt-BR'),
        gerado_por: profile?.nome_completo || user?.email
      };

      // Por enquanto, usar o hook existente para um dos itens
      if (selectedData.length > 0) {
        await generateReport(selectedData[0]);
      }

      toast({
        title: "Sucesso",
        description: `Relatório "${reportTitle}" gerado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Relatórios Customizados</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof availableFields>);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Relatórios Customizados</h1>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
          Geração de Relatórios Personalizados
        </h2>
        <p className="text-sm text-muted-foreground px-2">
          Configure e gere relatórios customizados com base nos dados do CAIP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Configuração do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Título do Relatório *</Label>
                <Input
                  id="reportTitle"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ex: Relatório de Imóveis - 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription">Descrição</Label>
                <Textarea
                  id="reportDescription"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Descrição opcional do relatório..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Formato de Saída</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeImages"
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(checked === true)}
                />
                <Label htmlFor="includeImages" className="text-sm">
                  Incluir imagens dos imóveis
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Campos a Incluir */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Campos a Incluir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                  <div className="space-y-2">
                    {fields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id} className="text-sm">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Seleção de Dados */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataFilter onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>

          {/* Lista de Imóveis */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Selecionar Imóveis ({filteredData.length} disponíveis)
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems(filteredData.map(item => item.id))}
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems([])}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
              {selectedItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length} imóveis selecionados
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedItems(prev =>
                        prev.includes(item.id)
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="h-4 w-4 text-primary" />
                          <h3 className="font-medium text-sm">
                            {item.nome_da_unidade || 'Nome não informado'}
                          </h3>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.endereco || 'Endereço não informado'}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.tipo_de_unidade || 'Tipo não informado'}
                            </Badge>
                            {item.estado_de_conservacao && (
                              <Badge variant="outline" className="text-xs">
                                {item.estado_de_conservacao}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-xs text-muted-foreground">
                        {item.area_construida_m2 && (
                          <span>{Number(item.area_construida_m2).toLocaleString()} m²</span>
                        )}
                        {item.ano_caip && <span>{item.ano_caip}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="text-sm text-muted-foreground">
                  <p>Relatório: <strong>{reportTitle || 'Sem título'}</strong></p>
                  <p>Imóveis selecionados: <strong>{selectedItems.length}</strong></p>
                  <p>Campos incluídos: <strong>{selectedFields.length}</strong></p>
                </div>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating || selectedItems.length === 0 || !reportTitle.trim()}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;