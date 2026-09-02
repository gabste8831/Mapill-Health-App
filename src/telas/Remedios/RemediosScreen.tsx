import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { excluirMedicamento } from "@/hooks/use-medication-registration";
import {
  ordenarRemedios,
  useMedicationList,
  type ItemDaListaDeRemedios,
  type OrdemDeRemedios,
} from "@/hooks/use-medication-list";
import {
  formatarQuantidadeLivre,
  horariosComDose,
  resumirDose,
  resumirFrequencia,
} from "@/shared/rotulos-de-medicamento";
import { useSync } from "@/hooks/use-sync";
import { colors, estadoDePressao } from "@/shared/theme";
import {
  AvisoDePendencias,
  Button,
  CenteredLoader,
  EstadoDeErro,
  Fab,
  FotoLocal,
  Header,
  IconButton,
  SearchField,
  SeletorDeOrdem,
  VisualizadorDeMidia,
  type OpcaoDeOrdem,
} from "@/ui";
import { styles } from "./RemediosScreen.styles";

/** Alfabética primeiro por ser a que não muda sozinha: a lista fica onde a pessoa deixou. */
const ORDENS_DE_REMEDIO: OpcaoDeOrdem<OrdemDeRemedios>[] = [
  { value: "alfabetica", label: "A–Z", icon: "text-outline" },
  { value: "cadastro", label: "Mais recentes", icon: "time-outline" },
  { value: "estoque", label: "Acabando", icon: "cube-outline" },
];

type ItemDeRemedioProps = {
  item: ItemDaListaDeRemedios;
  /** Ausente quando não há tratamento pra editar — o card fica inerte, e o texto explica. */
  onEdit?: () => void;
  onDelete: () => void;
  /** Amplia a foto da caixa. Só chamado quando existe foto. */
  onVerFoto: (uri: string, nome: string) => void;
};

