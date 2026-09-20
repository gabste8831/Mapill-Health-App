# Correções e acréscimos ao Capítulo 4

> Levantamento de **16/09/2026**, feito lendo o Capítulo 4 do
> `TCC Gabriel Steffens Atualizado 11_09.docx.md` contra o código do repositório.
>
> **Como usar:** cada item traz o que está no artigo hoje, o texto de substituição pronto e a razão
> da mudança.
>
> **Estado - conferido em 16/09 contra `TCC Gabriel Steffens Atualizado 11_09.docx (1).md`:**
> os itens **1, 2a, 3 e 5 já foram aplicados**. Restam o 2b, o 4, o 6, o 7 e o 8.

---

## Índice

| # | Onde | O que é | Tipo | Estado |
|---|---|---|---|---|
| 1 | Quadro 6, RF-26 | Diz "dois modos"; são três | 🔴 erro factual | ✅ **aplicado** |
| 2a | Quadro 9, RNF-04 | "Aditivas e reversíveis" | 🔴 erro factual | ✅ **aplicado** |
| 2b | §4.4.3 | O parágrafo ainda diz "estritamente aditivas" | 🔴 erro factual | ⬜ pendente |
| 3 | §4.6.2 | Citava a regra de código 11 | 🟡 referência | ✅ **resolvido** |
| 4 | §4.6.2 | Citava a seção 4.4.9 | 🟡 referência | ⚠️ ver nota |
| 5 | §4.3.5 | "Exclusão definitiva" contradizia a §4.3.1 | 🟡 contradição | ✅ **aplicado** |
| 6 | §4.6 + §4.4 | Quatro subseções novas + a 4.4.9 | 🟠 texto novo | ⬜ pendente |
| 7 | `texto-legal.ts` | O termo promete JSON; o app entrega ZIP/CSV | 🟡 código | ⬜ pendente |
| 8 | §4.3.1, §4.4.3, §4.4.6 | Três blocos de código | 📘 texto novo | ⬜ pendente |

### ⚠️ Dois pontos que a aplicação deixou em aberto

**1. A frase da §4.6.2 perdeu as duas referências.** Ela ficou assim:

> *"Configurações de lembrete determinam se o disparo ocorrerá por alarme sonoro ou por notificação
> comum."*

Você removeu tanto o "código 11" (que estava errado) quanto a "seção 4.4.9" (que não existia) - o que
resolve os itens 3 e 4, mas deixa a frase **sem rastreabilidade**, diferente do resto do capítulo.
**Sugestão:** se criar a §4.4.9 (item 6), reponha como *"conforme a regra de negócio de código 16 e a
discussão da seção 4.4.9"*. Se não criar, use *"conforme a regra de negócio de código 16"*.

**2. A §4.3.5 ficou com um heading indevido.** O segundo parágrafo entrou como `###`, então o texto
"A exclusão ocorre em duas modalidades..." está marcado como **título de subseção**, e vai aparecer
no sumário automático do Word como se fosse uma seção nova. Precisa virar parágrafo comum, dentro da
4.3.5.

> Também notei que a versão aplicada juntou os parágrafos dois e três e cortou a menção ao art. 18 da
> LGPD. Funciona, mas a citação do artigo dava respaldo legal à afirmação - vale reconsiderar.

---

# PARTE I - CORREÇÕES

## 1. 🔴 RF-26 - número de modos de lembrete

**Onde:** Quadro 6 (Requisitos funcionais: lembretes), linha do código 26.

**SUBSTITUA:**

> | 26 | O sistema deve oferecer dois modos: alarme (som alto, ignora silencioso) e notificação |

**POR:**

> | 26 | O sistema deve oferecer três modos de lembrete por tratamento: alarme (som alto, ignora o silencioso), notificação comum e nenhum aviso |

**Por quê:** `src/domain/entities/prescription.ts:24` declara quatro valores -
`"alarm" | "notification" | "both" | "none"`. Três são oferecidos ao paciente; `both` foi removido da
interface em 05/09 e permanece no tipo apenas para ler tratamentos salvos antes da remoção, onde é
interpretado como `alarm`.

