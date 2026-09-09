import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { aplicarParDeEstado } from "./aplicar-par-de-estado";
import { acharPar, PAR_PADRAO, type ParDeEstado } from "./pares-de-estado";
import { TEMAS, temaPadrao, type PreferenciaDeTema, type Tema } from "./temas";

const CHAVE_DA_PREFERENCIA = "@mapill/preferencia-de-tema";
const CHAVE_DO_PAR = "@mapill/par-de-estado";

type ValorDoContexto = {
  /** O tema em vigor agora — já resolvido, nunca "sistema". */
  tema: Tema;
  /** O que a pessoa escolheu, que pode ser "sistema". É isto que a tela de Ajustes marca. */
  preferencia: PreferenciaDeTema;
  escolher: (preferencia: PreferenciaDeTema) => void;
  /** Falso enquanto a preferência salva ainda está sendo lida do disco. */
  carregado: boolean;
  /**
   * O que o **aparelho** está usando agora, independente do tema escolhido no app.
   *
   * Existe para a linha "Automático" em Ajustes poder mostrar a amostra do que ela produziria se
   * fosse escolhida. Sem isto, aquela tela lia `tema.esquema` — o tema **em vigor** —, e com "Alto
   * contraste" selecionado a amostra do automático saía clara mesmo com o celular no escuro:
   * dizia a cor errada justamente da opção cujo sentido é acompanhar o aparelho.
   */
  esquemaDoAparelho: "claro" | "escuro";
  /**
   * O par de cores escolhido para "deu certo" e "não deu".
   *
   * Vale **em todos os temas**, e não só num modo próprio: quem não distingue verde de vermelho
   * também usa o app à noite, e teria que abrir mão do tema escuro para enxergar os estados. Ver
   * `pares-de-estado.ts`.
   */
  parDeEstado: ParDeEstado;
  escolherPar: (id: string) => void;
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
  esquemaDoAparelho: "claro",
  parDeEstado: PAR_PADRAO,
  escolherPar: () => {},
});

export function ProvedorDeTema({ children }: { children: ReactNode }) {
  const esquemaDoSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaDeTema>("padrao");
  const [idDoPar, setIdDoPar] = useState<string>(PAR_PADRAO.id);
  const [carregado, setCarregado] = useState(false);

  // A preferência é lida uma vez, na abertura. Antes disso o app já desenha no tema padrão — é
  // melhor que segurar a tela: quem não escolheu nada (a maioria) não espera por nada.
  useEffect(() => {
    let ativo = true;
    void Promise.all([
      AsyncStorage.getItem(CHAVE_DA_PREFERENCIA),
      AsyncStorage.getItem(CHAVE_DO_PAR),
    ])
      .then(([salvo, parSalvo]) => {
        if (!ativo) return;
        if (salvo !== null && ehPreferenciaValida(salvo)) setPreferencia(salvo);
        // `acharPar` cai no padrão quando o id não existe mais — um par removido da lista não
        // deixa o app sem cores de estado.
        if (parSalvo !== null) setIdDoPar(acharPar(parSalvo).id);
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

  const escolherPar = useCallback((id: string) => {
    setIdDoPar(acharPar(id).id);
    void AsyncStorage.setItem(CHAVE_DO_PAR, id);
  }, []);

  const parDeEstado = useMemo(() => acharPar(idDoPar), [idDoPar]);

  /**
   * O tema resolvido, já com o par de cores da pessoa aplicado.
   *
   * A ordem importa: primeiro o tema (que decide claro/escuro, superfícies, azul), depois o par
   * (que reescreve só os tokens de estado). Fazer o contrário deixaria o tema sobrescrever a
   * escolha, e a pessoa veria a cor voltar ao verde ao trocar para o modo escuro.
   */
  const tema = useMemo(() => {
    const base =
      preferencia === "sistema"
        ? esquemaDoSistema === "dark"
          ? TEMAS.escuro
          : TEMAS.padrao
        : TEMAS[preferencia];
    if (parDeEstado.id === PAR_PADRAO.id) return base;
    return { ...base, cores: aplicarParDeEstado(base.cores, parDeEstado, base.esquema) };
  }, [preferencia, esquemaDoSistema, parDeEstado]);

  const valor = useMemo(
    () => ({
      tema,
      preferencia,
      escolher,
      carregado,
      esquemaDoAparelho: esquemaDoSistema === "dark" ? ("escuro" as const) : ("claro" as const),
      parDeEstado,
      escolherPar,
    }),
    [tema, preferencia, escolher, carregado, esquemaDoSistema, parDeEstado, escolherPar],
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
