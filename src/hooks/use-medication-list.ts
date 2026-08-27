import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { InventoryItem } from "@/domain/entities/inventory-item";
import type { Medication } from "@/domain/entities/medication";
import type { Prescription } from "@/domain/entities/prescription";
import { todayIsoDate } from "@/shared/date-input";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há o que listar. */
const persistsLocally = Platform.OS !== "web";

/**
 * Um remédio como a lista precisa dele: o cadastro, o tratamento vigente e o estoque.
 *
 * `prescription` é nulo só em cadastro corrompido (medicamento sem tratamento) — a tela mostra o
 * que tem em vez de esconder a linha, senão o remédio some sem explicação.
 */
export type ItemDaListaDeRemedios = {
  medication: Medication;
  prescription: Prescription | null;
  inventory: InventoryItem | null;
};

/**
 * Qual tratamento representa o medicamento na lista. Um mesmo remédio pode ter mais de uma
 * prescrição gravada — a que interessa é a que está valendo hoje; sem nenhuma vigente, a mais
 * recente, que é a que conta a história de por que ele ainda está cadastrado.
 */
function prescricaoVigente(prescriptions: Prescription[], hoje: string): Prescription | null {
  const vigentes = prescriptions.filter((p) => p.endDate === null || p.endDate >= hoje);
  const candidatas = vigentes.length > 0 ? vigentes : prescriptions;
  return (
    candidatas.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

async function carregarItens(): Promise<ItemDaListaDeRemedios[]> {
  // Três consultas em vez de uma por remédio: agrupar em memória é trivial nesse volume, e
  // evita a lista ficar mais lenta a cada medicamento cadastrado.
  const [medications, prescriptions, inventories] = await Promise.all([
    new MedicationRepository().findAll(),
    new PrescriptionRepository().findAll(),
    new InventoryRepository().findAll(),
  ]);

  const hoje = todayIsoDate();
  const porMedicamento = new Map<string, Prescription[]>();
  for (const prescription of prescriptions) {
    const lista = porMedicamento.get(prescription.medicationId) ?? [];
    lista.push(prescription);
    porMedicamento.set(prescription.medicationId, lista);
  }

  // Sem ordenar aqui: quem escolhe a ordem é a tela (E3), e ordenar duas vezes só faria a
  // primeira ser jogada fora.
  return medications.map((medication) => ({
    medication,
    prescription: prescricaoVigente(porMedicamento.get(medication.id) ?? [], hoje),
    inventory: inventories.find((item) => item.medicationId === medication.id) ?? null,
  }));
}

/** Como a lista de medicações pode ser ordenada. */
export type OrdemDeRemedios = "alfabetica" | "cadastro" | "estoque";

/**
 * Ordena a lista já carregada.
 *
 * Fora do hook porque a ordem é escolha de quem está olhando, não propriedade do dado — e
 * reordenar em memória custa nada perto de reconsultar o SQLite a cada toque na fileira.
 *
 * `estoque` põe na frente o que está acabando, e **empurra para o fim quem não controla estoque**:
 * sem número, não há urgência a comparar, e deixar esses no meio faria a ordem parecer aleatória.
 */
export function ordenarRemedios(
  items: ItemDaListaDeRemedios[],
  ordem: OrdemDeRemedios,
): ItemDaListaDeRemedios[] {
  const porNome = (a: ItemDaListaDeRemedios, b: ItemDaListaDeRemedios) =>
    a.medication.name.localeCompare(b.medication.name, "pt-BR", { sensitivity: "base" });

  if (ordem === "alfabetica") return items.slice().sort(porNome);

  // Mais recente primeiro: quem acabou de cadastrar quer ver o que cadastrou.
  if (ordem === "cadastro") {
    return items.slice().sort((a, b) => b.medication.updatedAt.localeCompare(a.medication.updatedAt));
  }

  return items.slice().sort((a, b) => {
    const quantidade = (item: ItemDaListaDeRemedios) =>
      item.inventory === null ? Number.MAX_SAFE_INTEGER : item.inventory.quantity;
    const diferenca = quantidade(a) - quantidade(b);
    return diferenca !== 0 ? diferenca : porNome(a, b);
  });
}

/**
 * A lista de remédios cadastrados, recarregada toda vez que a tela volta ao foco — é o que faz o
 * medicamento recém-cadastrado já estar lá quando o fluxo de cadastro fecha.
 */
export function useMedicationList() {
  const [items, setItems] = useState<ItemDaListaDeRemedios[]>([]);
  const [isLoading, setIsLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) return;
    try {
      setItems(await carregarItens());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar seus remédios.");
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
