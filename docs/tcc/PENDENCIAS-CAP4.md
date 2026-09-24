# Pendências do Capítulo 4

> **Atualizado em 24/09/2026.** A edição agora é feita no Google Docs.
>
> **Retorno do orientador (24/09).** A estrutura do capítulo foi aprovada. Os ajustes pedidos
> são de formatação: código passa a ser quadro com borda, e todo quadro ou figura fica na mesma
> página que seu título e sua fonte, reduzindo a fonte do quadro ou dividindo-o em dois se
> necessário.

---

## 1. Pendente

### 1.1 Código em quadro

**Conferido em 24/09, 15h.** Os blocos de código até a 4.6.4 já estão em tabela, mas a partir do
segundo código da 4.4.7 os títulos ficaram deslocados uma posição, e os quadros do modelo de dados
ainda não foram renumerados.

**Formato.** Tabela 1×1 com borda de ½ pt. Código em Courier New 10, todo em preto, palavras
reservadas em negrito, comentários em itálico, numeração de linhas e recuo preservados. Título
acima ("Quadro N - ..."), "Fonte: elaborado pelo autor." abaixo. A frase anterior cita o número
("conforme o Quadro N."), com Q maiúsculo.

**A regra da numeração.** Quadros são numerados pela ordem em que aparecem no documento, contando
todos. Os nove do modelo de dados ficam entre a 4.4.8 e a 4.6.3, e por isso os códigos da 4.6
são 25, 26 e 27.

| Quadro | Seção | Código | Título correto | Estado |
|---|---|---|---|---|
| 11 | 4.4.6 | LWW | Resolução de conflito de sincronização pelo critério *Last-Write-Wins* | ✅ |
| 12 | 4.4.7 | `IntakeLog` | Estrutura do registro de ingestão de dose | ✅ |
| 13 | 4.4.7 | `execute(...)` | Correção retroativa de um registro de dose | 🔧 está como "Quadro 12 - Estrutura..." |
| 14 | 4.4.8 | `jaEstaEmCena` | Verificação de alarme já exibido | 🔧 está como "Quadro 13 - Correção..." |
| 15 | 4.4.8 | `fecharTelaDoAlarme` | Encerramento da tela do alarme no módulo nativo | 🔧 está como "Quadro 14 - Verificação..." |
| 16 a 24 | 4.5 | tabelas do banco | Os mesmos títulos de hoje | 🔧 ainda numerados 11 a 19 |
| 25 | 4.6.3 | `ACAO_TOMEI` | Ações do alarme de dose disponíveis na notificação | 🔧 está como "Quadro 15 - Encerramento..." |
| 26 | 4.6.4 | `naoVenceuNemFoiRespondida` | Critério de exclusão de doses no cálculo de adesão | 🔧 está como "Quadro 16 - Verificação..." |
| 27 | 4.6.5 | `azulLaranja` | Definição de um conjunto de cores de estado | ⬜ ainda fora de tabela |

**As frases que apresentam cada quadro.** Troca só no final da frase.

| Antes do | Hoje termina em | Passa a terminar em |
|---|---|---|
| 12 | "...na estrutura da entidade:" | "...na estrutura da entidade, conforme o Quadro 12." |
| 13 | "...no momento da gravação:" | "...no momento da gravação, conforme o Quadro 13." |
| 14 | "...o custo de cada erro possível" (sem ponto) | "...o custo de cada erro possível, conforme o Quadro 14." |
| 15 | "...pela reprodução do som." | "...pela reprodução do som, e o Quadro 15 apresenta a solução adotada." |
| 16 a 24 | "A figura 2 apresenta... o quadro 11 contempla..." | "A Figura 2 apresenta... os Quadros 16 a 24 contemplam o esquema completo do modelo de dados." |
| 25 | "...conforme o trecho a seguir." | "...conforme o Quadro 25." |
| 26 | "...apresentada na seção 4.3.6." | "...apresentada na seção 4.3.6 e detalhada no Quadro 26." |
| 27 | "O trecho a seguir apresenta um dos conjuntos..." | "O Quadro 27 apresenta um dos conjuntos..." |

