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

Cores extraídas do design aprovado (adaptar nomes conforme necessário, mas manter esses valores
como ponto de partida):

```ts
// shared/theme/colors.ts
export const colors = {
  primary: '#2B7FFF',        // ações primárias, estados ativos, foco
  secondary: '#1E293B',      // texto principal, ícones de alto contraste
  background: '#F8FAFC',     // fundo neutro
  surface: '#FFFFFF',        // cards e containers
  border: '#E2E8F0',         // bordas finas (1px), estrutura
  borderStrong: '#CBD5E1',   // bordas de modais/popovers
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  // Cor de destaque para gamificação (streak, progresso) — reaproveita o primary
  // para não introduzir uma paleta paralela; variação de opacidade/tint é suficiente.
};
```

```ts
// shared/theme/typography.ts
// Fonte: Plus Jakarta Sans. ATENÇÃO: pesos leves (300) valem para telas de apresentação/
// marketing, mas para o público idoso/polimedicado, priorizar peso 500-600 em qualquer
// texto que carregue informação crítica (nome do remédio, horário, dose) — legibilidade
// tem prioridade sobre a estética editorial nesses pontos.
export const typography = {
  headingLg: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 24, lineHeight: 32 },
  headingMd: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 18, lineHeight: 24 },
  bodyLg: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, lineHeight: 26 },
  bodyMd: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 22 },
  label: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  // Uso crítico (dose, horário, nome do medicamento em destaque): sempre 500+ de peso,
  // nunca 300, independente do que o DESIGN.md original sugira para telas de marketing.
};
```

```ts
// shared/theme/spacing.ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 32, xl: 48, xxl: 80 };
export const radius = { sm: 4, md: 8, full: 9999 };
```

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

### O que evitar

- Não usar `style={{ ... }}` inline exceto para valores verdadeiramente dinâmicos (ex: cor que
  muda conforme status de uma dose atrasada).
- Não introduzir Tailwind, NativeWind, styled-components ou emotion sem o usuário pedir
  explicitamente — a preferência já foi definida.
- Não misturar lógica de estilo condicional complexa dentro do JSX; extrair para uma função
  `getContainerStyle(status)` no próprio arquivo de estilos ou no componente.
