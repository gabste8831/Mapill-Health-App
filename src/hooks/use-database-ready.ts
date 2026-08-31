import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { initializeDatabase } from "@/data/local/database";
import { importarCatalogoCmed } from "@/data/local/importar-cmed";

/**
 * Roda as migrations do SQLite uma única vez na abertura do app e diz quando o banco está
 * pronto pra ser lido. Enquanto for `false`, nenhuma tela deve consultar repositório — as
 * tabelas podem ainda não existir.
 *
 * Web: `expo-sqlite` depende de OPFS/SharedArrayBuffer, instável em dev (o worker às vezes
 * trava com "Sync operation timeout"). O Mapill não é um app web, então nessa plataforma a
 * inicialização é pulada e a UI é liberada direto — nada é persistido. Native (Expo Go/EAS)
 * não é afetado.
 */
export function useDatabaseReady(): boolean {
  // Lazy init em vez de setState síncrono dentro do effect pro caso web (Platform.OS não muda
  // entre renders, então não precisa de effect nenhum pra esse ramo — só o nativo precisa
  // esperar a Promise das migrations).
  const [isDatabaseReady, setIsDatabaseReady] = useState(Platform.OS === "web");

  useEffect(() => {
    if (Platform.OS === "web") return;
    initializeDatabase()
      .then(() => {
        /**
         * O catálogo da CMED carrega **depois** de liberar a tela, e sem `await`.
         *
         * São ~21 mil inserções na primeira abertura. Elas não podem ficar entre a pessoa e a Home:
         * a busca por nome é conveniência do cadastro, não pré-requisito de nada — enquanto ela não
         * está pronta, o campo apenas não sugere, e o cadastro manual funciona igual.
         */
        void importarCatalogoCmed().catch((cause: unknown) => {
          console.error("Falha ao importar o catálogo da CMED:", cause);
        });
      })
      .catch((cause: unknown) => {
        /**
         * Falhar aqui **também libera a UI**, e não é indiferença ao erro: enquanto isto ficava
         * `false`, o `_layout` devolvia `null`, nenhuma tela montava, ninguém chamava
         * `SplashScreen.hideAsync()` e o app ficava preso no fundo azul da splash — sem saída a não
         * ser fechar e abrir de novo. Era o que acontecia ao reabrir depois de tirar dos recentes.
         *
         * Uma tela que abre e mostra o erro ao ler os dados é recuperável; uma splash eterna não é.
         * Os repositórios já falham alto por conta própria se as tabelas não existirem, então o
         * erro continua visível — só deixa de ser fatal para o app inteiro.
         */
        console.error("Falha ao inicializar o banco local:", cause);
      })
      .finally(() => setIsDatabaseReady(true));
  }, []);

  return isDatabaseReady;
}