function ItemDeRemedio({ item, onEdit, onDelete, onVerFoto }: ItemDeRemedioProps) {
  const { medication, prescription, inventory } = item;
  // Com a dose junto quando ela varia por horário: é o caso em que a hora sozinha esconde
  // justamente o que se quer conferir na fichinha.
  const horarios =
    prescription === null
      ? []
      : horariosComDose(prescription.schedule, prescription.doseAmount, prescription.doseUnit);

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        {/**
         * Sem foto, um marcador neutro ocupa o lugar — e **não** iniciais, que repetiriam o nome
         * ao lado.
         *
         * Antes não entrava nada, e a consequência era a lista desalinhar: numa tela onde a
         * maioria não tem foto, o item que tem é que ficava deslocado. O marcador mantém a coluna
         * do nome no mesmo lugar em todos os itens, e o azul claro dá à lista a cor que faltava sem
         * inventar superfície nova.
         */}
        {medication.photoUri !== null ? (
          /* A foto da caixa existe para responder "é este o remédio?", e numa miniatura de 56px
             essa pergunta às vezes não se responde — caixas da mesma família são quase iguais. */
          <Pressable
            style={estadoDePressao(undefined, { escala: true })}
            onPress={() => onVerFoto(medication.photoUri ?? "", medication.name)}
            accessibilityRole="button"
            accessibilityLabel={`Ver a foto de ${medication.name}`}>
            <FotoLocal uri={medication.photoUri} style={styles.photo} />
          </Pressable>
        ) : (
          <View style={[styles.photo, styles.photoVazia]}>
            <Ionicons name="medkit-outline" size={24} color={colors.primary} />
          </View>
        )}

        <View style={styles.itemHeaderText}>
          <Text style={styles.name}>{medication.name}</Text>
          {medication.activeIngredient.length > 0 ? (
            <Text style={styles.activeIngredient}>{medication.activeIngredient}</Text>
          ) : null}
        </View>

        {/* Duas ações explícitas em vez do card inteiro clicável: "abre alguma coisa" não diz o
            que vai acontecer, e ao lado de um botão de excluir isso pesa. */}
        {/**
         * `IconButton` do kit, e não `Pressable` desenhado aqui.
         *
         * Antes eram dois ícones **sem fundo nenhum**, distinguidos só pela cor — e o sintoma que
         * denunciava isso era o texto de apoio desta tela precisar explicar em prosa o que o lápis
         * e a lixeira fazem. Quando a interface precisa de legenda, ela falhou.
         *
         * O fundo é o que transforma um ícone em algo que se reconhece como tocável, e vir do kit
         * é o que garante que os dois respondam ao toque e tenham o alvo de 44 — eram 40, e ficam
         * encostados num destrutivo, onde errar apaga um tratamento.
         */}
        <View style={styles.acoes}>
          {onEdit ? (
            <IconButton
              variant="sutil"
              tamanho="sm"
              onPress={onEdit}
              accessibilityLabel={`Ver ou editar ${medication.name}`}
              icon={<Ionicons name="pencil-outline" size={20} color={colors.primary} />}
            />
          ) : null}
          <IconButton
            variant="sutil"
            tamanho="sm"
            onPress={onDelete}
            accessibilityLabel={`Excluir ${medication.name}`}
            icon={<Ionicons name="trash-outline" size={20} color={colors.error} />}
          />
        </View>
      </View>

      {prescription !== null ? (
        <Text style={styles.posology}>
          {resumirDose(prescription.doseAmount, prescription.doseUnit, prescription.schedule)}
          {" · "}
          {resumirFrequencia(prescription.schedule)}
        </Text>
      ) : (
        <Text style={styles.activeIngredient}>Sem tratamento cadastrado.</Text>
      )}

      {horarios.length > 0 ? (
        <View style={styles.timeRow}>
          {horarios.map((horario) => (
            <View key={horario} style={styles.timeChip}>
              <Text style={styles.timeChipText}>{horario}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {inventory !== null ? (
        <View style={styles.footerRow}>
          {/* Sem estoque é o único caso em que o número vira aviso: o remédio acabou. */}
          <Text style={[styles.stock, inventory.quantity === 0 && styles.stockLow]}>
            {inventory.quantity === 0
              ? "Estoque zerado"
              : `Estoque: ${formatarQuantidadeLivre(inventory.quantity, inventory.unit)}`}
          </Text>
          {inventory.storageLocation !== null ? (
            <Text style={styles.badge}>{inventory.storageLocation}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Minúsculas e sem acento, pra "acido folico" achar "Ácido fólico". Quem procura um remédio
 * digita apressado e no teclado do celular, onde o acento custa dois toques.
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function RemediosScreen() {
  const router = useRouter();
  const { items, isLoading, error, reload } = useMedicationList();
  const sync = useSync();
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<OrdemDeRemedios>("alfabetica");
  /** A foto da caixa ampliada sobre a lista — o título é o nome do remédio. */
  const [midiaAberta, setMidiaAberta] = useState<{ uri: string; titulo: string } | null>(null);

  // Sobre `items`, e não sobre `visiveis`: o acesso ao estoque não pode sumir porque a busca em
  // curso não casou com nenhum remédio controlado.
  const temEstoque = items.some((item) => item.inventory !== null);

  const termo = normalizar(busca.trim());
  // O princípio ativo entra na busca junto do nome: quem tem a caixa na mão às vezes lembra do
  // "losartana" e não do nome comercial.
  const encontrados =
    termo.length === 0
      ? items
      : items.filter(
          (item) =>
            normalizar(item.medication.name).includes(termo) ||
            normalizar(item.medication.activeIngredient).includes(termo),
        );
  const visiveis = ordenarRemedios(encontrados, ordem);

  function confirmarExclusao(item: ItemDaListaDeRemedios) {
    Alert.alert(
      `Excluir ${item.medication.name}?`,
      // Dizer o que sobrevive é o que separa "excluir" de "apagar tudo": quem tem receio de
      // perder o histórico precisa saber, antes de confirmar, que ele fica.
      "Os horários futuros deixam de existir e o remédio sai da sua lista. O histórico de doses já registradas é mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirMedicamento({
                medicationId: item.medication.id,
                prescriptionId: item.prescription?.id ?? null,
              });
              await reload();
            } catch (cause) {
              Alert.alert(
                "Não foi possível excluir",
                cause instanceof Error ? cause.message : "Tente novamente em instantes.",
              );
            }
          },
        },
      ],
    );
  }

  if (isLoading) return <CenteredLoader />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* O ícone de estoque saiu daqui: no teste em aparelho ele passou despercebido, e atalho que
          ninguém encontra não é atalho. Virou botão no corpo da tela, logo abaixo. */}
      <Header
        title="Medicações"
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />

      <View style={styles.header}>
        {items.length > 0 ? (
          <>
            <SearchField
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou princípio ativo"
              style={styles.busca}
            />
            <Text style={styles.contagem}>
              {termo.length > 0
                ? `${visiveis.length} de ${items.length} ${items.length === 1 ? "medicação" : "medicações"}`
                : `${items.length} ${items.length === 1 ? "medicação cadastrada" : "medicações cadastradas"}`}
            </Text>

            {/* Só com mais de um: ordenar uma lista de um item é oferecer uma escolha sem efeito. */}
            {items.length > 1 ? (
              <SeletorDeOrdem
                value={ordem}
                onChange={setOrdem}
                options={ORDENS_DE_REMEDIO}
              />
            ) : null}
          </>
        ) : null}
      </View>

      {error !== null ? (
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      ) : (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => item.medication.id}
          /**
           * As mesmas duas props do `KeyboardAwareScrollView`, aqui à mão: esta tela tem campo de
           * busca mas não é formulário, então não passa por aquele componente — e ficava sem saída
           * nenhuma para o teclado. Arrastar a lista dispensa (o gesto de quem quer ver o que está
           * embaixo), e `handled` faz o primeiro toque num remédio valer em vez de ser gasto só
           * fechando o teclado.
           */
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ItemDeRemedio
              item={item}
              onVerFoto={(uri, nome) => setMidiaAberta({ uri, titulo: nome })}
              onEdit={
                item.prescription === null
                  ? undefined
                  : () =>
                      router.push({
                        pathname: "/cadastro/editar/[id]",
                        params: { id: item.medication.id },
                      })
              }
              onDelete={() => confirmarExclusao(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // O texto explicativo rola junto com a lista, e só a busca fica fixa: parado no topo ele
          // custava três linhas de altura em toda rolagem, para dizer algo que se lê uma vez.
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Uma linha para a tela inteira, e não um selo por card: a pergunta é "meus dados
                  estão salvos?", e ela se responde uma vez. Some quando não há pendência — que é
                  o caso comum, e sempre o caso de quem não vinculou conta. */}
              <AvisoDePendencias pendentes={sync.estado.pendentes} />

              <Text style={styles.subtitle}>
                Abaixo, suas medicações cadastradas em nosso sistema. Toque no lápis para ver mais
                informações ou editar o cadastro, e na lixeira caso deseje excluir a medicação.
              </Text>

              {/* Só existe quando há estoque cadastrado: o botão leva a uma tela que, sem isso,
                  abriria vazia — e oferecer caminho para o vazio é pior que não oferecer. */}
              {temEstoque ? (
                <Button
                  label="Gerenciar estoques"
                  variant="outline"
                  icon={<Ionicons name="cube-outline" size={20} color={colors.primary} />}
                  onPress={() => router.push("/estoque")}
                />
              ) : null}
            </View>
          }
          ListEmptyComponent={
            // Busca sem resultado e lista vazia pedem respostas diferentes: uma se resolve
            // mudando o que foi digitado, a outra cadastrando algo.
            termo.length > 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>Nenhuma medicação encontrada</Text>
                <Text style={styles.emptyDescription}>
                  Nada por aqui combina com “{busca.trim()}”. Confira a escrita ou busque pelo
                  princípio ativo.
                </Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>Nenhum remédio por aqui ainda</Text>
                <Text style={styles.emptyDescription}>
                  Toque no + para cadastrar seu primeiro medicamento.
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Vai direto para "escanear ou manual": quem está na lista de remédios já respondeu, ao
          estar aqui, que o que vai cadastrar é um remédio — passar pela pergunta "medicação ou
          compromisso?" seria pedir de novo o que a tela já diz. */}
      <Fab
        accessibilityLabel="Cadastrar medicação"
        onPress={() => router.push("/cadastro/medicamento")}
      />

      <VisualizadorDeMidia
        uri={midiaAberta?.uri ?? null}
        titulo={midiaAberta?.titulo ?? ""}
        onClose={() => setMidiaAberta(null)}
      />
    </SafeAreaView>
  );
}
