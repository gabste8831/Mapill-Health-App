# TCC: o que falta (guia único)

> **Conferido em 30/09, 21:29**, contra `TCC Gabriel Steffens Atualizado 30_09.docx.pdf` (89
> páginas). Texto, referências, itálicos, pré-textuais e as Figuras 10, 11 e 12 estão certos. O
> histórico das revisões fica no git.
>
> **Falta:** 1 (título do capítulo 6) → 2 (Figura 8) → 3 (números de página) → exportar PDF → 5
> (conferência). O 4 fica para o dia da defesa.

---

## 1. Título do capítulo 6 (p.83)

Está **"6. CONFCLUSÃO"**, com um F a mais. No Sumário está certo.

## 2. Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.72)

É a única que ainda usa a imagem de reserva. Três capturas lado a lado, na mesma altura e com
espaçamento igual, do mesmo aparelho, com a barra de status limpa, sem moldura de celular e com os
dados da base de demonstração do [`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md).

1. **Tela do alarme sobre a tela de bloqueio.**
2. **Notificação com os botões de ação**, Tomei e Pulei. Só a notificação comum tem botões, e o
   Adiar existe apenas na tela cheia do alarme. Para este print, usar um medicamento com o lembrete
   no modo **notificação**, e não alarme.
3. **Tela do alarme depois do adiamento, com dois medicamentos.** Mostra o agrupamento das doses do
   mesmo horário em um único aviso e, sem o botão Adiar, que o adiamento é oferecido uma vez só.

**Manter o tamanho da imagem de reserva.** Se a figura nova ficar mais alta, a fonte desce para a
p.73 e todos os números a partir daí andam; aí é só me mandar o PDF de novo.

## 3. Números de página

Conferidos entrada por entrada contra o PDF das 21:29. Supondo que a Figura 8 não mude de tamanho,
trocar só estes; o resto já está certo.

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

A 4.2 LEVANTAMENTO DE REQUISITOS fica em 43 (o título está no pé da p.43).

**Lista de quadros:** do **Quadro 3 ao Quadro 24, somar 1** (Quadro 3: 44 → 45 ... Quadro 24: 65 →
66), e **Quadro 27: 76 → 77**. Os Quadros 1, 2, 25, 26 e 28 já estão certos.

**Lista de figuras:** **Figura 1: 54 → 55**, **Figura 2: 59 → 60** e **Figura 3: 66 → 67**. Da
Figura 4 à 12 já está certo.

## 4. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 5. Conferência final

Depois dos itens 1 a 3, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro a Figura 8 e os números de página.
