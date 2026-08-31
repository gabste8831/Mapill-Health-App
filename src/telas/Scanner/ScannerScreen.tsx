import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CatalogEntry } from "@/domain/ports/medication-catalog";
import { useBuscaPorEan } from "@/hooks/use-medication-catalog";
import { Button, Header } from "@/ui";
import { styles } from "./ScannerScreen.styles";

/**
 * O que a tela está fazendo. Estados explícitos em vez de booleanos soltos: "lendo" e
 * "não encontrado" e "achou" são exclusivos, e três booleanos permitiriam os oito estados
 * impossíveis entre eles.
 */
type EstadoDaLeitura =
  | { tipo: "lendo" }
  | { tipo: "buscando"; ean: string }
  | { tipo: "encontrado"; entrada: CatalogEntry }
  | { tipo: "naoEncontrado"; ean: string };

export type ScannerScreenProps = {
  /**
   * Chamado quando a pessoa aceita o que foi lido. Leva a entrada do catálogo, ou `null` quando o
   * código não está na base e ela escolheu cadastrar à mão mesmo assim.
   */
  onUsar: (entrada: CatalogEntry | null) => void;
  onBack: () => void;
};

/**
 * Leitura do código de barras da caixa.
 *
 * **Nada é salvo sem revisão.** O scanner encontra e mostra o que achou; quem confirma é a pessoa,
 * e o destino é o mesmo formulário de sempre, já preenchido no que a base sabe. Um cadastro clínico
 * criado por um código lido de relance seria dado que ninguém conferiu.
 *
 * EAN não encontrado **não é beco sem saída** (é item do "pronto quando" do B3): metade da base da
 * CMED é de produtos que não estão à venda e foram cortados, manipulados não têm código, e a base
 * envelhece. O caminho manual continua a um toque de distância, com o mesmo peso visual.
 */
export function ScannerScreen({ onUsar, onBack }: ScannerScreenProps) {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [estado, setEstado] = useState<EstadoDaLeitura>({ tipo: "lendo" });
  const buscarPorEan = useBuscaPorEan();

  async function aoLer(codigo: string) {
    // Só processa enquanto está lendo: a câmera dispara o callback muitas vezes por segundo, e sem
    // esta trava a mesma caixa geraria dezenas de buscas e um piscar de telas.
    if (estado.tipo !== "lendo") return;
    setEstado({ tipo: "buscando", ean: codigo });

    const entrada = await buscarPorEan(codigo);
    setEstado(
      entrada === null
        ? { tipo: "naoEncontrado", ean: codigo }
        : { tipo: "encontrado", entrada },
    );
  }

  if (permissao === null) return null;

  if (!permissao.granted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title="Escanear código" onBack={onBack} />
        <View style={styles.centro}>
          <Text style={styles.titulo}>A câmera precisa da sua permissão</Text>
          {/* Diz o que o app faz com ela, e o limite: a câmera aqui lê um número da embalagem, não
              guarda imagem nenhuma. */}
          <Text style={styles.texto}>
            O Mapill usa a câmera só para ler o código de barras da caixa. Nenhuma foto é tirada ou
            guardada.
          </Text>
          <Button label="Permitir a câmera" onPress={() => void pedirPermissao()} />
          {/* Recusar não pode fechar o caminho: quem não quer dar a câmera cadastra à mão. */}
          <Button label="Cadastrar sem escanear" variant="outline" onPress={() => onUsar(null)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Escanear código" onBack={onBack} />

      {estado.tipo === "lendo" || estado.tipo === "buscando" ? (
        <View style={styles.camera}>
          <CameraView
            style={styles.preview}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
            onBarcodeScanned={({ data }) => void aoLer(data)}
          />
          {/* A moldura existe para dizer onde mirar. Sem ela, a pessoa aponta a câmera para a
              caixa inteira e o código nunca entra em foco. */}
          <View style={styles.alvo} pointerEvents="none" />
          <View style={styles.instrucao}>
            <Text style={styles.instrucaoTexto}>
              {estado.tipo === "buscando"
                ? "Procurando na base…"
                : "Aponte para o código de barras da caixa"}
            </Text>
          </View>
        </View>
      ) : null}

      {estado.tipo === "encontrado" ? (
        <View style={styles.centro}>
          <Text style={styles.rotulo}>Encontrado</Text>
          <Text style={styles.nome}>
            {estado.entrada.name}
            {estado.entrada.strength.length > 0 ? ` ${estado.entrada.strength}` : ""}
          </Text>
          {estado.entrada.activeIngredient.length > 0 ? (
            <Text style={styles.texto}>{estado.entrada.activeIngredient.toLowerCase()}</Text>
          ) : null}

          {/* "Continuar" e não "Salvar": o que vem a seguir é o formulário, onde a posologia ainda
              precisa ser respondida. A base sabe o remédio, não o tratamento. */}
          <Button label="Continuar o cadastro" onPress={() => onUsar(estado.entrada)} />
          <Button
            label="Não é este, ler de novo"
            variant="outline"
            onPress={() => setEstado({ tipo: "lendo" })}
          />
        </View>
      ) : null}

      {estado.tipo === "naoEncontrado" ? (
        <View style={styles.centro}>
          <Text style={styles.titulo}>Código não encontrado</Text>
          <Text style={styles.texto}>
            Este código não está na base da Anvisa que o app carrega. Isso é comum em manipulados,
            importados e produtos novos — você pode cadastrar normalmente à mão.
          </Text>
          <Text style={styles.ean}>{estado.ean}</Text>

          <Button label="Cadastrar à mão" onPress={() => onUsar(null)} />
          <Button
            label="Ler outro código"
            variant="outline"
            onPress={() => setEstado({ tipo: "lendo" })}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
