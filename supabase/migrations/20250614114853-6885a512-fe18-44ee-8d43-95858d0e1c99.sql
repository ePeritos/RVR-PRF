-- Recriar a função para calcular nota de manutenção considerando ambientes selecionados
CREATE OR REPLACE FUNCTION public.calcular_nota_manutencao(p_imovel_id uuid)
RETURNS numeric AS $$
DECLARE
    v_potencial_maximo numeric := 0;
    v_score_efetivo numeric := 0;
    v_nota_final numeric := 0;
    v_tipo_unidade text;
    v_dados_caip RECORD;
    ambiente_record RECORD;
BEGIN
    -- Buscar os dados do imóvel incluindo ambientes selecionados
    SELECT * INTO v_dados_caip
    FROM public.dados_caip
    WHERE id = p_imovel_id;
    
    -- Se não encontrar o imóvel, retorna 0
    IF v_dados_caip.tipo_de_unidade IS NULL THEN
        RETURN 0;
    END IF;
    
    v_tipo_unidade := v_dados_caip.tipo_de_unidade;
    
    -- Iterar sobre todos os ambientes avaliados para este imóvel
    FOR ambiente_record IN
        SELECT 
            ma.score_conservacao, 
            ca.nome_ambiente, 
            ca.peso,
            ca.id as ambiente_id
        FROM public.manutencao_ambientes ma
        JOIN public.caderno_ambientes ca ON ma.ambiente_id = ca.id
        JOIN public.tipos_imoveis ti ON ca.tipo_imovel_id = ti.id
        WHERE ma.imovel_id = p_imovel_id
          AND ti.nome_tipo = v_tipo_unidade
          AND ca.peso > 0  -- Só considerar ambientes com peso maior que 0
    LOOP
        -- Verificar se o ambiente está selecionado no formulário principal
        DECLARE
            ambiente_selecionado boolean := false;
        BEGIN
            -- Mapear nome do ambiente para campo do formulário
            CASE ambiente_record.nome_ambiente
                WHEN 'Almoxarifado' THEN
                    ambiente_selecionado := v_dados_caip.almoxarifado = 'Sim';
                WHEN 'Alojamento' THEN
                    ambiente_selecionado := (v_dados_caip.alojamento_masculino = 'Sim' OR 
                                           v_dados_caip.alojamento_feminino = 'Sim' OR 
                                           v_dados_caip.alojamento_misto = 'Sim');
                WHEN 'Área de serviço' THEN
                    ambiente_selecionado := v_dados_caip.area_de_servico = 'Sim';
                WHEN 'Área de uso compartilhado' THEN
                    ambiente_selecionado := v_dados_caip.area_de_uso_compartilhado_com_outros_orgaos = 'Sim';
                WHEN 'Arquivo' THEN
                    ambiente_selecionado := v_dados_caip.arquivo = 'Sim';
                WHEN 'Auditório' THEN
                    ambiente_selecionado := v_dados_caip.auditorio = 'Sim';
                WHEN 'Banheiro para servidores' THEN
                    ambiente_selecionado := (v_dados_caip.banheiro_masculino_para_servidores = 'Sim' OR 
                                           v_dados_caip.banheiro_feminino_para_servidoras = 'Sim' OR 
                                           v_dados_caip.banheiro_misto_para_servidores = 'Sim');
                WHEN 'Banheiro para zeladoria' THEN
                    ambiente_selecionado := v_dados_caip.banheiro_para_zeladoria = 'Sim';
                WHEN 'Box com chuveiro externo' THEN
                    ambiente_selecionado := v_dados_caip.box_com_chuveiro_externo = 'Sim';
                WHEN 'Box para lavagem de veículos' THEN
                    ambiente_selecionado := v_dados_caip.box_para_lavagem_de_veiculos = 'Sim';
                WHEN 'Canil' THEN
                    ambiente_selecionado := v_dados_caip.canil = 'Sim';
                WHEN 'Casa de máquinas' THEN
                    ambiente_selecionado := v_dados_caip.casa_de_maquinas = 'Sim';
                WHEN 'Central de gás' THEN
                    ambiente_selecionado := v_dados_caip.central_de_gas = 'Sim';
                WHEN 'Cobertura para aglomeração de usuários' THEN
                    ambiente_selecionado := v_dados_caip.cobertura_para_aglomeracao_de_usuarios = 'Sim';
                WHEN 'Cobertura para fiscalização de veículos' THEN
                    ambiente_selecionado := v_dados_caip.cobertura_para_fiscalizacao_de_veiculos = 'Sim';
                WHEN 'Copa e cozinha' THEN
                    ambiente_selecionado := v_dados_caip.copa_e_cozinha = 'Sim';
                WHEN 'Depósito de lixo' THEN
                    ambiente_selecionado := v_dados_caip.deposito_de_lixo = 'Sim';
                WHEN 'Depósito de materiais de descarte e baixa' THEN
                    ambiente_selecionado := v_dados_caip.deposito_de_materiais_de_descarte_e_baixa = 'Sim';
                WHEN 'Depósito de material de limpeza' THEN
                    ambiente_selecionado := v_dados_caip.deposito_de_material_de_limpeza = 'Sim';
                WHEN 'Depósito de material operacional' THEN
                    ambiente_selecionado := v_dados_caip.deposito_de_material_operacional = 'Sim';
                WHEN 'Estacionamento para usuários' THEN
                    ambiente_selecionado := v_dados_caip.estacionamento_para_usuarios = 'Sim';
                WHEN 'Garagem para servidores' THEN
                    ambiente_selecionado := v_dados_caip.garagem_para_servidores = 'Sim';
                WHEN 'Garagem para viaturas' THEN
                    ambiente_selecionado := v_dados_caip.garagem_para_viaturas = 'Sim';
                WHEN 'Lavabo para servidores sem box para chuveiro' THEN
                    ambiente_selecionado := v_dados_caip.lavabo_para_servidores_sem_box_para_chuveiro = 'Sim';
                WHEN 'Local para custódia temporária de detidos' THEN
                    ambiente_selecionado := v_dados_caip.local_para_custodia_temporaria_de_detidos = 'Sim';
                WHEN 'Local para guarda provisória de animais' THEN
                    ambiente_selecionado := v_dados_caip.local_para_guarda_provisoria_de_animais = 'Sim';
                WHEN 'Pátio de retenção de veículos' THEN
                    ambiente_selecionado := v_dados_caip.patio_de_retencao_de_veiculos = 'Sim';
                WHEN 'Plataforma para fiscalização da parte superior dos veículos' THEN
                    ambiente_selecionado := v_dados_caip.plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos = 'Sim';
                WHEN 'Ponto de pouso para aeronaves' THEN
                    ambiente_selecionado := v_dados_caip.ponto_de_pouso_para_aeronaves = 'Sim';
                WHEN 'Rampa de fiscalização de veículos' THEN
                    ambiente_selecionado := v_dados_caip.rampa_de_fiscalizacao_de_veiculos = 'Sim';
                WHEN 'Recepção' THEN
                    ambiente_selecionado := v_dados_caip.recepcao = 'Sim';
                WHEN 'Sala administrativa/escritório' THEN
                    ambiente_selecionado := v_dados_caip.sala_administrativa_escritorio = 'Sim';
                WHEN 'Sala administrativa / Escritório' THEN
                    ambiente_selecionado := v_dados_caip.sala_administrativa_escritorio = 'Sim';
                WHEN 'Sala de assepsia' THEN
                    ambiente_selecionado := v_dados_caip.sala_de_assepsia = 'Sim';
                WHEN 'Sala de aula' THEN
                    ambiente_selecionado := v_dados_caip.sala_de_aula = 'Sim';
                WHEN 'Sala de reunião' THEN
                    ambiente_selecionado := v_dados_caip.sala_de_reuniao = 'Sim';
                WHEN 'Sala de revista pessoal' THEN
                    ambiente_selecionado := v_dados_caip.sala_de_revista_pessoal = 'Sim';
                WHEN 'Sala operacional/observatório' THEN
                    ambiente_selecionado := v_dados_caip.sala_operacional_observatorio = 'Sim';
                WHEN 'Sala operacional / Observatório' THEN
                    ambiente_selecionado := v_dados_caip.sala_operacional_observatorio = 'Sim';
                WHEN 'Sala técnica' THEN
                    ambiente_selecionado := v_dados_caip.sala_tecnica = 'Sim';
                WHEN 'Sanitário público' THEN
                    ambiente_selecionado := v_dados_caip.sanitario_publico = 'Sim';
                WHEN 'Telefone público' THEN
                    ambiente_selecionado := v_dados_caip.telefone_publico = 'Sim';
                WHEN 'Torre de telecomunicações' THEN
                    ambiente_selecionado := v_dados_caip.torre_de_telecomunicacoes = 'Sim';
                WHEN 'Vestiário para não-policiais' THEN
                    ambiente_selecionado := v_dados_caip.vestiario_para_nao_policiais = 'Sim';
                WHEN 'Vestiário para policiais' THEN
                    ambiente_selecionado := v_dados_caip.vestiario_para_policiais = 'Sim';
                ELSE
                    ambiente_selecionado := false;
            END CASE;
            
            -- Só considerar no cálculo se o ambiente estiver selecionado
            IF ambiente_selecionado THEN
                -- Calcular potencial máximo (peso * 5)
                v_potencial_maximo := v_potencial_maximo + (ambiente_record.peso * 5);
                
                -- Calcular score efetivo (peso * score_conservacao)
                v_score_efetivo := v_score_efetivo + (ambiente_record.peso * ambiente_record.score_conservacao);
            END IF;
        END;
    END LOOP;
    
    -- Calcular a nota final
    IF v_potencial_maximo > 0 THEN
        v_nota_final := (v_score_efetivo / v_potencial_maximo) * 100;
    ELSE
        v_nota_final := 0;
    END IF;
    
    -- Garantir que não ultrapasse 100
    v_nota_final := LEAST(v_nota_final, 100);
    
    RETURN ROUND(v_nota_final, 2);
END;
$$ LANGUAGE plpgsql;