import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Search, Filter, Image, Building, MapPin, Eye } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useCAIPReport } from '@/hooks/useCAIPReport';
import { exportToExcel, exportToCSV } from '@/utils/exportData';

const Relatorios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const { data: supabaseData, loading } = useSupabaseData(
    isAdmin ? undefined : profile?.unidade_gestora
  );
  const { generateReport, isGenerating } = useCAIPReport();
  const { toast } = useToast();

  // Carregar dados salvos do localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('relatorio_customizacao');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedData = loadSavedData();

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>(savedData?.selectedItems || []);
  const [reportTitle, setReportTitle] = useState(savedData?.reportTitle || '');
  const [reportDescription, setReportDescription] = useState(savedData?.reportDescription || '');
  const [includeImages, setIncludeImages] = useState(savedData?.includeImages ?? true);
  const [reportFormat, setReportFormat] = useState(savedData?.reportFormat || 'pdf');
  const [includeAggregation, setIncludeAggregation] = useState(savedData?.includeAggregation ?? false);

  // Campos organizados por categoria
  const fieldsByCategory: Record<string, { key: string; label: string }[]> = {
    'Básico': [
      { key: 'nome_da_unidade', label: 'Nome da Unidade' },
      { key: 'tipo_de_unidade', label: 'Tipo de Unidade' },
      { key: 'unidade_gestora', label: 'Unidade Gestora' },
      { key: 'endereco', label: 'Endereço' },
      { key: 'ano_caip', label: 'Ano CAIP' },
      { key: 'processo_sei', label: 'Processo SEI' },
      { key: 'servo2_pdi', label: 'Servo2/PDI' },
      { key: 'coordenadas', label: 'Coordenadas' },
      { key: 'zona', label: 'Zona' },
      { key: 'rip', label: 'RIP' },
      { key: 'matricula_do_imovel', label: 'Matrícula do Imóvel' },
    ],
    'Dimensões': [
      { key: 'area_construida_m2', label: 'Área Construída (m²)' },
      { key: 'area_do_terreno_m2', label: 'Área do Terreno (m²)' },
      { key: 'area_do_patio_para_retencao_de_veiculos_m2', label: 'Área do Pátio para Retenção (m²)' },
      { key: 'area_da_cobertura_de_pista_m2', label: 'Área da Cobertura de Pista (m²)' },
      { key: 'area_da_cobertura_para_fiscalizacao_de_veiculos_m2', label: 'Área Cobertura Fiscalização (m²)' },
    ],
    'Avaliação': [
      { key: 'estado_de_conservacao', label: 'Estado de Conservação' },
      { key: 'idade_aparente_do_imovel', label: 'Idade Aparente (anos)' },
      { key: 'nota_global', label: 'Nota Global' },
      { key: 'vida_util_estimada_anos', label: 'Vida Útil Estimada (anos)' },
      { key: 'nota_para_adequacao', label: 'Nota para Adequação' },
      { key: 'nota_para_manutencao', label: 'Nota para Manutenção' },
      { key: 'rvr', label: 'RVR' },
    ],
    'Propriedade': [
      { key: 'tipo_de_imovel', label: 'Tipo de Imóvel' },
      { key: 'situacao_do_imovel', label: 'Situação do Imóvel' },
      { key: 'implantacao_da_unidade', label: 'Implantação da Unidade' },
    ],
    'Infraestrutura': [
      { key: 'fornecimento_de_agua', label: 'Fornecimento de Água' },
      { key: 'fornecimento_de_energia_eletrica', label: 'Energia Elétrica' },
      { key: 'esgotamento_sanitario', label: 'Esgotamento Sanitário' },
      { key: 'conexao_de_internet', label: 'Conexão de Internet' },
      { key: 'possui_wireless_wifi', label: 'WiFi' },
      { key: 'abastecimento_de_agua', label: 'Abastecimento de Água' },
      { key: 'energia_eletrica_de_emergencia', label: 'Energia de Emergência' },
      { key: 'iluminacao_externa', label: 'Iluminação Externa' },
      { key: 'radiocomunicacao', label: 'Radiocomunicação' },
      { key: 'cabeamento_estruturado', label: 'Cabeamento Estruturado' },
      { key: 'climatizacao_de_ambientes', label: 'Climatização' },
      { key: 'coleta_de_lixo', label: 'Coleta de Lixo' },
    ],
    'Segurança': [
      { key: 'blindagem', label: 'Blindagem' },
      { key: 'protecao_contra_incendios', label: 'Proteção Contra Incêndios' },
      { key: 'protecao_contra_intrusao', label: 'Proteção Contra Intrusão' },
      { key: 'aterramento_e_protecao_contra_descargas_atmosfericas', label: 'Proteção Descargas' },
      { key: 'claviculario', label: 'Claviculário' },
      { key: 'sala_cofre', label: 'Sala Cofre' },
      { key: 'concertina', label: 'Concertina' },
      { key: 'muro_ou_alambrado', label: 'Muro/Alambrado' },
    ],
    'Sustentabilidade': [
      { key: 'acessibilidade', label: 'Acessibilidade' },
      { key: 'sustentabilidade', label: 'Sustentabilidade' },
      { key: 'aproveitamento_da_agua_da_chuva', label: 'Aproveitamento Água da Chuva' },
      { key: 'energia_solar', label: 'Energia Solar' },
    ],
    'Manutenção': [
      { key: 'ano_da_ultima_reavaliacao_rvr', label: 'Última Reavaliação RVR' },
      { key: 'ano_da_ultima_intervencao_na_infraestrutura_do_imovel', label: 'Última Intervenção' },
      { key: 'tempo_de_intervencao', label: 'Tempo de Intervenção' },
      { key: 'ha_contrato_de_manutencao_predial', label: 'Contrato Manutenção' },
      { key: 'ha_plano_de_manutencao_do_imovel', label: 'Plano de Manutenção' },
      { key: 'precisaria_de_qual_intervencao', label: 'Intervenção Necessária' },
    ],
    'Ambientes': [
      { key: 'almoxarifado', label: 'Almoxarifado' },
      { key: 'alojamento_feminino', label: 'Alojamento Feminino' },
      { key: 'alojamento_masculino', label: 'Alojamento Masculino' },
      { key: 'alojamento_misto', label: 'Alojamento Misto' },
      { key: 'area_de_servico', label: 'Área de Serviço' },
      { key: 'area_de_uso_compartilhado_com_outros_orgaos', label: 'Área de Uso Compartilhado' },
      { key: 'arquivo', label: 'Arquivo' },
      { key: 'auditorio', label: 'Auditório' },
      { key: 'banheiro_para_zeladoria', label: 'Banheiro Zeladoria' },
      { key: 'banheiro_feminino_para_servidoras', label: 'Banheiro Feminino' },
      { key: 'banheiro_masculino_para_servidores', label: 'Banheiro Masculino' },
      { key: 'banheiro_misto_para_servidores', label: 'Banheiro Misto' },
      { key: 'box_com_chuveiro_externo', label: 'Box Chuveiro Externo' },
      { key: 'box_para_lavagem_de_veiculos', label: 'Box Lavagem Veículos' },
      { key: 'canil', label: 'Canil' },
      { key: 'casa_de_maquinas', label: 'Casa de Máquinas' },
      { key: 'central_de_gas', label: 'Central de Gás' },
      { key: 'cobertura_para_aglomeracao_de_usuarios', label: 'Cobertura Aglomeração' },
      { key: 'cobertura_para_fiscalizacao_de_veiculos', label: 'Cobertura Fiscalização' },
      { key: 'copa_e_cozinha', label: 'Copa e Cozinha' },
      { key: 'deposito_de_lixo', label: 'Depósito de Lixo' },
      { key: 'deposito_de_materiais_de_descarte_e_baixa', label: 'Depósito Descarte/Baixa' },
      { key: 'deposito_de_material_de_limpeza', label: 'Depósito Limpeza' },
      { key: 'deposito_de_material_operacional', label: 'Depósito Material Operacional' },
      { key: 'estacionamento_para_usuarios', label: 'Estacionamento Usuários' },
      { key: 'garagem_para_servidores', label: 'Garagem Servidores' },
      { key: 'garagem_para_viaturas', label: 'Garagem Viaturas' },
      { key: 'lavabo_para_servidores_sem_box_para_chuveiro', label: 'Lavabo Servidores' },
      { key: 'local_para_custodia_temporaria_de_detidos', label: 'Custódia Temporária' },
      { key: 'local_para_guarda_provisoria_de_animais', label: 'Guarda Animais' },
      { key: 'patio_de_retencao_de_veiculos', label: 'Pátio Retenção Veículos' },
      { key: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', label: 'Plataforma Fiscalização' },
      { key: 'ponto_de_pouso_para_aeronaves', label: 'Ponto Pouso Aeronaves' },
      { key: 'rampa_de_fiscalizacao_de_veiculos', label: 'Rampa Fiscalização' },
      { key: 'recepcao', label: 'Recepção' },
      { key: 'sala_administrativa_escritorio', label: 'Sala Administrativa' },
      { key: 'sala_de_assepsia', label: 'Sala de Assepsia' },
      { key: 'sala_de_aula', label: 'Sala de Aula' },
      { key: 'sala_de_reuniao', label: 'Sala de Reunião' },
      { key: 'sala_de_revista_pessoal', label: 'Sala Revista Pessoal' },
      { key: 'sala_operacional_observatorio', label: 'Sala Operacional' },
      { key: 'sala_tecnica', label: 'Sala Técnica' },
      { key: 'sanitario_publico', label: 'Sanitário Público' },
      { key: 'telefone_publico', label: 'Telefone Público' },
      { key: 'torre_de_telecomunicacoes', label: 'Torre Telecomunicações' },
      { key: 'vestiario_para_nao_policiais', label: 'Vestiário Não-Policiais' },
      { key: 'vestiario_para_policiais', label: 'Vestiário Policiais' },
    ],
    'Imagens': [
      { key: 'imagem_geral', label: 'Imagem Geral' },
      { key: 'imagem_fachada', label: 'Imagem da Fachada' },
      { key: 'imagem_lateral_1', label: 'Imagem Lateral 1' },
      { key: 'imagem_lateral_2', label: 'Imagem Lateral 2' },
      { key: 'imagem_fundos', label: 'Imagem dos Fundos' },
      { key: 'imagem_sala_cofre', label: 'Imagem Sala Cofre' },
      { key: 'imagem_cofre', label: 'Imagem do Cofre' },
      { key: 'imagem_interna_alojamento_masculino', label: 'Imagem Alojamento Masculino' },
      { key: 'imagem_interna_alojamento_feminino', label: 'Imagem Alojamento Feminino' },
      { key: 'imagem_interna_plantao_uop', label: 'Imagem Plantão UOP' },
    ],
    'Outras': [
      { key: 'o_trecho_e_concessionado', label: 'Trecho Concessionado' },
      { key: 'adere_ao_pgprf_teletrabalho', label: 'PGPRF Teletrabalho' },
      { key: 'identidade_visual', label: 'Identidade Visual' },
      { key: 'observacoes', label: 'Observações' },
    ],
  };

  const availableFields = Object.values(fieldsByCategory).flat().map(f => f.key);
  
  const fieldLabels: Record<string, string> = Object.fromEntries(
    Object.values(fieldsByCategory).flat().map(f => [f.key, f.label])
  );

  const [selectedFields, setSelectedFields] = useState<string[]>(
    savedData?.selectedFields || ['nome_da_unidade', 'tipo_de_unidade', 'endereco', 'area_construida_m2', 'estado_de_conservacao']
  );

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    const dataToSave = {
      selectedItems,
      reportTitle,
      reportDescription,
      includeImages,
      includeAggregation,
      reportFormat,
      selectedFields
    };
    localStorage.setItem('relatorio_customizacao', JSON.stringify(dataToSave));
  }, [selectedItems, reportTitle, reportDescription, includeImages, includeAggregation, reportFormat, selectedFields]);

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

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey) 
        : [...prev, fieldKey]
    );
  };

  const handleToggleCategory = (category: string) => {
    const categoryKeys = fieldsByCategory[category].map(f => f.key);
    const allSelected = categoryKeys.every(k => selectedFields.includes(k));
    if (allSelected) {
      setSelectedFields(prev => prev.filter(f => !categoryKeys.includes(f)));
    } else {
      setSelectedFields(prev => [...new Set([...prev, ...categoryKeys])]);
    }
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
      
      console.log('=== DEBUG GERAÇÃO RELATÓRIO DETALHADO ===');
      console.log('Todos os dados disponíveis:', supabaseData.length, 'registros');
      console.log('Dados filtrados:', filteredData.length, 'registros');
      console.log('IDs selecionados:', selectedItems);
      console.log('Dados selecionados encontrados:', selectedData.length, 'registros');
      console.log('Campos incluídos:', selectedFields);
      
      if (selectedData.length > 0) {
        console.log('=== PRIMEIRO ITEM SELECIONADO ===');
        const primeiro = selectedData[0];
        console.log('Objeto completo:', primeiro);
        console.log('ID:', primeiro.id);
        console.log('Nome:', primeiro.nome_da_unidade);
        console.log('Tipo:', primeiro.tipo_de_unidade);
        console.log('Endereço:', primeiro.endereco);
        console.log('Área construída:', primeiro.area_construida_m2);
        console.log('Estado conservação:', primeiro.estado_de_conservacao);
        console.log('Alojamento feminino:', primeiro.alojamento_feminino);
        console.log('Alojamento masculino:', primeiro.alojamento_masculino);
        console.log('Todas as propriedades:', Object.keys(primeiro));
      } else {
        console.error('❌ ERRO: Nenhum dado selecionado encontrado!');
        console.log('filteredData sample:', filteredData.slice(0, 3));
        console.log('selectedItems:', selectedItems);
      }
      
      // Preparar dados do relatório
      const reportData = {
        titulo: reportTitle,
        descricao: reportDescription,
        campos_incluidos: selectedFields,
        incluir_imagens: includeImages,
        incluir_agregacao: includeAggregation,
        formato: reportFormat,
        dados: selectedData,
        total_imoveis: selectedData.length,
        data_geracao: new Date().toLocaleString('pt-BR'),
        gerado_por: profile?.nome_completo || user?.email
      };

      console.log('Dados do relatório preparados:', reportData);

      // Verificar formato de exportação selecionado
      if (reportFormat === 'excel') {
        try {
          exportToExcel({
            title: reportTitle,
            data: selectedData,
            selectedFields: selectedFields
          });
          toast({
            title: "Sucesso",
            description: "Arquivo Excel gerado com sucesso!",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao gerar arquivo Excel.",
            variant: "destructive",
          });
        }
        return;
      }

      if (reportFormat === 'csv') {
        try {
          exportToCSV({
            title: reportTitle,
            data: selectedData,
            selectedFields: selectedFields
          });
          toast({
            title: "Sucesso",
            description: "Arquivo CSV gerado com sucesso!",
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao gerar arquivo CSV.",
            variant: "destructive",
          });
        }
        return;
      }

      // Navegar para preview para PDF
      navigate('/relatorio-preview', { state: { reportData } });

      toast({
        title: "Redirecionando",
        description: `Abrindo preview do relatório "${reportTitle}"...`,
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


  const clearCustomization = () => {
    setSelectedItems([]);
    setReportTitle('');
    setReportDescription('');
    setIncludeImages(true);
    setReportFormat('pdf');
    setIncludeAggregation(false);
    setSelectedFields(['nome_da_unidade', 'tipo_de_unidade', 'endereco', 'area_construida_m2', 'estado_de_conservacao']);
    localStorage.removeItem('relatorio_customizacao');
    toast({
      title: "Customização limpa",
      description: "Todos os dados de customização foram removidos.",
    });
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Relatórios Customizados</h1>
        </div>
        <Button
          variant="outline"
          onClick={clearCustomization}
          className="text-sm"
        >
          Limpar Customização
        </Button>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAggregation"
                  checked={includeAggregation}
                  onCheckedChange={(checked) => setIncludeAggregation(checked === true)}
                />
                <Label htmlFor="includeAggregation" className="text-sm">
                  Incluir resumo agregado (campos Sim/Não)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Campos a Incluir */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Campos a Incluir</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Selecione os campos que deseja incluir no relatório
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields([...availableFields])}
                    className="text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFields([])}
                    className="text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedFields.length} campos selecionados
                </Badge>
              </div>
              <ScrollArea className="h-72 border rounded-md p-2">
                {Object.entries(fieldsByCategory).map(([category, fields]) => {
                  const allSelected = fields.every(f => selectedFields.includes(f.key));
                  return (
                    <div key={category} className="mb-3">
                      <div 
                        className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                        onClick={() => handleToggleCategory(category)}
                      >
                        <Checkbox checked={allSelected} onCheckedChange={() => handleToggleCategory(category)} />
                        <span className="text-xs font-bold text-primary uppercase">{category}</span>
                        <span className="text-xs text-muted-foreground">({fields.filter(f => selectedFields.includes(f.key)).length}/{fields.length})</span>
                      </div>
                      <div className="ml-4 space-y-1">
                        {fields.map(field => (
                          <div key={field.key} className="flex items-center gap-2">
                            <Checkbox
                              id={`field-${field.key}`}
                              checked={selectedFields.includes(field.key)}
                              onCheckedChange={() => handleFieldToggle(field.key)}
                            />
                            <Label htmlFor={`field-${field.key}`} className="text-xs cursor-pointer">
                              {field.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
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
                      <Eye className="mr-2 h-4 w-4" />
                      Preview do Relatório
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