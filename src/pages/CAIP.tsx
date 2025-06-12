import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Database, Plus, Search, Edit, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

const CAIP = () => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState<DadosCAIP[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [percentualPreenchimento, setPercentualPreenchimento] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DadosCAIP>();
  const watchedValues = watch();

  // Lista de unidades gestoras baseada no perfil do usuário
  const unidadesGestoras = [
    'SR/PRF/AC', 'SR/PRF/AL', 'SR/PRF/AP', 'SR/PRF/AM', 'SR/PRF/BA', 'SR/PRF/CE',
    'SR/PRF/DF', 'SR/PRF/ES', 'SR/PRF/GO', 'SR/PRF/MA', 'SR/PRF/MT', 'SR/PRF/MS',
    'SR/PRF/MG', 'SR/PRF/PA', 'SR/PRF/PB', 'SR/PRF/PR', 'SR/PRF/PE', 'SR/PRF/PI',
    'SR/PRF/RJ', 'SR/PRF/RN', 'SR/PRF/RS', 'SR/PRF/RO', 'SR/PRF/RR', 'SR/PRF/SC',
    'SR/PRF/SP', 'SR/PRF/SE', 'SR/PRF/TO'
  ];

  // Estados de conservação
  const estadosConservacao = [
    { value: 'A', label: 'A - Novo' },
    { value: 'B', label: 'B - Entre novo e regular' },
    { value: 'C', label: 'C - Regular' },
    { value: 'D', label: 'D - Entre regular e reparos simples' },
    { value: 'E', label: 'E - Reparos simples' },
    { value: 'F', label: 'F - Entre reparos simples e importantes' },
    { value: 'G', label: 'G - Reparos importantes' },
    { value: 'H', label: 'H - Entre reparos importantes e sem valor' }
  ];

  useEffect(() => {
    fetchExistingData();
  }, []);

  // Preencher campos automáticos ao criar novo registro
  useEffect(() => {
    if (profile && !editingId) {
      setValue('cadastrador', profile.nome_completo);
      setValue('alterador', profile.nome_completo);
      setValue('ultima_alteracao', new Date().toISOString().split('T')[0]);
      if (profile.unidade_lotacao) {
        setValue('unidade_gestora', profile.unidade_lotacao);
      }
    }
  }, [profile, editingId, setValue]);

  // Calcular percentual de preenchimento
  useEffect(() => {
    if (watchedValues) {
      const campos = Object.keys(watchedValues);
      const camposPreenchidos = campos.filter(campo => {
        const valor = watchedValues[campo as keyof DadosCAIP];
        return valor !== null && valor !== undefined && valor !== '';
      });
      
      const percentual = Math.round((camposPreenchidos.length / campos.length) * 100);
      setPercentualPreenchimento(percentual);
      setValue('percentual_preenchimento', percentual.toString());
      setValue('preenchido', percentual > 70 ? 'Sim' : 'Não');
      setValue('data_alteracao_preenchida', new Date().toISOString().split('T')[0]);
    }
  }, [watchedValues, setValue]);

  const fetchExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('dados_caip')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setExistingData(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados existentes.",
        variant: "destructive",
      });
    }
  };

  const validateAnoCAIP = (value: string) => {
    const year = parseInt(value);
    if (isNaN(year) || year % 2 === 0) {
      return 'O Ano CAIP deve ser um número ímpar.';
    }
    return true;
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate Ano CAIP
      if (data.ano_caip) {
        const validation = validateAnoCAIP(data.ano_caip);
        if (validation !== true) {
          toast({
            title: "Erro de Validação",
            description: validation,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (editingId) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Registro atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('dados_caip')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Novo registro criado com sucesso.",
        });
      }

      reset();
      setEditingId(null);
      fetchExistingData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: DadosCAIP) => {
    setEditingId(item.id);
    // Preencher o formulário com os dados existentes
    Object.keys(item).forEach(key => {
      setValue(key as keyof DadosCAIP, item[key as keyof DadosCAIP]);
    });
  };

  const handleNew = () => {
    reset();
    setEditingId(null);
  };

  const filteredData = existingData.filter(item =>
    item.nome_da_unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unidade_gestora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">CAIP - Cadastro de Imóveis</h1>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">
            {editingId ? 'Editar Registro' : 'Novo Registro'}
          </TabsTrigger>
          <TabsTrigger value="list">Registros Existentes</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Editar Registro CAIP' : 'Novo Registro CAIP'}
              </CardTitle>
              {editingId && (
                <Badge variant="outline">Editando ID: {editingId}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção 1: Informações Básicas e Cadastro */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Informações Básicas
                  </h3>
                  {/* Campos automáticos ocultos */}
                  <input type="hidden" {...register('cadastrador')} />
                  <input type="hidden" {...register('alterador')} />
                  <input type="hidden" {...register('ultima_alteracao')} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ano_caip">Ano CAIP *</Label>
                      <Input 
                        type="text" 
                        maxLength={4}
                        {...register('ano_caip', { 
                          required: "Campo obrigatório",
                          pattern: {
                            value: /^\d{4}$/,
                            message: "O Ano CAIP deve ter 4 dígitos"
                          },
                          validate: (value) => {
                            const year = parseInt(value);
                            return !isNaN(year) && year % 2 !== 0 || "O Ano CAIP deve ser um número ímpar";
                          }
                        })} 
                        placeholder="Ex: 2025 (ímpar)" 
                      />
                      {errors.ano_caip && (
                        <p className="text-sm text-destructive mt-1">{errors.ano_caip.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="unidade_gestora">Unidade Gestora *</Label>
                      <Select onValueChange={(value) => setValue('unidade_gestora', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma unidade gestora" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesGestoras.map((unidade) => (
                            <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unidade_gestora && (
                        <p className="text-sm text-destructive mt-1">{errors.unidade_gestora.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="tipo_de_unidade">Tipo de Unidade</Label>
                      <Input {...register('tipo_de_unidade')} placeholder="Ex: Superintendência, UOP, Delegacia" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="nome_da_unidade">Nome da Unidade *</Label>
                      <Input {...register('nome_da_unidade', { required: "Campo obrigatório" })} placeholder="Nome completo da unidade" />
                      {errors.nome_da_unidade && (
                        <p className="text-sm text-destructive mt-1">{errors.nome_da_unidade.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="processo_sei">Processo SEI</Label>
                      <Input {...register('processo_sei')} placeholder="Nº do processo SEI" />
                    </div>
                    <div>
                      <Label htmlFor="servo2_pdi">Servo2 (PDI)</Label>
                      <Input {...register('servo2_pdi')} placeholder="Informação do Servo2 (PDI)" />
                    </div>
                  </div>
                </Card>

                {/* Seção 2: Imagens */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Imagens do Imóvel
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'imagem_geral', label: 'Imagem Geral' },
                      { key: 'imagem_fachada', label: 'Imagem Fachada' },
                      { key: 'imagem_lateral_1', label: 'Imagem Lateral 1' },
                      { key: 'imagem_lateral_2', label: 'Imagem Lateral 2' },
                      { key: 'imagem_fundos', label: 'Imagem Fundos' },
                      { key: 'imagem_sala_cofre', label: 'Imagem Sala Cofre' },
                      { key: 'imagem_cofre', label: 'Imagem Cofre' },
                      { key: 'imagem_interna_alojamento_masculino', label: 'Imagem Interna Alojamento Masculino' },
                      { key: 'imagem_interna_alojamento_feminino', label: 'Imagem Interna Alojamento Feminino' },
                      { key: 'imagem_interna_plantao_uop', label: 'Imagem Interna Plantão UOP' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{label}</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/20">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <Input
                            type="file"
                            accept="image/*"
                            {...register(key as keyof DadosCAIP)}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Seção 3: Localização e Dados do Imóvel */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Localização e Dados do Imóvel</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Textarea {...register('endereco')} placeholder="Endereço completo do imóvel" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="implantacao_da_unidade">Implantação da Unidade</Label>
                        <Input {...register('implantacao_da_unidade')} placeholder="Tipo de implantação da unidade" />
                      </div>
                      <div>
                        <Label htmlFor="coordenadas">Coordenadas</Label>
                        <Input {...register('coordenadas')} placeholder="Ex: -XX.XXXXXX, -XX.XXXXXX" />
                      </div>
                      <div>
                        <Label htmlFor="zona">Zona</Label>
                        <Input {...register('zona')} placeholder="Zona (Urbana/Rural)" />
                      </div>
                      <div>
                        <Label htmlFor="rip">RIP</Label>
                        <Input {...register('rip')} placeholder="Número RIP do imóvel" />
                      </div>
                      <div>
                        <Label htmlFor="matricula_do_imovel">Matrícula do Imóvel</Label>
                        <Input {...register('matricula_do_imovel')} placeholder="Matrícula do imóvel (se houver)" />
                      </div>
                      <div>
                        <Label htmlFor="tipo_de_imovel">Tipo de Imóvel</Label>
                        <Select onValueChange={(value) => setValue('tipo_de_imovel', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Urbano">Urbano</SelectItem>
                            <SelectItem value="Rural">Rural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="situacao_do_imovel">Situação do Imóvel</Label>
                        <Input {...register('situacao_do_imovel')} placeholder="Ex: Regular, Irregular, Em obras" />
                      </div>
                      <div>
                        <Label htmlFor="estado_de_conservacao">Estado de Conservação</Label>
                        <Select onValueChange={(value) => setValue('estado_de_conservacao', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado de conservação" />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosConservacao.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Seção 4: Dados Técnicos e Áreas */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Dados Técnicos e Áreas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="vida_util_estimada_anos">Vida Útil Estimada (Anos)</Label>
                      <Input type="number" {...register('vida_util_estimada_anos', { valueAsNumber: true })} placeholder="Ex: 60" />
                    </div>
                    <div>
                      <Label htmlFor="area_do_terreno_m2">Área do Terreno (m²)</Label>
                      <Input type="number" step="0.01" {...register('area_do_terreno_m2', { valueAsNumber: true })} placeholder="Ex: 500.00" />
                    </div>
                    <div>
                      <Label htmlFor="area_construida_m2">Área Construída (m²)</Label>
                      <Input type="number" step="0.01" {...register('area_construida_m2', { valueAsNumber: true })} placeholder="Ex: 250.50" />
                    </div>
                    <div>
                      <Label htmlFor="area_do_patio_para_retencao_de_veiculos_m2">Área do Pátio para Retenção de Veículos (m²)</Label>
                      <Input type="number" step="0.01" {...register('area_do_patio_para_retencao_de_veiculos_m2', { valueAsNumber: true })} placeholder="Ex: 100.00" />
                    </div>
                    <div>
                      <Label htmlFor="area_da_cobertura_de_pista_m2">Área da Cobertura de Pista (m²)</Label>
                      <Input type="number" step="0.01" {...register('area_da_cobertura_de_pista_m2', { valueAsNumber: true })} placeholder="Ex: 50.00" />
                    </div>
                    <div>
                      <Label htmlFor="area_da_cobertura_para_fiscalizacao_de_veiculos_m2">Área da Cobertura para Fiscalização de Veículos (m²)</Label>
                      <Input type="number" step="0.01" {...register('area_da_cobertura_para_fiscalizacao_de_veiculos_m2', { valueAsNumber: true })} placeholder="Ex: 30.00" />
                    </div>
                    <div>
                      <Label htmlFor="idade_aparente_do_imovel">Idade Aparente do Imóvel</Label>
                      <Input type="number" {...register('idade_aparente_do_imovel', { valueAsNumber: true })} placeholder="Idade em anos" />
                    </div>
                    <div>
                      <Label htmlFor="ano_da_ultima_intervencao_na_infraestrutura_do_imovel">Ano da Última Intervenção na Infraestrutura</Label>
                      <Input type="number" {...register('ano_da_ultima_intervencao_na_infraestrutura_do_imovel')} placeholder="Ano da intervenção" />
                    </div>
                    <div>
                      <Label htmlFor="tempo_de_intervencao">Tempo de Intervenção</Label>
                      <Input {...register('tempo_de_intervencao')} placeholder="Ex: 3 meses, 1 ano" />
                    </div>
                    <div>
                      <Label htmlFor="ano_da_ultima_reavaliacao_rvr">Ano da Última Reavaliação (RVR)</Label>
                      <Input type="number" {...register('ano_da_ultima_reavaliacao_rvr')} placeholder="Ano da última RVR" />
                    </div>
                    <div>
                      <Label htmlFor="rvr">RVR</Label>
                      <Input {...register('rvr')} placeholder="Detalhes do RVR" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('adere_ao_pgprf_teletrabalho')} />
                      <Label>Adere ao PGPRF? (TELETRABALHO)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('ha_contrato_de_manutencao_predial')} />
                      <Label>Há contrato de manutenção predial?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('ha_plano_de_manutencao_do_imovel')} />
                      <Label>Há plano de manutenção do imóvel?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('o_trecho_e_concessionado')} />
                      <Label>O trecho é concessionado?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('acessibilidade')} />
                      <Label>Acessibilidade?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('sustentabilidade')} />
                      <Label>Sustentabilidade?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('aproveitamento_da_agua_da_chuva')} />
                      <Label>Aproveitamento da água da chuva?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('energia_solar')} />
                      <Label>Energia Solar?</Label>
                    </div>
                  </div>
                </Card>

                {/* Seção 5: Infraestrutura e Utilidades */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Infraestrutura e Utilidades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('fornecimento_de_agua')} />
                      <Label>Fornecimento de Água</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('fornecimento_de_energia_eletrica')} />
                      <Label>Fornecimento de Energia Elétrica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('esgotamento_sanitario')} />
                      <Label>Esgotamento Sanitário</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('conexao_de_internet')} />
                      <Label>Conexão de Internet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('identidade_visual')} />
                      <Label>Identidade Visual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('possui_wireless_wifi')} />
                      <Label>Possui Wireless (Wi-Fi)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register('blindagem')} />
                      <Label>Blindagem</Label>
                    </div>
                  </div>
                </Card>

                {/* Seção 6: Ambientes e Espaços */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Ambientes e Espaços</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'almoxarifado', label: 'Almoxarifado' },
                      { key: 'alojamento_feminino', label: 'Alojamento Feminino' },
                      { key: 'alojamento_masculino', label: 'Alojamento Masculino' },
                      { key: 'alojamento_misto', label: 'Alojamento Misto' },
                      { key: 'area_de_servico', label: 'Área de Serviço' },
                      { key: 'area_de_uso_compartilhado_com_outros_orgaos', label: 'Área de Uso Compartilhado com Outros Órgãos' },
                      { key: 'arquivo', label: 'Arquivo' },
                      { key: 'auditorio', label: 'Auditório' },
                      { key: 'banheiro_para_zeladoria', label: 'Banheiro para Zeladoria' },
                      { key: 'banheiro_feminino_para_servidoras', label: 'Banheiro Feminino para Servidoras' },
                      { key: 'banheiro_masculino_para_servidores', label: 'Banheiro Masculino para Servidores' },
                      { key: 'banheiro_misto_para_servidores', label: 'Banheiro Misto para Servidores' },
                      { key: 'box_com_chuveiro_externo', label: 'Box com Chuveiro Externo' },
                      { key: 'box_para_lavagem_de_veiculos', label: 'Box para Lavagem de Veículos' },
                      { key: 'canil', label: 'Canil' },
                      { key: 'casa_de_maquinas', label: 'Casa de Máquinas' },
                      { key: 'central_de_gas', label: 'Central de Gás' },
                      { key: 'cobertura_para_aglomeracao_de_usuarios', label: 'Cobertura para Aglomeração de Usuários' },
                      { key: 'cobertura_para_fiscalizacao_de_veiculos', label: 'Cobertura para Fiscalização de Veículos' },
                      { key: 'copa_e_cozinha', label: 'Copa e Cozinha' },
                      { key: 'deposito_de_lixo', label: 'Depósito de Lixo' },
                      { key: 'deposito_de_materiais_de_descarte_e_baixa', label: 'Depósito de Materiais de Descarte e Baixa' },
                      { key: 'deposito_de_material_de_limpeza', label: 'Depósito de Material de Limpeza' },
                      { key: 'deposito_de_material_operacional', label: 'Depósito de Material Operacional' },
                      { key: 'estacionamento_para_usuarios', label: 'Estacionamento para Usuários' },
                      { key: 'garagem_para_servidores', label: 'Garagem para Servidores' },
                      { key: 'garagem_para_viaturas', label: 'Garagem para Viaturas' },
                      { key: 'lavabo_para_servidores_sem_box_para_chuveiro', label: 'Lavabo para Servidores (sem box para chuveiro)' },
                      { key: 'local_para_custodia_temporaria_de_detidos', label: 'Local para Custódia Temporária de Detidos' },
                      { key: 'local_para_guarda_provisoria_de_animais', label: 'Local para Guarda Provisória de Animais' },
                      { key: 'patio_de_retencao_de_veiculos', label: 'Pátio de Retenção de Veículos' },
                      { key: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', label: 'Plataforma para Fiscalização da Parte Superior dos Veículos' },
                      { key: 'ponto_de_pouso_para_aeronaves', label: 'Ponto de Pouso para Aeronaves' },
                      { key: 'rampa_de_fiscalizacao_de_veiculos', label: 'Rampa de Fiscalização de Veículos' },
                      { key: 'recepcao', label: 'Recepção' },
                      { key: 'sala_administrativa_escritorio', label: 'Sala Administrativa / Escritório' },
                      { key: 'sala_de_assepsia', label: 'Sala de Assepsia' },
                      { key: 'sala_de_aula', label: 'Sala de Aula' },
                      { key: 'sala_de_reuniao', label: 'Sala de Reunião' },
                      { key: 'sala_de_revista_pessoal', label: 'Sala de Revista Pessoal' },
                      { key: 'sala_operacional_observatorio', label: 'Sala Operacional / Observatório' },
                      { key: 'sala_tecnica', label: 'Sala Técnica' },
                      { key: 'sanitario_publico', label: 'Sanitário Público' },
                      { key: 'telefone_publico', label: 'Telefone Público' },
                      { key: 'torre_de_telecomunicacoes', label: 'Torre de Telecomunicações' },
                      { key: 'vestiario_para_nao_policiais', label: 'Vestiário para Não-Policiais' },
                      { key: 'vestiario_para_policiais', label: 'Vestiário para Policiais' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox {...register(key as keyof DadosCAIP)} />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Seção 7: Sistemas e Equipamentos */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Sistemas e Equipamentos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'abastecimento_de_agua', label: 'Abastecimento de Água' },
                      { key: 'aterramento_e_protecao_contra_descargas_atmosfericas', label: 'Aterramento e Proteção contra Descargas Atmosféricas' },
                      { key: 'climatizacao_de_ambientes', label: 'Climatização de Ambientes' },
                      { key: 'coleta_de_lixo', label: 'Coleta de Lixo' },
                      { key: 'energia_eletrica_de_emergencia', label: 'Energia Elétrica de Emergência' },
                      { key: 'iluminacao_externa', label: 'Iluminação Externa' },
                      { key: 'protecao_contra_incendios', label: 'Proteção contra Incêndios' },
                      { key: 'protecao_contra_intrusao', label: 'Proteção contra Intrusão' },
                      { key: 'radiocomunicacao', label: 'Radiocomunicação' },
                      { key: 'cabeamento_estruturado', label: 'Cabeamento Estruturado' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox {...register(key as keyof DadosCAIP)} />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Seção 8: Segurança e Proteção */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Segurança e Proteção</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'claviculario', label: 'Claviculário' },
                      { key: 'sala_cofre', label: 'Sala Cofre' },
                      { key: 'concertina', label: 'Concertina' },
                      { key: 'muro_ou_alambrado', label: 'Muro ou Alambrado' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox {...register(key as keyof DadosCAIP)} />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Seção 9: Notas e Avaliações */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Notas e Avaliações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nota_para_adequacao">Nota para ADEQUAÇÃO (1-10)</Label>
                      <Select onValueChange={(value) => setValue('nota_para_adequacao', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a nota de adequação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Inadequado</SelectItem>
                          <SelectItem value="2">2 - Inadequado</SelectItem>
                          <SelectItem value="3">3 - Muito Deficiente</SelectItem>
                          <SelectItem value="4">4 - Deficiente</SelectItem>
                          <SelectItem value="5">5 - Regular</SelectItem>
                          <SelectItem value="6">6 - Satisfatório</SelectItem>
                          <SelectItem value="7">7 - Bom</SelectItem>
                          <SelectItem value="8">8 - Muito Bom</SelectItem>
                          <SelectItem value="9">9 - Excelente</SelectItem>
                          <SelectItem value="10">10 - Perfeito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nota_para_manutencao">Nota para MANUTENÇÃO (1-10)</Label>
                      <Select onValueChange={(value) => setValue('nota_para_manutencao', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a nota de manutenção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Péssimo Estado</SelectItem>
                          <SelectItem value="2">2 - Muito Ruim</SelectItem>
                          <SelectItem value="3">3 - Ruim</SelectItem>
                          <SelectItem value="4">4 - Regular Inferior</SelectItem>
                          <SelectItem value="5">5 - Regular</SelectItem>
                          <SelectItem value="6">6 - Regular Superior</SelectItem>
                          <SelectItem value="7">7 - Bom</SelectItem>
                          <SelectItem value="8">8 - Muito Bom</SelectItem>
                          <SelectItem value="9">9 - Excelente</SelectItem>
                          <SelectItem value="10">10 - Novo/Perfeito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="precisaria_de_qual_intervencao">Precisaria de qual intervenção?</Label>
                    <Textarea {...register('precisaria_de_qual_intervencao')} placeholder="Descreva as intervenções necessárias" />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea {...register('observacoes')} placeholder="Outras observações relevantes" />
                  </div>
                </Card>

                {/* Campos calculados ocultos */}
                <input type="hidden" {...register('preenchido')} />
                <input type="hidden" {...register('percentual_preenchimento')} />
                <input type="hidden" {...register('gatilho')} />
                <input type="hidden" {...register('data_alteracao_preenchida')} />
                <input type="hidden" {...register('id_caip')} />

                {/* Mostrar percentual de preenchimento */}
                <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Progresso do preenchimento:</p>
                    <p className="text-2xl font-bold text-primary">{percentualPreenchimento}%</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleNew}>
                      Cancelar Edição
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Registros Existentes</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, unidade gestora ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredData.map((item) => (
                  <Card key={item.id} className="p-4 hover:bg-muted/50 cursor-pointer" onClick={() => handleEdit(item)}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{item.nome_da_unidade || 'Nome não informado'}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Unidade Gestora:</strong> {item.unidade_gestora || 'N/A'}</p>
                          <p><strong>Tipo:</strong> {item.tipo_de_unidade || 'N/A'}</p>
                          <p><strong>Endereço:</strong> {item.endereco || 'N/A'}</p>
                          <p><strong>Área Construída:</strong> {item.area_construida_m2 ? `${item.area_construida_m2} m²` : 'N/A'}</p>
                          <p><strong>RVR:</strong> {item.rvr ? `R$ ${Number(item.rvr).toLocaleString('pt-BR')}` : 'N/A'}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {item.ano_caip || 'Sem ano'}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {filteredData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CAIP;