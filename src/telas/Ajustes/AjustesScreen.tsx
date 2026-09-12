import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { Card, FotoLocal } from "@/ui";
import { criarEstilos } from "./AjustesScreen.styles";

export type AjustesScreenProps = {
  /** Nome do paciente, do registro salvo. Vazio enquanto a ficha não foi preenchida. */
  patientName: string;
  photoUri: string | null;
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  onBack: () => void;
  onEditProfile: () => void;
  /** Abre a tela de conta e dados, onde moram vincular, termos e apagamento (E4). */
  onOpenAccount: () => void;
  /** Abre a tela de escolha de tema (Padrão, Escuro, Alto contraste, Sem depender de cor). */
  onOpenTheme: () => void;
  /**
   * Abre o diagnóstico de avisos. Ausente em produção — a rota nem existe lá.
   *
   * Opcional, e não obrigatório com `__DEV__` dentro da tela: a decisão de expor a ferramenta é de
   * quem monta a rota, e uma prop opcional deixa isso explícito na assinatura.
   */
  onOpenDiagnostico?: () => void;
};

type LinhaProps = {
  label: string;
  /** Só quando é informação real (ex: o e-mail da conta vinculada) — nunca texto de instrução. */
  hint?: string;
  /** Nó em vez de nome de ícone: a linha do Google usa a marca real, não um ícone genérico. */
  icon: ReactNode;
  /** Pinta o rótulo na cor de erro. Para o que apaga dado, não para o que só navega. */
  destrutiva?: boolean;
  onPress: () => void;
};

function Linha({ label, hint, icon, destrutiva = false, onPress }: LinhaProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    // Linha de largura total: escurece, mas não encolhe — escalar faria o texto vizinho tremer.
    <Pressable style={estadoDePressao(styles.row)} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, destrutiva && styles.rowLabelDestrutiva]}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={cores.outline} />
    </Pressable>
  );
}

