import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { BasicInformationSection } from '@/components/caip/BasicInformationSection';
import { ImagesSection } from '@/components/caip/ImagesSection';
import { LocationPropertySection } from '@/components/caip/LocationPropertySection';
import { TechnicalDataSection } from '@/components/caip/TechnicalDataSection';
import { InfrastructureSection } from '@/components/caip/InfrastructureSection';
import { EnvironmentsSection } from '@/components/caip/EnvironmentsSection';
import { SystemsSection } from '@/components/caip/SystemsSection';
import { SecuritySection } from '@/components/caip/SecuritySection';
import { NotesEvaluationSection } from '@/components/caip/NotesEvaluationSection';
import { ProgressActionsSection } from '@/components/caip/ProgressActionsSection';
import { ExistingRecordsList } from '@/components/caip/ExistingRecordsList';

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
                <BasicInformationSection 
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  unidadesGestoras={unidadesGestoras}
                  estadosConservacao={estadosConservacao}
                />

                <ImagesSection register={register} />

                <LocationPropertySection 
                  register={register}
                  setValue={setValue}
                  estadosConservacao={estadosConservacao}
                />

                <TechnicalDataSection register={register} />

                <InfrastructureSection register={register} />

                <EnvironmentsSection register={register} />

                <SystemsSection register={register} />

                <SecuritySection register={register} />

                <NotesEvaluationSection 
                  register={register}
                  setValue={setValue}
                />

                <ProgressActionsSection 
                  register={register}
                  percentualPreenchimento={percentualPreenchimento}
                  isLoading={isLoading}
                  editingId={editingId}
                  handleNew={handleNew}
                />
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <ExistingRecordsList 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredData={filteredData}
            handleEdit={handleEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CAIP;