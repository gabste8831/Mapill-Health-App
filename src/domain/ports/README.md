# Ports

Interfaces de repositório usadas pelos use-cases. Nenhum port importa `expo-sqlite` ou
`@supabase/supabase-js` — quem implementa de verdade fica em `src/data/repositories`.

Pra uma entidade nova, segue o mesmo padrão:

```ts
export interface MedicationRepository extends Repository<Medication> {}
```
