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
import { MultiSelect } from '@/components/ui/multi-select';
import { FileText, Download, Search, Filter, Image, Building, MapPin, Eye } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useCAIPReport } from '@/hooks/useCAIPReport';

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

  // Todos os campos disponíveis do CAIP organizados por categoria
  const availableFields = [
    // Básico
    'nome_da_unidade', 'tipo_de_unidade', 'unidade_gestora', 'endereco', 'ano_caip',
    'processo_sei', 'servo2_pdi', 'coordenadas', 'zona', 'rip', 'matricula_do_imovel',
    
    // Dimensões
    'area_construida_m2', 'area_do_terreno_m2', 'area_do_patio_para_retencao_de_veiculos_m2',
    'area_da_cobertura_de_pista_m2', 'area_da_cobertura_para_fiscalizacao_de_veiculos_m2',
    
    // Avaliação
    'estado_de_conservacao', 'idade_aparente_do_imovel', 'nota_global', 'vida_util_estimada_anos',
    'nota_para_adequacao', 'nota_para_manutencao',
    
    // Financeiro
    'rvr',
    
    // Propriedade
    'tipo_de_imovel', 'situacao_do_imovel', 'implantacao_da_unidade',
    
    // Infraestrutura
    'fornecimento_de_agua', 'fornecimento_de_energia_eletrica', 'esgotamento_sanitario',
    'conexao_de_internet', 'possui_wireless_wifi', 'abastecimento_de_agua',
    'energia_eletrica_de_emergencia', 'iluminacao_externa', 'radiocomunicacao',
    'cabeamento_estruturado',
    
    // Segurança
    'blindagem', 'protecao_contra_incendios', 'protecao_contra_intrusao',
    'aterramento_e_protecao_contra_descargas_atmosfericas', 'claviculario',
    'sala_cofre', 'concertina', 'muro_ou_alambrado',
    
    // Sustentabilidade
    'acessibilidade', 'sustentabilidade', 'aproveitamento_da_agua_da_chuva', 'energia_solar',
    
    // Manutenção
    'ano_da_ultima_reavaliacao_rvr', 'ano_da_ultima_intervencao_na_infraestrutura_do_imovel',
    'tempo_de_intervencao', 'ha_contrato_de_manutencao_predial', 'ha_plano_de_manutencao_do_imovel',
    'precisaria_de_qual_intervencao',
    
    // Ambientes
    'almoxarifado', 'alojamento_feminino', 'alojamento_masculino', 'alojamento_misto',
    'area_de_servico', 'area_de_uso_compartilhado_com_outros_orgaos', 'arquivo', 'auditorio',
    'banheiro_para_zeladoria', 'banheiro_feminino_para_servidoras', 'banheiro_masculino_para_servidores',
    'banheiro_misto_para_servidores', 'box_com_chuveiro_externo', 'box_para_lavagem_de_veiculos',
    'canil', 'casa_de_maquinas', 'central_de_gas', 'cobertura_para_aglomeracao_de_usuarios',
    'cobertura_para_fiscalizacao_de_veiculos', 'copa_e_cozinha', 'deposito_de_lixo',
    'deposito_de_materiais_de_descarte_e_baixa', 'deposito_de_material_de_limpeza',
    'deposito_de_material_operacional', 'estacionamento_para_usuarios', 'garagem_para_servidores',
    'garagem_para_viaturas', 'lavabo_para_servidores_sem_box_para_chuveiro',
    'local_para_custodia_temporaria_de_detidos', 'local_para_guarda_provisoria_de_animais',
    'patio_de_retencao_de_veiculos', 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
    'ponto_de_pouso_para_aeronaves', 'rampa_de_fiscalizacao_de_veiculos', 'recepcao',
    'sala_administrativa_escritorio', 'sala_de_assepsia', 'sala_de_aula', 'sala_de_reuniao',
    'sala_de_revista_pessoal', 'sala_operacional_observatorio', 'sala_tecnica', 'sanitario_publico',
    'telefone_publico', 'torre_de_telecomunicacoes', 'vestiario_para_nao_policiais',
    'vestiario_para_policiais',
    
    // Imagens
    'imagem_geral', 'imagem_fachada', 'imagem_lateral_1', 'imagem_lateral_2', 'imagem_fundos',
    'imagem_sala_cofre', 'imagem_cofre', 'imagem_interna_alojamento_masculino',
    'imagem_interna_alojamento_feminino', 'imagem_interna_plantao_uop',
    
    // Outras
    'o_trecho_e_concessionado', 'adere_ao_pgprf_teletrabalho', 'identidade_visual',
    'climatizacao_de_ambientes', 'coleta_de_lixo', 'observacoes'
  ];

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
      reportFormat,
      selectedFields
    };
    localStorage.setItem('relatorio_customizacao', JSON.stringify(dataToSave));
  }, [selectedItems, reportTitle, reportDescription, includeImages, reportFormat, selectedFields]);

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

  // Criar labels amigáveis para os campos
  const fieldLabels: Record<string, string> = {
    // Básico
    'nome_da_unidade': 'Nome da Unidade',
    'tipo_de_unidade': 'Tipo de Unidade', 
    'unidade_gestora': 'Unidade Gestora',
    'endereco': 'Endereço',
    'ano_caip': 'Ano CAIP',
    'processo_sei': 'Processo SEI',
    'servo2_pdi': 'Servo2/PDI',
    'coordenadas': 'Coordenadas',
    'zona': 'Zona',
    'rip': 'RIP',
    'matricula_do_imovel': 'Matrícula do Imóvel',
    
    // Dimensões
    'area_construida_m2': 'Área Construída (m²)',
    'area_do_terreno_m2': 'Área do Terreno (m²)',
    'area_do_patio_para_retencao_de_veiculos_m2': 'Área do Pátio para Retenção (m²)',
    'area_da_cobertura_de_pista_m2': 'Área da Cobertura de Pista (m²)',
    'area_da_cobertura_para_fiscalizacao_de_veiculos_m2': 'Área Cobertura Fiscalização (m²)',
    
    // Avaliação
    'estado_de_conservacao': 'Estado de Conservação',
    'idade_aparente_do_imovel': 'Idade Aparente (anos)',
    'nota_global': 'Nota Global',
    'vida_util_estimada_anos': 'Vida Útil Estimada (anos)',
    'nota_para_adequacao': 'Nota para Adequação',
    'nota_para_manutencao': 'Nota para Manutenção',
    
    // Financeiro
    'rvr': 'RVR',
    
    // Propriedade
    'tipo_de_imovel': 'Tipo de Imóvel',
    'situacao_do_imovel': 'Situação do Imóvel',
    'implantacao_da_unidade': 'Implantação da Unidade',
    
    // Infraestrutura
    'fornecimento_de_agua': 'Fornecimento de Água',
    'fornecimento_de_energia_eletrica': 'Energia Elétrica',
    'esgotamento_sanitario': 'Esgotamento Sanitário',
    'conexao_de_internet': 'Conexão de Internet',
    'possui_wireless_wifi': 'WiFi',
    'abastecimento_de_agua': 'Abastecimento de Água',
    'energia_eletrica_de_emergencia': 'Energia de Emergência',
    'iluminacao_externa': 'Iluminação Externa',
    'radiocomunicacao': 'Radiocomunicação',
    'cabeamento_estruturado': 'Cabeamento Estruturado',
    
    // Segurança
    'blindagem': 'Blindagem',
    'protecao_contra_incendios': 'Proteção Contra Incêndios',
    'protecao_contra_intrusao': 'Proteção Contra Intrusão',
    'aterramento_e_protecao_contra_descargas_atmosfericas': 'Proteção Descargas',
    'claviculario': 'Claviculário',
    'sala_cofre': 'Sala Cofre',
    'concertina': 'Concertina',
    'muro_ou_alambrado': 'Muro/Alambrado',
    
    // Sustentabilidade
    'acessibilidade': 'Acessibilidade',
    'sustentabilidade': 'Sustentabilidade',
    'aproveitamento_da_agua_da_chuva': 'Aproveitamento Água da Chuva',
    'energia_solar': 'Energia Solar',
    
    // Manutenção
    'ano_da_ultima_reavaliacao_rvr': 'Última Reavaliação RVR',
    'ano_da_ultima_intervencao_na_infraestrutura_do_imovel': 'Última Intervenção',
    'tempo_de_intervencao': 'Tempo de Intervenção',
    'ha_contrato_de_manutencao_predial': 'Contrato Manutenção',
    'ha_plano_de_manutencao_do_imovel': 'Plano de Manutenção',
    'precisaria_de_qual_intervencao': 'Intervenção Necessária',
    
    // Ambientes (simplificados)
    'almoxarifado': 'Almoxarifado',
    'alojamento_feminino': 'Alojamento Feminino',
    'alojamento_masculino': 'Alojamento Masculino',
    'recepcao': 'Recepção',
    'sala_administrativa_escritorio': 'Sala Administrativa',
    'garagem_para_viaturas': 'Garagem para Viaturas',
    
     // Imagens
     'imagem_geral': 'Imagem Geral',
     'imagem_fachada': 'Imagem da Fachada',
     'imagem_lateral_1': 'Imagem Lateral 1',
     'imagem_lateral_2': 'Imagem Lateral 2',
     'imagem_fundos': 'Imagem dos Fundos',
     'imagem_sala_cofre': 'Imagem Sala Cofre',
     'imagem_cofre': 'Imagem do Cofre',
     'imagem_interna_alojamento_masculino': 'Imagem Alojamento Masculino',
     'imagem_interna_alojamento_feminino': 'Imagem Alojamento Feminino',
     'imagem_interna_plantao_uop': 'Imagem Plantão UOP',
    
    // Outras
    'o_trecho_e_concessionado': 'Trecho Concessionado',
    'adere_ao_pgprf_teletrabalho': 'PGPRF Teletrabalho',
    'identidade_visual': 'Identidade Visual',
    'climatizacao_de_ambientes': 'Climatização',
    'coleta_de_lixo': 'Coleta de Lixo',
    'observacoes': 'Observações'
  };

  const fieldOptions = availableFields.map(field => fieldLabels[field] || field).sort((a, b) => a.localeCompare(b));

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
      
      console.log('=== DEBUG GERAÇÃO RELATÓRIO ===');
      console.log('Dados filtrados:', filteredData.length);
      console.log('IDs selecionados:', selectedItems);
      console.log('Dados selecionados:', selectedData);
      console.log('Campos incluídos:', selectedFields);
      
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

      console.log('Dados do relatório preparados:', reportData);

      // Navegar para preview em vez de gerar PDF diretamente
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

  const handleFieldsChange = (selectedLabels: string[]) => {
    // Converter labels de volta para field IDs
    const selectedFieldIds = selectedLabels.map(label => {
      const field = Object.entries(fieldLabels).find(([_, fieldLabel]) => fieldLabel === label);
      return field ? field[0] : label;
    });
    setSelectedFields(selectedFieldIds);
  };

  const clearCustomization = () => {
    setSelectedItems([]);
    setReportTitle('');
    setReportDescription('');
    setIncludeImages(true);
    setReportFormat('pdf');
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
            </CardContent>
          </Card>

          {/* Campos a Incluir */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Campos a Incluir</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecione os campos que deseja incluir no relatório
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiSelect
                options={fieldOptions}
                selected={selectedFields.map(field => fieldLabels[field] || field)}
                onChange={handleFieldsChange}
                placeholder="Selecione os campos para incluir..."
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {selectedFields.length} campos selecionados
              </div>
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