export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dados_caip: {
        Row: {
          abastecimento_de_agua: string | null
          acessibilidade: string | null
          adere_ao_pgprf_teletrabalho: string | null
          almoxarifado: string | null
          alojamento_feminino: string | null
          alojamento_masculino: string | null
          alojamento_misto: string | null
          alterador: string | null
          ano_caip: string | null
          ano_da_ultima_intervencao_na_infraestrutura_do_imovel: string | null
          ano_da_ultima_reavaliacao_rvr: string | null
          aproveitamento_da_agua_da_chuva: string | null
          area_construida_m2: number | null
          area_da_cobertura_de_pista_m2: number | null
          area_da_cobertura_para_fiscalizacao_de_veiculos_m2: number | null
          area_de_servico: string | null
          area_de_uso_compartilhado_com_outros_orgaos: string | null
          area_do_patio_para_retencao_de_veiculos_m2: number | null
          area_do_terreno_m2: number | null
          arquivo: string | null
          aterramento_e_protecao_contra_descargas_atmosfericas: string | null
          auditorio: string | null
          banheiro_feminino_para_servidoras: string | null
          banheiro_masculino_para_servidores: string | null
          banheiro_misto_para_servidores: string | null
          banheiro_para_zeladoria: string | null
          blindagem: string | null
          box_com_chuveiro_externo: string | null
          box_para_lavagem_de_veiculos: string | null
          cabeamento_estruturado: string | null
          cadastrador: string | null
          canil: string | null
          casa_de_maquinas: string | null
          central_de_gas: string | null
          claviculario: string | null
          climatizacao_de_ambientes: string | null
          cobertura_para_aglomeracao_de_usuarios: string | null
          cobertura_para_fiscalizacao_de_veiculos: string | null
          coleta_de_lixo: string | null
          concertina: string | null
          conexao_de_internet: string | null
          coordenadas: string | null
          copa_e_cozinha: string | null
          created_at: string | null
          data_alteracao_preenchida: string | null
          deposito_de_lixo: string | null
          deposito_de_materiais_de_descarte_e_baixa: string | null
          deposito_de_material_de_limpeza: string | null
          deposito_de_material_operacional: string | null
          endereco: string | null
          energia_eletrica_de_emergencia: string | null
          energia_solar: string | null
          esgotamento_sanitario: string | null
          estacionamento_para_usuarios: string | null
          estado_de_conservacao: string | null
          fornecimento_de_agua: string | null
          fornecimento_de_energia_eletrica: string | null
          garagem_para_servidores: string | null
          garagem_para_viaturas: string | null
          gatilho: string | null
          ha_contrato_de_manutencao_predial: string | null
          ha_plano_de_manutencao_do_imovel: string | null
          id: string
          id_caip: string | null
          idade_aparente_do_imovel: string | null
          identidade_visual: string | null
          iluminacao_externa: string | null
          imagem_cofre: string | null
          imagem_fachada: string | null
          imagem_fundos: string | null
          imagem_geral: string | null
          imagem_interna_alojamento_feminino: string | null
          imagem_interna_alojamento_masculino: string | null
          imagem_interna_plantao_uop: string | null
          imagem_lateral_1: string | null
          imagem_lateral_2: string | null
          imagem_sala_cofre: string | null
          implantacao_da_unidade: string | null
          lavabo_para_servidores_sem_box_para_chuveiro: string | null
          local_para_custodia_temporaria_de_detidos: string | null
          local_para_guarda_provisoria_de_animais: string | null
          matricula_do_imovel: string | null
          muro_ou_alambrado: string | null
          nome_da_unidade: string | null
          nota_para_adequacao: string | null
          nota_para_manutencao: string | null
          o_trecho_e_concessionado: string | null
          observacoes: string | null
          patio_de_retencao_de_veiculos: string | null
          percentual_preenchimento: string | null
          plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos:
            | string
            | null
          ponto_de_pouso_para_aeronaves: string | null
          possui_wireless_wifi: string | null
          precisaria_de_qual_intervencao: string | null
          preenchido: string | null
          processo_sei: string | null
          protecao_contra_incendios: string | null
          protecao_contra_intrusao: string | null
          radiocomunicacao: string | null
          rampa_de_fiscalizacao_de_veiculos: string | null
          recepcao: string | null
          rip: string | null
          rvr: number | null
          sala_administrativa_escritorio: string | null
          sala_cofre: string | null
          sala_de_assepsia: string | null
          sala_de_aula: string | null
          sala_de_reuniao: string | null
          sala_de_revista_pessoal: string | null
          sala_operacional_observatorio: string | null
          sala_tecnica: string | null
          sanitario_publico: string | null
          servo2_pdi: string | null
          situacao_do_imovel: string | null
          sustentabilidade: string | null
          telefone_publico: string | null
          tempo_de_intervencao: string | null
          tipo_de_imovel: string | null
          tipo_de_unidade: string | null
          torre_de_telecomunicacoes: string | null
          ultima_alteracao: string | null
          unidade_gestora: string | null
          updated_at: string | null
          vestiario_para_nao_policiais: string | null
          vestiario_para_policiais: string | null
          vida_util_estimada_anos: string | null
          zona: string | null
        }
        Insert: {
          abastecimento_de_agua?: string | null
          acessibilidade?: string | null
          adere_ao_pgprf_teletrabalho?: string | null
          almoxarifado?: string | null
          alojamento_feminino?: string | null
          alojamento_masculino?: string | null
          alojamento_misto?: string | null
          alterador?: string | null
          ano_caip?: string | null
          ano_da_ultima_intervencao_na_infraestrutura_do_imovel?: string | null
          ano_da_ultima_reavaliacao_rvr?: string | null
          aproveitamento_da_agua_da_chuva?: string | null
          area_construida_m2?: number | null
          area_da_cobertura_de_pista_m2?: number | null
          area_da_cobertura_para_fiscalizacao_de_veiculos_m2?: number | null
          area_de_servico?: string | null
          area_de_uso_compartilhado_com_outros_orgaos?: string | null
          area_do_patio_para_retencao_de_veiculos_m2?: number | null
          area_do_terreno_m2?: number | null
          arquivo?: string | null
          aterramento_e_protecao_contra_descargas_atmosfericas?: string | null
          auditorio?: string | null
          banheiro_feminino_para_servidoras?: string | null
          banheiro_masculino_para_servidores?: string | null
          banheiro_misto_para_servidores?: string | null
          banheiro_para_zeladoria?: string | null
          blindagem?: string | null
          box_com_chuveiro_externo?: string | null
          box_para_lavagem_de_veiculos?: string | null
          cabeamento_estruturado?: string | null
          cadastrador?: string | null
          canil?: string | null
          casa_de_maquinas?: string | null
          central_de_gas?: string | null
          claviculario?: string | null
          climatizacao_de_ambientes?: string | null
          cobertura_para_aglomeracao_de_usuarios?: string | null
          cobertura_para_fiscalizacao_de_veiculos?: string | null
          coleta_de_lixo?: string | null
          concertina?: string | null
          conexao_de_internet?: string | null
          coordenadas?: string | null
          copa_e_cozinha?: string | null
          created_at?: string | null
          data_alteracao_preenchida?: string | null
          deposito_de_lixo?: string | null
          deposito_de_materiais_de_descarte_e_baixa?: string | null
          deposito_de_material_de_limpeza?: string | null
          deposito_de_material_operacional?: string | null
          endereco?: string | null
          energia_eletrica_de_emergencia?: string | null
          energia_solar?: string | null
          esgotamento_sanitario?: string | null
          estacionamento_para_usuarios?: string | null
          estado_de_conservacao?: string | null
          fornecimento_de_agua?: string | null
          fornecimento_de_energia_eletrica?: string | null
          garagem_para_servidores?: string | null
          garagem_para_viaturas?: string | null
          gatilho?: string | null
          ha_contrato_de_manutencao_predial?: string | null
          ha_plano_de_manutencao_do_imovel?: string | null
          id?: string
          id_caip?: string | null
          idade_aparente_do_imovel?: string | null
          identidade_visual?: string | null
          iluminacao_externa?: string | null
          imagem_cofre?: string | null
          imagem_fachada?: string | null
          imagem_fundos?: string | null
          imagem_geral?: string | null
          imagem_interna_alojamento_feminino?: string | null
          imagem_interna_alojamento_masculino?: string | null
          imagem_interna_plantao_uop?: string | null
          imagem_lateral_1?: string | null
          imagem_lateral_2?: string | null
          imagem_sala_cofre?: string | null
          implantacao_da_unidade?: string | null
          lavabo_para_servidores_sem_box_para_chuveiro?: string | null
          local_para_custodia_temporaria_de_detidos?: string | null
          local_para_guarda_provisoria_de_animais?: string | null
          matricula_do_imovel?: string | null
          muro_ou_alambrado?: string | null
          nome_da_unidade?: string | null
          nota_para_adequacao?: string | null
          nota_para_manutencao?: string | null
          o_trecho_e_concessionado?: string | null
          observacoes?: string | null
          patio_de_retencao_de_veiculos?: string | null
          percentual_preenchimento?: string | null
          plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos?:
            | string
            | null
          ponto_de_pouso_para_aeronaves?: string | null
          possui_wireless_wifi?: string | null
          precisaria_de_qual_intervencao?: string | null
          preenchido?: string | null
          processo_sei?: string | null
          protecao_contra_incendios?: string | null
          protecao_contra_intrusao?: string | null
          radiocomunicacao?: string | null
          rampa_de_fiscalizacao_de_veiculos?: string | null
          recepcao?: string | null
          rip?: string | null
          rvr?: number | null
          sala_administrativa_escritorio?: string | null
          sala_cofre?: string | null
          sala_de_assepsia?: string | null
          sala_de_aula?: string | null
          sala_de_reuniao?: string | null
          sala_de_revista_pessoal?: string | null
          sala_operacional_observatorio?: string | null
          sala_tecnica?: string | null
          sanitario_publico?: string | null
          servo2_pdi?: string | null
          situacao_do_imovel?: string | null
          sustentabilidade?: string | null
          telefone_publico?: string | null
          tempo_de_intervencao?: string | null
          tipo_de_imovel?: string | null
          tipo_de_unidade?: string | null
          torre_de_telecomunicacoes?: string | null
          ultima_alteracao?: string | null
          unidade_gestora?: string | null
          updated_at?: string | null
          vestiario_para_nao_policiais?: string | null
          vestiario_para_policiais?: string | null
          vida_util_estimada_anos?: string | null
          zona?: string | null
        }
        Update: {
          abastecimento_de_agua?: string | null
          acessibilidade?: string | null
          adere_ao_pgprf_teletrabalho?: string | null
          almoxarifado?: string | null
          alojamento_feminino?: string | null
          alojamento_masculino?: string | null
          alojamento_misto?: string | null
          alterador?: string | null
          ano_caip?: string | null
          ano_da_ultima_intervencao_na_infraestrutura_do_imovel?: string | null
          ano_da_ultima_reavaliacao_rvr?: string | null
          aproveitamento_da_agua_da_chuva?: string | null
          area_construida_m2?: number | null
          area_da_cobertura_de_pista_m2?: number | null
          area_da_cobertura_para_fiscalizacao_de_veiculos_m2?: number | null
          area_de_servico?: string | null
          area_de_uso_compartilhado_com_outros_orgaos?: string | null
          area_do_patio_para_retencao_de_veiculos_m2?: number | null
          area_do_terreno_m2?: number | null
          arquivo?: string | null
          aterramento_e_protecao_contra_descargas_atmosfericas?: string | null
          auditorio?: string | null
          banheiro_feminino_para_servidoras?: string | null
          banheiro_masculino_para_servidores?: string | null
          banheiro_misto_para_servidores?: string | null
          banheiro_para_zeladoria?: string | null
          blindagem?: string | null
          box_com_chuveiro_externo?: string | null
          box_para_lavagem_de_veiculos?: string | null
          cabeamento_estruturado?: string | null
          cadastrador?: string | null
          canil?: string | null
          casa_de_maquinas?: string | null
          central_de_gas?: string | null
          claviculario?: string | null
          climatizacao_de_ambientes?: string | null
          cobertura_para_aglomeracao_de_usuarios?: string | null
          cobertura_para_fiscalizacao_de_veiculos?: string | null
          coleta_de_lixo?: string | null
          concertina?: string | null
          conexao_de_internet?: string | null
          coordenadas?: string | null
          copa_e_cozinha?: string | null
          created_at?: string | null
          data_alteracao_preenchida?: string | null
          deposito_de_lixo?: string | null
          deposito_de_materiais_de_descarte_e_baixa?: string | null
          deposito_de_material_de_limpeza?: string | null
          deposito_de_material_operacional?: string | null
          endereco?: string | null
          energia_eletrica_de_emergencia?: string | null
          energia_solar?: string | null
          esgotamento_sanitario?: string | null
          estacionamento_para_usuarios?: string | null
          estado_de_conservacao?: string | null
          fornecimento_de_agua?: string | null
          fornecimento_de_energia_eletrica?: string | null
          garagem_para_servidores?: string | null
          garagem_para_viaturas?: string | null
          gatilho?: string | null
          ha_contrato_de_manutencao_predial?: string | null
          ha_plano_de_manutencao_do_imovel?: string | null
          id?: string
          id_caip?: string | null
          idade_aparente_do_imovel?: string | null
          identidade_visual?: string | null
          iluminacao_externa?: string | null
          imagem_cofre?: string | null
          imagem_fachada?: string | null
          imagem_fundos?: string | null
          imagem_geral?: string | null
          imagem_interna_alojamento_feminino?: string | null
          imagem_interna_alojamento_masculino?: string | null
          imagem_interna_plantao_uop?: string | null
          imagem_lateral_1?: string | null
          imagem_lateral_2?: string | null
          imagem_sala_cofre?: string | null
          implantacao_da_unidade?: string | null
          lavabo_para_servidores_sem_box_para_chuveiro?: string | null
          local_para_custodia_temporaria_de_detidos?: string | null
          local_para_guarda_provisoria_de_animais?: string | null
          matricula_do_imovel?: string | null
          muro_ou_alambrado?: string | null
          nome_da_unidade?: string | null
          nota_para_adequacao?: string | null
          nota_para_manutencao?: string | null
          o_trecho_e_concessionado?: string | null
          observacoes?: string | null
          patio_de_retencao_de_veiculos?: string | null
          percentual_preenchimento?: string | null
          plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos?:
            | string
            | null
          ponto_de_pouso_para_aeronaves?: string | null
          possui_wireless_wifi?: string | null
          precisaria_de_qual_intervencao?: string | null
          preenchido?: string | null
          processo_sei?: string | null
          protecao_contra_incendios?: string | null
          protecao_contra_intrusao?: string | null
          radiocomunicacao?: string | null
          rampa_de_fiscalizacao_de_veiculos?: string | null
          recepcao?: string | null
          rip?: string | null
          rvr?: number | null
          sala_administrativa_escritorio?: string | null
          sala_cofre?: string | null
          sala_de_assepsia?: string | null
          sala_de_aula?: string | null
          sala_de_reuniao?: string | null
          sala_de_revista_pessoal?: string | null
          sala_operacional_observatorio?: string | null
          sala_tecnica?: string | null
          sanitario_publico?: string | null
          servo2_pdi?: string | null
          situacao_do_imovel?: string | null
          sustentabilidade?: string | null
          telefone_publico?: string | null
          tempo_de_intervencao?: string | null
          tipo_de_imovel?: string | null
          tipo_de_unidade?: string | null
          torre_de_telecomunicacoes?: string | null
          ultima_alteracao?: string | null
          unidade_gestora?: string | null
          updated_at?: string | null
          vestiario_para_nao_policiais?: string | null
          vestiario_para_policiais?: string | null
          vida_util_estimada_anos?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          matricula: string | null
          nome_completo: string
          responsavel_tecnico_id: string | null
          telefone: string | null
          unidade_lotacao: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id: string
          matricula?: string | null
          nome_completo: string
          responsavel_tecnico_id?: string | null
          telefone?: string | null
          unidade_lotacao?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          matricula?: string | null
          nome_completo?: string
          responsavel_tecnico_id?: string | null
          telefone?: string | null
          unidade_lotacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_responsavel_tecnico_id_fkey"
            columns: ["responsavel_tecnico_id"]
            isOneToOne: false
            referencedRelation: "responsaveis_tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis_tecnicos: {
        Row: {
          ativo: boolean
          conselho: string
          created_at: string
          formacao: string
          id: string
          nome_completo: string
          numero_registro: string
          uf: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          conselho: string
          created_at?: string
          formacao: string
          id?: string
          nome_completo: string
          numero_registro: string
          uf: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          conselho?: string
          created_at?: string
          formacao?: string
          id?: string
          nome_completo?: string
          numero_registro?: string
          uf?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