/** Iniciais como retrato de reserva enquanto não há foto — evita o vazio de um avatar cinza. */
function Iniciais({ name }: { name: string }) {
  const styles = useEstilos(criarEstilos);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length === 0 ? "?" : (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
  return <Text style={styles.avatarInitials}>{initials}</Text>;
}

export function AjustesScreen({
  patientName,
  photoUri,
  accountEmail,
  onBack,
  onEditProfile,
  onOpenAccount,
  onOpenTheme,
  onOpenDiagnostico,
}: AjustesScreenProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const hasProfile = patientName.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* O bloco de identidade é o próprio atalho pra ficha: numa tela sobre o paciente, o
            retrato dele é o ponto de entrada mais óbvio que existe. */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {/* Ajustes é aba, mas também é destino do atalho de conta da Home — quem chegou por
                lá espera poder voltar de onde veio, e não caçar a aba anterior na barra. */}
            <Pressable
              // Ícone solto sobre o azul do hero: alvo autocontido, encolhe ao toque.
              style={estadoDePressao(styles.backButton, { escala: true })}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar">
              <Ionicons name="arrow-back" size={24} color={cores.onPrimary} />
            </Pressable>
            <Text style={styles.heroTitle}>Ajustes</Text>
          </View>

          <Pressable
            // O bloco de identidade ocupa a largura do hero: escurece sem encolher.
            style={estadoDePressao(styles.identity)}
            onPress={onEditProfile}
            accessibilityRole="button">
            {/* `key` na presença da foto — a mesma correção da ficha de saúde. O avatar troca as
                iniciais pela imagem dentro de um `Pressable`, que é a estreia que não recompunha
                no Android: a foto recém-salva ficava invisível até a tela remontar. */}
            <View style={styles.avatar} key={photoUri ? "com-foto" : "sem-foto"}>
              {photoUri ? (
                <FotoLocal uri={photoUri} style={styles.avatarImage} />
              ) : (
                <Iniciais name={patientName} />
              )}
            </View>

            <View style={styles.identityText}>
              <Text style={styles.identityGreeting}>Sua ficha de saúde</Text>
              <Text style={styles.identityName} numberOfLines={1}>
                {hasProfile ? patientName : "Ainda não preenchida"}
              </Text>
            </View>

            <View style={styles.identityEdit}>
              <Ionicons name="pencil" size={16} color={cores.onPrimary} />
            </View>
          </Pressable>
        </View>

        {/* O aviso de pendências de sincronização saiu daqui.

            Ele contava as alterações ainda não enviadas à nuvem — mas o contador roda **mesmo sem
            conta vinculada**, e aí anunciava um problema que não existe e que a pessoa não pode
            resolver: usar o app só localmente é uma escolha legítima, não um estado pendente. Com
            conta vinculada ele também não se justificava, porque a sincronização é automática a
            cada volta ao app; o que resta de útil é o **estado** da cópia, e isso a tela de Conta
            já mostra no `IndicadorDeSync` — que, ao contrário deste, só aparece com conta. */}

        {/* Menu curto de botões — sem texto de instrução abaixo de cada seção. Quem já sabe o
            que quer (conta, tema) reconhece o rótulo e toca; quem não sabe, abre e descobre lá
            dentro. Texto de apoio aqui só repetia o óbvio no caminho de quem já ia direto. */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta e dados</Text>
          <Card style={styles.cartaoDeLinhas}>
            {/* Ícone de conta nos dois casos, e não o logo do Google quando vinculado: a linha leva
                a conta, dados e termos, e o logo prometia que ela era sobre login. O e-mail, quando
                existe, é a única informação que vale manter como subtítulo — dizer *qual* conta
                está vinculada é dado real, diferente do texto genérico que instruía a tocar. */}
            <Linha
              icon={
                <Ionicons name="person-circle-outline" size={22} color={cores.onSurfaceVariant} />
              }
              label="Conta e dados"
              hint={accountEmail ?? undefined}
              onPress={onOpenAccount}
            />
          </Card>
        </View>

        {/* Os temas de acessibilidade (escuro, alto contraste, sem depender de cor) só servem a
            quem os procura — por isso moram atrás de um botão nomeado, e não expandidos no corpo
            de Ajustes, onde a maioria de quem abre a tela está atrás de outra coisa. */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acessibilidade</Text>
          <Card style={styles.cartaoDeLinhas}>
            <Linha
              icon={<Ionicons name="color-palette-outline" size={22} color={cores.onSurfaceVariant} />}
              label="Configurações de tema"
              onPress={onOpenTheme}
            />
          </Card>
        </View>

        {/* A ferramenta de teste dos avisos.

            Ela mostra ids internos e canais do Android, e existe para responder "por que o alarme
            não tocou?" sem cabo e sem Metro. Numa build de produção seria uma porta para o avesso
            do app, então fica fora dela.

            **Vale também na `preview`**, e é essa a diferença: antes a condição era só `__DEV__`, e
            a tela desaparecia justamente na build que serve para testar alarme com o app fechado —
            onde o Metro não existe e o diagnóstico é a única forma de saber se um aviso foi
            agendado. Foi o que faltou na noite de 11/09, ao investigar o alarme que não tocava.

            As duas condições são resolvidas em tempo de compilação (`__DEV__` e a variável de
            ambiente entram no bundle como literais), então na produção a tela sai do binário — não
            fica escondida atrás de um `if` que alguém possa contornar. */}
        {(__DEV__ || process.env.EXPO_PUBLIC_DIAGNOSTICO === "1") && onOpenDiagnostico ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desenvolvimento</Text>
            <Card style={styles.cartaoDeLinhas}>
              <Linha
                icon={<Ionicons name="pulse-outline" size={22} color={cores.onSurfaceVariant} />}
                label="Diagnóstico de avisos"
                hint="O que está agendado agora, e disparo de teste"
                onPress={onOpenDiagnostico}
              />
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