> 💡 **A razão da remoção vira material para a §4.4.9** (item 6). Foi um defeito real em aparelho:
> *"a dose confirmada pela notificação era descontada de novo pelo alarme, que seguia aberto com a
> lista de antes"* (`prescription.ts:8-22`). Dupla contagem de estoque por dois caminhos de resposta
> ao mesmo fato clínico.

---

## 2. 🔴 "Migrações estritamente aditivas"

**Onde:** dois lugares - Quadro 9 (RNF-04) e o parágrafo da §4.4.3.

### 2a. No Quadro 9

**SUBSTITUA:**

> | 04 | Migrações de banco devem ser aditivas e reversíveis por versão |

**POR:**

> | 04 | Migrações de banco devem ser sequenciais, versionadas e preservar o histórico clínico já registrado |

### 2b. Na §4.4.3

**SUBSTITUA:**

> estruturado em migrações sequenciais e estritamente aditivas, que apenas adicionam colunas ou
> tabelas, nunca removem ou renomeiam estruturas existentes. Essa restrição decorre da necessidade de
> preservar o histórico clínico de instalações já em uso, para as quais uma migração destrutiva
> representaria perda de dados de tratamento.

**POR:**

> estruturado em migrações sequenciais e versionadas por `PRAGMA user_version`, aplicadas de forma
> idempotente. A diretriz que rege sua escrita é a preservação do histórico clínico já registrado:
> colunas estruturais podem ser removidas ou renomeadas quando a evolução do modelo as torna
> inconsistentes, como ocorreu ao unificar nome e sobrenome em um único campo, mas nenhuma migração
> descarta dado de tratamento. Essa restrição decorre da necessidade de preservar o histórico de
> instalações já em uso, para as quais uma migração destrutiva representaria perda de dados
> clínicos.

**Por quê:** das 20 migrações, três removem ou renomeiam.

| Migração | Operação |
|---|---|
| `007-patient-full-name.ts:14-15` | `DROP COLUMN first_name`, `DROP COLUMN last_name` |
| `008-prescription-schedule.ts:16` | `DROP COLUMN frequency_minutes` |
| `014-appointment-place-and-professional.ts:46-55` | `RENAME COLUMN type TO title` + três `DROP COLUMN` |

A regra absoluta é falsa e verificável em trinta segundos por quem abrir a pasta. A regra com
critério é verdadeira, mais difícil de cumprir, e demonstra julgamento de engenharia. A 007 é o
melhor exemplo: as colunas eram `NOT NULL` sem default, e mantê-las quebraria a integridade da
tabela.

---

## 3. 🟡 Regra de negócio errada

**Onde:** §4.6.2, último parágrafo.

**SUBSTITUA:** `conforme a regra de negócio de código 11`

**POR:** `conforme a regra de negócio de código 16`

**Por quê:** a RN-11 é *"Um aviso por horário, não por dose"*. A regra sobre alarme versus
notificação é a **RN-16** - *"Compromisso avisa por notificação, nunca por alarme"*. O erro aponta
para uma regra que existe, só que a errada, e por isso não salta aos olhos numa releitura.

---

## 4. 🟡 Seção inexistente

**Onde:** §4.6.2, mesma frase do item 3.

**SUBSTITUA:** `e a discussão da seção 4.4.9`

**POR:** `e a discussão da seção 4.4.8`

**Por quê:** a §4.4 vai de 4.4.1 a 4.4.8.

> ⚠️ **Se você criar a §4.4.9** (item 6), mantenha a referência como está - ela deixa de ser órfã.

---

## 5. 🟡 "Exclusão definitiva" contradiz a §4.3.1

**Onde:** §4.3.5, que hoje tem um parágrafo só.

**APAGUE:**

> Conflitos de edição entre aparelhos diferentes são resolvidos pelo critério de *Last-Write-Wins* já
> apresentado na seção 2.9.3, sempre considerando o registro em sua totalidade, nunca mesclando
> campos isolados de versões diferentes. A exclusão de um registro, por sua vez, é propagada à nuvem
> antes de ser removida localmente, e de forma definitiva, e não apenas lógica, o que impede que um
> dado excluído pelo titular reapareça em uma sincronização posterior.

**COLE:**

