import { useRouter } from "expo-router";

import { ScannerScreen } from "@/telas/Scanner/ScannerScreen";

/**
 * O scanner **não salva nada**: ele lê, encontra e passa adiante.
 *
 * O que foi lido viaja para o formulário como parâmetros de rota, e não por estado global. É a
 * forma que sobrevive ao ciclo de vida do Android — se o sistema descartar a tela do scanner
 * enquanto o formulário está aberto, o cadastro continua com o que já foi preenchido.
 *
 * `replace` e não `push`: terminada a leitura, voltar do formulário tem que levar à escolha de
 * cadastro, e não à câmera de novo. Reabrir o scanner ao voltar seria pedir para escanear algo que
 * a pessoa acabou de escanear.
 */
export default function ScannerRoute() {
  const router = useRouter();

  return (
    <ScannerScreen
      onBack={() => router.back()}
      onUsar={(entrada) =>
        router.replace({
          pathname: "/cadastro/manual",
          params:
            entrada === null
              ? {}
              : {
                  nome:
                    entrada.strength.length > 0
                      ? `${entrada.name} ${entrada.strength}`
                      : entrada.name,
                  principioAtivo: entrada.activeIngredient.toLowerCase(),
                  requisito: entrada.prescriptionRequirement,
                },
        })
      }
    />
  );
}
