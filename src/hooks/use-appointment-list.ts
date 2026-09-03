import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import type { Appointment } from "@/domain/entities/appointment";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há o que listar. */
const persistsLocally = Platform.OS !== "web";

/**
 * Todos os compromissos cadastrados, recarregados toda vez que a tela volta ao foco — é o que faz
 * o compromisso recém-cadastrado ou recém-editado já estar na lista quando o formulário fecha.
 *
 * A ordenação vem pronta do repositório (`findAllOrderedByDate`, do mais próximo ao mais
 * distante): é o banco que tem o índice, e não há escolha de ordem nesta tela como há em
 * `useMedicationList` — um compromisso só tem uma data que importa.
 */
export function useAppointmentList() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) return;
    try {
      setItems(await new AppointmentRepository().findAllOrderedByDate());
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível carregar seus compromissos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { items, isLoading, error, reload };
}
