
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface TemplateParametros {
  id: string;
  nome_template: string;
  descricao?: string;
  parametros: any;
  is_default: boolean;
  created_at: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<TemplateParametros[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTemplates = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates_parametros')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarTemplate = async (
    nomeTemplate: string,
    descricao: string,
    parametros: any,
    isDefault: boolean = false
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('templates_parametros')
        .insert({
          user_id: user.id,
          nome_template: nomeTemplate,
          descricao,
          parametros,
          is_default: isDefault,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template salvo com sucesso",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  const excluirTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates_parametros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template excluído",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive",
      });
    }
  };

  const definirPadrao = async (id: string) => {
    try {
      // Primeiro, remove o padrão de todos os templates
      await supabase
        .from('templates_parametros')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Depois, define o novo padrão
      const { error } = await supabase
        .from('templates_parametros')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template definido como padrão",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Erro ao definir template padrão:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir template como padrão",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  return {
    templates,
    loading,
    salvarTemplate,
    excluirTemplate,
    definirPadrao,
    refetch: fetchTemplates,
  };
};
