/**
 * As cores de "deu certo" e "nao deu".
 *
 * Verde com vermelho e justamente o que a deuteranopia e a protanopia confundem, juntas presentes
 * em cerca de 1 homem em 12.
 *
 * A escolha e da pessoa, e nao do app: daltonismo nao e uma condicao so, e nenhum par fixo e otimo
 * para as tres formas. Um "modo daltonismo" com turquesa e magenta ja existiu aqui, e a medicao o
 * desmontou - separava pior que o verde e vermelho que substituia.
 *
 * Todos os pares foram medidos em duas frentes, e os valores anotados em cada um sao medidos, nao
 * estimados: contraste sobre branco (WCAG AA, 4.5:1), porque as cores sao usadas como texto, e
 * separacao sob as tres formas de daltonismo, onde abaixo de 60 elas colapsam num tom so.
 */
export type ParDeEstado = {
  id: string;
  /**
   * O nome que a pessoa lê: as **três** cores por extenso, na ordem em que a faixa as desenha.
   *
   * Dito pelas cores, e não por uma condição médica - quem escolhe não precisa saber nomear a
   * própria visão, só apontar o conjunto que lhe parece mais distinto.
   *
   * Eram **duas** cores aqui ("Azul e laranja"), com a do meio só na `descricao`, que a tela não
   * mostra: a pessoa via três faixas, lia duas cores e tinha de adivinhar qual não estava dita. As
   * três nomeadas é o que faz o rótulo corresponder ao que está desenhado logo acima.
   */
  nome: string;
  /** "Deu certo": dose tomada, compromisso comparecido, estoque saudável. */
  afirmativo: string;
  /** "Não deu": dose atrasada, estoque zerado, erro de campo. */
  negativo: string;
  /**
   * "Fique atento": estoque acabando, receita vencendo, permissão faltando.
   *
   * Faz parte do par porque o amarelo de atenção **colide com o negativo** sob daltonismo - no
   * verde/vermelho original a distância entre os dois é ΔE 7.8, ou seja, praticamente a mesma cor
   * para quem tem deuteranopia. Trocar só duas cores deixaria o terceiro estado indistinguível
   * justamente de quem escolheu trocar.
   */
  atencao: string;
  /**
   * O que a medição diz do conjunto - lido pelo leitor de tela, junto do nome.
   *
   * Não repete as cores: elas passaram a viver em `coresPorExtenso`, que a grade mostra. Enquanto o
   * rótulo citava só duas, esta frase era o único lugar onde as três apareciam; agora ela cuida só
   * do que a amostra **não** consegue mostrar a quem não distingue as cores - como o conjunto se
   * comportou na medição.
   */
  descricao: string;
};

export const PARES_DE_ESTADO: readonly ParDeEstado[] = [
  {
    id: "padrao",
    nome: "Verde, amarelo e vermelho",
    afirmativo: "#11803E",
    negativo: "#C90000",
    // O âmbar original do app. Com o par padrão ele colide com o vermelho (ΔE 7.8) - é justamente
    // a colisão que motiva os pares abaixo.
    atencao: "#A16207",
    descricao: "As cores originais do app.",
  },
  {
    id: "azulLaranja",
    nome: "Azul, marrom e laranja",
    afirmativo: "#0B5FD9",
    negativo: "#C2410C",
    // ΔE mínimo do trio: 17.6. O âmbar escurece para se afastar do laranja do negativo.
    atencao: "#6D4C00",
    // Separação medida: 217 / 207 / 248 nas três formas. É o par que mais se separa dos cinco,
    // e o recomendado da literatura para deuteranopia e protanopia - as duas mais comuns.
    descricao: "O conjunto que mais se separa.",
  },
  {
    id: "azulVermelho",
    nome: "Azul, petróleo e vermelho",
    afirmativo: "#1D4ED8",
    negativo: "#B91C1C",
    // Petróleo: ΔE mínimo 12.9. Um terceiro âmbar colidiria com o vermelho, como no par padrão.
    atencao: "#155E75",
    // 216 / 207 / 251. Empata com o azul/laranja e mantém o vermelho, que já significa "pare"
    // fora do app - para quem confunde só o verde, trocar apenas ele é a mudança menor.
    descricao: "Mantém o vermelho de alerta.",
  },
  {
    id: "roxoAmarelo",
    nome: "Roxo, petróleo e âmbar",
    afirmativo: "#6D28D9",
    // `#96590A` e nao o `#A16207` do `warning`: aquele dava 4.46:1 sobre o fundo da tela e
    // reprovava em AA por 0.04. Um degrau mais fechado leva a 5.10:1 e continua sendo o mesmo
    // ambar aos olhos.
    negativo: "#96590A",
    // Petróleo, porque aqui o negativo **é** o âmbar: ΔE mínimo 14.6.
    atencao: "#155E75",
    // 150 / 161 / 151 - o único par que fica igual nas três, e por isso o mais previsível para
    // tritanopia, que os outros atendem por acaso e não por desenho.
    descricao: "O mais parelho nos três tipos.",
  },
  {
    id: "turquesaMagenta",
    nome: "Turquesa, marrom e magenta",
    afirmativo: "#00696E",
    negativo: "#C2185B",
    // ΔE mínimo 18.4, o melhor deste trio.
    atencao: "#6D4C00",
    // 146 / 117 / 178. Era o par fixo do antigo tema "Sem depender de cor"; fica na lista porque
    // alguém pode preferi-lo, mas não é mais o que o app escolhe por conta.
    descricao: "As cores do modo anterior.",
  },
];

export const PAR_PADRAO = PARES_DE_ESTADO[0];

export function acharPar(id: string | null): ParDeEstado {
  return PARES_DE_ESTADO.find((par) => par.id === id) ?? PAR_PADRAO;
}
