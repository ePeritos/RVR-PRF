-- Normalizar registros legados com tipos de unidade equivalentes
UPDATE public.dados_caip SET tipo_de_unidade = 'UOP' WHERE tipo_de_unidade IN ('Unidade Operacional', 'Posto de Fiscalização', 'Núcleo de Capacitação');
UPDATE public.dados_caip SET tipo_de_unidade = 'DEL' WHERE tipo_de_unidade = 'Delegacia';