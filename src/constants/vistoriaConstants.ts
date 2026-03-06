export interface ChecklistItem {
  id: string;
  label: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  icon: string;
  subsections?: { title: string; items: ChecklistItem[] }[];
  items?: ChecklistItem[];
}

export const VISTORIA_SECTIONS: ChecklistSection[] = [
  {
    id: 'hidrossanitario',
    title: '2. Sistema Hidrossanitário',
    icon: '💧',
    subsections: [
      {
        title: '2.1 Geral',
        items: [
          { id: 'hidrômetros', label: 'Leitura inicial dos hidrômetros registrada' },
          { id: 'registros_torneiras', label: 'Registros, torneiras e metais sanitários funcionando' },
          { id: 'valvulas_descarga', label: 'Válvulas e caixas de descarga funcionando' },
          { id: 'tubulacoes', label: 'Tubulações sem vazamentos aparentes' },
          { id: 'ralos_caixas', label: 'Ralos, caixas de gordura e inspeção desobstruídos' },
          { id: 'bebedouros', label: 'Bebedouros/purificadores funcionando' },
        ]
      },
      {
        title: '2.2 Reservatórios',
        items: [
          { id: 'reservatorio_estado', label: 'Estado geral satisfatório' },
          { id: 'reservatorio_boias', label: 'Boias, extravasores e medidores funcionando' },
          { id: 'reservatorio_vazamentos', label: 'Sem vazamentos aparentes' },
          { id: 'reservatorio_limpeza', label: 'Limpeza recente comprovada' },
        ]
      },
      {
        title: '2.3 Bombas e redes',
        items: [
          { id: 'bombas_operacionais', label: 'Bombas operacionais' },
          { id: 'bombas_automatico', label: 'Comando automático funcionando' },
          { id: 'bombas_ruidos', label: 'Sem ruídos/vibrações anormais' },
        ]
      }
    ]
  },
  {
    id: 'eletrico',
    title: '3. Sistema Elétrico e Eletrônico',
    icon: '⚡',
    subsections: [
      {
        title: '3.1 Quadros e distribuição',
        items: [
          { id: 'qgbt_estado', label: 'QGBT e CDs em bom estado' },
          { id: 'aquecimento', label: 'Sem aquecimento anormal' },
          { id: 'ruidos_eletricos', label: 'Sem ruídos elétricos' },
          { id: 'aterramento', label: 'Aterramento adequado' },
        ]
      },
      {
        title: '3.2 Instalações e cargas',
        items: [
          { id: 'iluminacao', label: 'Iluminação interna e externa funcional' },
          { id: 'tomadas_interruptores', label: 'Tomadas e interruptores em bom estado' },
          { id: 'fiacoes', label: 'Fiações aparentes adequadas' },
        ]
      },
      {
        title: '3.3 Equipamentos',
        items: [
          { id: 'portoes_automaticos', label: 'Portões automáticos operantes' },
          { id: 'motores_comandos', label: 'Motores e comandos sem anormalidades' },
          { id: 'spda', label: 'SPDA em condições visuais adequadas' },
        ]
      }
    ]
  },
  {
    id: 'rede_logica',
    title: '4. Rede Lógica, Telefonia, Estabilizadores e No-break',
    icon: '🌐',
    items: [
      { id: 'pontos_logicos', label: 'Pontos lógicos identificados e funcionais' },
      { id: 'tomadas_rj45', label: 'Tomadas RJ-45 fixas e íntegras' },
      { id: 'pontos_telefonicos', label: 'Pontos telefônicos operacionais' },
      { id: 'estabilizadores_nobreak', label: 'Estabilizadores e no-breaks funcionando' },
      { id: 'baterias_validade', label: 'Baterias dentro da validade' },
    ]
  },
  {
    id: 'incendio',
    title: '5. Sistemas de Prevenção e Combate a Incêndio',
    icon: '🔥',
    subsections: [
      {
        title: '5.1 Extintores',
        items: [
          { id: 'extintores_acesso', label: 'Acesso livre' },
          { id: 'extintores_pressao', label: 'Pressão adequada' },
          { id: 'extintores_lacres', label: 'Lacres e validade' },
        ]
      },
      {
        title: '5.2 Hidrantes',
        items: [
          { id: 'hidrantes_caixas', label: 'Caixas acessíveis e sinalizadas' },
          { id: 'hidrantes_mangueiras', label: 'Mangueiras e conexões em bom estado' },
          { id: 'hidrantes_vazamentos', label: 'Sem vazamentos' },
        ]
      },
      {
        title: '5.3 Sistemas',
        items: [
          { id: 'alarmes', label: 'Alarmes funcionando' },
          { id: 'iluminacao_emergencia', label: 'Iluminação de emergência operacional' },
        ]
      }
    ]
  },
  {
    id: 'ar_condicionado',
    title: '6. Ar-Condicionado, Ventilação e Exaustão',
    icon: '❄️',
    items: [
      { id: 'equipamentos_operacionais', label: 'Equipamentos operacionais' },
      { id: 'filtros_limpos', label: 'Filtros limpos' },
      { id: 'serpentinas_bandejas', label: 'Serpentinas e bandejas íntegras' },
      { id: 'drenos', label: 'Drenos desobstruídos' },
      { id: 'ruidos_ac', label: 'Sem ruídos anormais' },
    ]
  },
  {
    id: 'obras_civis',
    title: '7. Obras Civis e Arquitetura',
    icon: '🏗️',
    subsections: [
      {
        title: '7.1 Interno',
        items: [
          { id: 'pisos_revestimentos', label: 'Pisos e revestimentos' },
          { id: 'paredes_pinturas', label: 'Paredes e pinturas' },
          { id: 'forros', label: 'Forros' },
          { id: 'portas_janelas', label: 'Portas, janelas e ferragens' },
        ]
      },
      {
        title: '7.2 Externo',
        items: [
          { id: 'fachadas_impermeabilizacao', label: 'Fachadas e impermeabilização' },
          { id: 'cobertura_calhas', label: 'Cobertura e calhas' },
          { id: 'estacionamento_circulacao', label: 'Estacionamento e circulação' },
          { id: 'escadas_corrimaos', label: 'Escadas e corrimãos' },
        ]
      },
      {
        title: '7.3 Estrutural',
        items: [
          { id: 'fissuras_trincas', label: 'Fissuras/trincas' },
          { id: 'infiltracoes', label: 'Infiltrações' },
        ]
      }
    ]
  },
  {
    id: 'areas_externas',
    title: '8. Áreas Externas, Jardinagem e Paisagismo',
    icon: '🌿',
    items: [
      { id: 'gramados', label: 'Gramados conservados' },
      { id: 'arvores_arbustos', label: 'Árvores e arbustos adequados' },
      { id: 'pragas', label: 'Sem pragas aparentes' },
      { id: 'limpeza_geral', label: 'Limpeza geral satisfatória' },
    ]
  }
];

export const SECTION_STATUS_OPTIONS = [
  { value: 'adequado', label: 'Adequado', color: 'text-green-600' },
  { value: 'com_pendencias', label: 'Com pendências', color: 'text-yellow-600' },
  { value: 'critico', label: 'Crítico', color: 'text-red-600' },
];

export const VISTORIA_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', variant: 'outline' },
  em_andamento: { label: 'Em Andamento', variant: 'secondary' },
  enviado: { label: 'Enviado', variant: 'default' },
  validado: { label: 'Validado', variant: 'default' },
  rejeitado: { label: 'Rejeitado', variant: 'destructive' },
};
