import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APPOINTMENT_REMINDER_LEAD_DAYS } from "@/domain/entities/appointment";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { dataEHoraPorExtenso, dataPorExtenso } from "@/shared/datas-por-extenso";
import { parseDateInput, todayIsoDate } from "@/shared/date-input";
import { formatIntegerInput } from "@/shared/number-input";
import { rotuloDeAntecedencia } from "@/shared/rotulos-de-compromisso";
import { parseTimeInput } from "@/shared/time-input";
import {
  Button,
  Card,
  DateField,
  Header,
  KeyboardAwareScrollView,
  OptionGroup,
  type OptionGroupOption,
  TextField,
  TimeField,
  RodapeDeFormulario,
} from "@/ui";
import { styles } from "./CadastroDeCompromisso.styles";

/** Antecedência máxima aceita. Meio ano antes já não é lembrete, é outro compromisso. */
const MAX_ANTECEDENCIA_EM_DIAS = 180;

const SIM_NAO: OptionGroupOption<"sim" | "nao">[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const LEAD_OPTIONS: OptionGroupOption<string>[] = APPOINTMENT_REMINDER_LEAD_DAYS.map((days) => ({
  value: String(days),
  label: rotuloDeAntecedencia(days),
}));

/** Cadastro inteiro numa estrutura só — a mesma tela cria e edita. */
export type CompromissoDraft = {
  title: string;
  /** Instante do compromisso em ISO, já com data e hora juntas. */
  scheduledFor: string;
  location: string | null;
  professional: string | null;
  notes: string | null;
  reminderLeadDays: number | null;
  reminderOnDay: boolean;
};

type FormularioDeCompromissoScreenProps = {
  /** Ausente = cadastro novo. Presente = edição do compromisso já gravado. */
  initialValue?: CompromissoDraft;
  onSubmit: (draft: CompromissoDraft) => void;
  onBack: () => void;
};

/** `2026-08-27` + `14:30` → instante local em ISO. */
function paraInstante(isoDate: string, time: string): string {
  const [ano, mes, dia] = isoDate.split("-").map(Number);
  const [horas, minutos] = time.split(":").map(Number);
  return new Date(ano, mes - 1, dia, horas, minutos, 0, 0).toISOString();
}

/** "a descrição, a data e o horário" — lista em português, com "e" antes do último. */
function emLista(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? "";
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/**
 * Cadastro e edição de compromisso na mesma tela.
 *
 * Muito mais curto que o de medicamento, e de propósito: um compromisso é um ponto no tempo, não
 * uma regra que se repete. Não há posologia para derivar nem estoque para conciliar — por isso
 * aqui não existe a revelação em dois estados, que lá serve para conter um formulário que de
 * outra forma seria longo demais.
 *
 * O que se mantém igual ao B2, porque são decisões do projeto e não daquela tela: nada vem
 * escolhido de fábrica, o rodapé é fixo e diz por extenso o que falta, e o campo condicional só
 * aparece quando se aplica.
 */
export function FormularioDeCompromissoScreen({
  initialValue,
  onSubmit,
  onBack,
}: FormularioDeCompromissoScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();

  const instanteInicial = initialValue === undefined ? null : new Date(initialValue.scheduledFor);

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [dateInput, setDateInput] = useState(() => {
    if (instanteInicial === null) return "";
    const dia = String(instanteInicial.getDate()).padStart(2, "0");
    const mes = String(instanteInicial.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${instanteInicial.getFullYear()}`;
  });
  const [timeInput, setTimeInput] = useState(() => {
    if (instanteInicial === null) return "";
    const horas = String(instanteInicial.getHours()).padStart(2, "0");
    const minutos = String(instanteInicial.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
  });

  /**
   * "Agora" congelado na abertura. Ler o relógio a cada render tornaria a tela impura (o React
   * Compiler recusa) e faria a validação da antecedência mudar de resposta sozinha enquanto a
   * pessoa ainda está preenchendo.
   */
  const [agora] = useState(() => new Date());
  const [location, setLocation] = useState(initialValue?.location ?? "");
  const [professional, setProfessional] = useState(initialValue?.professional ?? "");
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  /**
   * O aviso é uma cascata de três respostas, e cada uma só existe se a anterior foi sim. Três
   * estados em vez de booleano em todas: "não quero" é **resposta** e precisa ficar marcada na
   * tela — com booleano, quem toca em "Não" vê a opção voltar ao cinza de não respondida e não
   * sabe se o toque valeu.
   */
  const querAvisoInicial =
    initialValue === undefined
      ? null
      : initialValue.reminderLeadDays !== null || initialValue.reminderOnDay
        ? "sim"
        : "nao";
  const [querAviso, setQuerAviso] = useState<"sim" | "nao" | null>(querAvisoInicial);
  const [avisoNoDia, setAvisoNoDia] = useState<"sim" | "nao" | null>(
    initialValue === undefined ? null : initialValue.reminderOnDay ? "sim" : "nao",
  );
  const [avisoAntes, setAvisoAntes] = useState<"sim" | "nao" | null>(
    initialValue === undefined ? null : initialValue.reminderLeadDays !== null ? "sim" : "nao",
  );
  const [leadDays, setLeadDays] = useState<string | null>(
    initialValue?.reminderLeadDays == null ? null : String(initialValue.reminderLeadDays),
  );
  /** Antecedência fora dos atalhos — "quero ser avisado 15 dias antes". */
  const [leadDaysLivre, setLeadDaysLivre] = useState(() => {
    const gravado = initialValue?.reminderLeadDays;
    if (gravado == null) return "";
    return APPOINTMENT_REMINDER_LEAD_DAYS.includes(gravado) ? "" : String(gravado);
  });

  const usaLeadLivre = leadDaysLivre.length > 0;
  const leadEscolhido = usaLeadLivre ? Number(leadDaysLivre) : leadDays === null ? null : Number(leadDays);
  const leadInvalido =
    usaLeadLivre && (leadEscolhido === null || leadEscolhido < 1 || leadEscolhido > MAX_ANTECEDENCIA_EM_DIAS);

  const dateIso = parseDateInput(dateInput);
  const dateError = dateInput.length === 10 && dateIso === null ? "Data inválida." : undefined;

  const time = parseTimeInput(timeInput);
  const instante =
    dateIso === null || time === null || dateError !== undefined
      ? null
      : new Date(paraInstante(dateIso, time));

  /**
   * Compromisso no passado **avisa, não bloqueia** (E8).
   *
   * Antes era erro e travava o salvar, o que impedia o caso legítimo de registrar a consulta que
   * já aconteceu — e esse é justamente o uso que o desfecho ("você foi?" e a anotação do que o
   * médico disse) existe para servir. Agenda que só aceita o futuro não é histórico clínico.
   *
   * O aviso continua porque a data passada também é o erro de digitação mais comum, o ano trocado.
   * Dizer sem impedir deixa quem errou perceber e quem quis registrar seguir.
   *
   * **É o instante completo, e não o dia.** Comparar só a data deixava passar a consulta de hoje
   * de manhã marcada à tarde: `dateIso` é o de hoje, a seção de lembretes continuava aberta, e o
   * app gravava um aviso para um horário que já tinha passado — uma notificação que nunca dispara.
   * Enquanto o horário não foi preenchido não há o que julgar, e uma **data** anterior a hoje já
   * basta, porque nenhum horário do dia a salvaria.
   */
  const jaPassou =
    instante !== null
      ? instante < agora
      : dateIso !== null && dateIso < todayIsoDate();

  const querAntecedencia = querAviso === "sim" && avisoAntes === "sim";

  /**
   * A antecedência escolhida cabe? "7 dias antes" numa consulta que é depois de amanhã descreve um
   * aviso que já passou — e gravá-lo em silêncio seria prometer um lembrete que nunca chega.
   */
  const avisoChegaEm =
    instante === null || !querAntecedencia || leadEscolhido === null || leadInvalido
      ? null
      : new Date(instante.getTime() - leadEscolhido * 24 * 60 * 60_000);
  const avisoJaPassou = avisoChegaEm !== null && avisoChegaEm < agora;

  /**
   * Compromisso que já aconteceu não tem lembrete a dar, então a seção inteira sai da tela e para
   * de ser cobrada. Perguntar "deseja ser lembrado?" de uma consulta da semana passada seria pedir
   * uma resposta que o app não tem como honrar.
   */
  const aceitaLembrete = !jaPassou;

  /**
   * A pessoa configurou o lembrete e **depois** mudou a data para trás. As respostas continuam no
   * estado, mas a seção sumiu — então elas não são mais visíveis nem editáveis, e `handleSubmit` as
   * descarta. Guardar isso calado é o que o F5 fazia: dizer que o lembrete some é o que separa
   * "o app decidiu por mim" de "o app me avisou".
   */
  const lembreteDescartado = jaPassou && querAviso === "sim";

  const avisoRespondido =
    !aceitaLembrete ||
    querAviso === "nao" ||
    (querAviso === "sim" &&
      avisoNoDia !== null &&
      avisoAntes !== null &&
      // Marcar "sim" para a antecedência sem escolher quantos dias deixaria o aviso ligado sem
      // quando disparar.
      (avisoAntes === "nao" || (leadEscolhido !== null && !leadInvalido)) &&
      // Dizer "não" para os dois é o mesmo que não querer aviso, e não descreve nada.
      !(avisoNoDia === "nao" && avisoAntes === "nao"));

  const canSubmit = title.trim().length > 0 && instante !== null && avisoRespondido;

  const pendencias = [
    title.trim().length === 0 ? "a descrição" : null,
    dateIso === null || dateError !== undefined ? "a data" : null,
    time === null ? "o horário" : null,
    // Nada de lembrete é cobrado num compromisso já passado — a seção nem aparece.
    aceitaLembrete && querAviso === null ? "se deseja ser lembrado" : null,
    aceitaLembrete && querAviso === "sim" && avisoNoDia === null ? "o lembrete no dia" : null,
    aceitaLembrete && querAviso === "sim" && avisoAntes === null ? "o lembrete antecipado" : null,
    aceitaLembrete && querAntecedencia && (leadEscolhido === null || leadInvalido)
      ? "a antecedência"
      : null,
    aceitaLembrete && querAviso === "sim" && avisoNoDia === "nao" && avisoAntes === "nao"
      ? "ao menos um dos dois lembretes"
      : null,
  ].filter((pendencia): pendencia is string => pendencia !== null);

  function handleSubmit() {
    // Impossível com `canSubmit` verdadeiro; o teste está aqui pro compilador, e pra que uma
    // mudança futura quebre alto em vez de calado.
    if (!canSubmit || instante === null) return;
    onSubmit({
      title: title.trim(),
      scheduledFor: instante.toISOString(),
      location: location.trim().length > 0 ? location.trim() : null,
      professional: professional.trim().length > 0 ? professional.trim() : null,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      // No passado nada de aviso é gravado, mesmo que a seção tenha sido preenchida antes de a
      // data mudar: lembrete de algo que já aconteceu nunca chegaria.
      reminderLeadDays:
        aceitaLembrete && querAntecedencia && leadEscolhido !== null ? leadEscolhido : null,
      reminderOnDay: aceitaLembrete && querAviso === "sim" && avisoNoDia === "sim",
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={initialValue === undefined ? "Novo compromisso" : "Editar compromisso"}
        onBack={onBack}
      />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DADOS DO COMPROMISSO</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
          </View>

          {/* Texto livre, e não lista de tipos: a lista real não fecha (consulta, retorno, exame,
              coleta, terapia, fisioterapia…), e cada opção que falta obriga a escolher a menos
              errada e explicar o resto na observação. */}
          <TextField
            label="DESCRIÇÃO DO COMPROMISSO"
            required
            placeholder="Ex: Consulta com cardiologista"
            value={title}
            onChangeText={setTitle}
            onFocus={scrollToFocusedInput}
          />

          {/* Cada um na sua linha. Lado a lado eles couberam enquanto a data era só texto; com o
              ícone de calendário dentro do campo (X7 de 26/08) sobrou metade da tela para um campo
              que mostra `DD/MM/AAAA` e ainda abre um seletor, e os dois ficaram apertados demais
              para o dedo. Que são a mesma resposta continua dito pelo bloco: mesmo cartão, uma
              embaixo da outra, e a frase por extenso confirmando as duas juntas. */}

          {/* Sem `minimo`: o passado é escolhível de propósito (E8), para registrar a consulta
              que já aconteceu. Quem avisa é a frase abaixo, não o bloqueio. */}
          <DateField
            label="DATA"
            required
            value={dateInput}
            onChangeText={setDateInput}
            onFocus={scrollToFocusedInput}
            error={dateError}
          />

          <TimeField label="HORÁRIO" required value={timeInput} onChange={setTimeInput} />

          {/* A data por extenso, e não só o que foi digitado: "dia 27" não denuncia nada, mas
              "sábado" denuncia na hora quem quis marcar na sexta e errou o número. */}
          {instante !== null ? (
            <Text style={styles.confirmacao}>{dataEHoraPorExtenso(instante)}</Text>
          ) : null}

          {/* Avisa sem impedir: registrar a consulta que já aconteceu é uso legítimo — é para isso
              que existe o "você foi?" —, mas data passada também é o erro de digitação mais comum,
              o ano trocado. Dizer deixa quem errou perceber e quem quis registrar seguir. */}
          {jaPassou ? (
            <>
              <Text style={styles.aviso}>
                Esse compromisso já passou. Ele entra na agenda como registro, e não haverá lembrete
                — você poderá anotar o que aconteceu.
              </Text>
              {/* Só quando havia mesmo algo configurado: dizer "o lembrete foi descartado" para
                  quem nunca configurou um inventa uma perda que não houve. */}
              {lembreteDescartado ? (
                <Text style={styles.aviso}>
                  O lembrete que você tinha configurado foi descartado. Se voltar a data para o
                  futuro, é só configurar de novo.
                </Text>
              ) : null}
            </>
          ) : null}
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES COMPLEMENTARES</Text>
            <Text style={[styles.selo, styles.seloOpcional]}>OPCIONAL</Text>
          </View>

          <TextField
            label="LOCAL DE ATENDIMENTO"
            placeholder="Ex: Clínica São José, sala 12"
            value={location}
            onChangeText={setLocation}
            onFocus={scrollToFocusedInput}
          />

          <TextField
            label="NOME DO PROFISSIONAL"
            placeholder="Ex: Dra. Ana Martins, cardiologista"
            value={professional}
            onChangeText={setProfessional}
            onFocus={scrollToFocusedInput}
          />

          <TextField
            label="ORIENTAÇÕES E PREPARO"
            placeholder="Ex: jejum de 12h, levar exames anteriores"
            value={notes}
            onChangeText={setNotes}
            onFocus={scrollToFocusedInput}
            multiline
          />
        </Card>

        {/* A seção inteira some no passado: não há aviso a dar sobre o que já aconteceu, e
            perguntar seria cobrar resposta que o app não tem como honrar. */}
        {aceitaLembrete ? (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LEMBRETES</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
          </View>

          <OptionGroup
            label="DESEJA SER LEMBRADO DESTE COMPROMISSO?"
            value={querAviso}
            options={SIM_NAO}
            onChange={(value) => {
              setQuerAviso(value);
              // Recusar o aviso apaga o que só existia por causa dele: sozinhas, as respostas de
              // baixo não descrevem nada, e reapareceriam marcadas se a pessoa mudasse de ideia —
              // resposta que ninguém deu desta vez.
              if (value === "nao") {
                setAvisoNoDia(null);
                setAvisoAntes(null);
                setLeadDays(null);
                setLeadDaysLivre("");
              }
            }}
          />

          {querAviso === "sim" ? (
            <>
              {/* Os dois canais são independentes de propósito: uma semana antes serve para se
                  organizar, e no dia serve para não esquecer o que já estava planejado. Quem marca
                  consulta costuma querer os dois, e um campo só obrigaria a escolher. */}
              <OptionGroup
                label="LEMBRAR NO DIA DO COMPROMISSO?"
                value={avisoNoDia}
                options={SIM_NAO}
                onChange={setAvisoNoDia}
              />

              <OptionGroup
                label="LEMBRAR COM ANTECEDÊNCIA?"
                value={avisoAntes}
                options={SIM_NAO}
                onChange={(value) => {
                  setAvisoAntes(value);
                  if (value === "nao") {
                    setLeadDays(null);
                    setLeadDaysLivre("");
                  }
                }}
              />

              {querAntecedencia ? (
                <>
                  {/* Atalhos para o comum e campo livre no fim da fileira, o mesmo padrão de
                      "quantas vezes por dia" do cadastro de medicamento: a lista cobre a maioria
                      sem fechar a porta para quem quer 15 ou 30 dias. */}
                  <OptionGroup
                    label="COM QUANTOS DIAS DE ANTECEDÊNCIA"
                    value={usaLeadLivre ? null : leadDays}
                    options={LEAD_OPTIONS}
                    onChange={(value) => {
                      setLeadDaysLivre("");
                      setLeadDays(value);
                    }}
                  />

                  {/* O campo livre saiu de dentro da fileira de atalhos e ganhou linha própria.
                      Espremido ao lado deles, ele disputava a largura com três fichas e ficava
                      pequeno demais para o dedo — e é onde se digita 15, 30 ou 45 dias. */}
                  <TextField
                    label="OUTRO PRAZO, EM DIAS"
                    placeholder="Ex: 15"
                    value={leadDaysLivre}
                    onChangeText={(raw) => {
                      setLeadDaysLivre(formatIntegerInput(raw, 3));
                      setLeadDays(null);
                    }}
                    onFocus={scrollToFocusedInput}
                    keyboardType="number-pad"
                    maxLength={3}
                  />

                  {leadInvalido ? (
                    <Text style={styles.erro}>
                      Informe entre 1 e {MAX_ANTECEDENCIA_EM_DIAS} dias.
                    </Text>
                  ) : null}

                  {/* A data em que o aviso chega, e não a antecedência: é o único jeito de conferir
                      se dá tempo de remarcar o trabalho ou arrumar carona. */}
                  {avisoChegaEm !== null ? (
                    <Text style={avisoJaPassou ? styles.aviso : styles.confirmacao}>
                      {avisoJaPassou
                        ? "Essa antecedência já passou: o aviso cairia numa data anterior a hoje. Escolha um prazo menor."
                        : `Aviso antecipado em ${dataPorExtenso(avisoChegaEm)}.`}
                    </Text>
                  ) : null}
                </>
              ) : null}

              {/* Diz **quando** e **como** o aviso chega, agora que ele chega de verdade. A hora
                  fixa importa: quem pede "3 dias antes" precisa saber que o aviso é de manhã, e não
                  no mesmo horário da consulta — senão parece atrasado. */}
              <Text style={styles.hint}>
                Os avisos chegam por notificação, às 8 da manhã do dia marcado. Compromisso não toca
                alarme: só a dose faz isso.
              </Text>
            </>
          ) : null}
        </Card>
        ) : null}
      </KeyboardAwareScrollView>

      <RodapeDeFormulario>
        <Button
          label={initialValue === undefined ? "Salvar compromisso" : "Salvar alterações"}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
        {pendencias.length > 0 ? (
          <Text style={styles.submitHint}>Falta informar {emLista(pendencias)}.</Text>
        ) : null}
      </RodapeDeFormulario>
    </SafeAreaView>
  );
}
