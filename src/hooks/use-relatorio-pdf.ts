import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { gerarRelatorioPdf } from "@/data/repositories/gerar-relatorio-pdf";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PatientProfileRepository } from "@/data/repositories/patient-profile-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { DoseDoPeriodo } from "@/domain/use-cases/resumir-adesao";
import {
  montarRelatorio,
  type CompromissoDoRelatorio,
  type TratamentoDoRelatorio,
} from "@/domain/use-cases/montar-relatorio";
import { horariosComDose, resumirDose, resumirFrequencia } from "@/shared/rotulos-de-medicamento";

const persistsLocally = Platform.OS !== "web";

/**
 * Quais medicamentos entram no relatório.
 *
 * `null` = todos, e é o padrão. A seleção existe para o polimedicado que vai ao **especialista**:
 * quem consulta o cardiologista leva o que é do coração, não a lista inteira — e relatório mais
 * curto é relatório mais lido.
 */
export type FiltroDeMedicamentos = string[] | null;

/** Um medicamento que o relatório pode cobrir — o que o seletor lista. */
export type MedicamentoDoRelatorio = { id: string; nome: string };

/**
 * Gera o PDF do relatório clínico e o entrega à folha de compartilhamento.
 *
 * Lê os mesmos repositórios que a tela de adesão — `findBetween` para as doses, e as listas de
 * prescrição e medicamento —, então o número do papel é o mesmo número da tela por construção, e
 * não por coincidência. A conta mora no use-case puro (`montarRelatorio`), como o "pronto quando"
 * do D2 exige.
 */
export function useRelatorioPdf() {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [medicamentos, setMedicamentos] = useState<MedicamentoDoRelatorio[]>([]);

  /**
   * O universo do seletor: os medicamentos que **têm tratamento**.
   *
   * Sai daqui, e não de `MedicationRepository.findAll()`, porque um medicamento sem prescrição não
   * produz linha nenhuma no relatório — oferecê-lo no filtro seria oferecer uma escolha que não
   * muda nada, e quem a fizesse receberia um PDF vazio sem entender por quê.
   */
  useFocusEffect(
    useCallback(() => {
      if (!persistsLocally) return;

      void (async () => {
        try {
          const [prescriptions, medications] = await Promise.all([
            new PrescriptionRepository().findAll(),
            new MedicationRepository().findAll(),
          ]);
          const comTratamento = new Set(prescriptions.map((p) => p.medicationId));
          setMedicamentos(
            medications
              .filter((m) => comTratamento.has(m.id))
              .map((m) => ({ id: m.id, nome: m.name }))
              .sort((a, b) => a.nome.localeCompare(b.nome)),
          );
        } catch {
          // Falhar aqui não pode impedir o relatório completo: sem lista, o seletor não aparece e
          // o botão continua gerando tudo, que é o padrão.
          setMedicamentos([]);
        }
      })();
    }, []),
  );

  const gerar = useCallback(
    async (periodoEmDias: number, medicamentos: FiltroDeMedicamentos = null) => {
      if (!persistsLocally) {
        setErro("O relatório em PDF está disponível apenas no aplicativo.");
        return;
      }

      setGerando(true);
      setErro(null);

      try {
        const agora = new Date();
        const inicio = new Date(agora.getTime() - periodoEmDias * 24 * 60 * 60_000);

        const [comStatus, prescriptions, medications, appointments, perfil] = await Promise.all([
          new DoseScheduleRepository().findBetween(inicio.toISOString(), agora.toISOString()),
          new PrescriptionRepository().findAll(),
          new MedicationRepository().findAll(),
          new AppointmentRepository().findAllOrderedByDate(),
          new PatientProfileRepository().getCurrent(),
        ]);

        const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
        const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));
        const selecionados = medicamentos === null ? null : new Set(medicamentos);

        const doses: DoseDoPeriodo[] = [];
        for (const { doseSchedule, latestStatus } of comStatus) {
          const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
          const medication = prescription && medicamentoPorId.get(prescription.medicationId);
          // Mesma regra do relatório em tela: medicamento excluído sai, porque manter a estatística
          // de um remédio que não aparece em lugar nenhum daria uma taxa que ninguém explica.
          if (!prescription || !medication) continue;
          if (selecionados && !selecionados.has(medication.id)) continue;

          doses.push({
            doseScheduleId: doseSchedule.id,
            scheduledFor: doseSchedule.scheduledFor,
            medicationId: medication.id,
            medicationName: medication.name,
            latestStatus,
          });
        }

        const tratamentos: TratamentoDoRelatorio[] = [];
        for (const prescription of prescriptions) {
          const medication = medicamentoPorId.get(prescription.medicationId);
          if (!medication) continue;
          if (selecionados && !selecionados.has(medication.id)) continue;

          tratamentos.push({
            medicationId: medication.id,
            nome: medication.name,
            // Os mesmos rótulos da lista de remédios: se o relatório tivesse a própria tradução, o
            // que foi cadastrado como "Comprimido ou cápsula" apareceria no papel com outro nome.
            dose: resumirDose(prescription.doseAmount, prescription.doseUnit, prescription.schedule),
            frequencia: resumirFrequencia(prescription.schedule),
            horarios: horariosComDose(
              prescription.schedule,
              prescription.doseAmount,
              prescription.doseUnit,
            ),
          });
        }
        tratamentos.sort((a, b) => a.nome.localeCompare(b.nome));

        const inicioIso = inicio.toISOString();
        const agoraIso = agora.toISOString();
        const compromissos: CompromissoDoRelatorio[] = appointments
          .filter((a) => a.scheduledFor >= inicioIso && a.scheduledFor <= agoraIso)
          .map((a) => ({
            descricao: a.title,
            quando: a.scheduledFor,
            // `attended` → true, `missed` → false, ausente → null. A RN01 vale aqui: sem resposta
            // não é "faltou", e o relatório precisa dizer isso em vez de presumir.
            compareceu: a.outcome === null ? null : a.outcome === "attended",
          }));

        const relatorio = montarRelatorio({
          doses,
          tratamentos,
          compromissos,
          paciente: perfil?.fullName?.trim() || "Paciente",
          inicio,
          agora,
          // O total conta os tratamentos com medicamento existente, que é o mesmo universo de onde
          // sai `tratamentos` — senão um remédio excluído faria o relatório se declarar "filtrado"
          // sem que ninguém tenha filtrado nada.
          totalDeTratamentos: prescriptions.filter((p) => medicamentoPorId.has(p.medicationId))
            .length,
        });

        const arquivo = await gerarRelatorioPdf(relatorio);

        if (!(await Sharing.isAvailableAsync())) {
          setErro(
            `O relatório foi salvo como ${arquivo.nome}, mas este aparelho não oferece a tela de compartilhamento.`,
          );
          return;
        }

        await Sharing.shareAsync(arquivo.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartilhar relatório do Mapill",
          UTI: "com.adobe.pdf",
        });
      } catch (cause) {
        setErro(
          cause instanceof Error ? cause.message : "Não foi possível gerar o relatório.",
        );
      } finally {
        setGerando(false);
      }
    },
    [],
  );

  return { gerar, gerando, erro, medicamentos };
}
