
-- Create vistorias_manutencao table
CREATE TABLE public.vistorias_manutencao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dados_caip_id uuid NOT NULL REFERENCES public.dados_caip(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  atribuido_por uuid NOT NULL REFERENCES auth.users(id),
  unidade_gestora text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'enviado', 'validado', 'rejeitado')),
  data_atribuicao timestamptz NOT NULL DEFAULT now(),
  prazo_entrega date NOT NULL,
  data_envio timestamptz,
  data_validacao timestamptz,
  responsavel_tecnico text,
  crea_cau text,
  acompanhamento_fiscalizacao boolean DEFAULT false,
  secao_hidrossanitario jsonb DEFAULT '{}',
  secao_eletrico jsonb DEFAULT '{}',
  secao_rede_logica jsonb DEFAULT '{}',
  secao_incendio jsonb DEFAULT '{}',
  secao_ar_condicionado jsonb DEFAULT '{}',
  secao_obras_civis jsonb DEFAULT '{}',
  secao_areas_externas jsonb DEFAULT '{}',
  classificacao_geral text CHECK (classificacao_geral IN ('boa', 'regular', 'ruim')),
  prazo_adequacao_dias integer,
  necessidades_iniciais text,
  imagem_geral text,
  imagem_fachada text,
  imagem_lateral_1 text,
  imagem_lateral_2 text,
  imagem_fundos text,
  imagem_sala_cofre text,
  imagem_cofre text,
  imagem_interna_alojamento_masculino text,
  imagem_interna_alojamento_feminino text,
  imagem_interna_plantao_uop text,
  observacoes_gerais text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vistoria_validacoes table
CREATE TABLE public.vistoria_validacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vistoria_id uuid NOT NULL REFERENCES public.vistorias_manutencao(id) ON DELETE CASCADE,
  secao text NOT NULL,
  campo text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  observacao_validador text,
  validado_por uuid REFERENCES auth.users(id),
  validado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vistoria_id, secao, campo)
);

-- Enable RLS
ALTER TABLE public.vistorias_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistoria_validacoes ENABLE ROW LEVEL SECURITY;

-- RLS vistorias_manutencao
CREATE POLICY "Admins full access vistorias" ON public.vistorias_manutencao
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Servidores can view unit vistorias" ON public.vistorias_manutencao
  FOR SELECT TO authenticated
  USING (unidade_gestora = (SELECT p.unidade_gestora FROM public.profiles p WHERE p.id = auth.uid()) AND public.has_role(auth.uid(), 'usuario_padrao'::app_role));

CREATE POLICY "Servidores can assign vistorias" ON public.vistorias_manutencao
  FOR INSERT TO authenticated
  WITH CHECK (unidade_gestora = (SELECT p.unidade_gestora FROM public.profiles p WHERE p.id = auth.uid()) AND public.has_role(auth.uid(), 'usuario_padrao'::app_role));

CREATE POLICY "Servidores can update unit vistorias" ON public.vistorias_manutencao
  FOR UPDATE TO authenticated
  USING (unidade_gestora = (SELECT p.unidade_gestora FROM public.profiles p WHERE p.id = auth.uid()) AND public.has_role(auth.uid(), 'usuario_padrao'::app_role));

CREATE POLICY "Terceirizados can view own vistorias" ON public.vistorias_manutencao
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'terceirizado'::app_role));

CREATE POLICY "Terceirizados can update own vistorias" ON public.vistorias_manutencao
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'terceirizado'::app_role));

-- RLS vistoria_validacoes
CREATE POLICY "Admins full access validacoes" ON public.vistoria_validacoes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Servidores can manage validacoes" ON public.vistoria_validacoes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vistorias_manutencao v WHERE v.id = vistoria_validacoes.vistoria_id AND v.unidade_gestora = (SELECT p.unidade_gestora FROM public.profiles p WHERE p.id = auth.uid())) AND public.has_role(auth.uid(), 'usuario_padrao'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vistorias_manutencao v WHERE v.id = vistoria_validacoes.vistoria_id AND v.unidade_gestora = (SELECT p.unidade_gestora FROM public.profiles p WHERE p.id = auth.uid())) AND public.has_role(auth.uid(), 'usuario_padrao'::app_role));

CREATE POLICY "Terceirizados can view own validacoes" ON public.vistoria_validacoes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vistorias_manutencao v WHERE v.id = vistoria_validacoes.vistoria_id AND v.user_id = auth.uid()) AND public.has_role(auth.uid(), 'terceirizado'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_vistorias_updated_at
  BEFORE UPDATE ON public.vistorias_manutencao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
