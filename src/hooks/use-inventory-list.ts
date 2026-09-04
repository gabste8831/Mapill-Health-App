import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { InventoryAdjustment, InventoryItem } from "@/domain/entities/inventory-item";
import {
  allowsFractionalDose,
  type Medication,
  type PosologyUnit,
} from "@/domain/entities/medication";
import type { Prescription } from "@/domain/entities/prescription";
import type { StockChange } from "@/domain/use-cases/adjust-stock";
import {
  estoquesARecontar,
  type EstoqueARecontar,
} from "@/domain/use-cases/estoques-a-recontar";
import {
  estimateStockDepletion,
  type StockDepletion,
} from "@/domain/use-cases/estimate-stock-depletion";
import { UNIT_LABELS } from "@/shared/rotulos-de-medicamento";
import { todayIsoDate } from "@/shared/date-input";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há estoque pra listar. */
const persistsLocally = Platform.OS !== "web";

/**
 * Um estoque como a tela precisa dele: o número, de que remédio ele é, e até quando dura.
 *
 * `depletion` é `null` quando não há o que estimar — remédio "só quando precisar" não consome em
 * ritmo nenhum, e estoque que passa do horizonte de busca não tem data que valha ser dita.
 */
export type ItemDeEstoque = {
  inventory: InventoryItem;
  medication: Medication;
  depletion: StockDepletion | null;
  /** Meia caneta de insulina existe, meio adesivo não — vem da unidade da embalagem. */
  aceitaFracao: boolean;
};

/**
 * A unidade do estoque é `string` no banco, não `PosologyUnit` (ver `formatarQuantidadeLivre`).
 * Fora da tabela, o benefício da dúvida é deixar fracionar: recusar a vírgula num frasco de
 * unidade desconhecida impede a pessoa de gravar o que ela realmente tem.
 */
function unidadeAceitaFracao(unit: string): boolean {
  if (!(unit in UNIT_LABELS)) return true;
  return allowsFractionalDose(unit as PosologyUnit);
}

