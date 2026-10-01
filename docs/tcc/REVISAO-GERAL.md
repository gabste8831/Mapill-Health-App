# TCC: o que falta (guia único)

> **Conferido em 01/10, 13:43**, contra `TCC Gabriel Steffens Atualizado 01_10.docx (1).pdf` (91
> páginas). Texto, siglas, quadros, figuras e a seção 4.7 estão certos. O histórico das revisões fica
> no git.
>
> **Falta:** 1 (página em branco) → 2 (acabamentos) → 3 (números de página) → exportar PDF → 5
> (conferência). O 4 fica para o dia da defesa.

---

## 1. Página em branco depois do Sumário (p.16 do PDF)

A linha nova da 4.7 empurrou as linhas vazias do fim do Sumário para uma página nova, que saiu
inteira em branco, entre o Sumário e a Introdução. Apagar as linhas vazias depois de
"REFERÊNCIAS.....86". Depois de exportar, conferir que a Introdução continua com o número **16** no
topo, porque a tabela do item 3 parte disso.

## 2. Acabamentos

- **FIGMA (Referências):** termina em "Acesso em: 1 out. 2026" sem o ponto final.
- **Espaço entre referências:** ainda desigual em três trechos. EXPO e FIGMA estão coladas, sem
  linha em branco, e FIGMA, GOOGLE, MEDISAFE, META, NIELSEN e NORMAN têm um espaço menor que o das
  demais. Selecionar a lista inteira e aplicar o mesmo espaçamento resolve de uma vez.
- **Sumário, linha da 4.7:** o pontilhado saiu em negrito, e nas outras seções de nível 2 ele é
  normal.

## 3. Números de página

Conferidos de novo contra o PDF das 13:43, pelo número impresso no topo de cada página. A tabela
não mudou. Ainda não foi aplicada, e é o que falta. Trocar só estes; o resto já está certo.

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
| 4.7 USO DE INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO | 79 | 79 |
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


## 4. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 5. Conferência final

Depois dos itens 1 a 3, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro tudo de novo.
