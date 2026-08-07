# Arquitetura — Mapill

Baseado em Clean Architecture (Martin, 2019) e princípios SOLID, adaptado para
React Native + Expo. Objetivo: nenhuma tela conhece SQL, nenhuma regra de negócio
conhece React.

## Estrutura de pastas sugerida

```
src/
├── domain/              # Regras de negócio puras, sem dependência de RN/SQLite
│   ├── entities/        # Medication, Prescription, DoseSchedule, IntakeLog, InventoryItem...
│   ├── use-cases/       # RegisterIntake, CalculateInventory, ScheduleNextDose...
│   └── ports/           # Interfaces de repositório (contratos, sem implementação)
│
├── data/                # Implementações concretas dos ports
│   ├── local/           # SQLite: queries, migrations, DAOs
│   ├── remote/          # Supabase client, sync service
│   └── repositories/    # Implementa os ports do domain, decide local-first + sync
│
├── presentation/        # Telas e componentes
│   ├── screens/
│   ├── components/
│   └── navigation/
│
├── shared/               # Utils, tipos compartilhados, constantes
└── notifications/        # Camada de agendamento nativo (expo-notifications)
```

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
