-- Add unique constraint on (imovel_id, ambiente_id) to enable proper upsert
ALTER TABLE public.manutencao_ambientes 
ADD CONSTRAINT manutencao_ambientes_imovel_ambiente_unique 
UNIQUE (imovel_id, ambiente_id);