> Conflitos de edição entre aparelhos diferentes são resolvidos pelo critério de *Last-Write-Wins*
> já apresentado na seção 2.9.3, sempre considerando o registro em sua totalidade, nunca mesclando
> campos isolados de versões diferentes.
>
> A exclusão ocorre em duas modalidades. A de um registro individual, como um tratamento encerrado,
> é lógica: a linha recebe um carimbo de exclusão e permanece na base, o que preserva o histórico de
> doses já registradas e permite propagar a remoção aos demais aparelhos, já que uma linha apagada
> desapareceria sem deixar registro e retornaria na sincronização seguinte. Já o direito de
> eliminação previsto no art. 18 da LGPD é físico: os registros são removidos da nuvem antes do
> aparelho, ordem que impede que a sincronização seguinte os traga de volta.
>
> Não há expurgo automático por decurso de prazo, e isso é deliberado. O histórico de adesão é o
> insumo do relatório levado à consulta, cujo intervalo costuma ser semestral, de modo que uma
> retenção curta inutilizaria a funcionalidade que justifica a aplicação. A eliminação permanece,
> assim, prerrogativa exclusiva do titular.

**Por quê:** a §4.3.5 dizia *definitiva*, a §4.3.1 diz *lógica*. São operações diferentes, e o código
faz as duas corretamente. O terceiro parágrafo resolve de uma vez a questão da retenção, que é
pergunta natural de banca e o artigo não respondia.

> **Sobre o volume**, se perguntarem: um paciente com quinze doses diárias acumula cerca de onze mil
> registros por ano, menos de dois megabytes - contra os 782 KB do catálogo CMED já embarcado e os 1
> a 3 MB de **uma única** foto de caixa. O peso real do aplicativo são os anexos, não o histórico.

---

## 7. 🟡 O termo de consentimento promete JSON; o app entrega ZIP com CSV

**Onde:** `src/telas/Consentimento/texto-legal.ts:190-192` - **é código, não o artigo.**

**SUBSTITUA:**

> "O arquivo sai em formato aberto (JSON), para você guardar onde quiser ou levar para outro
> serviço."

**POR:**

> "O arquivo sai como um pacote compactado (.zip) com uma planilha (.csv) por tipo de dado, que abre
> no Excel, no Google Planilhas ou no LibreOffice."

**Por quê:** `exportarDados.ts:84` gera um `.zip` com uma planilha CSV por tabela, mais um LEIA-ME. A
troca foi deliberada e está documentada na linha 88: *"O JSON cumpria a lei - 'formato de uso comum e
leitura por máquina' - mas [não servia a] quem quer abrir e olhar."* O histórico registra a mudança
em 05/09; o texto legal não acompanhou.

É o documento que descreve ao titular o formato em que ele receberá os próprios dados - divergência
aí é o tipo de detalhe que uma banca atenta à LGPD cobra.

---

# PARTE II - TEXTO NOVO

## 6. 🟠 Completar a §4.6 e criar a §4.4.9

A §4.6 abre prometendo percorrer o aplicativo *"do primeiro acesso ao acompanhamento de longo
prazo"*, mas termina na 4.6.2. Faltam quatro etapas, entre elas o alarme e o uso diário.

> **Titulação.** Os títulos abaixo seguem a convenção predominante do documento: subseção em negrito,
> Title Case, como "4.4.6 Sincronização e Consistência Eventual". A 4.6.1 e 4.6.2 ("Primeiro acesso",
> "Cadastro de medicamentos") estão em sentence case e são a exceção do capítulo - se quiser
> uniformizar, renomeie para **"4.6.1 Primeiro Acesso"** e **"4.6.2 Cadastro de Medicamentos"**.
>
> **Escopo.** Estas subseções descrevem a **experiência do paciente** e remetem ao mecanismo em vez
> de reexplicá-lo. A §4.3 continua sendo o lugar das regras e a §4.4 o da implementação - sem essa
> fronteira, a §4.6 repetiria o que o capítulo já afirmou.

### COLE ao fim da §4.6 - 4.6.3