/** A prescrição que dita o ritmo de consumo: a vigente hoje, ou a mais recente que existir. */
function prescricaoVigente(prescriptions: Prescription[], hoje: string): Prescription | null {
  const vigentes = prescriptions.filter((p) => p.endDate === null || p.endDate >= hoje);
  const candidatas = vigentes.length > 0 ? vigentes : prescriptions;
  return candidatas.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

/**
 * O que acaba primeiro aparece primeiro. Zerado no topo porque já não é previsão, é o remédio ter
 * acabado; sem previsão no fim, porque não há urgência a comparar. Empate desce pro nome, pra
 * lista não trocar de ordem sozinha entre uma abertura e outra.
 */
function porUrgencia(a: ItemDeEstoque, b: ItemDeEstoque): number {
  const peso = (item: ItemDeEstoque) =>
    item.inventory.quantity === 0 ? -1 : (item.depletion?.daysRemaining ?? Number.MAX_SAFE_INTEGER);
  const diferenca = peso(a) - peso(b);
  if (diferenca !== 0) return diferenca;
  return a.medication.name.localeCompare(b.medication.name, "pt-BR", { sensitivity: "base" });
}

async function carregarItens(): Promise<ItemDeEstoque[]> {
  const [medications, prescriptions, inventories] = await Promise.all([
    new MedicationRepository().findAll(),
    new PrescriptionRepository().findAll(),
    new InventoryRepository().findAll(),
  ]);

  const hoje = todayIsoDate();
  const agora = new Date();
  const medicamentoPorId = new Map(medications.map((medication) => [medication.id, medication]));
  const prescricoesPorMedicamento = new Map<string, Prescription[]>();
  for (const prescription of prescriptions) {
    const lista = prescricoesPorMedicamento.get(prescription.medicationId) ?? [];
    lista.push(prescription);
    prescricoesPorMedicamento.set(prescription.medicationId, lista);
  }

  const itens: ItemDeEstoque[] = [];
  for (const inventory of inventories) {
    const medication = medicamentoPorId.get(inventory.medicationId);
    // Estoque de medicamento excluído: o soft delete tirou o remédio da lista, e mostrar o número
    // dele aqui traria de volta um cadastro que a pessoa já removeu.
    if (medication === undefined) continue;

    const prescription = prescricaoVigente(
      prescricoesPorMedicamento.get(inventory.medicationId) ?? [],
      hoje,
    );

    itens.push({
      inventory,
      medication,
      // A unidade vai junto: com gota tomada em gota e comprada em ml, a previsão precisa se
      // recusar a existir em vez de sair errada (ver `estimateStockDepletion`).
      depletion:
        prescription === null
          ? null
          : estimateStockDepletion(
              prescription,
              { amount: inventory.quantity, unit: inventory.unit as PosologyUnit },
              agora,
            ),
      aceitaFracao: unidadeAceitaFracao(inventory.unit),
    });
  }

  return itens.sort(porUrgencia);
}

/** Como a tela de estoque pode ser ordenada. */
export type OrdemDeEstoque = "urgencia" | "alfabetica" | "quantidade";

/**
 * Ordena a lista já carregada. Fora do carregamento pelo mesmo motivo da lista de medicações: a
 * ordem é escolha de quem olha, e reordenar em memória não custa uma consulta nova.
 */
export function ordenarEstoques(
  items: ItemDeEstoque[],
  ordem: OrdemDeEstoque,
): ItemDeEstoque[] {
  const porNome = (a: ItemDeEstoque, b: ItemDeEstoque) =>
    a.medication.name.localeCompare(b.medication.name, "pt-BR", { sensitivity: "base" });

  if (ordem === "alfabetica") return items.slice().sort(porNome);
  // Quantidade crua, e não dias restantes: é a pergunta "o que tem menos na caixa", que é
  // diferente de "o que acaba primeiro" — dois comprimidos de um remédio de uso diário acabam
  // antes de vinte de um que se toma uma vez por semana.
  if (ordem === "quantidade") {
    return items.slice().sort((a, b) => {
      const diferenca = a.inventory.quantity - b.inventory.quantity;
      return diferenca !== 0 ? diferenca : porNome(a, b);
    });
  }
  return items.slice().sort(porUrgencia);
}

/** Grava o evento e deixa o repositório recalcular a quantidade (com clamp em zero). */
export async function aplicarMudancaDeEstoque(
  inventoryItemId: string,
  change: StockChange,
): Promise<void> {
  if (!persistsLocally) return;

  const adjustment: InventoryAdjustment = {
    id: Crypto.randomUUID(),
    inventoryItemId,
    delta: change.delta,
    reason: change.reason,
    updatedAt: new Date().toISOString(),
    syncedAt: null,
    deletedAt: null,
  };
  await new InventoryRepository().applyAdjustment(adjustment);
}

/**
 * Liga ou desliga o aviso de estoque baixo, e com quantos dias de antecedência.
 *
 * Escreve nos **mesmos campos** que o cadastro do medicamento edita — não há cópia de estado nem
 * segunda fonte de verdade: são dois caminhos até o mesmo dado, e é o que permite oferecer o ajuste
 * onde a pessoa procura por ele (aqui, gerenciando estoque) sem tirá-lo de onde ele nasce.
 *
 * Diferente de `aplicarMudancaDeEstoque`, isto não gera `InventoryAdjustment`: a tabela de ajustes
 * é o histórico de **movimentação de quantidade**, e mudar quando o app avisa não move nada.
 */
export async function salvarAvisoDeEstoqueBaixo(
  inventoryItemId: string,
  aviso: { habilitado: boolean; diasDeAntecedencia: number | null },
): Promise<void> {
  if (!persistsLocally) return;

  const repository = new InventoryRepository();
  const atual = await repository.findById(inventoryItemId);
  if (atual === null) return;

  await repository.save({
    ...atual,
    lowStockAlertEnabled: aviso.habilitado,
    // Sem antecedência o alerta não teria quando disparar, então desligar limpa o valor em vez de
    // guardá-lo — é a mesma regra do cadastro.
    lowStockAlertLeadDays: aviso.habilitado ? aviso.diasDeAntecedencia : null,
    updatedAt: new Date().toISOString(),
    // Volta para a fila de sincronização: o registro mudou depois do último envio.
    syncedAt: null,
  });
}

/**
 * Os estoques controlados, recarregados a cada volta ao foco — é o que faz a quantidade já estar
 * certa depois de uma dose confirmada em outra tela.
 */
/**
 * Quais estoques estão há muito tempo sem conferência.
 *
 * Lê a última recontagem manual de cada um e entrega ao use-case puro, que decide o corte. Vazio
 * quando não há o que perguntar — e vazio é o caso comum, porque a pergunta é mensal.
 */
async function carregarARecontar(agora: Date): Promise<EstoqueARecontar[]> {
  const inventoryRepository = new InventoryRepository();
  const [inventories, medications, ultimaRecontagemPorItem] = await Promise.all([
    inventoryRepository.findAll(),
    new MedicationRepository().findAll(),
    inventoryRepository.findLastRecountByItem(),
  ]);

  const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

  return estoquesARecontar({
    estoques: inventories.flatMap((inventory) => {
      const medication = medicamentoPorId.get(inventory.medicationId);
      // Mesmo motivo da lista: estoque de remédio excluído não aparece em lugar nenhum.
      if (medication === undefined) return [];
      return [
        {
          inventoryItemId: inventory.id,
          medicationId: inventory.medicationId,
          medicationName: medication.name,
          ultimaRecontagem: ultimaRecontagemPorItem.get(inventory.id) ?? null,
          referencia: inventory.updatedAt,
        },
      ];
    }),
    agora,
  });
}

export function useInventoryList() {
  const [items, setItems] = useState<ItemDeEstoque[]>([]);
  const [aRecontar, setARecontar] = useState<EstoqueARecontar[]>([]);
  const [isLoading, setIsLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) return;
    try {
      const agora = new Date();
      setItems(await carregarItens());
      setARecontar(await carregarARecontar(agora));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar seu estoque.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { items, aRecontar, isLoading, error, reload };
}
