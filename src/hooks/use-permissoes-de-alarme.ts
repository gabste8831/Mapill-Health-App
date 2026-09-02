import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import {
  diagnosticarPermissoes,
  pedirPermissoesDeAlarme,
  type DiagnosticoDeAlarme,
} from "@/notifications/permissoes-de-alarme";

const VAZIO: DiagnosticoDeAlarme = { itens: [], vaiTocar: true, temPendencia: false };

/**
 * O estado das permissões do alarme, sempre atualizado.
 *
 * **Reconsulta a cada volta ao primeiro plano**, e isso é o coração do hook. As quatro permissões
 * vivem em telas do sistema, e é para lá que o app manda a pessoa quando falta alguma — então
 * "voltar ao app" é exatamente o momento em que o estado mudou. Sem esta releitura, ela concederia
 * a permissão e voltaria para um aviso dizendo que ainda falta.
 *
 * Também cobre o caminho inverso, que é o mais perigoso: permissão revogada nas configurações
 * enquanto o app estava fechado. O alarme deixa de tocar e ninguém percebe — a pessoa segue
 * confiando num lembrete que não existe mais.
 */
export function usePermissoesDeAlarme() {
  const [diagnostico, setDiagnostico] = useState<DiagnosticoDeAlarme>(VAZIO);
  const [isLoading, setLoading] = useState(true);

  const consultar = useCallback(async () => {
    setDiagnostico(await diagnosticarPermissoes());
    setLoading(false);
  }, []);

  useEffect(() => {
    let ativo = true;

    async function sincronizar() {
      const atual = await diagnosticarPermissoes();
      if (!ativo) return;
      setDiagnostico(atual);
      setLoading(false);
    }

    void sincronizar();
    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void sincronizar();
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  /** Abre o diálogo de notificações (o único que existe) e reconsulta o resto. */
  const pedir = useCallback(async () => {
    setDiagnostico(await pedirPermissoesDeAlarme());
  }, []);

  return { ...diagnostico, isLoading, pedir, consultar };
}
