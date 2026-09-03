import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * A pessoa pediu para o sistema reduzir animações?
 *
 * (Android: "Remover animações" nas opções de acessibilidade. iOS: "Reduzir movimento".)
 *
 * Todo componente que anima consulta isto e passa o resultado por
 * `duracaoRespeitandoMovimento` — ver `shared/theme/motion.ts`. Não é enfeite de acessibilidade:
 * quem liga essa opção costuma fazê-lo por enjoo vestibular, e para essas pessoas o movimento é
 * sintoma, não estilo.
 *
 * Escuta a mudança em tempo real, e não só na montagem: a pessoa pode ligar a preferência com o
 * app aberto — e é justamente aí, quando algo a incomodou, que ela vai fazer isso.
 */
export function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    let ativo = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) setReduzir(valor);
    });

    const inscricao = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduzir);

    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);

  return reduzir;
}
