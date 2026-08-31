import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { estadoDaSync, sincronizar, type EstadoDaSync } from "@/data/remote/sync-service";

/**
 * O estado da sincronização, e o gatilho manual.
 *
 * **Sincroniza ao voltar ao primeiro plano**, e não em intervalo fixo. É quando a conexão
 * costuma estar de volta e quando a pessoa vai olhar o app — um timer de 15 minutos gastaria
 * bateria para descobrir que nada mudou, num aparelho que passa a maior parte do dia no bolso.
 *
 * Nunca bloqueia nada: o app funciona inteiro offline, e a sincronização é backup e troca entre
 * aparelhos (§2.9 — consistência eventual).
 */
export function useSync() {
  const [estado, setEstado] = useState<EstadoDaSync>({ ultimaSync: null, pendentes: 0 });
  const [sincronizando, setSincronizando] = useState(false);

  const atualizarEstado = useCallback(async () => {
    setEstado(await estadoDaSync());
  }, []);

  /** Dispara uma passada e atualiza o que a tela mostra. */
  const sincronizarAgora = useCallback(async () => {
    setSincronizando(true);
    try {
      await sincronizar();
      setEstado(await estadoDaSync());
    } finally {
      setSincronizando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function passada() {
      await sincronizar();
      if (ativo) setEstado(await estadoDaSync());
    }

    void passada();
    const assinatura = AppState.addEventListener("change", (appState) => {
      if (appState === "active") void passada();
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  return { estado, sincronizando, sincronizarAgora, atualizarEstado };
}
