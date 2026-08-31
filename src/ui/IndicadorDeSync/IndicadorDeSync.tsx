import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { EstadoDaSync } from "@/data/remote/sync-service";
import { colors } from "@/shared/theme";
import { styles } from "./IndicadorDeSync.styles";

export type IndicadorDeSyncProps = {
  estado: EstadoDaSync;
  sincronizando: boolean;
  onSincronizar: () => void;
};

/** "há 3 minutos", "ontem" — quando, em relação a agora. */
function quandoFoi(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}

/**
 * O estado da cópia na nuvem, em uma linha.
 *
 * **Diz o que é verdade agora, e não o que se espera.** Com pendências, ele não chama isso de erro:
 * offline-first significa que ficar sem enviar é o funcionamento normal, não uma falha — o dado
 * está salvo no aparelho de qualquer jeito, e é isso que a frase precisa deixar claro. Chamar de
 * problema o que é comportamento esperado ensina a pessoa a ignorar o indicador justamente quando
 * ele tiver algo a dizer.
 *
 * A ação manual existe para quem quer garantia antes de trocar de aparelho ou apagar o app. No dia
 * a dia ninguém precisa tocar nela: a sincronização acontece sozinha a cada volta ao app.
 */
export function IndicadorDeSync({ estado, sincronizando, onSincronizar }: IndicadorDeSyncProps) {
  const temPendencias = estado.pendentes > 0;

  return (
    <Pressable
      style={styles.container}
      onPress={onSincronizar}
      disabled={sincronizando}
      accessibilityRole="button"
      accessibilityLabel="Sincronizar agora">
      <View style={styles.icone}>
        {sincronizando ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={temPendencias ? "cloud-upload-outline" : "cloud-done-outline"}
            size={20}
            color={temPendencias ? colors.onSurfaceVariant : colors.success}
          />
        )}
      </View>

      <View style={styles.texto}>
        <Text style={styles.titulo}>
          {sincronizando
            ? "Sincronizando…"
            : temPendencias
              ? estado.pendentes === 1
                ? "1 alteração para enviar"
                : `${estado.pendentes} alterações para enviar`
              : "Tudo salvo na nuvem"}
        </Text>
        <Text style={styles.detalhe}>
          {temPendencias && !sincronizando
            ? "Elas já estão salvas neste aparelho. Sobem sozinhas quando houver internet."
            : estado.ultimaSync === null
              ? "Toque para sincronizar agora."
              : `Última sincronização ${quandoFoi(estado.ultimaSync)}.`}
        </Text>
      </View>
    </Pressable>
  );
}
