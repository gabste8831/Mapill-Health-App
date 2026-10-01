# TCC: o que falta (guia único)

> **Conferido em 01/10, 10:30**, contra `TCC Gabriel Steffens Atualizado 01_10.docx.pdf` (89
> páginas). O histórico das revisões fica no git.
>
> **Falta:** 1 (seção 4.7) → 2 (Figura 8) → 3 (números de página) → exportar PDF → 5 (conferência).
> O 4 fica para o dia da defesa.

---

## Feitos em 01/10, a conferir no próximo PDF

Título "6. CONFCLUSÃO" (p.83), caixa branca sobre "segurança" (p.16), itálico nos comentários dos
Quadros 11, 13, 25 e 26, título da Figura 12 na lista, frase da reinicialização no Abstract, espaço
entre as referências META, MICROSOFT, NIELSEN e NORMAN, e o pontilhado da 2.7.3 no Sumário.

## 1. Seção 4.7, uso de inteligência artificial (depois da 4.6.5, antes do capítulo 5)

Entra no fim do capítulo 4, logo depois do parágrafo da gamificação (p.78). No fim do capítulo,
nenhuma remissão a seção existente muda de número. O texto não usa quadro nem figura, então a
numeração dos dois segue igual.

> **4.7 USO DE INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO**
>
> O desenvolvimento do projeto contou com o auxílio de ferramentas de inteligência artificial (IA).
> Na concepção das telas, etapa das primeiras ideias de *design*, o Google Stitch (Google, 2026)
> gerou propostas iniciais a partir de descrições textuais centradas no foco da aplicação, ajustadas
> no Figma (Figma, 2026) antes da implementação sobre o sistema de *design* próprio apresentado na
> seção 4.4.4.
>
> Na implementação, utilizou-se o Claude Code (Anthropic, 2026), um agente de IA que opera sobre o
> repositório e executa comandos no ambiente de desenvolvimento, empregado na escrita de código e no
> diagnóstico de defeitos. Para que o agente seguisse as decisões do projeto, foram escritos, no
> início do desenvolvimento, arquivos de instrução que ele consulta antes de cada operação para obter
> contexto. Esses arquivos registram a arquitetura adotada, a sincronização *offline-first*, as
> heurísticas de usabilidade, a validação de dados clínicos e as práticas de React Native, de modo
> que os planos de implementação, as rotinas e as revisões partissem das mesmas regras descritas
> neste capítulo.
>
> O ponto mais marcante foi a rotina de teste, na qual o agente atuou também na revisão de código
> (*code review*). Durante grande parte do desenvolvimento, as versões instaláveis foram compiladas em
> nuvem pelo EAS (*Expo Application Services*), cujo plano gratuito limita o número mensal de
> compilações, de modo que um erro descoberto só no aparelho custava uma compilação inteira e uma
> nova rodada de testes. Por isso, nenhuma versão era gerada sem passar antes pela checagem de tipos,
> pela análise estática do código e por rotinas de conferência, que exercitam as regras de domínio
> sem aparelho graças ao instante presente recebido como parâmetro, conforme a seção 4.4.2. A mesma
> verificação prévia foi mantida depois que a compilação passou a ser feita localmente, com
> instalação direta no aparelho por depuração USB. Defeitos encontrados no aparelho passaram a
> originar novas rotinas, tanto de regras da arquitetura quanto de alinhamento ao *design* do
> produto, para que não retornassem em versões seguintes.
>
> Na validação descrita no capítulo 5, o agente apoiou a montagem do roteiro de testes e a simulação
> do segundo dispositivo pela base remota, o que permitiu cenários mais completos, com mais recursos
> da aplicação acionados em menos tempo. A execução e a aprovação de cada cenário couberam ao autor,
> no aparelho físico.

**Junto com a seção**

- **Sumário:** nova linha "4.7 USO DE INTELIGÊNCIA ARTIFICIAL NO DESENVOLVIMENTO", depois da 4.6.5.
  O número sai depois de inserir a figura 8, no item 3.
- **Lista de siglas:** "EAS: *Expo Application Services*", entre CTO e eHealth, "IA: Inteligência
  Artificial", entre FK e IBM, e "USB: *Universal Serial Bus* (Barramento Serial Universal)", entre
  UNIDAVI e UX.
- **Referências**, em ordem alfabética:
  - depois de ALLSOPP: ANTHROPIC. **Claude Code**. 2026. Disponível em:
    https://www.anthropic.com/claude-code. Acesso em: 1 out. 2026.
  - depois de EXPO: FIGMA. **Figma**. 2026. Disponível em: https://www.figma.com. Acesso em: 1 out.
    2026.
  - depois de FIGMA: GOOGLE. **Stitch**. 2026. Disponível em: https://stitch.withgoogle.com. Acesso
    em: 1 out. 2026.

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

**Manter o tamanho da imagem de reserva**, que é o mesmo das Figuras 3 a 7. Se a figura nova ficar
mais alta, a fonte desce para a p.73 e todos os números a partir daí andam; aí é só me mandar o
PDF de novo.

## 3. Números de página

Conferidos entrada por entrada contra o PDF de 01/10. **A seção 4.7 vai empurrar o capítulo 5 em
diante**, então esta tabela vale só até a 4.6.5, e o resto eu recalculo no próximo PDF. Supondo
que a Figura 8 não mude de tamanho, trocar estes.

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
e salvar no editor, que corrompe o arquivo). Eu confiro a Figura 8, a seção 4.7, os acertos de 01/10 e os números de página.
