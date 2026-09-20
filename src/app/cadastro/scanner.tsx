import { useRouter } from "expo-router";

import { capitalizarNome } from "@/shared/rotulos-de-medicamento";
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
                  /**
                   * Capitalizado aqui, e não só na exibição: **este** é o valor que o formulário
                   * abre no campo e que vai para o banco. Era o único caminho da CMED que gravava
                   * o uppercase cru — quem chegava pela busca passava por `aceitarSugestao`, que
                   * já capitalizava, e os dois cadastros do mesmo remédio saíam com nomes
                   * diferentes conforme a pessoa tivesse escaneado ou digitado.
                   */
                  nome: capitalizarNome(
                    entrada.strength.length > 0
                      ? `${entrada.name} ${entrada.strength}`
                      : entrada.name,
                  ),
                  // `capitalizarNome` e não `toLowerCase`: minúscula corrida é o outro extremo do
                  // caixa alta, e deixava "dipirona monoidratada" parecendo texto não formatado.
                  principioAtivo: capitalizarNome(entrada.activeIngredient),
                  requisito: entrada.prescriptionRequirement,
                },
        })
      }
    />
  );
}
