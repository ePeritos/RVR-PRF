import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Tables } from '@/integrations/supabase/types';
import { AMBIENTES_UOP, AMBIENTES_DELEGACIA, CAMPOS_JA_CALCULADOS } from '@/constants/caipConstants';

type DadosCAIP = Tables<'dados_caip'>;

interface UseCAIPCalculationsProps {
  watchedValues: any;
  setValue: UseFormSetValue<DadosCAIP>;
  setPercentualPreenchimento?: (percentual: number) => void;
  avaliacoesManutencao?: {[key: string]: number};
}

export const useCAIPCalculations = ({ watchedValues, setValue, setPercentualPreenchimento, avaliacoesManutencao }: UseCAIPCalculationsProps) => {
  // Calcular percentual de preenchimento
  useEffect(() => {
    if (watchedValues) {
      const campos = Object.keys(watchedValues);
      const camposPreenchidos = campos.filter(campo => {
        const valor = watchedValues[campo as keyof DadosCAIP];
        return valor !== null && valor !== undefined && valor !== '';
      });
      
      const percentual = Math.round((camposPreenchidos.length / campos.length) * 100);
      setValue('percentual_preenchimento', percentual.toString());
      setValue('preenchido', percentual > 70 ? 'Sim' : 'Não');
      setValue('data_alteracao_preenchida', new Date().toISOString().split('T')[0]);
    }
  }, [watchedValues, setValue]);

  // Calcular nota de adequação em tempo real
  useEffect(() => {
    if (watchedValues && watchedValues.tipo_de_unidade) {
      const tipoUnidade = watchedValues.tipo_de_unidade;
      let pesoTotalPossivel = 0;
      let pesoAlcancado = 0;

      // Definir peso total possível baseado no tipo de unidade
      if (tipoUnidade === 'UOP') {
        pesoTotalPossivel = 192;
      } else if (tipoUnidade === 'Delegacia') {
        pesoTotalPossivel = 154;
      } else {
        setValue('nota_para_adequacao', '0');
        return;
      }

      // Regra especial para "Alojamento" (peso UOP: 10, DEL: 0)
      if (tipoUnidade === 'UOP') {
        const alojamentoMasculino = watchedValues.alojamento_masculino === 'Sim';
        const alojamentoFeminino = watchedValues.alojamento_feminino === 'Sim';
        const alojamentoMisto = watchedValues.alojamento_misto === 'Sim';

        if (alojamentoMasculino && alojamentoFeminino) {
          pesoAlcancado += 10; // Pontuação integral
        } else if (alojamentoMasculino || alojamentoFeminino || alojamentoMisto) {
          pesoAlcancado += 5; // Meia pontuação
        }
      }

      // Regra especial para "Banheiro para servidores" (peso UOP: 10, DEL: 10)
      const banheiroMasculino = watchedValues.banheiro_masculino_para_servidores === 'Sim';
      const banheiroFeminino = watchedValues.banheiro_feminino_para_servidoras === 'Sim';
      const banheiroMisto = watchedValues.banheiro_misto_para_servidores === 'Sim';

      if (banheiroMasculino && banheiroFeminino) {
        pesoAlcancado += 10; // Pontuação integral
      } else if (banheiroMasculino || banheiroFeminino || banheiroMisto) {
        pesoAlcancado += 5; // Meia pontuação
      }

      const ambientes = tipoUnidade === 'UOP' ? AMBIENTES_UOP : AMBIENTES_DELEGACIA;

      Object.keys(ambientes).forEach(ambiente => {
        if (!CAMPOS_JA_CALCULADOS.includes(ambiente) && watchedValues[ambiente as keyof DadosCAIP] === 'Sim') {
          pesoAlcancado += ambientes[ambiente as keyof typeof ambientes];
        }
      });

      // Calcular nota final garantindo que não ultrapasse 100
      const notaFinal = Math.min(100, Math.round((pesoAlcancado / pesoTotalPossivel) * 100 * 100) / 100);
      setValue('nota_para_adequacao', notaFinal.toString());
      
      // Recalcular nota global quando a nota de adequação mudar
      const notaManutencao = parseFloat(watchedValues?.nota_para_manutencao || '0');
      const notaGlobal = (notaFinal * 0.6) + (notaManutencao * 0.4);
      setValue('nota_global', notaGlobal.toFixed(2) as any);
    }
  }, [watchedValues, setValue]);

  // Calcular nota de manutenção baseada nas avaliações com estrelas
  useEffect(() => {
    if (watchedValues && watchedValues.tipo_de_unidade && avaliacoesManutencao) {
      console.log('🔧 Calculando nota de manutenção...');
      console.log('Tipo de unidade:', watchedValues.tipo_de_unidade);
      console.log('Avaliações de manutenção:', avaliacoesManutencao);

      const tipoUnidade = watchedValues.tipo_de_unidade;
      const ambientes = tipoUnidade === 'UOP' ? AMBIENTES_UOP : AMBIENTES_DELEGACIA;
      
      let potencialMaximo = 0;
      let scoreEfetivo = 0;

      // Iterar sobre todos os ambientes e calcular apenas os que estão selecionados E avaliados
      Object.keys(ambientes).forEach(ambiente => {
        const peso = ambientes[ambiente as keyof typeof ambientes];
        const isSelected = watchedValues[ambiente as keyof DadosCAIP] === 'Sim';
        const avaliacao = avaliacoesManutencao[ambiente] || 0;

        // Tratamento especial para alojamentos
        if (ambiente.startsWith('alojamento_')) {
          const alojamentoMasculino = watchedValues.alojamento_masculino === 'Sim';
          const alojamentoFeminino = watchedValues.alojamento_feminino === 'Sim';
          const alojamentoMisto = watchedValues.alojamento_misto === 'Sim';
          
          if (ambiente === 'alojamento_masculino' && (alojamentoMasculino || alojamentoFeminino || alojamentoMisto)) {
            const avaliacaoMasc = avaliacoesManutencao['alojamento_masculino'] || 0;
            const avaliacaoFem = avaliacoesManutencao['alojamento_feminino'] || 0;
            const avaliacaoMisto = avaliacoesManutencao['alojamento_misto'] || 0;
            const maiorAvaliacao = Math.max(avaliacaoMasc, avaliacaoFem, avaliacaoMisto);
            
            if (maiorAvaliacao > 0) {
              potencialMaximo += peso * 5; // Máximo é peso * 5 estrelas
              scoreEfetivo += peso * maiorAvaliacao;
              console.log(`✅ Alojamento: peso=${peso}, avaliação=${maiorAvaliacao}`);
            }
          }
        }
        // Tratamento especial para banheiros
        else if (ambiente.startsWith('banheiro_') && ambiente.includes('servidor')) {
          const banheiroMasculino = watchedValues.banheiro_masculino_para_servidores === 'Sim';
          const banheiroFeminino = watchedValues.banheiro_feminino_para_servidoras === 'Sim';
          const banheiroMisto = watchedValues.banheiro_misto_para_servidores === 'Sim';
          
          if (ambiente === 'banheiro_masculino_para_servidores' && (banheiroMasculino || banheiroFeminino || banheiroMisto)) {
            const avaliacaoMasc = avaliacoesManutencao['banheiro_masculino_para_servidores'] || 0;
            const avaliacaoFem = avaliacoesManutencao['banheiro_feminino_para_servidoras'] || 0;
            const avaliacaoMisto = avaliacoesManutencao['banheiro_misto_para_servidores'] || 0;
            const maiorAvaliacao = Math.max(avaliacaoMasc, avaliacaoFem, avaliacaoMisto);
            
            if (maiorAvaliacao > 0) {
              potencialMaximo += peso * 5;
              scoreEfetivo += peso * maiorAvaliacao;
              console.log(`✅ Banheiro: peso=${peso}, avaliação=${maiorAvaliacao}`);
            }
          }
        }
        // Tratamento normal para outros ambientes
        else if (isSelected && avaliacao > 0 && peso > 0) {
          potencialMaximo += peso * 5; // Máximo é peso * 5 estrelas
          scoreEfetivo += peso * avaliacao;
          console.log(`✅ ${ambiente}: peso=${peso}, avaliação=${avaliacao}`);
        }
      });

      // Calcular a nota final
      let notaManutencao = 0;
      if (potencialMaximo > 0) {
        notaManutencao = (scoreEfetivo / potencialMaximo) * 100;
      }

      // Garantir que não ultrapasse 100
      notaManutencao = Math.min(notaManutencao, 100);
      
      console.log(`📊 Resultado: ${scoreEfetivo}/${potencialMaximo} = ${notaManutencao.toFixed(2)}%`);
      
      // Atualizar o formulário
      setValue('nota_para_manutencao', notaManutencao.toFixed(2) as any);
      
      // Recalcular nota global
      const notaAdequacao = parseFloat(watchedValues?.nota_para_adequacao || '0');
      const notaGlobal = (notaAdequacao * 0.6) + (notaManutencao * 0.4);
      setValue('nota_global', notaGlobal.toFixed(2) as any);
      
      console.log(`🎯 Nota global atualizada: ${notaGlobal.toFixed(2)}`);
    }
  }, [watchedValues, setValue, avaliacoesManutencao]);
};