> **4.6.3 Uso Diário e Registro de Doses**
>
> A tela inicial concentra a operação cotidiana do aplicativo e organiza o dia em três blocos, cuja
> ordem responde à urgência e não à cronologia. No topo aparecem as doses atrasadas, destacadas em
> cor de erro, seguidas da próxima dose prevista e, abaixo, das demais doses do dia. Essa hierarquia
> decorre de uma constatação simples: apresentadas em ordem cronológica, as doses vencidas ocupariam
> a posição de horário já passado e seriam percorridas sem atenção, justamente por estarem onde o
> paciente não espera encontrar pendência.
>
> Cada dose exibe seu estado visual e admite duas respostas, confirmar ou pular, ambas precedidas de
> confirmação explícita. A exigência não é acessória: o registro de ingestão é documento clínico, e
> um toque acidental produziria dado falso no histórico, contrariando a heurística de prevenção de
> erros discutida na seção 2.4.1. Os botões de ação aparecem apenas na próxima dose e nas atrasadas,
> uma vez que oferecer a confirmação de uma dose das vinte e duas horas às oito da manhã convidaria
> o paciente a registrar intenção, e não ingestão.
>
> Para quem passou o dia longe do aparelho, a confirmação em lote das doses atrasadas resolve em um
> gesto o que exigiria vários. Já um registro equivocado é corrigido tocando na própria dose, o que
> abre a troca de desfecho descrita na seção 4.4.7. A correção não apaga o registro anterior, mas
> gera um novo apontando para ele, de modo que o estoque é ajustado apenas pela diferença entre os
> dois estados.

### COLE - 4.6.4

> **4.6.4 Disparo e Resposta ao Alarme**
>
> O alarme é o ponto em que a aplicação deixa de ser consultada e passa a interromper, e nele se
> concentra a promessa central discutida na seção 4.1. O disparo é delegado ao gerenciador nativo de
> alarmes, conforme detalhado na seção 4.4.8, e por isso ocorre com o aplicativo encerrado e sem
> nenhum processo em memória.
>
> Com o aparelho bloqueado, o alarme apresenta uma tela em primeiro plano sobre a tela de bloqueio,
> exibindo o medicamento, a dose e o local de guarda, acompanhada de som em volume de despertador,
> que é o canal que atravessa o modo silencioso. A tela oferece as respostas diretas, confirmar,
> pular, adiar e silenciar, todas disponíveis sem desbloqueio, pois é essa a razão de existir do
> alarme e nenhuma delas revela informação além da que já está à vista. Entrar no aplicativo, no
> entanto, exige a identificação do usuário: ali estão o histórico completo, a ficha de saúde e os
> demais tratamentos, e a tela do alarme surge sobre o bloqueio sem que ninguém tenha se
> identificado. A distinção entre responder e acessar é, portanto, uma fronteira de privacidade, e
> não uma inconsistência de fluxo.
>
> Quando o aparelho está em uso, a interrupção em tela cheia seria desproporcional, e o sistema
> apresenta uma notificação com ações rápidas, cujo toque conduz à tela do horário. O adiamento é
> permitido uma única vez por horário, conforme a regra de negócio de código 12, após o que o botão
> deixa de ser oferecido. Doses de medicamentos diferentes marcadas para o mesmo horário compõem um
> único aviso, e não um por medicamento, pois quatro notificações idênticas em sequência ensinam o
> paciente a ignorar a primeira.

### COLE - 4.6.5

> **4.6.5 Acompanhamento e Análise de Adesão**
>
> Encerrado o ciclo diário, a aplicação oferece três superfícies de acompanhamento, cada uma
> respondendo a uma pergunta distinta. O calendário reúne doses e compromissos clínicos em uma mesma
> grade mensal, com marcação por tipo e filtros, e projeta doses futuras além do horizonte
> efetivamente gravado em banco, de modo que o paciente enxergue a continuidade do tratamento e não
> o limite técnico da geração de horários.
>
> A tela de adesão responde como tem sido o cumprimento do tratamento, em períodos de sete, trinta e
> noventa dias. O cálculo observa duas regras discutidas na seção 4.3.6: doses cujo horário ainda não
> chegou não entram na conta, e a ausência de doses vencidas resulta na indicação de que ainda não há
> o que medir, em vez de uma taxa de zero por cento. Os períodos oferecidos são uma janela de
> leitura, e não uma política de retenção, uma vez que os registros permanecem íntegros na base
> independentemente do intervalo consultado.
>
> O controle de estoque, por sua vez, responde por quanto tempo ainda há medicamento, percorrendo as
> doses efetivamente agendadas em vez de dividir a quantidade pela dose, o que erraria em posologias
> de dose variável ou com dias de pausa. Quando estoque e dose são contados em unidades
> incompatíveis, a previsão é recusada em vez de estimada. Por fim, o relatório em PDF consolida o
> período em documento portátil, gerado integralmente no aparelho e destinado à consulta médica, que
> é o momento em que o histórico de adesão sai do celular e cumpre sua finalidade.

