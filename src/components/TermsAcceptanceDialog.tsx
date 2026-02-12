import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsAcceptanceDialogProps {
  open: boolean;
  onAccept: () => void;
}

export const TermsAcceptanceDialog: React.FC<TermsAcceptanceDialogProps> = ({
  open,
  onAccept,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleAccept = () => {
    if (termsAccepted && privacyAccepted) {
      onAccept();
    }
  };

  const canAccept = termsAccepted && privacyAccepted;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-xl max-h-[70vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Termos de Uso e Política de Privacidade
          </DialogTitle>
          <DialogDescription>
            Para utilizar o SIGI-PRF, é necessário aceitar os termos de uso e a política de privacidade.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[40vh] pr-4">
          <div className="space-y-4">
            {/* Termos de Uso - Resumo */}
            <div>
              <h3 className="font-semibold text-base mb-2">Termos de Uso</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>1. Objeto:</strong> O SIGI-PRF destina-se exclusivamente ao uso de servidores da Polícia Rodoviária Federal (PRF) para finalidades institucionais.
                </p>
                <p>
                  <strong>2. Acesso:</strong> Requer credenciais válidas (@prf.gov.br) e uso conforme políticas internas de segurança.
                </p>
                <p>
                  <strong>3. Responsabilidades:</strong> O usuário deve manter sigilo das credenciais, usar apenas para fins institucionais e cumprir a legislação vigente.
                </p>
                <p>
                  <strong>4. Proibições:</strong> É vedado o uso pessoal, compartilhamento de credenciais, acesso não autorizado e atividades que prejudiquem o sistema.
                </p>
              </div>
            </div>

            {/* Política de Privacidade - Resumo */}
            <div>
              <h3 className="font-semibold text-base mb-2">Política de Privacidade (LGPD)</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Dados Coletados:</strong> Nome, e-mail institucional, matrícula funcional e dados técnicos de acesso.
                </p>
                <p>
                  <strong>Finalidade:</strong> Autenticação, controle de acesso, execução das funcionalidades, segurança da informação e cumprimento de obrigações legais.
                </p>
                <p>
                  <strong>Base Legal:</strong> Execução de políticas públicas e cumprimento de obrigações legais (Art. 7º, II e III da LGPD).
                </p>
                <p>
                  <strong>Segurança:</strong> Dados criptografados em trânsito (HTTPS) e em repouso, com Row Level Security (RLS) e backup automatizado.
                </p>
                <p>
                  <strong>Compartilhamento:</strong> Limitado aos provedores de infraestrutura (Hostinger e Supabase) como operadores de dados.
                </p>
                <p>
                  <strong>Seus Direitos:</strong> Confirmar tratamento, acessar, corrigir, eliminar dados e obter informações sobre compartilhamento.
                </p>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-semibold text-base mb-2">Contato</h3>
              <div className="text-xs text-muted-foreground">
                <p><strong>Encarregado de Proteção de Dados:</strong> Daniel Nunes de Ávila</p>
                <p><strong>E-mail:</strong> daniel.avila@prf.gov.br</p>
                <p><strong>Telefone:</strong> 81 97116-8618</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="text-xs">
              Li e aceito os <strong>Termos de Uso</strong> do SIGI-PRF
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
            />
            <Label htmlFor="privacy" className="text-xs">
              Li e aceito a <strong>Política de Privacidade</strong> e autorizo o tratamento dos meus dados pessoais conforme a LGPD
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            className="w-full h-8 text-xs"
          >
            {canAccept ? 'Aceitar e Continuar' : 'Aceite os termos para continuar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};