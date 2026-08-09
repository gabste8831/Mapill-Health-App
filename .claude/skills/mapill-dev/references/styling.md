# Estilização — Mapill

Decisão do usuário: **sem Tailwind/NativeWind**. Preferência declarada: um estilo parecido
com o do Angular — estilos "colados" ao componente, não classes utilitárias espalhadas no JSX.

## Padrão a seguir

Cada componente tem seu próprio arquivo de estilos usando `StyleSheet.create`, no mesmo
diretório do componente (co-localizado, como um `.component.css` do Angular ao lado do `.ts`):

```
components/
└── DoseCard/
    ├── DoseCard.tsx
    ├── DoseCard.styles.ts
    └── index.ts
```

`DoseCard.styles.ts`:
```ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/shared/theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
});
```

`DoseCard.tsx`:
```tsx
import { styles } from './DoseCard.styles';

export function DoseCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>...</Text>
    </View>
  );
}
```

## Tema centralizado

Manter um `shared/theme/` com tokens (`colors`, `spacing`, `typography`) importados pelos
arquivos `.styles.ts` — isso evita repetir valores soltos e dá consistência visual, sem precisar
de um framework utility-first.

## Direção visual: "Clinical Precision" + gamificação leve

Direção aprovada pelo usuário (meio-termo): a base visual é minimalista/clínica — transmite
profissionalismo e confiabilidade — mas com pontos pontuais de gamificação (inspirados em
Duolingo) para reforço positivo, já que isso é parte da fundamentação teórica do artigo (ver
seção de UX/UI do `SKILL.md` principal sobre heurísticas de Nielsen e reforço positivo).

**Regra de convivência dos dois estilos**: a base do app (formulários, listas, navegação,
telas de configuração) segue o padrão clínico abaixo. A gamificação fica restrita a elementos
específicos e funcionais — barra de progresso diário, indicador de streak, confirmação de dose —
nunca vira o layout inteiro nem compete com a legibilidade clínica.

### Tokens de tema (`shared/theme/`)

**Atualizado em 2026-08-09** a partir dos protótipos HTML reais (Home/Dashboard, Escanear
código, Cadastro manual) — sistema de cores Material 3 completo, não mais um placeholder.
Mapeamento `role M3 → token do app`; manter os nomes dos roles (facilita comparar com specs
futuras do mesmo protótipo):

```ts
// shared/theme/colors.ts
export const colors = {
  primary: '#0057BF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#026FEF',
  onPrimaryContainer: '#FEFCFF',

  secondary: '#545F73',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D5E0F8',
  onSecondaryContainer: '#586377',

  tertiary: '#994200',       // reservado — não usado nas 3 telas ainda recebidas
  tertiaryContainer: '#C05400',
  onTertiaryContainer: '#FFFBFF',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  // error/onError é a cor do card de "Alerta de Estoque" na Home — fundo cheio vermelho,
  // não um tom claro, porque é uma ação que pede atenção imediata (Nielsen: visibilidade
  // do status do sistema).

  background: '#F7F9FB',
  onBackground: '#191C1E',
  surface: '#F7F9FB',
  surfaceBright: '#F7F9FB',      // header e nav fixos
  surfaceContainerLowest: '#FFFFFF',  // cards elevados (ex: dose em destaque)
  surfaceContainerLow: '#F2F4F6',
  surfaceContainer: '#ECEEF0',
  surfaceContainerHigh: '#E6E8EA',
  onSurface: '#191C1E',
  onSurfaceVariant: '#414754',   // texto secundário, labels, ícones neutros

  outline: '#727786',
  outlineVariant: '#C1C6D7',     // bordas finas de card/input — o "border" antigo
};
```

```ts
// shared/theme/typography.ts
// Fonte: Plus Jakarta Sans (Google Fonts). ATENÇÃO: pesos leves (300) valem para telas de
// apresentação/marketing (ex: título "Hello, David." na Home usa peso 300 no protótipo),
// mas para o público idoso/polimedicado, priorizar peso 500-600 em qualquer texto que
// carregue informação crítica (nome do remédio, horário, dose) — legibilidade tem
// prioridade sobre a estética editorial nesses pontos.
export const typography = {
  headlineXl: { fontFamily: 'PlusJakartaSans_300Light', fontSize: 40, lineHeight: 48, letterSpacing: -0.02 },
  headlineLg: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 32, lineHeight: 40, letterSpacing: -0.01 },
  headlineMd: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 24, lineHeight: 32, letterSpacing: -0.01 },
  headlineSm: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, lineHeight: 28 },
  bodyMd: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 22 },
  label: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.6 }, // uppercase no protótipo
  // Uso crítico (dose, horário, nome do medicamento em destaque): sempre 500+ de peso,
  // nunca 300 — ex: "14:30" e "Metformina 500mg" no card de próxima dose usam bold/600+,
  // mesmo a headline de saudação ao lado usando peso leve.
};
```

