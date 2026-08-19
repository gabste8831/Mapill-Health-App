import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { initializeDatabase } from "@/data/local/database";

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
    initializeDatabase().then(() => setIsDatabaseReady(true));
  }, []);

  return isDatabaseReady;
}
