# Arquitetura — Mapill

Baseado em Clean Architecture (Martin, 2019) e princípios SOLID, adaptado para
React Native + Expo. Objetivo: nenhuma tela conhece SQL, nenhuma regra de negócio
conhece React.

## Estrutura de pastas (real, não sugerida)

```
src/
├── app/                 # Rotas do expo-router — o nome do arquivo É a URL
│   ├── (abas)/          # Grupo de rotas: os parênteses tiram o segmento da URL
│   └── cadastro/        # Sobe como modal por cima das abas
│
├── domain/              # Regras de negócio puras, sem dependência de RN/SQLite
│   ├── entities/        # Medication, Prescription, DoseSchedule, IntakeLog, InventoryItem...
│   ├── use-cases/       # RegisterIntake, CorrectIntake, SnoozeDoseAlarm...
│   └── ports/           # Interfaces de repositório (contratos, sem implementação)
│
├── data/                # Implementações concretas dos ports
│   ├── local/           # SQLite: database, migrations
│   ├── remote/          # Supabase client, auth gateway
│   └── repositories/    # Implementa os ports do domain, decide local-first + sync
│
├── telas/               # Uma pasta por tela: Login, Inicio, FichaDeSaude, Consentimento,
│   │                    # EscolhaDeCadastro, EmConstrucao
│   └── <Tela>/componentes/   # Componentes usados só por aquela tela
│
├── ui/                  # Componentes reutilizáveis por qualquer tela (kit + barrel index.ts)
├── hooks/               # Hooks compartilhados
├── shared/              # Tema e utilitários
└── notifications/       # Camada de agendamento nativo (expo-notifications) — ainda não existe
```

### Convenção de nomenclatura

**Domínio e dados em inglês; telas e rotas em português.** O núcleo técnico acompanha o
vocabulário das libs e do artigo; a camada onde se navega no dia a dia acompanha o idioma de
quem desenvolve. Nome vago é corrigido em qualquer idioma — `EntryChoiceScreen` virou
`EscolhaDeCadastroScreen` porque não dizia o que era.

O nome do arquivo tem que dizer o que ele exporta. `animated-icon.tsx` exportando
`AnimatedSplashOverlay` é o tipo de coisa que faz o projeto parecer maior e mais confuso do
que é.

### O que não é livre para renomear

- `src/app/**`: roteamento por arquivo. O nome do arquivo é a rota, `_layout.tsx` é convenção,
  e os parênteses de `(abas)` marcam um grupo que não vira segmento de URL.
- Sufixos `.web.tsx` / `.android.tsx` / `.ios.tsx`: resolução por plataforma do Metro.
- `.styles.ts` co-localizado: convenção do projeto, ver `styling.md`.

## Comentários

Comentário existe para registrar **por que**, nunca **o que** — o código já diz o que faz.

- Terceira pessoa, descrevendo o sistema. Nada de se dirigir a um leitor ("usar junto com",
  "copiar esse padrão", "preencha com", "não esquecer de").
- Nada de referência a processo dentro do código: bloco do plano, número de sprint, ou citação
  a arquivo de planejamento. Código é código; plano é `docs/PLANO-DE-DESENVOLVIMENTO.md`.
- Uma a três linhas. Se precisa de parágrafo para explicar, normalmente o problema é o nome da
  função ou o tamanho dela.
- Vale comentar: restrição externa (limitação do SQLite, comportamento do RN), base legal,
  decisão de produto que o código sozinho não revela, e armadilha que já mordeu.
- Não vale comentar: o óbvio, o histórico da mudança (isso é o commit), ou a intenção futura
  sem um TODO concreto.

## Regra de ouro (SRP)

Cada arquivo/módulo tem **uma única razão para mudar**:
- Um `use-case` muda só se a regra de negócio mudar.
- Um `repository` muda só se a forma de persistir/sincronizar mudar.
- Uma `screen` muda só se o layout/fluxo visual mudar.

Se ao adicionar uma feature você perceber que precisa mexer em lógica de agendamento
E em estilo de botão no mesmo arquivo, é sinal de que a separação de camadas quebrou —
pare e refatore antes de continuar.

## Fluxo de uma escrita (ex: confirmar dose tomada)

1. `presentation/screens` chama um `use-case` (ex: `RegisterIntake.execute()`)
2. O `use-case` chama o `port` de repositório (interface), sem saber se é SQLite ou Supabase
3. O `repository` (em `data/repositories`) escreve **primeiro no SQLite local**, retorna
   sucesso imediato pra UI
4. O `repository` enfileira o registro para sincronização assíncrona com Supabase
   (ver `sync-and-offline.md`)

## Clean Code — convenções mínimas

- Nomes de variáveis/funções em português ou inglês — escolha um idioma e mantenha
  consistente no projeto todo (recomendação: inglês para código, português só em textos de UI).
- Nunca números mágicos: `const MAX_DOSE_TOLERANCE_MINUTES = 30` em vez de `30` solto no código.
- Nenhuma função de use-case deve ultrapassar responsabilidade única — se o nome precisa de "e"
  ("registra dose E atualiza estoque"), considere separar em dois use-cases compostos.
