-- Criar tabela para valores de CUB por UF e padrão construtivo
CREATE TABLE public.valores_cub (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uf CHAR(2) NOT NULL,
  padrao_construtivo TEXT NOT NULL,
  valor_m2 NUMERIC(10,2) NOT NULL,
  data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
  fonte TEXT DEFAULT 'SINDUSCON',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(uf, padrao_construtivo, data_referencia)
);

-- Habilitar RLS
ALTER TABLE public.valores_cub ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para valores_cub
CREATE POLICY "Authenticated users can view CUB values" 
ON public.valores_cub 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can manage CUB values" 
ON public.valores_cub 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir dados iniciais para o estado do Amapá (pode ser expandido para outros estados)
INSERT INTO public.valores_cub (uf, padrao_construtivo, valor_m2, data_referencia) VALUES
-- Residencial Baixo
('AP', 'R1-B', 1850.00, '2024-08-01'),
('AP', 'PP-4-B', 1750.00, '2024-08-01'),
('AP', 'R8-B', 1900.00, '2024-08-01'),
('AP', 'PIS', 1650.00, '2024-08-01'),

-- Residencial Normal
('AP', 'R1-N', 2100.00, '2024-08-01'),
('AP', 'PP-4-N', 2000.00, '2024-08-01'),
('AP', 'R8-N', 2150.00, '2024-08-01'),
('AP', 'R16-N', 2300.00, '2024-08-01'),

-- Residencial Alto
('AP', 'R1-A', 2800.00, '2024-08-01'),
('AP', 'R8-A', 2900.00, '2024-08-01'),
('AP', 'R16-A', 3100.00, '2024-08-01'),

-- Comercial Normal
('AP', 'CAL-8-N', 2400.00, '2024-08-01'),
('AP', 'CSL-8-N', 2350.00, '2024-08-01'),
('AP', 'CSL-16-N', 2500.00, '2024-08-01'),

-- Comercial Alto
('AP', 'CAL-8-A', 3200.00, '2024-08-01'),
('AP', 'CSL-8-A', 3150.00, '2024-08-01'),
('AP', 'CSL-16-A', 3350.00, '2024-08-01'),

-- Residência Popular
('AP', 'RP1Q', 1500.00, '2024-08-01'),

-- Galpão Industrial
('AP', 'GI', 1800.00, '2024-08-01');

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática de timestamps
CREATE TRIGGER update_valores_cub_updated_at
    BEFORE UPDATE ON public.valores_cub
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();