### COLE - 4.6.6

> **4.6.6 Exercício dos Direitos do Titular**
>
> A jornada se encerra nas ações que a Lei Geral de Proteção de Dados assegura ao titular, reunidas
> na seção de conta e dados. A exportação entrega a totalidade dos registros em um arquivo compactado
> contendo uma planilha por tabela, acompanhado de uma folha explicativa que descreve o conteúdo de
> cada arquivo. O formato tabular foi escolhido em lugar de uma serialização estruturada porque ambos
> cumprem a exigência legal de formato de uso comum, mas apenas o primeiro é legível por quem não
> programa, e é ao paciente que o arquivo se destina.
>
> A exclusão é oferecida em dois níveis, apagar somente os dados de saúde, preservando ficha e
> consentimento, ou apagar tudo, o que desvincula a conta e devolve a aplicação ao estado de
> recém-instalada. Em ambos os casos a remoção é física, alcança os arquivos anexados e observa a
> ordem descrita na seção 4.3.5. A revogação do consentimento não constitui ação separada: em uma
> aplicação cuja única finalidade de tratamento é o próprio registro clínico do titular, revogar o
> consentimento e eliminar os dados são a mesma operação, e oferecer um botão que apenas retornasse
> o usuário à tela de aceite seria menos do que a lei exige.

### COLE ao fim da §4.4 - a subseção 4.4.9

Resolve de quebra a referência órfã do item 4.

> **4.4.9 Decisões de Remoção de Escopo**
>
> Nem toda decisão de projeto consiste em acrescentar. Em três ocasiões, funcionalidades que já
> estavam implementadas e operantes foram retiradas da aplicação, e o registro dessas remoções
> documenta um critério que a mera enumeração de requisitos não revela.
>
> A primeira foi o modo de lembrete que emitia simultaneamente alarme e notificação para o mesmo
> horário. O mecanismo funcionava, mas criava dois caminhos independentes para responder ao mesmo
> fato clínico, e o teste em aparelho revelou a consequência: uma dose confirmada pela notificação
> era novamente descontada do estoque pelo alarme, que permanecia aberto exibindo a lista anterior.
> A redundância pretendida já era obtida sem ele, pois o alarme permanece na bandeja após ser
> respondido.
>
> A segunda foi a frequência expressa em intervalo de horas. Todos os intervalos oferecidos dividiam
> o dia em partes iguais, de modo que a opção produzia exatamente o mesmo agendamento que a
> frequência diária com os horários equivalentes. Duas rotas para o mesmo destino não ampliam a
> expressividade do cadastro, apenas introduzem dúvida no momento da escolha.
>
> A terceira foi o preenchimento automático dos horários de dose a partir da frequência. Um campo
> previamente preenchido é aceito sem leitura por quem tem pressa, e o resultado seria a aplicação
> lembrar da dose no horário errado sem que nada denunciasse o equívoco. Exigir a digitação é mais
> custoso para o paciente e mais seguro para o tratamento, e essa troca é aceitável precisamente
> porque o cadastro ocorre uma vez e o lembrete, todos os dias.

---

## 8. 📘 Evidência de código nas seções 4.3 e 4.4

**Por que este item existe:** o capítulo tem hoje **dois blocos de código**, ambos na §4.4.7 e ambos
sobre o mesmo assunto. A §4.3 apresenta vinte regras de negócio sem um único trecho que mostre como
alguma delas é imposta. A §4.4.7 prova que o padrão funciona bem - ele só aparece uma vez.

