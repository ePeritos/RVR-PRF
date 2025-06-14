import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Tables } from '@/integrations/supabase/types';
import { AMBIENTES_UOP, AMBIENTES_DELEGACIA, CAMPOS_JA_CALCULADOS } from '@/constants/caipConstants';

type DadosCAIP = Tables<'dados_caip'>;

interface UseCAIPCalculationsProps {
  watchedValues: any;
  setValue: UseFormSetValue<DadosCAIP>;
  setPercentualPreenchimento?: (percentual: number) => void;
}

export const useCAIPCalculations = ({ watchedValues, setValue, setPercentualPreenchimento }: UseCAIPCalculationsProps) => {
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
};