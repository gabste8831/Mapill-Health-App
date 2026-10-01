# TCC: o que falta (guia único)

> **Conferido em 01/10, 14:38**, contra `TCC Gabriel Steffens Atualizado 01_10.docx.pdf` (90
> páginas). Sumário e listas com os 123 números certos e títulos idênticos aos do corpo, remissões
> a quadros, figuras e seções todas válidas, quadros de código iguais ao código-fonte, contagens do
> texto conferidas e figuras de acordo com as legendas. O histórico das revisões fica no git.
>
> **Falta:** A (itálicos) → exportar PDF → 2 (conferência). O 1 fica para o dia da defesa. O espaço
> entre algumas referências (EXPO, FIGMA, GOOGLE, MEDISAFE, META, NIELSEN e NORMAN) segue um pouco
> menor que o das demais, acabamento opcional.

---

## A. Itálicos que faltam (não mexem na paginação)

- **Sumário (p.13 e 14):** MHEALTH em itálico nas entradas 2.1, 2.3 e 2.10, como já está nos
  títulos do corpo.
- **Título da 2.6 (p.30) e a entrada dela no Sumário (p.14):** CLEAN ARCHITECTURE em itálico, como
  já está na 4.4.1 e como o Sumário faz com *Clean Code* na 2.6.2.
- **Lista de siglas (p.9):** a sigla "eHealth" em itálico, como já está "mHealth" logo abaixo.

## B. Para decidir (opcional)

Os Quadros 16 a 24 não listam a coluna **server_updated_at**, que existe nas nove tabelas da base
remota e é o instante de chegada que a seção 4.4.6 descreve no recebimento. A omissão se defende,
porque os quadros mostram o modelo comum às duas bases, mas a 4.5 diz que as tabelas são "definidas
tanto na base local SQLite quanto na base remota PostgreSQL". Acrescentar a linha nos nove quadros
mudaria a paginação a partir da p.60.

## 1. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 2. Conferência final

Depois do item A, e de novo depois do item 1, no dia da defesa, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro tudo de novo.
