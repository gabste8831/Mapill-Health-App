/**
 * Propósito do app, termos de uso e política de privacidade - mostrados no
 * ConsentimentoScreen, entre o login e a ficha de saúde.
 *
 * IMPORTANTE: este texto foi redigido alinhado aos princípios da LGPD (finalidade específica,
 * minimização, base legal de consentimento explícito para dado sensível - art. 7º, I e art.
 * 11, I) para fins de TCC, mas não é uma peça jurídica revisada por um advogado. Antes de
 * qualquer uso além de demonstração acadêmica, vale validar o texto com o orientador/banca ou
 * um profissional qualificado.
 *
 * Editar TERMS_OF_USE_SECTIONS ou PRIVACY_POLICY_SECTIONS muda o que o paciente consentiu:
 * bumpar CURRENT_TERMS_VERSION junto, senão o aceite antigo continua valendo para um texto
 * que ele nunca leu.
 */

import type { LegalSection } from "@/ui";

/** Bump ao editar TERMS_OF_USE_SECTIONS ou PRIVACY_POLICY_SECTIONS - força re-consentimento. */
export const CURRENT_TERMS_VERSION = "1.0.1";

export const APP_PURPOSE_TEXT =
  "O Mapill existe para ajudar você a manter sua rotina de medicamentos, estoque e " +
  "compromissos de saúde organizados em um só lugar. Ele funciona mesmo sem " +
  "internet, e os seus dados ficam salvos no seu aparelho por padrão. Saiba mais sobre como usamos seus dados em Termos de Uso e Política de Privacidade.";

export type DataPracticeHighlight = {
  title: string;
  description: string;
};

export const DATA_PRACTICE_HIGHLIGHTS: DataPracticeHighlight[] = [
  {
    title: "Finalidade específica",
    description:
      "Usamos seus dados só para o que o Mapill se propõe a fazer: lembrar você de tomar " +
      "seus medicamentos, controlar estoque e organizar seus compromissos.",
  },
  {
    title: "Dados sensíveis",
    description:
      "Informações de saúde (medicamentos, alergias, tipo sanguíneo etc.) são dados " +
      "sensíveis por lei. Tratamos essas informações com cuidado, seguindo todas as disposições " +
      "da LGPD (Lei Geral de Proteção de Dados).",
  },
  {
    title: "Backup opcional de dados",
    description:
      "Login com Google habilita backup dos seus dados em nuvem. É opcional. Seu aplicativo funcionará " +
      "independente dessa etapa, embora seja interessante para não perder dados caso troque de aparelho ou desinstale o app.",
  },
  {
    title: "Seus dados, suas regras",
    description:
      "Você pode acessar, corrigir ou excluir seus dados quando quiser, em Configurações.",
  },
];

