-- Criar função trigger para calcular a nota de adequação automaticamente
CREATE OR REPLACE FUNCTION calcular_nota_adequacao_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_peso_total_possivel INTEGER;
    v_peso_alcancado NUMERIC := 0; -- Usando NUMERIC para suportar meias pontuações
    v_nota_final NUMERIC;
BEGIN
    -- 1. Definir o Peso Total Possível baseado no tipo de unidade
    IF NEW.tipo_de_unidade = 'UOP' THEN
        v_peso_total_possivel := 192;
    ELSIF NEW.tipo_de_unidade = 'Delegacia' THEN
        v_peso_total_possivel := 154;
    ELSE
        -- Se não for UOP nem Delegacia, não calcula a nota
        NEW.nota_para_adequacao := '0';
        RETURN NEW;
    END IF;

    -- 2. Calcular o Peso Alcançado baseado na tabela de referência
    
    -- Regra especial para "Alojamento" (peso UOP: 10, DEL: 0)
    IF NEW.tipo_de_unidade = 'UOP' THEN
        IF (NEW.alojamento_masculino IN ('Existente', 'Sim')) AND (NEW.alojamento_feminino IN ('Existente', 'Sim')) THEN
            v_peso_alcancado := v_peso_alcancado + 10; -- Pontuação integral
        ELSIF (NEW.alojamento_masculino IN ('Existente', 'Sim')) OR (NEW.alojamento_feminino IN ('Existente', 'Sim')) OR (NEW.alojamento_misto IN ('Existente', 'Sim')) THEN
            v_peso_alcancado := v_peso_alcancado + 5; -- Meia pontuação
        END IF;
    END IF;
    
    -- Regra especial para "Banheiro para servidores" (peso UOP: 10, DEL: 10)
    IF (NEW.banheiro_masculino_para_servidores IN ('Existente', 'Sim')) AND (NEW.banheiro_feminino_para_servidoras IN ('Existente', 'Sim')) THEN
        v_peso_alcancado := v_peso_alcancado + 10; -- Pontuação integral
    ELSIF (NEW.banheiro_masculino_para_servidores IN ('Existente', 'Sim')) OR (NEW.banheiro_feminino_para_servidoras IN ('Existente', 'Sim')) OR (NEW.banheiro_misto_para_servidores IN ('Existente', 'Sim')) THEN
        v_peso_alcancado := v_peso_alcancado + 5; -- Meia pontuação
    END IF;

    -- Demais ambientes (aplicar peso baseado no tipo de unidade)
    IF NEW.tipo_de_unidade = 'UOP' THEN
        -- Pesos para UOP
        IF NEW.almoxarifado IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.area_de_servico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.area_de_uso_compartilhado_com_outros_orgaos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.arquivo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.auditorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.banheiro_para_zeladoria IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.box_com_chuveiro_externo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.box_para_lavagem_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.casa_de_maquinas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.central_de_gas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.cobertura_para_aglomeracao_de_usuarios IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.cobertura_para_fiscalizacao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.copa_e_cozinha IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.deposito_de_lixo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.deposito_de_materiais_de_descarte_e_baixa IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.deposito_de_material_de_limpeza IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.deposito_de_material_operacional IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.estacionamento_para_usuarios IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.garagem_para_servidores IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.garagem_para_viaturas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.lavabo_para_servidores_sem_box_para_chuveiro IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.local_para_custodia_temporaria_de_detidos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.local_para_guarda_provisoria_de_animais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.patio_de_retencao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.ponto_de_pouso_para_aeronaves IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.rampa_de_fiscalizacao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.recepcao IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.sala_administrativa_escritorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.sala_de_assepsia IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_de_aula IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.sala_de_reuniao IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_de_revista_pessoal IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_operacional_observatorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.sala_tecnica IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.sanitario_publico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.telefone_publico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.torre_de_telecomunicacoes IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.vestiario_para_nao_policiais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.vestiario_para_policiais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        
    ELSIF NEW.tipo_de_unidade = 'Delegacia' THEN
        -- Pesos para Delegacia
        IF NEW.almoxarifado IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.area_de_servico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.area_de_uso_compartilhado_com_outros_orgaos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.arquivo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.auditorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.banheiro_para_zeladoria IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.box_com_chuveiro_externo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.box_para_lavagem_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.casa_de_maquinas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.central_de_gas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.cobertura_para_aglomeracao_de_usuarios IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.cobertura_para_fiscalizacao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.copa_e_cozinha IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.deposito_de_lixo IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.deposito_de_materiais_de_descarte_e_baixa IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.deposito_de_material_de_limpeza IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.deposito_de_material_operacional IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.estacionamento_para_usuarios IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.garagem_para_servidores IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.garagem_para_viaturas IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.lavabo_para_servidores_sem_box_para_chuveiro IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.local_para_custodia_temporaria_de_detidos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.local_para_guarda_provisoria_de_animais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.patio_de_retencao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.ponto_de_pouso_para_aeronaves IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.rampa_de_fiscalizacao_de_veiculos IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.recepcao IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.sala_administrativa_escritorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.sala_de_assepsia IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_de_aula IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.sala_de_reuniao IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.sala_de_revista_pessoal IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_operacional_observatorio IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 0; END IF;
        IF NEW.sala_tecnica IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.sanitario_publico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.telefone_publico IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 3; END IF;
        IF NEW.torre_de_telecomunicacoes IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 10; END IF;
        IF NEW.vestiario_para_nao_policiais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
        IF NEW.vestiario_para_policiais IN ('Existente', 'Sim') THEN v_peso_alcancado := v_peso_alcancado + 6; END IF;
    END IF;

    -- 3. Calcular a Nota Final e arredondar para 2 casas decimais
    v_nota_final := round((v_peso_alcancado / v_peso_total_possivel::numeric) * 100, 2);

    -- 4. Atribuir o valor calculado à coluna nota_para_adequacao
    NEW.nota_para_adequacao := v_nota_final::text;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger que executa a função antes de INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_calcular_nota_adequacao ON dados_caip;
CREATE TRIGGER trigger_calcular_nota_adequacao
    BEFORE INSERT OR UPDATE ON dados_caip
    FOR EACH ROW
    EXECUTE FUNCTION calcular_nota_adequacao_trigger_func();