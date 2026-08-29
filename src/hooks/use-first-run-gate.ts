import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";

import { CURRENT_TERMS_VERSION } from "@/telas/Consentimento/texto-legal";
import type { PatientProfileDraft } from "@/domain/entities/patient-profile";
import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { ConsentRepository } from "@/data/repositories/consent-repository";
import { PatientProfileRepository } from "@/data/repositories/patient-profile-repository";
import { savePatientProfileDraft } from "@/hooks/use-patient-profile";

/**
 * Etapas obrigatórias antes do app propriamente dito, na ordem em que acontecem.
 *
 * `indeciso` é o estado antes de o SQLite ter sido lido: ainda não se sabe se há ficha e
 * consentimento. Existe porque começar em `login` fazia a tela de login **piscar** por um quadro
 * em toda abertura de quem já tinha passado por ela — o gate corrigia em seguida, mas o susto já
 * tinha acontecido. Nenhuma tela desenha nesse estado; quem espera é o splash, que já está lá.
 */
export type FirstRunStep = "indeciso" | "login" | "consent" | "profile" | "app";

/**
 * Resultado do login com Google. O que mostrar em cada caso é decisão da camada de
 * apresentação — este hook não conhece `Alert` nem texto de UI.
 */
export type GoogleSignInResult = "signed-in" | "not-configured";

export type FirstRunGate = {
  step: FirstRunStep;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  continueWithoutLogin: () => Promise<void>;
  acceptConsent: () => Promise<void>;
  saveProfile: (draft: PatientProfileDraft) => Promise<void>;
  /** Volta uma etapa. No-op em `login` (não há pra onde voltar) e em `app` (gate encerrado). */
  goBack: () => void;
  /** A tela usa isso pra decidir se desenha o botão de voltar. */
  canGoBack: boolean;
};

/**
 * Assinatura viva do gate, para quem está longe dele na árvore poder mandá-lo recomeçar.
 *
 * Existe por causa do apagamento de dados: quem apaga a ficha e o consentimento pela tela de
 * Ajustes deixa o app num estado que nenhuma tela sabe desenhar — a aba Home abriria consultando
 * um paciente que não existe mais, e pior, o app seguiria em uso **sem consentimento registrado**,
 * que é exatamente o que a LGPD não admite.
 *
 * Um ouvinte só, e não uma lista: o gate é único no app, montado no layout raiz. Uma lista
 * sugeriria que pode haver dois, e dois gates discordando sobre a etapa atual seria pior que o
 * problema que ela resolveria.
 */
let restartListener: (() => void) | null = null;

/** Devolve o app à primeira execução. Chamar **depois** que o dado local já foi apagado. */
export function restartFirstRun(): void {
  restartListener?.();
}

/** Etapa anterior de cada passo — `null` quando não há retorno possível. */
const PREVIOUS_STEP: Record<FirstRunStep, FirstRunStep | null> = {
  // Ninguém volta para "ainda não sei": é estado de leitura, não etapa do fluxo.
  indeciso: null,
  login: null,
  consent: "login",
  profile: "consent",
  // O gate termina em `app`: a partir daí quem manda na navegação é o expo-router.
  app: null,
};

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então lá o fluxo é sempre completo. */
const persistsLocally = Platform.OS !== "web";

/**
 * "Ficha completa" = tem nome. É o único campo obrigatório, então serve como marcador estável
 * de "o paciente já passou por essa tela", sem quebrar em bancos de versões antigas.
 */
async function hasCompletedProfile(): Promise<boolean> {
  if (!persistsLocally) return false;
  const profileRepository = new PatientProfileRepository();
  const existingProfile = await profileRepository.getCurrent();
  return (existingProfile?.fullName.trim().length ?? 0) > 0;
}

async function hasValidConsent(): Promise<boolean> {
  if (!persistsLocally) return false;
  const consentRepository = new ConsentRepository();
  const currentConsent = await consentRepository.getCurrent();
  // Bump em CURRENT_TERMS_VERSION invalida o consentimento anterior e força reconsentimento —
  // exigência da LGPD quando a finalidade/texto do tratamento muda.
  return currentConsent?.termsVersion === CURRENT_TERMS_VERSION;
}

/**
 * Máquina de estados da primeira execução: login → consentimento LGPD → ficha de saúde → app.
 * Cada etapa é pulada se já tiver sido cumprida numa abertura anterior.
 *
 * Fica isolada num hook (e não dentro do layout) porque é regra de fluxo, não de renderização:
 * o layout só decide qual tela desenhar para o `step` atual.
 *
 * @param isDatabaseReady só consulta o SQLite depois das migrations rodarem.
 */
