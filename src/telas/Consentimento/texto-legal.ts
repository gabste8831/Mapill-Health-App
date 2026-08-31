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

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { LegalSection } from "@/ui";

/**
 * Bump ao editar TERMS_OF_USE_SECTIONS ou PRIVACY_POLICY_SECTIONS - força re-consentimento.
 *
 * **1.2.0 (30/08/2026)**: a cópia em nuvem deixou de ser promessa e passou a existir (D1). O texto
 * anterior afirmava que os dados de saúde não saíam do aparelho, e prometia consultar de novo
 * antes de qualquer envio começar — este bump é essa consulta. Sem ele, o primeiro upload
 * aconteceria sob um consentimento dado para outra coisa.
 */
export const CURRENT_TERMS_VERSION = "1.2.0";

export const APP_PURPOSE_TEXT =
  "O Mapill existe para ajudar você a manter sua rotina de medicamentos, estoque e " +
  "compromissos de saúde organizados em um só lugar. Ele funciona mesmo sem " +
  "internet, e os seus dados ficam salvos no seu aparelho. Se você vincular uma conta do Google, " +
  "eles também ganham uma cópia na nuvem. Saiba mais sobre como usamos seus dados em Termos de Uso e Política de Privacidade.";

export type DataPracticeHighlight = {
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const DATA_PRACTICE_HIGHLIGHTS: DataPracticeHighlight[] = [
  {
    icon: "locate-outline",
    title: "Finalidade específica",
    description:
      "Usamos seus dados só para o que o Mapill se propõe a fazer: lembrar você de tomar " +
      "seus medicamentos, controlar estoque e organizar seus compromissos.",
  },
  {
    icon: "lock-closed-outline",
    title: "Dados sensíveis",
    description:
      "Informações de saúde (medicamentos, alergias, tipo sanguíneo etc.) são dados " +
      "sensíveis por lei. Tratamos essas informações com cuidado, seguindo todas as disposições " +
      "da LGPD (Lei Geral de Proteção de Dados).",
  },
  {
    icon: "cloud-outline",
    title: "Cópia em nuvem, e ela é opcional",
    description:
      "Sem conta vinculada, seus dados ficam só no aparelho. Vinculando uma conta do Google, eles " +
      "passam a ter uma cópia na nuvem, para você não perder nada se trocar de celular. As fotos " +
      "e a receita anexada continuam só no aparelho.",
  },
  {
    icon: "key-outline",
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
        "Google, usados hoje apenas para autenticação e, quando a cópia em nuvem existir, para " +
        "identificar de quem ela é.",
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
      "Todos os dados ficam no seu aparelho, num banco de dados local (SQLite) - é a fonte de " +
        "verdade principal e funciona sem internet.",
      "Sem conta vinculada, seus dados de saúde não saem do aparelho. Não há envio nenhum, e o " +
        "app funciona por completo assim.",
      "Com a conta do Google vinculada, é criada uma cópia dos seus dados na nuvem, no Supabase " +
        "(nosso provedor de backend, que atua como operador dos dados nos termos da LGPD). Ela " +
        "serve para backup e para você recuperar tudo em outro aparelho. O envio é assíncrono e " +
        "nunca trava o uso do app: se você estiver sem internet, os dados ficam salvos aqui e " +
        "sobem depois.",
      "O que sobe: medicamentos, tratamentos, horários, registros de ingestão, estoque, " +
        "compromissos, sua ficha de saúde e o registro do seu consentimento. Cada usuário só " +
        "acessa os próprios dados - o banco é configurado para recusar qualquer leitura fora " +
        "disso.",
      "O que NÃO sobe: as fotos e os arquivos. A foto da sua ficha, a foto da caixa do remédio e " +
        "a receita anexada continuam apenas neste aparelho. Se o envio de anexos vier a existir, " +
        "ele será opt-out por item e este texto será atualizado antes.",
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
      "Seus dados ficam armazenados enquanto você usar o app. Em Ajustes, na seção Meus dados, " +
        "você pode apagar a qualquer momento só os dados de saúde (mantendo sua ficha) ou tudo, " +
        "incluindo ficha, consentimento, fotos e receitas anexadas.",
      "A exclusão é real: os registros são removidos do banco do aparelho e os arquivos " +
        "apagados, não apenas ocultados da tela. Apagar tudo também desvincula a sua conta do " +
        "Google e devolve o app ao estado de recém-instalado. A conta do Google em si não é " +
        "excluída - ela apenas deixa de estar ligada ao Mapill.",
      "Com a conta vinculada, apagar pelo app alcança também a cópia na nuvem, na mesma ação - a " +
        "conta é o que prova que os dados são seus. Se você desvincular a conta antes de apagar, a " +
        "cópia na nuvem permanece, e para removê-la basta vincular de novo e apagar, ou pedir pelo " +
        "contato no fim deste documento.",
      "Você também pode baixar uma cópia completa dos seus dados a qualquer momento, em Ajustes > " +
        "Conta e dados > Baixar uma cópia dos meus dados. O arquivo sai em formato aberto (JSON), " +
        "para você guardar onde quiser ou levar para outro serviço.",
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
