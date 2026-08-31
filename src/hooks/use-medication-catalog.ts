import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { CmedCatalogRepository } from "@/data/repositories/cmed-catalog-repository";
import type { CatalogEntry } from "@/domain/ports/medication-catalog";

/** Web não tem SQLite (ver `useDatabaseReady`), então não há catálogo a consultar. */
const temCatalogo = Platform.OS !== "web";

/** Quantas sugestões aparecem. Mais que isso vira lista para rolar, e a pessoa está digitando. */
const MAX_SUGESTOES = 6;

/**
 * Espera entre a última tecla e a consulta.
 *
 * Sem isso, digitar "losartana" dispararia nove buscas — as oito primeiras jogadas fora. 250 ms é
 * abaixo do que se percebe como lentidão e acima do intervalo entre teclas de quem digita rápido.
 */
const ESPERA_EM_MS = 250;

/**
 * Sugestões do catálogo da CMED enquanto se digita o nome do medicamento.
 *
 * O catálogo é **opcional por construção**: se ele ainda não terminou de importar, ou se a busca
 * falhar, a lista fica vazia e o cadastro segue normalmente. Nada aqui pode impedir alguém de
 * cadastrar um remédio que a base não conhece — manipulados, importados e o que a CMED ainda não
 * listou existem, e o app não pode negá-los.
 */
export function useMedicationCatalog(termo: string) {
  const [sugestoes, setSugestoes] = useState<CatalogEntry[]>([]);

  useEffect(() => {
    if (!temCatalogo) return;

    let ativo = true;
    const timer = setTimeout(() => {
      void new CmedCatalogRepository()
        .buscarPorNome(termo, MAX_SUGESTOES)
        .then((encontrados) => {
          if (ativo) setSugestoes(encontrados);
        })
        .catch(() => {
          // Catálogo ainda importando, ou tabela ausente: sugerir nada é o comportamento correto.
          if (ativo) setSugestoes([]);
        });
    }, ESPERA_EM_MS);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termo]);

  return sugestoes;
}

/** Busca por código de barras — o caminho do scanner (B3). */
export function useBuscaPorEan() {
  return useCallback(async (ean: string): Promise<CatalogEntry | null> => {
    if (!temCatalogo) return null;
    return new CmedCatalogRepository()
      .buscarPorEan(ean)
      .catch(() => null);
  }, []);
}
