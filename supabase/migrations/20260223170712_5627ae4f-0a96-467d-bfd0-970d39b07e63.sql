
-- Tabela de perfis de permissão (ex: Gestor, Técnico, Consultor)
CREATE TABLE public.perfis_permissao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  unidades_gestoras text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de ações por módulo vinculadas a cada perfil
CREATE TABLE public.perfil_permissao_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_permissao_id uuid NOT NULL REFERENCES public.perfis_permissao(id) ON DELETE CASCADE,
  modulo text NOT NULL,
  acao text NOT NULL,
  permitido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(perfil_permissao_id, modulo, acao)
);

-- Vincular perfil de permissão ao usuário
ALTER TABLE public.profiles ADD COLUMN perfil_permissao_id uuid REFERENCES public.perfis_permissao(id) ON DELETE SET NULL;

-- RLS para perfis_permissao
ALTER TABLE public.perfis_permissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view permission profiles"
  ON public.perfis_permissao FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert permission profiles"
  ON public.perfis_permissao FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update permission profiles"
  ON public.perfis_permissao FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete permission profiles"
  ON public.perfis_permissao FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- RLS para perfil_permissao_acoes
ALTER TABLE public.perfil_permissao_acoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view permission actions"
  ON public.perfil_permissao_acoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert permission actions"
  ON public.perfil_permissao_acoes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update permission actions"
  ON public.perfil_permissao_acoes FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete permission actions"
  ON public.perfil_permissao_acoes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_perfis_permissao_updated_at
  BEFORE UPDATE ON public.perfis_permissao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
