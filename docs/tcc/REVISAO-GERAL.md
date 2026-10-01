# TCC: o que falta (guia único)

> **Conferido em 01/10, 11:58**, contra `TCC Gabriel Steffens Atualizado 01_10.docx.pdf` (91
> páginas). Figura 8 inserida e no tamanho certo, seção 4.7 no lugar, e os acertos da manhã
> (capítulo 6, p.16, comentários dos Quadros 25 e 26, Figura 12, Abstract, 2.7.3) estão certos. O
> histórico das revisões fica no git.
>
> **Falta:** 1 a 5 (acertos pontuais) → 6 (números de página) → exportar PDF → 8 (conferência). O
> 7 fica para o dia da defesa.

---

## 1. Sumário sem a 4.7 (p.15)

Falta a linha **"4.7 USO DE INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO.....79"**, entre a 4.6.5 e o
5. RESULTADOS, no mesmo estilo da 4.6 (sem negrito, por ser seção de nível 2).

## 2. Lista de siglas sem EAS e USB (p.9 e 10)

A IA entrou. Faltam as duas que a 4.7 também usa.

- **EAS:** *Expo Application Services*, entre CTO e eHealth.
- **USB:** *Universal Serial Bus* (Barramento Serial Universal), entre UNIDAVI e UX.

## 3. Ajustes no texto da 4.7 (p.79)

- "seguisse as decisões e escopo do projeto" → "seguisse as decisões e **o** escopo do projeto".
- "pela checagem de tipos, análise estática do código e por rotinas" → "pela checagem de tipos,
  **pela** análise estática do código e por rotinas".
- "alinhamento ao design do produto" → *design* em **itálico**, como nas outras duas ocorrências da
  seção.

## 4. Referências (p.87 a 90)

- **FIGMA** ficou sem o ano no fim. Está "Acesso em: 1 out." e fica "Acesso em: 1 out. **2026.**".
- **Página quase vazia na p.89.** Depois de NIELSEN há uma quebra de página, e NORMAN começa no
  topo da p.90. Apagar a quebra que ficou depois de NIELSEN.
- **Espaço entre referências desigual.** O padrão é uma linha em branco entre cada uma. Ficaram
  com espaço menor EXPO, FIGMA, GOOGLE e IBM entre si, MEDISAFE, META e MICROSOFT entre si, e NORMAN e
  OSTERBERG. Vale selecionar a lista inteira e aplicar o mesmo espaçamento de uma vez.

## 5. Reticências dos Quadros 11 e 13 (p.55 e 57)

Nas linhas `// ...` (linha 10 do Quadro 11 e linha 13 do Quadro 13) o `//` ficou em itálico e as
reticências não. Pôr o `...` em itálico também.

## 6. Números de página

Conferidos entrada por entrada contra o PDF das 11:58, já com a Figura 8 e a 4.7. Trocar só estes; o
resto já está certo.

**Sumário**

| Entrada | Está | Fica |
|---|---|---|
| 4. DESENVOLVIMENTO | 42 | 43 |
| 4.1 VISÃO GERAL DA APLICAÇÃO E DELIMITAÇÃO DO ESCOPO | 42 | 43 |
| 4.2.1 Requisitos Funcionais | 43 | 44 |
| 4.2.2 Requisitos Não Funcionais | 46 | 47 |
| 4.3 REGRAS DE NEGÓCIO | 47 | 48 |
| 4.3.1 Integridade do Registro Clínico | 47 | 48 |
| 4.3.2 Controle de Estoque | 48 | 49 |
| 4.3.3 Modelagem da Posologia | 48 | 49 |
| 4.3.4 Notificações e Lembretes | 48 | 49 |
| 4.3.5 Sincronização de Dados | 49 | 50 |
| 4.3.6 Cálculo de Adesão | 49 | 50 |
| 4.4 ARQUITETURA DE SOFTWARE | 51 | 52 |
| 4.4.1 Decisão Estrutural | 51 | 52 |
| 4.4.2 Camada de Domínio | 51 | 52 |
| 4.4.3 Camada de Dados | 52 | 53 |
| 4.4.4 Camada de Apresentação | 52 | 53 |
| 4.4.5 Stack Tecnológica | 52 | 53 |
| 4.4.6 Sincronização e Consistência Eventual | 53 | 54 |
| 4.4.7 Trilha de Auditoria e os Três Estados da Dose | 55 | 56 |
| 4.4.8 Garantia de Entrega do Alarme | 56 | 57 |
| 4.5 MODELO DE DADOS | 58 | 59 |
| 4.6 JORNADA E EXPERIÊNCIA DO USUÁRIO | 65 | 66 |
| 4.6.1 Primeiro Acesso | 65 | 66 |
| 4.6.2 Cadastro de Medicamentos | 66 | 67 |
| 4.6.5 Acessibilidade e Linguagem Visual | 75 | 76 |
| 4.7 USO DE INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO | (nova) | 79 |
| 5. RESULTADOS | 79 | 80 |
| 5.1 VALIDAÇÃO DA ARQUITETURA OFFLINE-FIRST | 79 | 80 |
| 5.2 AJUSTES DECORRENTES DA VALIDAÇÃO | 79 | 80 |
| 5.3 CONFIABILIDADE DO ALARME | 81 | 82 |
| 5.4 ATENDIMENTO AOS OBJETIVOS | 81 | 82 |
| 6. CONCLUSÃO | 83 | 84 |
| 6.1 TRABALHOS FUTUROS | 84 | 85 |
| REFERÊNCIAS | 86 | 87 |

A 4.2 LEVANTAMENTO DE REQUISITOS fica em 43 (o título está no pé da p.43), e a 4.6.3 e a 4.6.4
continuam em 70 e 73.

**Lista de quadros:** do **Quadro 3 ao Quadro 24, somar 1** (Quadro 3: 44 → 45 ... Quadro 24: 65 →
66), **Quadro 27: 76 → 77** e **Quadro 28: 80 → 81**. Os Quadros 1, 2, 25 e 26 já estão certos.

**Lista de figuras:** **Figura 1: 54 → 55**, **Figura 2: 59 → 60** e **Figura 3: 66 → 67**. Da
Figura 4 à 12 já está certo.

Os itens 1 a 5 não mudam a paginação. A quebra da p.89 fica dentro das Referências e não mexe no
Sumário.

## 7. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 8. Conferência final

Depois dos itens 1 a 6, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro tudo de novo.