Os três blocos abaixo seguem o mesmo formato: código numerado entre dois parágrafos. Nenhum passa de
dez linhas, e os três foram conferidos contra o repositório.

### 8.1 COLE ao fim da §4.3.1

> A restrição é imposta pela própria modelagem do domínio, e não por verificação em tempo de
> execução. O desfecho de uma dose é derivado do último registro de ingestão associado a ela, e a
> função que decide se um registro encerra a dose reconhece apenas dois dos três estados possíveis:

```
1. export type IntakeStatus = "confirmed" | "skipped" | "deferred";
2.
3. export function resolvesDose(status: IntakeStatus | null): boolean {
4.   return status === "confirmed" || status === "skipped";
5. }
```

> O estado `deferred` corresponde ao paciente que viu o aviso e escolheu decidir depois, e o valor
> nulo, à dose que ninguém respondeu. Como nenhum dos dois satisfaz a função, a dose permanece
> pendente e volta a ser apresentada, o que torna a aplicação estruturalmente incapaz de registrar
> como pulada uma dose que apenas não obteve resposta. A regra de negócio de código 01 não é, assim,
> uma verificação que poderia falhar, mas uma consequência do tipo de dado, distinção relevante em um
> sistema cujo histórico se pretende auditável, conforme discutido na seção 2.3.3.

**É o mais valioso dos três:** cinco linhas que convertem o argumento central do trabalho de uma
afirmação em uma demonstração.

### 8.2 COLE ao fim do parágrafo sobre persistência remota, na §4.4.3

> A ordem em que as tabelas são sincronizadas é declarada explicitamente, e não derivada
> alfabeticamente ou por conveniência de implementação:

```
1. export const TABELAS_SINCRONIZAVEIS = [
2.   // Independentes primeiro.
3.   "patient_profiles", "consent_records", "medications", "appointments",
4.   // Dependem de medications.
5.   "prescriptions", "inventory_items",
6.   // Dependem de prescriptions / inventory_items.
7.   "dose_schedules", "inventory_adjustments",
8.   // Depende de dose_schedules.
9.   "intake_logs",
10. ] as const;
```

> A sequência reproduz as dependências entre entidades: uma prescrição referencia um medicamento, um
> horário de dose referencia uma prescrição, e um registro de ingestão referencia um horário. Enviar
> um registro filho antes do registro pai produziria uma linha órfã no servidor, e recebê-los na
> ordem inversa produziria o mesmo efeito localmente. Declarar a ordem é o que mantém as duas bases
> referencialmente coerentes sem exigir transação distribuída, mecanismo indisponível entre um banco
> embarcado e um serviço remoto.

### 8.3 COLE após o parágrafo sobre Last-Write-Wins, na §4.4.6

> A identificação do que precisa ser enviado decorre da comparação entre dois carimbos de tempo
> mantidos em cada registro:

```
1. SELECT * FROM <tabela>
2.  WHERE synced_at IS NULL OR updated_at > synced_at
```

> O campo `synced_at` responde à pergunta "esta linha já foi enviada a partir deste aparelho?", e por
> ser uma pergunta local, nunca é transmitido ao servidor. Um registro criado offline apresenta o
> campo nulo; um registro editado após o último envio apresenta data de atualização posterior à de
> sincronização. Ambos são capturados pela mesma condição, incluindo os registros marcados como
> excluídos, cuja remoção precisa alcançar o servidor sob pena de retornar na sincronização seguinte.
> É esse critério que sustenta a operação offline-first descrita na seção 2.8: a aplicação não mantém
> fila de operações pendentes, mas deriva o que falta enviar do próprio estado dos dados, de modo que
> uma interrupção a qualquer momento não produz perda nem duplicação.

### Onde **não** colocar código

| Seção | Por quê |
|---|---|
| **4.1** | É delimitação de escopo - código ali desloca o foco |
| **4.2** | Requisitos são o que o sistema deve fazer, não como |
| **4.5** | Os nove quadros já cumprem o papel de evidência |
| **4.6** | É a experiência do paciente; código quebraria a narrativa |

Com os três blocos, o capítulo passa de dois para cinco trechos de código, distribuídos entre regra
de negócio, persistência e sincronização.

---

# PARTE III - REFERÊNCIA

## Acompanhamento