**Conferir no Google Docs.** No `.md` exportado os quadros 12 em diante aparecem sem numeração
de linhas. Pode ser só a exportação, que não leva lista numerada para dentro de tabela, mas vale
confirmar que os números aparecem como no Quadro 11.

**Depois de tudo.** Atualizar a lista de quadros no pré-textual.

### 1.2 Quadro, título e fonte na mesma página

Vale para todos os quadros e figuras. No título, marcar "Manter com o próximo" (Formatar,
Espaçamento entre linhas e parágrafos, Espaçamento personalizado). Na tabela, desmarcar
"Permitir que a linha ultrapasse as páginas". Quadro grande demais tem a fonte reduzida para
10 pt e, se ainda não couber, vira dois. Quebras de página manuais só no final, depois de toda a
renumeração.

### 1.3 Figuras 8, 10, 11 e 12

As Figuras 6, 7 e 9 já estão no documento. O que cada captura pendente mostra fica em
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md).

### 1.4 Sumário

As linhas vazias com estilo de título entre as seções são espaçamento intencional. Ao gerar o
sumário automático, conferir se elas entram como entradas vazias e, se entrarem, removê-las do
sumário.

---

## 2. Resolvido

### Rodada de 23/09

| Item | Situação |
|---|---|
| 4.6.3 e 4.6.4 inseridas no meio da 4.6.2 | Reposicionadas, e a 4.6.2 voltou a fechar com as Figuras 4, 5 e 6 |
| Frase de apresentação do código da 4.6.3 ausente | Incluída |
| Título "4.6..4" e título vazio abaixo dele | Corrigidos |
| Proporção entre arquitetura e usabilidade | Escrita a 4.6.5 Acessibilidade e Linguagem Visual, que dá contrapartida às seções 2.4.3, 2.4.4 e 2.4.5 |
| Remissão da 4.2 às "fases de desenvolvimento detalhadas na seção 4.5" | Remissão removida, a frase encerra em "de forma incremental" |
| Remissão da 4.5 à figura errada | Corrigida para Figura 2 |
| 4.4.9 Limitações Técnicas | Descartada por decisão do Gabriel |

A 4.6.5 foi conferida contra o código. O conjunto padrão de cores de estado reprova em
`scripts/conferir-cores-de-estado.mjs`, e o texto diz isso em vez de afirmar que todos passam.
A mensagem de dia completo conta doses tomadas e puladas, e o texto a apresenta como reforço do
registro, não do resultado.

### Rodada de 22/09

| Item | Situação |
|---|---|
| Subseções 4.4.1 a 4.4.5 reunidas em parágrafo único | Separadas, cada uma com título próprio |
| Título da 4.5 absorvido pelo parágrafo da 4.4.8 | Restaurado |
| Parágrafo da 4.3.5 com estilo de título | Corrigido |
| Padrão de maiúsculas divergente entre capítulos | Padronizado em Title Case |
| Blocos de código da 4.4.6 e 4.4.8 com primeira linha fora da lista | Corrigidos |
| Código do Last-Write-Wins divergente do repositório | Corrigido, com o `SELECT` e o nome de coluna corretos |
| Afirmação sobre dezesseis rotinas de conferência | Corrigida para oito, que é o número real de rotinas que exercitam o domínio |

---

## 3. Fora do Capítulo 4

**Capítulo 5 Resultados.** Existe como título, sem conteúdo. É o próximo bloco de escrita.

**Remissões ao Capítulo 2.** A 4.4.3 remete à atomicidade da seção 2.9.1, e a 4.6.4 à
minimização da seção 2.10.2. Conferir se ambas sustentam a remissão.

**Acentuação no código-fonte.** A refatoração de comentários removeu acentos em parte do
projeto, e 77 arquivos misturam as duas grafias. Não afeta o artigo, exceto se novos trechos
de código forem citados a partir deles.
