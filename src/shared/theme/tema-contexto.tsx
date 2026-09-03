import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { TEMAS, temaPadrao, type PreferenciaDeTema, type Tema } from "./temas";

const CHAVE_DA_PREFERENCIA = "@mapill/preferencia-de-tema";

type ValorDoContexto = {
  /** O tema em vigor agora — já resolvido, nunca "sistema". */
  tema: Tema;
  /** O que a pessoa escolheu, que pode ser "sistema". É isto que a tela de Ajustes marca. */
  preferencia: PreferenciaDeTema;
  escolher: (preferencia: PreferenciaDeTema) => void;
  /** Falso enquanto a preferência salva ainda está sendo lida do disco. */
  carregado: boolean;
};

/**
 * O padrão do contexto é o tema padrão — e não `undefined`.
 *
 * Assim, um componente renderizado fora do provider (um teste, um Storybook, uma tela que ainda
 * não foi migrada) continua funcionando com o visual padrão em vez de estourar. Numa migração
 * gradual como esta, isso é o que garante que nada quebra no meio do caminho.
 */
const ContextoDeTema = createContext<ValorDoContexto>({
  tema: temaPadrao,
  preferencia: "padrao",
  escolher: () => {},
  carregado: true,
});

export function ProvedorDeTema({ children }: { children: ReactNode }) {
  const esquemaDoSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaDeTema>("padrao");
  const [carregado, setCarregado] = useState(false);

  // A preferência é lida uma vez, na abertura. Antes disso o app já desenha no tema padrão — é
  // melhor que segurar a tela: quem não escolheu nada (a maioria) não espera por nada.
  useEffect(() => {
    let ativo = true;
    void AsyncStorage.getItem(CHAVE_DA_PREFERENCIA)
      .then((salvo) => {
        if (ativo && salvo !== null && ehPreferenciaValida(salvo)) setPreferencia(salvo);
      })
      .finally(() => {
        if (ativo) setCarregado(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const escolher = useCallback((nova: PreferenciaDeTema) => {
    // O estado muda na hora e a gravação vai atrás: a troca de tema precisa ser instantânea, e
    // esperar o disco para repintar a tela faria a escolha parecer travada.
    setPreferencia(nova);
    void AsyncStorage.setItem(CHAVE_DA_PREFERENCIA, nova);
  }, []);

  const tema = useMemo(() => {
    if (preferencia === "sistema") {
      return esquemaDoSistema === "dark" ? TEMAS.escuro : TEMAS.padrao;
    }
    return TEMAS[preferencia];
  }, [preferencia, esquemaDoSistema]);

  const valor = useMemo(
    () => ({ tema, preferencia, escolher, carregado }),
    [tema, preferencia, escolher, carregado],
  );

  return <ContextoDeTema.Provider value={valor}>{children}</ContextoDeTema.Provider>;
}

function ehPreferenciaValida(valor: string): valor is PreferenciaDeTema {
  return valor === "sistema" || valor in TEMAS;
}

/**
 * O tema em vigor.
 *
 * Use em qualquer componente que precise de cor. O padrão de consumo é:
 *
 * ```tsx
 * const { cores } = useTema();
 * const styles = useEstilos(criarEstilos);   // ver ./usar-estilos.ts
 * ```
 */
export function useTema(): ValorDoContexto {
  return useContext(ContextoDeTema);
}
