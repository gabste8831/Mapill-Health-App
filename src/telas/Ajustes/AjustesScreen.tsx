import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSync } from "@/hooks/use-sync";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { AvisoDePendencias, Card, FotoLocal } from "@/ui";
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
}: AjustesScreenProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const sync = useSync();

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
            <View style={styles.avatar}>
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

        {/* Uma linha para a tela inteira, e não um selo por card: a pergunta é "meus dados estão
            salvos?", e ela se responde uma vez. Some quando não há pendência — que é o caso comum,
            e sempre o caso de quem não vinculou conta. Morava na lista de Remédios; mudou pra cá
            porque é sobre a conta, não sobre os remédios em si. */}
        <View style={styles.section}>
          <AvisoDePendencias pendentes={sync.estado.pendentes} />
        </View>

        {/* Menu curto de botões — sem texto de instrução abaixo de cada seção. Quem já sabe o
            que quer (conta, tema) reconhece o rótulo e toca; quem não sabe, abre e descobre lá
            dentro. Texto de apoio aqui só repetia o óbvio no caminho de quem já ia direto. */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA E DADOS</Text>
          <Card>
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
          <Text style={styles.sectionTitle}>ACESSIBILIDADE</Text>
          <Card>
            <Linha
              icon={<Ionicons name="color-palette-outline" size={22} color={cores.onSurfaceVariant} />}
              label="Configurações de tema"
              onPress={onOpenTheme}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