export const TERMS_OF_USE_SECTIONS: LegalSection[] = [
  {
    title: "1. Sobre o Mapill",
    paragraphs: [
      "O Mapill é um aplicativo de apoio à rotina terapêutica, desenvolvido como Trabalho de " +
        "Conclusão de Curso do curso de Sistemas de Informação pela UNIDAVI. Ele ajuda " +
        "você a registrar medicamentos, controlar estoque, acompanhar doses e organizar " +
        "compromissos de saúde (consultas, exames, renovação de receita). Serve também como " +
        "uma central das suas anotações clínicas - a ficha de saúde reúne informações que " +
        "costumam ser pedidas em atendimentos e que raramente estão anotadas em algum lugar.",
      "O Mapill NÃO é um dispositivo médico, não fornece diagnóstico, não prescreve " +
        "medicamentos e não substitui orientação de um profissional de saúde qualificado. " +
        "As informações inseridas são de responsabilidade do próprio usuário (ou de quem o " +
        "auxilia no tratamento) e podem ter origem em receitas ou orientações médicas prévias.",
    ],
  },
  {
    title: "2. Quem pode usar",
    paragraphs: [
      "O Mapill se destina ao uso pessoal do paciente ou de um cuidador/familiar que o " +
        "acompanhe, sempre pela mesma conta - não existe papel de usuário separado para " +
        "cuidador. Se você é menor de idade, o uso deve ser supervisionado por um " +
        "responsável legal.",
    ],
  },
  {
    title: "3. Sua responsabilidade ao usar o app",
    paragraphs: [
      "Você é responsável por manter as informações inseridas atualizadas e corretas - o " +
        "Mapill organiza e lembra, mas não valida se uma dose, horário ou quantidade " +
        "corresponde ao que foi de fato prescrito por um profissional.",
      "Alarmes e notificações dependem de permissões do sistema operacional e de o " +
        "aparelho estar em condições normais de funcionamento (bateria, sem economia de " +
        "energia agressiva etc.). Não garantimos entrega perfeita de lembretes em todas as " +
        "condições - o Mapill é uma ferramenta de apoio, não um substituto de " +
        "acompanhamento clínico responsável.",
    ],
  },
  {
    title: "4. Alterações destes termos",
    paragraphs: [
      "Se este texto mudar de forma relevante, uma nova versão será apresentada e um novo " +
        "consentimento será solicitado antes de você continuar usando o app.",
    ],
  },
];

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    title: "1. Quais dados coletamos",
    paragraphs: [
      "Dados de conta (se você optar por login): nome, e-mail e foto associados à sua conta " +
        "Google, usados apenas para autenticação e backup.",
      "Dados de saúde inseridos por você: ficha de saúde (nome, data de nascimento, sexo " +
        "biológico, tipo sanguíneo, alergias, contatos de emergência, observações livres), " +
        "medicamentos, posologia, horários, registros de ingestão, estoque e compromissos " +
        "clínicos.",
      "Não coletamos dado nenhum sem que você o digite ou envie ativamente no app - não há " +
        "rastreamento de terceiros, publicidade ou venda de dados.",
    ],
  },
  {
    title: "2. Base legal para o tratamento",
    paragraphs: [
      "Tratamos seus dados de saúde com base no seu consentimento explícito e específico " +
        "(art. 7º, I e art. 11, I da Lei Geral de Proteção de Dados - Lei nº 13.709/2018), " +
        "dado neste momento. Você pode revogar esse consentimento a qualquer momento - o " +
        "que implica não poder mais usar as funcionalidades que dependem dele.",
    ],
  },
  {
    title: "3. Onde seus dados ficam armazenados",
    paragraphs: [
      "Por padrão, todos os dados ficam apenas no seu aparelho, num banco de dados local " +
        "(SQLite) - é a fonte de verdade principal, funciona sem internet.",
      "Se você fizer login, uma cópia pode ser sincronizada de forma assíncrona com o " +
        "Supabase (nosso provedor de backend), atuando como operador dos dados nos termos " +
        "da LGPD, apenas para fins de backup e recuperação em outro aparelho. Fotos e " +
        "anexos (ex: foto de receita) têm envio à nuvem opt-out por item - se você não " +
        "quiser aquele anexo específico na nuvem, ele não sobe.",
    ],
  },
  {
    title: "4. Compartilhamento com terceiros",
    paragraphs: [
      "Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de " +
        "publicidade ou marketing. O único terceiro envolvido é o provedor de " +
        "infraestrutura (Supabase), e só se você optar por login - ele atua como operador, " +
        "sob as instruções e finalidades definidas aqui.",
    ],
  },
  {
    title: "5. Retenção e exclusão",
    paragraphs: [
      "Seus dados ficam armazenados enquanto você usar o app. Você pode excluir sua conta e " +
        "todos os seus dados a qualquer momento, em Configurações - a exclusão é real " +
        "(remoção definitiva no Supabase, quando aplicável, e purge local), não apenas " +
        "ocultação da tela.",
    ],
  },
  {
    title: "6. Seus direitos como titular dos dados",
    paragraphs: [
      "Conforme o art. 18 da LGPD, você pode a qualquer momento: confirmar a existência de " +
        "tratamento, acessar seus dados, corrigir dados incompletos ou desatualizados, " +
        "solicitar a exclusão, revogar o consentimento, e obter informação sobre com quem " +
        "compartilhamos seus dados (ver seção 4). A maior parte disso está disponível " +
        "diretamente em Configurações, sem precisar entrar em contato.",
    ],
  },
  {
    title: "7. Responsável pelo tratamento e contato",
    paragraphs: [
      "O Mapill é um projeto acadêmico do curso de Sistemas de Informação pela " +
        "UNIDAVI, desenvolvido por Gabriel Steffens (gabrielsteffens2003@gmail.com).",
    ],
  },
  {
    title: "8. Alterações desta política",
    paragraphs: [
      `Versão vigente: ${CURRENT_TERMS_VERSION}. Se o texto mudar de forma relevante, um ` +
        "novo consentimento será solicitado antes de você continuar usando o app.",
    ],
  },
];