export function useFirstRunGate(isDatabaseReady: boolean): FirstRunGate {
  const [step, setStep] = useState<FirstRunStep>("indeciso");

  /** Decide o destino depois do login (com ou sem conta), respeitando o que já foi cumprido. */
  const continueAfterLogin = useCallback(async () => {
    if (!(await hasValidConsent())) {
      setStep("consent");
      return;
    }
    setStep((await hasCompletedProfile()) ? "app" : "profile");
  }, []);

  /**
   * O que decide pular a primeira execução é o **onboarding cumprido**, não a sessão.
   *
   * Antes só a sessão do Supabase avançava o gate, e isso fazia a tela de login reaparecer a cada
   * abertura para todo mundo que escolheu "continuar sem login" — uma escolha que o app oferece e
   * depois esquecia. Pior, num build sem as credenciais do Supabase ela reaparecia sempre, para
   * todos, sem que houvesse botão que resolvesse: o de entrar não funciona, e o de seguir sem
   * conta precisava ser tocado de novo todo dia.
   *
   * Consentimento válido mais ficha preenchida só existem porque alguém passou por aqui e
   * respondeu. É prova melhor do que a sessão, que pode nunca ter existido por decisão do próprio
   * paciente. A sessão continua sendo lida, mas só para cobrir quem entrou com o Google antes de
   * chegar ao consentimento.
   */
  useEffect(() => {
    if (!isDatabaseReady) return;
    let ativo = true;
    void (async () => {
      try {
        if (await hasCompletedProfile()) {
          // Reconsentimento por bump de versão ainda passa pelo `continueAfterLogin`, que checa a
          // versão aceita antes de liberar o app.
          if (ativo) await continueAfterLogin();
          return;
        }
        if (!isSupabaseConfigured) {
          // Sai de `indeciso`: sem Supabase não há sessão a consultar, e a resposta já é final.
          if (ativo) setStep("login");
          return;
        }
        // A sessão persiste sozinha entre aberturas (AsyncStorage, ver supabase-client.ts).
        const user = await new SupabaseAuthGateway().getCurrentUser();
        if (!ativo) return;
        if (user) await continueAfterLogin();
        else setStep("login");
      } catch (cause) {
        /**
         * Qualquer falha aqui **precisa sair de `indeciso`**. Nenhuma tela desenha nesse estado, e
         * o layout devolve `null` enquanto ele durar — então uma promessa rejeitada deixava o app
         * parado na splash azul para sempre, sem erro visível e sem saída. Foi o que travava a
         * reabertura depois de tirar dos recentes.
         *
         * O destino é `login`, o mesmo de quem abre o app pela primeira vez: se não deu para ler
         * ficha nem sessão, tratar como instalação nova é a suposição mais conservadora — pede de
         * novo o que já foi respondido, mas nunca libera o app pulando o consentimento.
         */
        console.error("Falha ao decidir a etapa inicial:", cause);
        if (ativo) setStep("login");
      }
    })();
    return () => {
      ativo = false;
    };
  }, [isDatabaseReady, continueAfterLogin]);

  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
    // Login é opcional por decisão de produto: sem credenciais configuradas o app segue
    // utilizável, então avisamos em vez de prender o usuário numa tela que nunca responde.
    if (!isSupabaseConfigured) return "not-configured";
    const authGateway = new SupabaseAuthGateway();
    await authGateway.signInWithGoogle();
    await continueAfterLogin();
    return "signed-in";
  }, [continueAfterLogin]);

  const acceptConsent = useCallback(async () => {
    // Voltar da ficha pro consentimento e aceitar de novo não pode gerar um segundo registro:
    // o que a LGPD exige é a prova de consentimento da versão vigente, e ela já existe.
    if (persistsLocally && !(await hasValidConsent())) {
      const consentRepository = new ConsentRepository();
      const now = new Date().toISOString();
      // Prova de consentimento persistida e versionada — é o registro que comprova o
      // cumprimento do art. 11 da LGPD (tratamento de dado sensível de saúde).
      await consentRepository.save({
        id: Crypto.randomUUID(),
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedAt: now,
        updatedAt: now,
        syncedAt: null,
        deletedAt: null,
      });
    }
    // Cobre reconsentimento (termos mudaram de versão) de quem já tinha ficha preenchida —
    // não faz sentido pedir a ficha de novo só porque o texto legal mudou.
    setStep((await hasCompletedProfile()) ? "app" : "profile");
  }, []);

  const saveProfile = useCallback(async (draft: PatientProfileDraft) => {
    await savePatientProfileDraft(draft);
    setStep("app");
  }, []);

  // Volta pro login, e não direto pro consentimento: sem ficha nem consentimento o app está no
  // mesmo estado de uma instalação nova, e a escolha de entrar ou seguir sem conta faz parte dele.
  useEffect(() => {
    restartListener = () => setStep("login");
    return () => {
      restartListener = null;
    };
  }, []);

  const canGoBack = PREVIOUS_STEP[step] !== null;

  /**
   * Retorno explícito entre as etapas da primeira execução. Existe porque a escolha de entrada
   * é arrependível: quem clicou em "continuar sem login" precisa poder voltar e entrar com o
   * Google sem reinstalar o app. Nada é desfeito ao voltar — o consentimento já registrado
   * continua válido (ver `acceptConsent`), só a tela exibida muda.
   *
   * Heurística de Nielsen nº3 ("controle e liberdade do usuário"): saída de emergência clara
   * de um fluxo obrigatório.
   */
  const goBack = useCallback(() => {
    setStep((current) => PREVIOUS_STEP[current] ?? current);
  }, []);

  // No Android o botão físico de voltar precisa fazer a mesma coisa que o botão da tela —
  // sem isso ele fecharia o app no meio do onboarding, que é justamente o que o usuário não
  // espera. Só registramos o handler quando há pra onde voltar, pra não sequestrar o gesto
  // na tela de login (lá fechar o app é o comportamento correto).
  useEffect(() => {
    if (Platform.OS !== "android" || !canGoBack) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true; // evento consumido — impede o comportamento padrão de encerrar a activity.
    });
    return () => subscription.remove();
  }, [canGoBack, goBack]);

  return {
    step,
    signInWithGoogle,
    continueWithoutLogin: continueAfterLogin,
    acceptConsent,
    saveProfile,
    goBack,
    canGoBack,
  };
}
