import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { validateAnoCAIP, processFormData } from '@/utils/caipValidations';

type DadosCAIP = Tables<'dados_caip'>;

interface UseCAIPFormProps {
  editingItem?: DadosCAIP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const useCAIPForm = ({ editingItem, open, onOpenChange, onSuccess }: UseCAIPFormProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [percentualPreenchimento, setPercentualPreenchimento] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DadosCAIP>();
  const watchedValues = watch();

  // Preencher campos automáticos
  useEffect(() => {
    if (profile && !editingItem) {
      setValue('cadastrador', profile.nome_completo);
      setValue('alterador', profile.nome_completo);
      setValue('ultima_alteracao', new Date().toISOString().split('T')[0]);
      if (profile.unidade_lotacao) {
        setValue('unidade_gestora', profile.unidade_lotacao);
      }
    }
  }, [profile, editingItem, setValue, open]);

  // Preencher formulário com dados existentes quando editar
  useEffect(() => {
    if (editingItem && open) {
      Object.keys(editingItem).forEach(key => {
        setValue(key as keyof DadosCAIP, editingItem[key as keyof DadosCAIP]);
      });
    } else if (!editingItem && open) {
      reset();
    }
  }, [editingItem, open, setValue, reset]);

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
    }
  }, [watchedValues]);

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

      const processedData = processFormData(data);

      if (editingItem) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...processedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

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
            ...processedData,
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
      onOpenChange(false);
      onSuccess();
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

  const handleNew = () => {
    reset();
  };

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    watchedValues,
    errors,
    isLoading,
    percentualPreenchimento,
    onSubmit,
    handleNew
  };
};