Conferido em 16/09 contra `TCC Gabriel Steffens Atualizado 11_09.docx (1).md`.

| # | Item | Estado |
|---|---|---|
| 1 | RF-26: três modos de lembrete | ✅ aplicado |
| 2a | RNF-04 no Quadro 9 | ✅ aplicado |
| 2b | Parágrafo da §4.4.3 ainda diz "estritamente aditivas" | ⬜ |
| 3 | "código 11" removido | ✅ resolvido - mas ver nota sobre repor a 16 |
| 4 | "seção 4.4.9" removida | ✅ resolvido - mas ver nota |
| 5 | Parágrafo da §4.3.5 | ✅ aplicado - ⚠️ corrigir o `###` indevido |
| 6a | §4.6.3 Uso Diário e Registro de Doses | ⬜ |
| 6b | §4.6.4 Disparo e Resposta ao Alarme | ⬜ |
| 6c | §4.6.5 Acompanhamento e Análise de Adesão | ⬜ |
| 6d | §4.6.6 Exercício dos Direitos do Titular | ⬜ |
| 6e | §4.4.9 Decisões de Remoção de Escopo | ⬜ |
| 7 | `texto-legal.ts` - ZIP/CSV | ⬜ |
| 8a | Bloco `resolvesDose` na §4.3.1 | ⬜ |
| 8b | Bloco `TABELAS_SINCRONIZAVEIS` na §4.4.3 | ⬜ |
| 8c | Bloco da query de pendência na §4.4.6 | ⬜ |

### Correção de marcação pendente na §4.3.5

O parágrafo aplicado entrou como heading. **Está assim:**

```
### A exclusão ocorre em duas modalidades. A de um registro individual...
```

**Deve ser** parágrafo comum, sem o `###`, dentro da 4.3.5 - senão vai ao sumário do Word como se
fosse uma subseção nova.

## O que foi verificado e está correto

Quatorze afirmações do capítulo foram conferidas contra o código. Doze conferem:

| Afirmação do artigo | Verificado em |
|---|---|
| O bloco de código do `CorrectIntake` (§4.4.7) | `correct-intake.ts:35-47` - **fiel linha por linha** |
| O tipo `IntakeLog` (§4.4.7) | `intake-log.ts:19-24` - os cinco campos conferem |
| RN-01 - ausência de resposta nunca é desfecho | `intake-log.ts:14` |
| RN-03 - recusa previsão com unidades incompatíveis | `estimate-stock-depletion.ts:65` |
| RN-06 - correção nunca sobrescreve | `correct-intake.ts:41` |
| RN-11 - um aviso por horário | `planejar-avisos-de-dose.ts:97` |
| RN-12 - adiamento uma vez só | `snooze-dose-alarm.ts:19` |
| RN-19 / RN-20 - futuras fora da conta, sem denominador não há taxa | `resumir-adesao.ts:20,43` |
| Nove tabelas sincronizáveis, em ordem de dependência | `tabelas-sincronizaveis.ts:14-28` |
| Domínio sem dependência de framework | 17 use-cases em TypeScript puro |
| Nove formas farmacêuticas, quatro frequências | `medication.ts`, `prescription.ts` |
| RLS por `user_id = auth.uid()` | `apagar-na-nuvem.ts:16` |

## Observações estruturais (fora de escopo, para decidir depois)

Três problemas de marcação que afetam o sumário automático do Word. Não foram corrigidos porque a
decisão foi mexer só no que é conteúdo:

1. **`# 4.6` está no mesmo nível de `# 4 DESENVOLVIMENTO`** - sai do sumário como capítulo irmão, e
   não como seção do Desenvolvimento.
2. **4.3 e 4.4 não têm heading** - são parágrafo comum, então não entram no sumário.
3. **Títulos colados ao corpo** em toda a 4.3.x e 4.4.x, como em
   `### **4.3.5 Sincronização de Dados**  Conflitos de edição...`.

## Dado desatualizado fora do artigo

O `PLANO-DE-DESENVOLVIMENTO.md`, na tabela da pilha (§1.0), diz **"16 migrations, 13 repositórios"**.
São **20 migrações** hoje. Se esse número for puxado de lá para o artigo, use o correto.