```ts
// shared/theme/spacing.ts
export const spacing = { unit: 4, xs: 4, sm: 8, md: 16, gutter: 24, lg: 32, xl: 48, xxl: 80 };
export const marginMobile = 16;
export const marginDesktop = 64; // só relevante se houver versão web/tablet do app

// Radius do protótipo é sutil (quase "clínico", cantos quase retos) — bem mais discreto
// que o "full: 9999" antigo, que só se aplica a pílulas/avatares/FAB.
export const radius = { sm: 2, md: 4, lg: 8, full: 12 };
```

### Padrões de componente observados no protótipo (referência ao implementar)

- **Card de "Próxima Dose"** (Home): fundo `primary` cheio, texto branco, ícone de pílula
  grande semi-transparente no canto — é a única exceção "chamativa" da paleta neutra
  (justificado por ser o elemento mais importante da tela).
- **Lista de doses do dia**: item por linha com horário à esquerda, nome/nota no meio, ícone
  de status à direita. Três estados visuais claros: concluída (opacidade reduzida +
  `line-through` + check preenchido em `primary`), próxima/destaque (borda `primary` 2px,
  fundo `surfaceContainerLowest`, botão "Confirmar" cheio), futura (ícone de relógio em
  `outlineVariant`, sem ação).
- **Alerta de estoque baixo**: card cheio em `error`/`onError` (não um tom claro) com ação
  primária ("Atualizar Medicação", botão branco sobre vermelho) e ação secundária de texto
  ("Ignorar Lembrete") — consistente com a decisão de que o alerta não bloqueia a tela mas
  precisa de destaque forte.
- **Gráfico semanal de adesão**: barras simples em `primary` com opacidade variável por dia
  (dia atual = opacidade cheia), sem biblioteca de gráficos — dá pra fazer só com `View`s de
  altura proporcional.
- **Scanner de código de barras**: metade superior é a câmera com moldura de cantos
  destacados (`primary`, 4px) + linha de varredura animada; metade inferior é sempre visível
  com campo de entrada manual — reforça que o manual nunca é "escondido" atrás da câmera
  (acessibilidade, conforme já documentado em `screens-and-flows.md`).
- **Formulário de cadastro manual**: seções em cards separados (`surfaceContainerLowest` +
  borda `outlineVariant`) por bloco de responsabilidade (dados básicos / posologia / estoque)
  — não um formulário corrido. Frequência é um seletor de chips (Diário/Intervalo/Semanal/SOS),
  horários são chips removíveis com "+ Adicionar", estoque é um stepper (+/-) sem campo de
  limiar — bate exatamente com o que já estava documentado.
- **Navegação inferior fixa** (mobile): Home / Calendário / Remédios / Ajustes, ícone
  preenchido (`FILL 1`) só no item ativo.

### Onde a gamificação entra (elementos permitidos)

- **Barra de progresso diário** (ex: "3 de 5 doses hoje"): usa `colors.primary` preenchido sobre
  trilho em `colors.border`. Nunca bloqueia a tela nem exige interação.
- **Indicador de streak**: ícone (pílula/coração) + contador de dias, discreto, próximo ao
  card de próxima dose — reforço visual, não modal ou pop-up interruptivo.
- **Micro-animação de conclusão**: ao bater a meta do dia, uma animação leve e rápida (sem
  bloquear navegação) — ex: preenchimento final da barra com uma transição suave.
- Card de "Próxima Dose": pode romper a paleta neutra com `colors.primary` cheio (fundo azul,
  texto branco) para se destacar — isso é o card mais importante da Home e justifica ser a
  única exceção "chamativa" da tela.

### Logo / marca (pendente de aplicar)

Usuário tem uma referência de logo pronta: pílula em duas metades (cheia + contorno), na cor
`primary` (#0057BF), traço fino. Ainda não aplicada no código — hoje `LoginScreen` usa um "M"
de texto como placeholder da marca. Quando o asset for entregue: substituir esse placeholder,
gerar `icon.png`/`adaptive-icon`/`splash-icon` a partir dele (ver `app.json`), e considerar
reusar a mesma forma como ícone da FAB da Home (hoje é só um "+").

### O que evitar

- Não usar `style={{ ... }}` inline exceto para valores verdadeiramente dinâmicos (ex: cor que
  muda conforme status de uma dose atrasada).
- Não introduzir Tailwind, NativeWind, styled-components ou emotion sem o usuário pedir
  explicitamente — a preferência já foi definida.
- Não misturar lógica de estilo condicional complexa dentro do JSX; extrair para uma função
  `getContainerStyle(status)` no próprio arquivo de estilos ou no componente.
