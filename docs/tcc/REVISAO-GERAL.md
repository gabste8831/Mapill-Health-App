# TCC: o que falta (guia único)

> **Conferido em 01/10, 10:30**, contra `TCC Gabriel Steffens Atualizado 01_10.docx.pdf` (89
> páginas). Figuras 1 a 7 e 9 a 12 inseridas e no tamanho certo, pré-textuais, siglas e o restante
> do texto estão certos. O histórico das revisões fica no git.
>
> **Falta:** 1 a 7 (correções pontuais) → 8 (Figura 8) → 9 (números de página) → exportar PDF →
> 11 (conferência). O 10 fica para o dia da defesa.

---

## 1. Título do capítulo 6 (p.83)

Continua **"6. CONFCLUSÃO"**, com um F a mais. No Sumário está certo.

## 2. Texto coberto na p.16

Na última linha do 1.1 PROBLEMA DE PESQUISA, um retângulo branco cobre o começo da palavra
"segurança", e no PDF sai só **"nça e confiabilidade..."**. É o mesmo tipo de caixa branca que esconde
o número nas p.3 a 5, e nesta página ficou por cima do texto. Apagar a caixa ou movê-la para o
rodapé, se ela estiver ali para esconder alguma coisa.

## 3. Comentários de código sem itálico

O padrão dos quadros pede comentário em itálico, e quatro linhas ficaram em fonte normal:

- **Quadro 25 (p.71)**, linha 4: `// Um adiamento só por horário.`
- **Quadro 26 (p.73)**, linha 1: `// O que fica de fora das contas, ...` (as duas linhas da quebra)
- **Quadro 11 (p.55)**, linha 10: `// ...`
- **Quadro 13 (p.57)**, linha 13: `// ...`

## 4. Título da Figura 12 diferente na lista (p.12)

A imagem mostra claro, alto contraste e escuro, nessa ordem, e a legenda no corpo (p.78) diz
**"Tela inicial nos temas claro, alto contraste e escuro"**. A Lista de Figuras ainda diz
"claro, escuro e de alto contraste". Trocar a entrada da lista pelo texto da legenda.

## 5. Abstract sem a frase da reinicialização (p.8)

O Resumo termina a parte do alarme com "e a entrega após a reinicialização mostrou-se dependente
da restrição de inicialização automática imposta pelo fabricante", e o Abstract não tem esse
trecho. Trocar:

> The dose alarm was verified with the device locked and in use, with the application present in or
> absent from the recent apps list.

por:

> The dose alarm was verified with the device locked and in use, with the application present in or
> absent from the recent apps list, and its delivery after a reboot proved dependent on the
> autostart restriction imposed by the manufacturer.

## 6. Espaço entre referências (p.87)

Todas as referências têm uma linha em branco entre si, menos **META e MICROSOFT** e **NIELSEN e
NORMAN**, que estão coladas. Entre MEDISAFE e META o espaço também sai menor que os demais.

## 7. Sumário: 2.7.3 sem pontilhado (p.14)

A entrada "2.7.3 Arquiteturas Multiplataforma Baseadas em Pontes Nativas: React Native e Expo"
encosta no número e sai **"Expo33"**, sem pontilhado. Quebrar o título em duas linhas, como já
está a 2.4, para o pontilhado e o 33 caberem na segunda.

## 8. Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.72)

É a única que ainda usa a imagem de reserva. Três capturas lado a lado, na mesma altura e com
espaçamento igual, do mesmo aparelho, com a barra de status limpa, sem moldura de celular e com os
dados da base de demonstração do [`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md).

1. **Tela do alarme sobre a tela de bloqueio.**
2. **Notificação com os botões de ação**, Tomei e Pulei. Só a notificação comum tem botões, e o
   Adiar existe apenas na tela cheia do alarme. Para este print, usar um medicamento com o lembrete
   no modo **notificação**, e não alarme.
3. **Tela do alarme depois do adiamento, com dois medicamentos.** Mostra o agrupamento das doses do
   mesmo horário em um único aviso e, sem o botão Adiar, que o adiamento é oferecido uma vez só.

**Manter o tamanho da imagem de reserva**, que é o mesmo das Figuras 3 a 7. Se a figura nova ficar
mais alta, a fonte desce para a p.73 e todos os números a partir daí andam; aí é só me mandar o
PDF de novo.

## 9. Números de página

Conferidos entrada por entrada contra o PDF de 01/10. Nada mudou desde o de 30/09. Supondo que a
Figura 8 não mude de tamanho, trocar só estes; o resto já está certo.

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

## 10. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

## 11. Conferência final

Depois dos itens 1 a 9, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro a Figura 8, a p.16 e os números de página.
