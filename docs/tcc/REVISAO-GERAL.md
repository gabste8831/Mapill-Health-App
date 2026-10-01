# TCC: o que falta (guia único)

> **Conferido em 01/10, 14:38**, contra `TCC Gabriel Steffens Atualizado 01_10.docx.pdf` (90
> páginas). Sumário e listas com os 123 números certos e títulos idênticos aos do corpo, remissões
> a quadros, figuras e seções todas válidas, quadros de código iguais ao código-fonte, contagens do
> texto conferidas e figuras de acordo com as legendas. O histórico das revisões fica no git.
>
> **Falta:** A (itálicos) e B (coluna nos Quadros 16 a 24) → exportar PDF → números de página,
> que eu recalculo → 2 (conferência). O 1 fica para o dia da defesa. O espaço
> entre algumas referências (EXPO, FIGMA, GOOGLE, MEDISAFE, META, NIELSEN e NORMAN) segue um pouco
> menor que o das demais, acabamento opcional.

---

## A. Itálicos que faltam (não mexem na paginação)

- **Sumário (p.13 e 14):** MHEALTH em itálico nas entradas 2.1, 2.3 e 2.10, como já está nos
  títulos do corpo.
- **Título da 2.6 (p.30) e a entrada dela no Sumário (p.14):** CLEAN ARCHITECTURE em itálico, como
  já está na 4.4.1 e como o Sumário faz com *Clean Code* na 2.6.2.
- **Lista de siglas (p.9):** a sigla "eHealth" em itálico, como já está "mHealth" logo abaixo.

## B. Coluna server_updated_at nos Quadros 16 a 24

A coluna existe nas nove tabelas da base remota desde a correção de 25/09 descrita na 5.2, e os
quadros ainda não a listam. Em cada um dos nove quadros, inserir uma linha **entre updated_at e
deleted_at**, com a mesma formatação das outras (nome normal, tipo em itálico):

| Campo | Tipo | Descrição |
|---|---|---|
| server_updated_at | *timestamptz* | Data e hora de chegada do registro à base remota, usada no recebimento da sincronização |

A descrição é a mesma nos nove. Os quadros afetados são 16 (medications), 17 (prescriptions), 18
(dose_schedules), 19 (intake_logs), 20 (inventory_items), 21 (inventory_adjustments), 22
(appointments), 23 (patient_profiles) e 24 (consent_records).

**Isso muda a paginação.** Depois de inserir, exportar o PDF antes de mexer nos números, que eu
recalculo o Sumário e as listas a partir dele. Vale conferir também que nenhum quadro se partiu
entre duas páginas e que a fonte continua colada a cada um.

## 1. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 2. Conferência final

Depois dos itens A e B, e de novo depois do item 1, no dia da defesa, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro tudo de novo.
