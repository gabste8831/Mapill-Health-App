# Revisão crítica do TCC (prompt do orientador)

> **Feita em 30/09** contra `TCC Gabriel Steffens Atualizado 29_09.docx (2).pdf`, com o prompt de
> revisão crítica do orientador, em três blocos: (1) resumo, introdução e referencial; (2)
> metodologia e desenvolvimento; (3) resultados e conclusão. No bloco 2, as afirmações técnicas
> foram conferidas contra o código do app. Não é reescrita: é o diagnóstico de onde o raciocínio
> precisa ser aprofundado. Os relatórios completos, no formato TRECHO > PROBLEMA > POR QUE FRAGILIZA
> > O QUE FALTA > PERGUNTA, estão abaixo da síntese.

## Síntese e triagem

Nem tudo precisa virar mudança. A triagem abaixo separa o que a banca pode cobrar do que é
aprofundamento desejável.

### A. O texto afirma mais do que o app ou o teste mostram (corrigir antes da banca)

São os pontos em que um avaliador que conheça o assunto, ou que abra o app, encontra contradição.
Conferidos no código em 30/09.

1. **Garantia do alarme.** O texto fala em "determinismo" e disparo "independentemente" (3.1, 4.4.8,
   RNF 02). No código, só 7 dias de avisos ficam agendados (`JANELA_DE_AVISOS_EM_DIAS = 7`) e a
   janela só é renovada quando o app abre. A 5.3 registra a falha após reiniciar, mas a 5.4 e a
   conclusão dizem que os objetivos foram atendidos sem ressalva. (Bloco 2 F3, bloco 3 achados 6 e 9.)
2. **LWW e "edição mais recente".** O LWW faz prevalecer o maior carimbo de tempo do aparelho, que
   pode estar com o relógio errado, e descarta a edição concorrente. Kleppmann (2017), citado como
   apoio, é justamente quem aponta essas fraquezas. Falta assumir o trade-off e dizer por que ele é
   aceitável no Mapill. (Bloco 1 A13, bloco 2 F9, bloco 3 achado 3.)
3. **Estoque com dois aparelhos.** O texto apresenta o estoque como derivado de eventos, mas o saldo
   é gravado em `inventory_items.quantity` e sincroniza por LWW da linha inteira. Com dois aparelhos
   confirmando doses sem conexão, um desconto se perde. Cabe como limitação declarada. (Bloco 2 F8.)
4. **Contagens que não batem.** 21 migrações (o texto diz 20, "estritamente aditivas", e a 020 e a
   021 reescrevem dados), 10 formas farmacêuticas contando "outra" (o texto diz 9), três ações no
   alarme (o RF 27 diz duas), "quatro cenários" na conclusão contra cinco linhas no Quadro 28,
   "quatro camadas" anunciadas e três descritas na 4.4.1. (Bloco 2 F13 e F15, bloco 3 achado 15.)
5. **Anexos e exclusão.** Anexos não sobem para a nuvem hoje, então "recuperação de falhas" não
   recupera fotos e receitas, e `attachment_sync_opt_out` ainda não tem efeito. Sem conexão, a
   exclusão apaga o local e a nuvem fica para depois. (Bloco 2 F6 e F12.)
6. **Registro de dose não é monitoramento eletrônico.** Tocar em "Tomei" é autorrelato com hora
   marcada, e o próprio Quadro 1 (Osterberg e Blaschke) aponta o autorrelato como sujeito a viés. A
   "fidelidade do registro clínico" precisa ser dita nesses termos. (Bloco 1 A7, bloco 2 F7.)

### B. Resumo e conclusão extrapolam os resultados

"Simplicidade de uso", "transfere parte da carga cognitiva" e "resposta concreta à
descontinuidade" não foram medidos: a validação foi técnica, feita pelo autor, em um aparelho, sem
usuários. O resumo também não diz como a validação foi feita. (Bloco 1 A1, bloco 3 achados 10, 11 e
12.)

### C. A validação não tem método declarado

A 3.1 não descreve o roteiro de testes, o aparelho, a simulação do segundo dispositivo nem o
critério de aprovação, e o capítulo 5 remete a ela. Os ajustes da 5.2 aparecem sem o sintoma que
cada um resolveu. (Bloco 3 achados 1, 2 e 4, bloco 2 F1.)

### D. Referencial: fontes esticadas e afirmações sem fonte

- WHO (2003) descreve a não adesão como multidimensional, e o trabalho ataca sobretudo o
  esquecimento, sem delimitar isso.
- Nenhuma fonte mostra que apps ou lembretes melhoram a adesão, que é a premissa do trabalho.
- Bates et al. (2003) trata de apoio à decisão para médicos, e Sweller (1988) de aprendizagem.
- Afirmações sem fonte: "raramente é negligência intencional", "reduz drasticamente as taxas de
  omissão", "fadiga de tratamento", o público "majoritariamente idoso".
- Quadro 2 sem as páginas do Medisafe e do MyTherapy nas referências.

### E. Estilo

Vocabulário repetido ("garant-" 26 vezes, "assegur-" 17, "crític-" 19, "ecossistema" 12), absolutos
("nunca" 15 vezes) justamente onde o código tem exceção, e parágrafos no mesmo molde ("X transcende
Y", "Segundo autor", "Nesse cenário", "Dessa forma... garante").

---

# Bloco 1: resumo, introdução e referencial

## Diagnóstico crítico: Resumo, Abstract, Introdução e Referencial Teórico (p.7 a p.38)

Escopo: qualidade intelectual e científica do texto. Formatação, ABNT, negrito e artefatos de extração ficaram de fora. As fontes citadas foram conferidas contra a lista de referências (p.85 a p.87).

Visão geral: o texto é fluente e bem encadeado na superfície. A fragilidade central é outra. Boa parte do referencial afirma efeitos (reduz, garante, assegura, previne) que nenhuma fonte citada sustenta, e em alguns pontos a fonte citada trata de outra coisa (Bates, Osterberg e Blaschke, Kleppmann, Sweller, LGPD art. 11). Há também um vocabulário que se repete muito e funciona como enchimento. Na contagem do bloco, "garant-" aparece 26 vezes, "assegur-" 17, "crític-" 19, "rigor" 14, "mitig-" 13, "ecossistema" 12, "autonomia" 12 e "transcend-" 6.

---

### Parte 1. Achados

#### A1. A conclusão do resumo vai além do que foi avaliado (p.7)
**TRECHO:** "Conclui-se que é possível conciliar [...] a fidelidade do registro clínico e a simplicidade de uso, transferindo ao aparelho parte da carga cognitiva" (p.7)
**PROBLEMA IDENTIFICADO:** A conclusão extrapola os resultados. A validação descrita no próprio resumo foi técnica (conectividade, sincronização, conflito, alarme), e a justificativa (p.18) exclui expressamente a avaliação com usuários. Nem "simplicidade de uso" nem "transferência de carga cognitiva" foram medidas.
**POR QUE FRAGILIZA O TEXTO:** O resumo é a parte mais lida. Uma banca percebe logo a distância entre o que foi testado e o que se afirma ter sido demonstrado, e isso põe em dúvida a honestidade do resto.
**O QUE ESTÁ FALTANDO:** Separar o que foi verificado (comportamento da arquitetura) do que foi apenas projetado ou pretendido (usabilidade, redução de carga cognitiva).
**PERGUNTA QUE EU PRECISO RESPONDER:** Que evidência produzida neste trabalho sustenta "simplicidade de uso" e "transferência de carga cognitiva"? Se não houver nenhuma, a conclusão deve falar em resultado verificado ou em hipótese de projeto?

#### A2. O problema descrito pela OMS não é o problema que o app ataca (p.16, p.19-20)
**TRECHO:** "moldada pela interação de cinco dimensões fundamentais, impactada por fatores socioeconômicos e estruturais, como a falta de redes de apoio efetivas, prioridades familiares concorrentes e o custo do tratamento" (p.19-20)
**PROBLEMA IDENTIFICADO:** Falta relação entre afirmação, evidência e interpretação. O texto usa a WHO (2003) para dizer que a não adesão é multidimensional e depende sobretudo de fatores socioeconômicos e estruturais. Depois conclui que a solução é um app contra o esquecimento, que seria a "raiz primária" do problema (p.20). As cinco dimensões nem chegam a ser nomeadas, e nenhuma das barreiras listadas (custo, rede de apoio, prioridades familiares) é tratada pelo app.
**POR QUE FRAGILIZA O TEXTO:** A fonte principal sobre adesão é usada para legitimar o tema, mas o argumento vai na direção contrária. A banca pode perguntar por que citar a multidimensionalidade se a solução é unidimensional.
**O QUE ESTÁ FALTANDO:** Nomear as cinco dimensões da WHO e situar o Mapill em uma delas (fatores relacionados à terapia e ao paciente, como a complexidade do regime e o esquecimento), reconhecendo que as outras ficam fora do alcance da solução. Falta também separar a não adesão intencional da não intencional.
**PERGUNTA QUE EU PRECISO RESPONDER:** Em qual das cinco dimensões da WHO o Mapill atua de fato, e que parcela da não adesão a literatura atribui ao esquecimento não intencional?

#### A3. Afirmações categóricas sobre causas e custos da não adesão sem fonte (p.20)
**TRECHO:** "a descontinuidade raramente é um ato de negligência intencional" / "oneram os sistemas com a busca por atendimentos de emergência e internações" (p.20)
**PROBLEMA IDENTIFICADO:** Duas afirmações empíricas fortes sem dado nem referência. "Raramente" é uma afirmação de frequência, e a literatura (a própria WHO 2003, e Osterberg e Blaschke 2005) registra uma parcela relevante de não adesão intencional. O impacto em internações também é empírico e aparece sem nenhum número.
**POR QUE FRAGILIZA O TEXTO:** É a base factual de toda a justificativa, e está afirmada sem sustentação.
**O QUE ESTÁ FALTANDO:** Dados de prevalência (não adesão em doenças crônicas, proporção intencional e não intencional) e de consequências (hospitalizações, custo), com fonte. Osterberg e Blaschke (2005), que já está na lista, traz números desse tipo.
**PERGUNTA QUE EU PRECISO RESPONDER:** Quais números da WHO (2003) ou de Osterberg e Blaschke (2005) quantificam a não adesão e suas consequências, e o que eles dizem sobre o peso do componente intencional?

#### A4. Falta evidência de que apps de lembrete melhoram a adesão
**TRECHO:** "o mHealth estabelece-se não apenas como um canal de informação, mas como uma ferramenta de intervenção ativa e ininterrupta, capaz de atuar em tempo real para promover a adesão terapêutica" (p.19); "promovendo a autonomia do indivíduo por meio de um monitoramento ininterrupto e preditivo" (p.16)
**PROBLEMA IDENTIFICADO:** A premissa de que o mHealth promove adesão é tratada como fato em todo o capítulo, mas nenhuma fonte da lista avalia a eficácia de intervenções por aplicativo ou lembrete. A WHO (2011) define o mHealth, não demonstra efeito. "Preditivo" também não descreve o que o Mapill faz: projetar o esgotamento do estoque é cálculo determinístico, não predição.
**POR QUE FRAGILIZA O TEXTO:** É a premissa mais importante do trabalho, e está sem sustentação. A literatura sobre o tema mostra efeitos modestos e heterogêneos, e ignorá-la deixa o texto ingênuo diante da banca.
**O QUE ESTÁ FALTANDO:** Ao menos uma revisão sistemática ou metanálise sobre intervenções digitais e lembretes para adesão, com o tamanho do efeito e suas limitações.
**PERGUNTA QUE EU PRECISO RESPONDER:** O que as revisões sistemáticas dizem sobre o efeito de apps e lembretes na adesão, de que tamanho é esse efeito e em que condições ele aparece?

#### A5. Sweller está sendo estendido além do que a teoria sustenta (p.20)
**TRECHO:** "Em suas discussões conclusivas, o autor demonstra que a eliminação de exigências mentais desnecessárias à tarefa principal é um fator determinante para o sucesso do indivíduo" / "a memorização de múltiplas posologias atua como uma pesada carga extrínseca" (p.20)
**PROBLEMA IDENTIFICADO:** A teoria da carga cognitiva de Sweller (1988) trata de aprendizagem e resolução de problemas em contexto instrucional. "Sucesso do indivíduo", de modo genérico, generaliza bem além do estudo. Classificar a memorização de posologias como "carga extrínseca" é uma transposição conceitual que não foi justificada. O termo carga extrínseca (extraneous) também foi sistematizado em trabalhos posteriores de Sweller, e não no artigo de 1988.
**POR QUE FRAGILIZA O TEXTO:** A teoria vira ornamento, porque não existe mecanismo que ligue carga cognitiva na aprendizagem à lembrança de tomar remédio. O conceito que de fato serve ao argumento, a desoneração cognitiva de Risko e Gilbert (2016), só aparece duas páginas depois.
**O QUE ESTÁ FALTANDO:** Conferir o que o artigo de 1988 afirma de fato e justificar a transposição, ou apoiar o argumento diretamente em Risko e Gilbert (2016) e na memória prospectiva (Baddeley et al.), que tratam do fenômeno em questão.
**PERGUNTA QUE EU PRECISO RESPONDER:** O que Sweller (1988) conclui literalmente, e o termo "carga extrínseca" aparece nesse artigo? A teoria da carga cognitiva é mesmo necessária aqui, ou a desoneração cognitiva sustenta sozinha o argumento?

#### A6. Bates et al. (2003) é citado para uma afirmação sobre pacientes, mas o artigo trata de médicos (p.23)
**TRECHO:** "Esse modelo de arquitetura encontra respaldo nos princípios de CDSS. Conforme os preceitos de Bates et al. (2003), ao delegar a complexidade logística e matemática aos algoritmos, o indivíduo sofre significativamente menos desgaste." (p.23)
**PROBLEMA IDENTIFICADO:** A fonte é atribuída de forma incorreta. Os "Ten commandments" de Bates et al. tratam de sistemas de apoio à decisão clínica para profissionais no fluxo de atendimento (velocidade, antecipar necessidades, encaixar no fluxo de trabalho). O artigo não afirma que pacientes sofrem "significativamente menos desgaste". O Mapill também não é um CDSS, porque não apoia decisão clínica. O mesmo parágrafo diz que "a literatura define" a "fadiga de tratamento", sem citar ninguém, e chama o processo de "historicamente angustiante", também sem fonte.
**POR QUE FRAGILIZA O TEXTO:** Atribuir a uma fonte algo que ela não diz é o tipo de problema que a banca costuma conferir. Além disso, "significativamente" sugere um resultado estatístico que não existe.
**O QUE ESTÁ FALTANDO:** Reler Bates et al. (2003) e citar apenas o que se aplica por analogia (por exemplo, "anticipate needs and deliver in real time"), deixando explícito que é analogia. Encontrar a fonte de "fadiga de tratamento" (treatment fatigue, treatment burden) ou retirar o termo.
**PERGUNTA QUE EU PRECISO RESPONDER:** Qual dos dez mandamentos de Bates et al. corresponde de fato ao que o Mapill faz, e o Mapill pode ser chamado de CDSS se não apoia nenhuma decisão clínica?

#### A7. Toque de confirmação no app tratado como "monitoramento eletrônico" (p.24)
**TRECHO:** "A ação de confirmar a ingestão ou ignorar ativamente o gatilho fundamenta o que a literatura define como monitoramento eletrônico" / "Segundo o estudo de Osterberg e Blaschke (2005), o monitoramento eletrônico representa o método mais preciso para aferir a adesão" (p.24)
**PROBLEMA IDENTIFICADO:** Há um erro conceitual com consequência direta nas conclusões. Em Osterberg e Blaschke, o monitoramento eletrônico (MEMS, eMEM) é um dispositivo que registra automaticamente a abertura do frasco, sem depender da declaração do paciente. Tocar em "tomei" no app é autorrelato com carimbo de hora, que é justamente a categoria que o Quadro 1 aponta como "suscetível a viés" e sujeita a superestimação. O texto transfere para o app a precisão de outro método.
**POR QUE FRAGILIZA O TEXTO:** Sustenta as afirmações de "histórico confiável", "fidelidade do registro clínico" (resumo) e "consulta exata das tomadas". O próprio Quadro 1, lido com cuidado, desmente a interpretação. Um avaliador da área da saúde nota isso de imediato.
**O QUE ESTÁ FALTANDO:** Classificar corretamente o registro do Mapill como autorrelato digital com marcação temporal, apontar o que ele ganha (hora exata, sem depender da memória retrospectiva) e o que ele não resolve (não prova ingestão e é sujeito a toque por engano ou a confirmar sem tomar).
**PERGUNTA QUE EU PRECISO RESPONDER:** Pela definição de Osterberg e Blaschke (2005, p.489), o registro manual de uma dose no app é monitoramento eletrônico ou autorrelato? O que isso muda na expressão "fidelidade do registro clínico"?

#### A8. "Reduz drasticamente as taxas de omissão", sem fonte e sem mecanismo (p.23)
**TRECHO:** "Conforme os preceitos de usabilidade em saúde móvel, o uso de gatilhos determinísticos, multimodais e sonoros reduz drasticamente as taxas de omissão, transferindo de forma segura a responsabilidade de recordar do córtex cerebral para os processos de segundo plano do dispositivo." (p.23)
**PROBLEMA IDENTIFICADO:** "Preceitos de usabilidade em saúde móvel" não remete a nenhuma fonte. "Drasticamente" é uma afirmação quantitativa sem dado. "Do córtex cerebral para os processos de segundo plano" é uma frase de efeito sem conteúdo técnico. O parágrafo também afirma que o alarme "atua como uma interrupção de alta prioridade no sistema operacional" sem explicar como isso é obtido (canal de notificação, tela cheia, permissão de alarme exato).
**POR QUE FRAGILIZA O TEXTO:** Afirmação categórica, fonte vaga e retórica neurológica aparecem juntas no ponto que justifica a funcionalidade central do app.
**O QUE ESTÁ FALTANDO:** Uma fonte empírica sobre o efeito de lembretes (liga-se a A4) e a descrição do mecanismo técnico real que dá prioridade ao alarme, que é exatamente o que o capítulo de desenvolvimento mostra.
**PERGUNTA QUE EU PRECISO RESPONDER:** Qual estudo mede a redução de omissões com alarmes sonoros ou multimodais, e de quanto é essa redução? Que recurso do Android ou iOS faz o alarme do Mapill ser uma "interrupção de alta prioridade"?

#### A9. Brunton e Knollmann generalizados para qualquer medicamento (p.22)
**TRECHO:** "a manutenção dos níveis terapêuticos ideais depende estritamente do respeito aos intervalos de dosagem; caso contrário, ocorrem flutuações perigosas na concentração plasmática, variando entre a toxicidade e a ineficácia" (p.22)
**PROBLEMA IDENTIFICADO:** A generalização vai além do que a fonte permite. A sensibilidade ao atraso depende da meia-vida e do índice terapêutico de cada fármaco. Para muitos medicamentos de uso crônico, um atraso de minutos ou horas não tem relevância clínica. Os fármacos de índice terapêutico estreito são a exceção, não a regra.
**POR QUE FRAGILIZA O TEXTO:** Serve de base para a exigência de alarme "no minuto exato" (p.34), e a premissa exagerada infla a criticidade do requisito. O texto também não informa a página ou o capítulo da obra.
**O QUE ESTÁ FALTANDO:** Restringir a afirmação aos fármacos em que ela vale (índice terapêutico estreito) e apontar o trecho exato da obra.
**PERGUNTA QUE EU PRECISO RESPONDER:** Em que capítulo e página Brunton e Knollmann (2024) falam disso, e a afirmação se aplica a qualquer medicamento ou só aos de índice terapêutico estreito?

#### A10. Comportamento de pacientes descrito sem evidência (p.21)
**TRECHO:** "a gestão da saúde é fragmentada entre artefatos físicos, como bilhetes e quadros magnéticos, e ferramentas digitais não especializadas, como grupos de mensagens" / "Essa fragmentação acarreta restrições espaciais, concorrência visual com o cotidiano e perda de informações" (p.21)
**PROBLEMA IDENTIFICADO:** A seção 2.2 inteira descreve como os pacientes se organizam, mas não traz nenhuma fonte ou dado sobre esse comportamento. As consequências listadas são afirmadas por dedução. Norman (2013) é bem usado para o conceito de conhecimento no mundo, mas não confirma que pacientes façam isso.
**POR QUE FRAGILIZA O TEXTO:** A comparação "especializada versus genérica" é o argumento de diferenciação do produto, e fica apoiada na intuição do autor.
**O QUE ESTÁ FALTANDO:** Um estudo sobre estratégias de autogestão de medicação (porta-comprimidos, alarmes de celular, anotações) ou a admissão explícita de que é observação do autor.
**PERGUNTA QUE EU PRECISO RESPONDER:** Que estudo mostra quais estratégias os pacientes em polifarmácia usam de fato e que falhas elas produzem?

#### A11. Não há trabalhos correlatos para sustentar a diferenciação (p.18, p.21)
**TRECHO:** "Diferentemente de métodos convencionais ou lembretes genéricos, a solução proposta estabelece um ambiente de referência unificado" (p.18)
**PROBLEMA IDENTIFICADO:** A diferenciação é afirmada sem comparação. O referencial só compara o Mapill com bilhetes e grupos de mensagem, e nunca com os apps de adesão que já existem e que também integram lembrete, histórico e estoque.
**POR QUE FRAGILIZA O TEXTO:** Sem um estado da arte, a banca não sabe qual é a contribuição. O próprio texto a desloca para a arquitetura offline-first com sincronização e conflito (p.18), e isso não é sustentado por comparação com soluções existentes.
**O QUE ESTÁ FALTANDO:** Uma análise de soluções similares, mesmo que curta (funcionalidades, funcionamento sem conexão, sincronização entre aparelhos, tratamento de dados).
**PERGUNTA QUE EU PRECISO RESPONDER:** O que os apps de adesão já disponíveis não fazem e o Mapill faz? Essa diferença está na integração de funções ou na arquitetura?

#### A12. SSoT de Loshin estendida à "rotina do usuário" e em tensão com a consistência eventual (p.21-22, p.36)
**TRECHO:** "A aplicação desse conceito transcende a modelagem tradicional de banco de dados, sendo estendida à própria rotina operacional do usuário" / "o software assegura a integridade do processo informacional" (p.22); "o dispositivo local atua como a fonte de verdade imediata para o usuário" (p.36)
**PROBLEMA IDENTIFICADO:** Loshin (2010) trata de gestão de dados mestres em organizações. A extensão à rotina do usuário é uma metáfora apresentada como fundamento. "Integridade do processo informacional" soa técnico, mas não diz nada verificável. Há ainda uma tensão interna que não é discutida. Em arquitetura offline-first com vários aparelhos, cada aparelho é a "fonte de verdade imediata" e o servidor reconcilia depois. Por definição, existem várias cópias que podem divergir, o que contraria a ideia de uma única fonte da verdade.
**POR QUE FRAGILIZA O TEXTO:** SSoT aparece no resumo e na introdução como conceito central, e o referencial não resolve a contradição com a própria arquitetura escolhida.
**O QUE ESTÁ FALTANDO:** Definir em que sentido o Mapill é SSoT (única fonte para o usuário, contra a fragmentação entre bilhetes e apps) e em que sentido não é (tecnicamente é um sistema replicado com convergência eventual).
**PERGUNTA QUE EU PRECISO RESPONDER:** Com dois aparelhos da mesma conta, um deles offline, qual é a "única fonte da verdade" naquele instante? Como conciliar SSoT com consistência eventual?

#### A13. LWW com Kleppmann como fonte, e a duplicidade atribuída ao lugar errado (p.36)
**TRECHO:** "Conforme fundamentado nas diretrizes modernas de sistemas distribuídos [...] (Kleppmann, 2017), a solução aplica a política de LWW" / "Este rigor cronológico é vital para evitar a duplicidade de registros de medicação e garantir que o histórico de adesão do paciente seja fiel à sua última interação real" (p.36)
**PROBLEMA IDENTIFICADO:** Há dois problemas de raciocínio. (1) Kleppmann (2017) descreve LWW sobretudo como uma estratégia que descarta gravações concorrentes em silêncio e que depende de relógios não confiáveis. Citá-lo como fundamento favorável, sem mencionar essas limitações, inverte o sentido da fonte. (2) LWW resolve qual versão de um mesmo registro prevalece. Ele não evita duplicidade, que depende de identificadores únicos e idempotência. E "mais recente" é medido pelo relógio do aparelho, que pode estar errado, então não equivale à "última interação real". Há ainda a afirmação de Vogels sobre "latência zero", que é aplicação do autor e não algo que Vogels (2008) diga sobre aparelhos móveis.
**POR QUE FRAGILIZA O TEXTO:** Sincronização e conflito são, pelo próprio texto (p.18), a "parte central da contribuição". Uma fundamentação frágil justamente aqui compromete o núcleo técnico do trabalho.
**O QUE ESTÁ FALTANDO:** Apresentar LWW como escolha consciente, com os custos que ela tem (perda de edição concorrente, dependência do relógio), justificar por que esses custos são aceitáveis no domínio do app e atribuir a prevenção de duplicidade ao mecanismo que de fato a produz.
**PERGUNTA QUE EU PRECISO RESPONDER:** O que Kleppmann (2017) diz literalmente sobre LWW e relógios? No Mapill, qual mecanismo impede a duplicidade de um registro de dose, e qual relógio define "mais recente"?

#### A14. Offline-first confundido com o disparo do alarme (p.33-34)
**TRECHO:** "a instabilidade da rede pode impedir o disparo de notificações vitais" (p.33); "permite que os alertas locais ultrapassem barreiras de otimização de bateria, como o modo repouso, e sejam disparados no minuto exato" (p.34)
**PROBLEMA IDENTIFICADO:** Há um erro de mecanismo. Notificações e alarmes locais não dependem de rede em nenhuma arquitetura, então offline-first não é o que os viabiliza. Contornar o modo repouso depende de APIs e permissões do sistema operacional (alarme exato, restrições de fabricantes), e não é garantido em todos os aparelhos. O parágrafo de 2.8.1 repete o de 2.8 quase por inteiro, com "determinismo temporal" nos dois. Chamar isso de "edge computing" também é exagero para um app que calcula localmente.
**POR QUE FRAGILIZA O TEXTO:** O texto promete uma garantia ("no minuto exato") que depende de fatores fora do controle do app, e confunde dois problemas diferentes: dados sem rede e execução agendada com o app fechado.
**O QUE ESTÁ FALTANDO:** Separar os dois eixos (persistência e sincronização sem rede de um lado, agendamento no sistema operacional do outro) e apresentar as condições e limitações do disparo exato, citando a documentação da plataforma.
**PERGUNTA QUE EU PRECISO RESPONDER:** Em uma arquitetura cliente-servidor comum, a falta de rede impede uma notificação local agendada? Que API e que permissão fazem o alarme do Mapill disparar no modo repouso, e quais são as exceções documentadas?

#### A15. RLS, "integridade referencial" e uma "anonimização" que a LGPD não exige (p.35-36)
**TRECHO:** "A relevância teórica desta integração repousa na manutenção da integridade referencial dos dados sensíveis." (p.35); "Essa arquitetura é um requisito indispensável para atender às diretrizes de privacidade e anonimização exigidas pela Lei Geral de Proteção de Dados" (p.36)
**PROBLEMA IDENTIFICADO:** Há uma confusão conceitual. Integridade referencial (chaves estrangeiras) e controle de acesso por linha (RLS) são coisas diferentes, e o parágrafo anuncia uma e descreve a outra. RLS também não é anonimização, porque os dados continuam identificados. A LGPD exige segurança adequada (art. 46) e não prescreve RLS, então "requisito indispensável" é uma afirmação sem sustentação.
**POR QUE FRAGILIZA O TEXTO:** Mistura de conceitos em um trecho que usa vocabulário técnico preciso, o que torna o erro mais visível.
**O QUE ESTÁ FALTANDO:** Dizer qual problema o RLS resolve (isolamento de acesso entre titulares), a que dispositivo da LGPD isso responde e que papel o PostgreSQL cumpre de fato quanto à integridade.
**PERGUNTA QUE EU PRECISO RESPONDER:** Qual artigo da LGPD é atendido pelo isolamento via RLS? O Mapill anonimiza algum dado, ou o termo está sobrando?

#### A16. Leitura incompleta dos artigos 5º e 11 da LGPD (p.37)
**TRECHO:** "dados sensíveis são aqueles que versam sobre a saúde, a vida sexual ou dados genéticos" / "o artigo 11 da LGPD determina que o tratamento de dados sensíveis deve ocorrer mediante o consentimento específico e destacado do titular" (p.37)
**PROBLEMA IDENTIFICADO:** A fonte primária foi lida de forma imprecisa. O art. 5º, II, lista mais categorias (origem racial ou étnica, convicção religiosa, opinião política, filiação sindical, dado biométrico), e a frase "são aqueles" apresenta uma lista parcial como definição. O art. 11 prevê o consentimento (inciso I) e também hipóteses sem consentimento (inciso II). O consentimento é uma das bases legais, não a única.
**POR QUE FRAGILIZA O TEXTO:** É um erro verificável em fonte primária, fácil de a banca conferir, e ele justifica uma decisão de projeto (o aceite obrigatório).
**O QUE ESTÁ FALTANDO:** Citar a definição completa ou indicar que é recorte ("entre eles, os referentes à saúde"). Explicar por que o consentimento foi a base legal escolhida entre as possíveis.
**PERGUNTA QUE EU PRECISO RESPONDER:** Com o art. 11 aberto, qual base legal se aplica ao Mapill e por que o consentimento foi escolhido?

#### A17. Público-alvo "majoritariamente idoso" surge sem definição nem dado (p.25, p.28)
**TRECHO:** "o público-alvo frequentemente enfrenta cenários de estresse [...] ou limitações cognitivas inerentes ao envelhecimento" (p.25); "Para aplicações voltadas a um público majoritariamente idoso, como é o caso de assistentes de adesão medicamentosa" (p.28)
**PROBLEMA IDENTIFICADO:** A introdução define o público pela polifarmácia e pelo tratamento longo, e não pela idade. No referencial, o público passa a ser "majoritariamente idoso" sem dado. A cadeia causal "interface ruim, abandono da ferramenta e, consequentemente, interrupção da terapia" (p.25) também é afirmada sem evidência.
**POR QUE FRAGILIZA O TEXTO:** O público-alvo condiciona requisitos (contraste, alvo de toque), e defini-lo por suposição enfraquece a rastreabilidade entre referencial e requisitos.
**O QUE ESTÁ FALTANDO:** Dado de prevalência de polifarmácia por faixa etária e uma definição explícita do público-alvo, feita uma vez e usada de forma coerente.
**PERGUNTA QUE EU PRECISO RESPONDER:** Quem é o público-alvo do Mapill, definido em uma frase, e que dado liga polifarmácia e idade?

#### A18. Engenharia de software e TypeScript: efeitos superdimensionados e mecanismos trocados (p.31, p.32)
**TRECHO:** "Esse processo previne que eventuais falhas visuais, travamentos de tela ou atualizações de layout acabem corrompendo o processamento dos dados" (p.31); "a captura de anomalias em tempo de compilação, impedindo que falhas lógicas cheguem ao ambiente de produção" (p.32)
**PROBLEMA IDENTIFICADO:** Os mecanismos estão trocados. O SRP é um princípio de organização do código para facilitar a mudança, e não um isolamento de falhas em tempo de execução. Separar módulos não impede, por si só, que um erro de interface afete dados. A tipagem estática captura erros de tipo, e não falhas lógicas em geral (um intervalo de 8h digitado como 6h passa pelo compilador). "De forma determinística" é usado como sinônimo de "correta" (p.30, p.32, p.34).
**POR QUE FRAGILIZA O TEXTO:** Atribui a boas práticas garantias que elas não oferecem. Uma banca de Sistemas de Informação reconhece o exagero.
**O QUE ESTÁ FALTANDO:** Declarar o benefício real de cada prática (SRP reduz o impacto de mudanças, a tipagem elimina uma classe de erros) e, para a integridade dos dados, apontar os mecanismos que de fato a asseguram (transações, validação, testes).
**PERGUNTA QUE EU PRECISO RESPONDER:** Que tipo de erro o TypeScript não pega e que ainda assim ameaçaria um cronograma de doses? No Mapill, o que impede que uma falha de tela corrompa dados, o SRP ou as transações do SQLite?

#### A19. Seções de engenharia de software que só repetem definições de manual (p.28-29)
**TRECHO:** "Essa perspectiva sistêmica é essencial para garantir que o software opere como um produto de engenharia confiável, e não apenas como um script de automação." (p.29)
**PROBLEMA IDENTIFICADO:** O texto explica longamente aspectos óbvios. Os itens 2.5, 2.5.1 e o início de 2.5.2 parafraseiam as definições gerais de Sommerville e Pressman (o que é software, o que é engenharia de software) e fecham sempre com uma frase genérica ("ecossistema coeso", "sistema utilitário integrado") que não se liga a nenhuma decisão do projeto. Além disso, "a literatura ressalta que sistemas críticos de saúde não devem depender exclusivamente [...] da conectividade" (p.29) não cita qual literatura.
**POR QUE FRAGILIZA O TEXTO:** Ocupa espaço de fundamentação sem fundamentar nada. A banca conhece essas definições e procura a aplicação.
**O QUE ESTÁ FALTANDO:** Para cada conceito, dizer em que decisão do Mapill ele se concretiza. Dar a fonte de "a literatura ressalta".
**PERGUNTA QUE EU PRECISO RESPONDER:** Que decisão concreta do Mapill seria diferente se as seções 2.5 e 2.5.1 não existissem? Quem, na literatura, diz que sistemas de saúde não devem depender da conectividade?

#### A20. Norma ISO/IEC 25010:2023 descrita com termos que parecem ser de versões anteriores (p.28, p.30)
**TRECHO:** "ISO/IEC 25010:2023 [...] que reconhece a acessibilidade como uma característica formal de qualidade" (p.28); "confiabilidade, definida como a capacidade do sistema de manter seu nível de desempenho sob condições específicas" (p.30)
**PROBLEMA IDENTIFICADO:** Há risco de inconsistência entre a norma citada e o conteúdo descrito. A definição de confiabilidade usada lembra a da ISO/IEC 9126. Na revisão de 2023, a característica de usabilidade foi reorganizada (passou a se chamar interaction capability) e a subcaracterística de acessibilidade foi substituída por outras (como inclusivity e user assistance). O texto também diz que acessibilidade é uma "característica", quando no modelo ela é, no máximo, subcaracterística.
**POR QUE FRAGILIZA O TEXTO:** Citar uma edição e descrever outra é uma fragilidade verificável.
**O QUE ESTÁ FALTANDO:** Conferir as definições e a nomenclatura exatas na edição de 2023.
**PERGUNTA QUE EU PRECISO RESPONDER:** Na ISO/IEC 25010:2023, qual é a definição literal de confiabilidade, e onde a acessibilidade aparece (com que nome e em que nível)?

#### A21. Gamificação: "motivação intrínseca" sem fonte e sem ligação com o app (p.27)
**TRECHO:** "atua como um poderoso catalisador de engajamento" / "explora o gatilho psicológico da completude" / "Essa abordagem promove a motivação intrínseca, gerando no usuário um senso contínuo de autoeficácia e autonomia" (p.27)
**PROBLEMA IDENTIFICADO:** Deterding et al. (2011) só define o termo. Os efeitos ("poderoso catalisador", "gatilho da completude", motivação intrínseca, autoeficácia) aparecem sem fonte. Há ainda uma tensão conceitual, porque recompensas visuais costumam ser tratadas como motivadores extrínsecos, e a própria literatura de gamificação discute efeitos que se perdem com o tempo. A seção 2.4.3 tem o mesmo padrão ("induz o paciente à adesão", "aumentando significativamente a confiança", p.27).
**POR QUE FRAGILIZA O TEXTO:** São conceitos psicológicos com nome técnico usados sem teoria. Se o app implementa só um indicador de progresso, a seção promete mais do que o produto entrega.
**O QUE ESTÁ FALTANDO:** Uma fonte que relacione gamificação, ou feedback de progresso, a adesão ou motivação, e a indicação de qual elemento concreto do Mapill corresponde a isso.
**PERGUNTA QUE EU PRECISO RESPONDER:** Que elemento do Mapill é gamificação? Que estudo sustenta que esse elemento gera motivação intrínseca, e não extrínseca?

#### A22. Padrão de escrita: parágrafos de mesma estrutura e vocabulário inflado (todo o bloco)
**TRECHO:** "No ecossistema das aplicações de mHealth, a segurança da informação transcende a barreira técnica, configurando-se como um imperativo ético e jurídico" (p.36); "a aplicação rigorosa de heurísticas de usabilidade transcende o aspecto estético, configurando-se como um mecanismo de segurança fundamental" (p.25)
**PROBLEMA IDENTIFICADO:** Parágrafos com construção muito semelhante e frases que soam importantes e acrescentam pouco. Quase todas as seções seguem a mesma forma: afirmação ampla ("X transcende Y, configurando-se como Z"), "Segundo Autor", aplicação ao contexto ("Nesse cenário", "No contexto de") e fecho com "Dessa forma/Assim, [...] garante/assegura [...]". O fecho costuma trazer a garantia mais forte do parágrafo, sem apoio. Também há ideias repetidas entre as seções. "Transferir a responsabilidade de gestão da memória humana para o processamento computacional" aparece em p.16 e p.20 e volta no resumo. "Suporte utilitário" aparece três vezes. "Intervenção ativa" aparece em p.16 e p.19. A sobrecarga mental na polifarmácia é descrita quase com as mesmas palavras em p.7, p.16 e p.18.
**POR QUE FRAGILIZA O TEXTO:** O ritmo uniforme e as garantias em série cansam a leitura e diluem as afirmações que têm sustentação, porque tudo parece dito com o mesmo peso.
**O QUE ESTÁ FALTANDO:** Variar a estrutura conforme o tipo de argumento e reservar verbos fortes (garante, assegura, elimina) para o que foi demonstrado ou tem fonte.
**PERGUNTA QUE EU PRECISO RESPONDER:** Se cada "garante" e cada "assegura" do capítulo fosse trocado por "contribui para", quais afirmações perderiam força de verdade? Essas são as que precisam de evidência.

---

### Parte 2. Organização por categoria

#### Problemas de estilo e escrita
- A22. Estrutura de parágrafo repetitiva, vocabulário inflado ("transcende", "ecossistema", "rigor", "garante") e ideias repetidas entre resumo, introdução, justificativa e 2.1.2.
- A19. Explicação longa do óbvio nas seções 2.5 e 2.5.1 (definições de manual sem aplicação).
- A8 (parte retórica). "Do córtex cerebral para os processos de segundo plano".
- A14 (parte de repetição). O item 2.8.1 repete 2.8 ("determinismo temporal" duas vezes).
- A12 (parte retórica). "Integridade do processo informacional", frase sofisticada sem conteúdo verificável.
- Menor, sem achado próprio: 2.4.2 dedica um parágrafo à história do termo UX (Norman na Apple, 1993) que não contribui para o argumento, e anuncia uma "análise psicológica" que vem depois, fora de ordem.

#### Problemas de argumentação e raciocínio
- A1. A conclusão do resumo extrapola a validação feita.
- A2. O problema descrito pela WHO (multidimensional) não é o problema que a solução ataca (esquecimento).
- A11. Diferenciação afirmada sem comparação com soluções existentes.
- A12. SSoT em tensão com a arquitetura replicada e com a consistência eventual.
- A13. LWW apresentado como algo que evita duplicidade e garante a "última interação real".
- A14. Offline-first confundido com o disparo de alarme local.
- A15. RLS confundido com integridade referencial e com anonimização.
- A17. Público-alvo muda de definição entre a introdução e o referencial.
- A18. Mecanismos trocados (SRP como isolamento de falhas, tipagem como prevenção de falhas lógicas).

#### Problemas de sustentação científica
- A3. Frequência de não adesão intencional e impacto em internações sem dado.
- A4. Nenhuma fonte sobre a eficácia de apps e lembretes na adesão.
- A5. Sweller transposto sem justificativa e possivelmente com terminologia posterior a 1988.
- A6. Bates et al. (2003) citado para uma afirmação que o artigo não faz. "Fadiga de tratamento" sem fonte.
- A7. Registro manual no app tratado como monitoramento eletrônico, com a precisão atribuída por Osterberg e Blaschke.
- A8. "Reduz drasticamente as taxas de omissão" sem fonte.
- A9. Brunton e Knollmann generalizados para todos os fármacos.
- A10. Comportamento de pacientes (bilhetes, grupos) sem evidência.
- A16. Leitura incompleta dos arts. 5º e 11 da LGPD.
- A19 (parte de fonte). "A literatura ressalta" sem autor.
- A20. ISO/IEC 25010:2023 possivelmente descrita com termos de versões anteriores.
- A21. Efeitos psicológicos da gamificação e da hierarquia visual sem fonte.

---

### Parte 3. Os três trechos prioritários

#### Prioridade 1. Registro de dose como "monitoramento eletrônico" (A7, p.24)
**Por que é prioritário:** É o único ponto do referencial em que uma fonte empírica forte (Osterberg e Blaschke, NEJM) é usada para qualificar o dado que o app produz, e a leitura está invertida. O registro do Mapill cai na categoria que o próprio Quadro 1 aponta como sujeita a viés. Desse erro dependem afirmações do resumo e da conclusão ("fidelidade do registro clínico", "histórico confiável", "consulta exata das tomadas"). Uma banca com alguém da saúde encontra isso de imediato.
**O que o aluno deveria investigar antes de reescrever:**
1. Reler Osterberg e Blaschke (2005), p.487-489, e anotar como eles definem os monitores eletrônicos (dispositivo que registra a abertura da embalagem) e que limitações apontam (abrir o frasco não prova a ingestão).
2. Decidir em que categoria cai o toque em "tomei" no Mapill. A expectativa é autorrelato digital com marcação temporal.
3. Listar o que esse registro melhora em relação ao relato retrospectivo (hora exata, sem depender da memória do paciente) e o que ele não resolve (não prova a ingestão).
4. Conferir se "fidelidade do registro clínico" no resumo e na conclusão continua defensável depois dessa reclassificação, e em que sentido (fidelidade ao que o usuário declarou, não à ingestão).

#### Prioridade 2. LWW, Kleppmann e a "última interação real" (A13 e A12, p.36 e p.22)
**Por que é prioritário:** A justificativa (p.18) declara que sincronização e resolução de conflitos são a "parte central da contribuição". É justamente onde a fundamentação é mais fraca. A fonte é citada como apoio a uma estratégia que ela mesma critica, LWW recebe um efeito que não tem (evitar duplicidade) e a dependência do relógio do aparelho não é discutida. Junta-se a isso a contradição não resolvida entre SSoT e consistência eventual.
**O que o aluno deveria investigar antes de reescrever:**
1. Ler em Kleppmann (2017) as seções sobre detecção de gravações concorrentes e LWW, e sobre relógios não confiáveis (capítulos 5 e 8), e anotar o que ele diz sobre perda de dados e diferença entre relógios.
2. Verificar no código do Mapill qual carimbo de tempo é comparado (do aparelho ou do servidor) e o que acontece se o relógio do aparelho estiver adiantado.
3. Identificar qual mecanismo impede de fato a duplicidade de um registro de dose (UUID, chave única, upsert) e atribuir a ele, não ao LWW, esse efeito.
4. Justificar por que perder uma edição concorrente é aceitável no domínio do app, por exemplo pela raridade de edição simultânea do mesmo registro por uma única pessoa em dois aparelhos.
5. Definir em que sentido o Mapill é SSoT e em que sentido é um sistema replicado, e escrever essa distinção de forma explícita.

#### Prioridade 3. Adesão multidimensional contra solução centrada no esquecimento, sem evidência de eficácia (A2, A3, A4, p.19-20 e p.16)
**Por que é prioritário:** É a premissa do trabalho inteiro. O texto cita a WHO para dizer que a não adesão é multidimensional e sobretudo estrutural, afirma sem dado que ela "raramente" é intencional e trata como certo que mHealth promove adesão, sem nenhuma fonte de eficácia. Se essa base cair na arguição, a justificativa e o propósito do app ficam sem chão. A correção também é a mais barata, porque exige leitura e não mudança no produto.
**O que o aluno deveria investigar antes de reescrever:**
1. Na WHO (2003), identificar as cinco dimensões pelo nome e localizar onde entram a complexidade do regime e o esquecimento.
2. Buscar na WHO (2003) e em Osterberg e Blaschke (2005) os números de prevalência da não adesão em doenças crônicas e a distinção entre não adesão intencional e não intencional.
3. Encontrar ao menos uma revisão sistemática recente sobre lembretes e apps para adesão medicamentosa e registrar o tamanho do efeito e as limitações.
4. Com isso em mãos, delimitar o que o Mapill pretende resolver (a parcela não intencional ligada à memória e à logística) e o que fica fora do alcance (custo, rede de apoio, crenças), e alinhar com essa delimitação a introdução, a justificativa e a frase "atacando diretamente a raiz primária do esquecimento" (p.20).

---

# Bloco 2: metodologia e desenvolvimento

## Diagnóstico crítico: capítulo 3 (Metodologia) e capítulo 4 (Desenvolvimento)

Escopo: páginas 39 a 78. Li o texto inteiro e a lista de referências. Quando o texto faz uma afirmação técnica forte, conferi no código do repositório (src/, modules/, docs/supabase-schema.sql). Onde o texto contradiz o código, isso aparece marcado como **[confere com o código: NÃO]**.

---

### Parte 1. Fragilidades encontradas

#### F1. A metodologia não tem etapa de avaliação
**TRECHO** (p.39): "caracteriza-se como uma pesquisa aplicada e descritiva" / "recorre-se ao levantamento bibliográfico e documental" / "O trabalho busca responder de que maneira uma aplicação móvel [...] pode centralizar [...] atendendo a requisitos funcionais e não funcionais de usabilidade, segurança e confiabilidade"

**PROBLEMA IDENTIFICADO:** A pergunta de pesquisa pede que se mostre que o app *atende* a requisitos de usabilidade, segurança e confiabilidade. Mesmo assim, a seção 3.1 descreve só o levantamento bibliográfico e a stack técnica. Não há procedimento para verificar esse atendimento, seja teste, avaliação heurística, validação em aparelho ou uso por participantes. Também não se diz o que exatamente está sendo "descrito" numa pesquisa chamada de descritiva. O levantamento bibliográfico e documental não tem protocolo: faltam bases consultadas, período e critérios de inclusão.

**POR QUE FRAGILIZA O TEXTO:** A pergunta fica sem um caminho metodológico até a resposta. Tudo o que o capítulo 4 afirma sobre confiabilidade e usabilidade depende apenas da intenção de projeto.

**O QUE ESTÁ FALTANDO:** Um procedimento de verificação explícito (roteiro de testes em aparelho, critérios de aceite por requisito, avaliação heurística documentada), os resultados desse procedimento e a justificativa da classificação "descritiva".

**PERGUNTA QUE EU PRECISO RESPONDER:** Que procedimento, executado e registrado, me permite afirmar que o Mapill *atende* aos requisitos de confiabilidade e usabilidade, e não apenas que foi *projetado* para atendê-los?

---

#### F2. O público-alvo é afirmado, não caracterizado
**TRECHO** (p.39): "atender ao público-alvo, composto majoritariamente por idosos e pacientes polimedicados"; (p.75): "partem do público que a utiliza, majoritariamente idoso"

**PROBLEMA IDENTIFICADO:** Na p.39 aparece como público-alvo presumido. Na p.75 passa a ser um fato sobre "o público que a utiliza", sem nenhum dado de uso ou perfil que o sustente. A mesma p.39 diz ainda que a UX foi "estritamente guiada pelas heurísticas de Nielsen", mas nenhuma avaliação heurística é relatada.

**POR QUE FRAGILIZA O TEXTO:** Várias decisões dependem desse público (contraste, alto contraste, temas, precisão motora). Se ele não está caracterizado, essas decisões perdem a base empírica. O advérbio "estritamente" promete um rigor que não é demonstrado.

**O QUE ESTÁ FALTANDO:** Dados epidemiológicos ou referência sobre quem são os polimedicados no Brasil, e o registro de como as heurísticas foram aplicadas e verificadas (checklist, avaliadores, achados).

**PERGUNTA QUE EU PRECISO RESPONDER:** De onde vem a afirmação de que o público é majoritariamente idoso? Existe alguma avaliação que mostre a aplicação das heurísticas, ou só o fato de terem sido consultadas?

---

#### F3. A garantia de entrega do alarme é mais forte do que o sistema entrega **[confere com o código: NÃO]**
**TRECHO** (p.39-40): "assegurando o determinismo dos alertas independentemente de conexão com a rede"; (p.57): "o alarme dispara mesmo com o aplicativo encerrado e sem nenhum processo em execução [...] condição indispensável"; RNF 02 (p.47): "O lembrete deve funcionar com o aplicativo fechado e após reinicialização do aparelho"

**PROBLEMA IDENTIFICADO:** No código, só 7 dias de avisos ficam agendados no sistema operacional (`JANELA_DE_AVISOS_EM_DIAS = 7` em `src/notifications/reagendar-avisos.ts`). A grade de doses cobre 30 dias (`HORIZONTE_EM_DIAS = 30` em `reabastecer-grade-de-doses.ts`) e é reabastecida só quando o app é aberto ou volta ao primeiro plano (`use-dose-notifications.ts`). Não há tarefa em segundo plano que renove essa janela. Na prática, um paciente que não abrir o app por mais de uma semana deixa de ser avisado. Além disso, o disparo depende de permissões do Android (alarme exato, otimização de bateria), e o próprio código tem telas de diagnóstico e de permissões para isso. "Determinismo" e "independentemente" não descrevem esse comportamento. Por fim, a regra de negócio 15 (p.50) diz que "o aplicativo nunca promete uma garantia que a plataforma não oferece de fato", e o texto faz justamente esse tipo de promessa.

**POR QUE FRAGILIZA O TEXTO:** O TCC apresenta a confiabilidade do lembrete como o diferencial central (p.42: "Essa escolha é importante porque torna o lembrete mais confiável"). Um avaliador que conheça o Android vai questionar "determinismo" logo de início. E um avaliador que conheça o código vai notar a janela de 7 dias.

**O QUE ESTÁ FALTANDO:** As condições de contorno da garantia: janela de agendamento, dependência de abertura periódica, permissões exigidas, plataforma (o módulo nativo é Kotlin, então a solução descrita é Android). Falta também evidência de teste: reinício do aparelho, app encerrado à força, modo Doze.

**PERGUNTA QUE EU PRECISO RESPONDER:** Em quais condições exatas o alarme toca, e em quais não toca? Testei o disparo após reinicialização, com o app encerrado e depois de dias sem abrir o app? Qual foi o resultado?

---

#### F4. O Quadro 2 conclui a partir de fontes ausentes e trata ausência de menção como ausência de recurso
**TRECHO** (p.40): "O Medisafe migrou, em janeiro de 2026, para um modelo de assinatura paga que limita o uso gratuito a apenas dois medicamentos" / "conforme declarado em sua própria página oficial" / "nenhuma das duas soluções menciona, em suas descrições públicas, suporte à dose variável por horário"; Quadro 2 (p.41): "Dose variável por horário — Não / Não"

**PROBLEMA IDENTIFICADO:** Há três problemas encadeados. (a) Nenhuma página do Medisafe ou do MyTherapy aparece na lista de referências, e nenhuma fonte tem data de acesso. A mudança de janeiro de 2026 e o repasse de dados não podem ser verificados. (b) O texto passa de "não menciona" para "Não" no quadro. É um argumento pela ignorância: a descrição de marketing de uma loja de aplicativos não é inventário de funcionalidades. (c) Os critérios do quadro foram escolhidos pelo autor como "os aspectos mais relevantes à proposta deste estudo". O quadro fica, então, construído para favorecer o Mapill, sem que a escolha dos critérios seja justificada por uma fonte externa (literatura de adesão, avaliações de apps de mHealth).

**POR QUE FRAGILIZA O TEXTO:** Toda a seção 3.2 e o posicionamento "troca amplitude por profundidade" (p.41) se apoiam nesse quadro. Se uma célula estiver errada, por exemplo se um dos apps aceitar doses diferentes por horário, o diferencial anunciado desaparece.

**O QUE ESTÁ FALTANDO:** Referências com URL e data de acesso para cada afirmação sobre concorrentes. Uma verificação empírica: instalar os apps e tentar cadastrar dose variável, estoque, uso sem conta, com data do teste e versão. Um critério para a escolha dos aspectos comparados. Trabalhos acadêmicos relacionados: a seção chama-se "trabalhos relacionados", mas só compara produtos comerciais.

**PERGUNTA QUE EU PRECISO RESPONDER:** Testei pessoalmente cada célula "Não" dos concorrentes? Em que data e em que versão? Por que esses nove aspectos, e não outros em que o Mapill perderia?

---

#### F5. A generalização sobre o mercado não tem fonte e conflita com o próprio Quadro 2
**TRECHO** (p.42): "os aplicativos de lembrete de medicação disponíveis no mercado [...] apresentam falhas recorrentes [...] Em geral, essas ferramentas dependem de conexão constante com a internet [...] e entregam o lembrete apenas quando o próprio aplicativo está aberto"

**PROBLEMA IDENTIFICADO:** É uma afirmação categórica sobre um conjunto indeterminado de apps, sem nenhuma referência nem amostra. Ela também contradiz a seção anterior: o Quadro 2 diz que o MyTherapy funciona sem conta, e as duas soluções citadas como líderes de mercado evidentemente enviam notificações com o app fechado.

**POR QUE FRAGILIZA O TEXTO:** A seção 4.1 usa essa "constatação" como origem do projeto ("partiu da constatação"). Se a premissa não tem base, a justificativa do desenvolvimento enfraquece.

**O QUE ESTÁ FALTANDO:** Um levantamento, mesmo pequeno e declarado (quantos apps, quais, como foram avaliados), ou literatura de revisão de apps de adesão que sustente essas "falhas recorrentes".

**PERGUNTA QUE EU PRECISO RESPONDER:** Quais aplicativos, concretamente, entregam o lembrete só com o app aberto? Como verifiquei isso, e como conciliar essa afirmação com o que eu mesmo disse sobre Medisafe e MyTherapy duas páginas antes?

---

#### F6. "Totalmente offline" e "exclusão completa" não valem em todos os casos **[confere com o código: parcialmente]**
**TRECHO** (p.42): "o Mapill é uma aplicação de adesão medicamentosa que funciona de forma totalmente offline"; (p.43): "assegurar ao titular [...] a exclusão completa de seus dados, tanto no aparelho quanto na nuvem"; (p.49): "os registros são removidos da nuvem antes do aparelho, ordem que impede que a sincronização seguinte os traga de volta"

**PROBLEMA IDENTIFICADO:** A autenticação Google, a sincronização e a exclusão na nuvem dependem de rede. Em `src/data/remote/apagar-na-nuvem.ts` e `local-data-repository.ts`, se o aparelho estiver offline, o apagamento local acontece mesmo assim e os dados permanecem no servidor (a função devolve `false` e segue em frente). A exclusão "completa" é, portanto, condicionada à conectividade. O texto também não diz se o usuário é avisado quando a limpeza na nuvem falha.

**POR QUE FRAGILIZA O TEXTO:** O adjetivo absoluto ("totalmente") e a promessa de exclusão completa são pontos que uma banca com viés de LGPD vai testar. A distinção correta é que as *operações clínicas* são offline e a *conta e a sincronização* não são. O RNF 01 já faz essa distinção, mas a p.42 não.

**O QUE ESTÁ FALTANDO:** Delimitar quais funcionalidades exigem rede e descrever o comportamento de falha da exclusão remota (aviso ao titular, nova tentativa).

**PERGUNTA QUE EU PRECISO RESPONDER:** O que acontece, exatamente, quando o titular pede a exclusão sem internet? Ele fica sabendo que os dados continuam na nuvem?

---

#### F7. O registro de ingestão é chamado de "fiel ao comportamento real", mas é autorrelato
**TRECHO** (p.47): "preservando a natureza do registro de ingestão como um documento fiel ao comportamento real do paciente"; (p.72): "é o que permite ao relatório clínico afirmar o que de fato ocorreu"

**PROBLEMA IDENTIFICADO:** O app registra o que o paciente *toca*, não o que ele *ingere*. Confirmar a dose é autorrelato. A taxa calculada é `confirmadas / previstas` (`src/domain/use-cases/resumir-adesao.ts`), uma medida indireta de adesão. A literatura que o próprio trabalho cita (Osterberg e Blaschke, 2005; WHO, 2003) trata o autorrelato como método sujeito a superestimação. O texto não reconhece essa limitação e diz que o relatório afirma "o que de fato ocorreu".

**POR QUE FRAGILIZA O TEXTO:** É uma extrapolação conceitual no núcleo do trabalho. A regra 01 ("ausência de resposta não é desfecho") é boa justamente porque evita inventar dados. Só que a mesma honestidade epistemológica não é aplicada à confirmação.

**O QUE ESTÁ FALTANDO:** Situar a medida do Mapill entre os métodos de aferição de adesão (diretos e indiretos), declarar a fórmula da taxa no texto e reconhecer os limites do autorrelato.

**PERGUNTA QUE EU PRECISO RESPONDER:** Que tipo de medida de adesão o Mapill produz, segundo a classificação da literatura que cito? Quais vieses ela carrega? O que o médico pode e o que não pode concluir do relatório?

---

#### F8. O estoque "por eventos" não se sustenta entre aparelhos **[confere com o código: NÃO]**
**TRECHO** (p.48): "toda alteração de estoque é registrada como um evento de ajuste, nunca como a substituição de um valor absoluto, o que permite compor com segurança doses confirmadas, recontagens manuais e reposições sem que uma ação apague o efeito da outra"

**PROBLEMA IDENTIFICADO:** No código, o evento é gravado em `inventory_adjustments`, mas o saldo também é materializado em `inventory_items.quantity`, com `SET quantity = MAX(0, quantity + ?)` em `inventory-repository.ts`. Esse saldo sincroniza por LWW de linha inteira. Se dois aparelhos da mesma conta confirmarem doses offline, cada um terá um `quantity` diferente e a sincronização mantém só um deles, descartando o efeito do outro. O saldo não é recalculado a partir dos eventos. Além disso, o corte em zero (`MAX(0, …)`) faz o saldo deixar de ser a soma dos eventos.

**POR QUE FRAGILIZA O TEXTO:** A frase afirma uma propriedade ("sem que uma ação apague o efeito da outra") que vale dentro de um aparelho e falha justamente no cenário distribuído que o trabalho diz tratar (consistência eventual, seção 4.4.6).

**O QUE ESTÁ FALTANDO:** Delimitar a garantia a um único aparelho ou explicar como o saldo é reconciliado após a sincronização, e discutir a interação entre o modelo de eventos e o LWW.

**PERGUNTA QUE EU PRECISO RESPONDER:** Com dois aparelhos na mesma conta, cada um confirmando uma dose offline, qual será o estoque depois de sincronizar? Ele bate com a soma dos eventos?

---

#### F9. A justificativa do LWW é unilateral e ignora os custos conhecidos **[confere com o código: parcialmente]**
**TRECHO** (p.53): "Se o sistema tentasse combinar campos de duas versões diferentes [...] poderia produzir um estado que nenhum dos dois dispositivos realmente gerou"; RF 40 (p.46): "resolvido por Last-Write-Wins, de forma determinística"; RNF 07 (p.47): "Nenhuma operação pode falhar em silêncio"

**PROBLEMA IDENTIFICADO:** O texto apresenta só a vantagem do LWW (não misturar campos) e omite o custo: edições concorrentes são descartadas sem aviso. Kleppmann (2017), que está nas referências, discute exatamente essa perda e a dependência de relógio. No Mapill, `updated_at` vem do relógio do aparelho, então um relógio adiantado vence sempre. O comentário do próprio `docs/supabase-schema.sql` diz que o trigger `recusar_versao_antiga` "recusa em silêncio a versão mais velha", o que entra em tensão direta com o RNF 07. "Determinística" só é verdade se os relógios forem confiáveis.

**POR QUE FRAGILIZA O TEXTO:** Uma escolha com custos conhecidos aparece como solução sem ressalvas. O cenário que justificaria a escolha (vários aparelhos editando o mesmo registro) nunca é dimensionado: se ele é raro, o custo é aceitável, e o texto deveria dizer isso.

**O QUE ESTÁ FALTANDO:** Um parágrafo de trade-off: perda de escrita concorrente, dependência de relógio, por que o custo é aceitável no caso de um paciente com poucos aparelhos, e como isso se concilia com "nenhuma operação falha em silêncio".

**PERGUNTA QUE EU PRECISO RESPONDER:** O que se perde quando o LWW descarta uma versão, e o usuário é informado? O que acontece se o relógio de um aparelho estiver errado? Por que esse risco é aceitável aqui?

---

#### F10. A "redundância deliberada" de segurança está descrita de forma imprecisa **[confere com o código: NÃO]**
**TRECHO** (p.55): "restringindo toda operação de leitura, inserção e atualização ao proprietário do registro [...] a aplicação repete o filtro por identificador de usuário como uma segunda camada independente de verificação, de modo que as duas camadas precisam concordar entre si para que uma operação seja concluída"

**PROBLEMA IDENTIFICADO:** Em `sync-service.ts`, o recebimento faz `select("*")` sem filtro por `user_id` e depende só do RLS. A aplicação apenas preenche `user_id` no envio e filtra por ele na exclusão (`apagar-na-nuvem.ts`). Logo, não é verdade que "as duas camadas precisam concordar" em toda operação. O texto também omite a política de DELETE, que existe no esquema e é justamente a usada no direito de exclusão.

**POR QUE FRAGILIZA O TEXTO:** É uma afirmação de segurança verificável e imprecisa. Numa defesa, um detalhe assim pode comprometer a credibilidade de toda a seção de segurança.

**O QUE ESTÁ FALTANDO:** Descrever com exatidão em quais operações existe o filtro duplo e incluir a exclusão entre as operações protegidas.

**PERGUNTA QUE EU PRECISO RESPONDER:** Em quais operações, concretamente, o app repete o filtro por usuário? Se o RLS de SELECT falhasse, o recebimento traria dados de outro usuário?

---

#### F11. Imutabilidade "nunca apagado" contra o esquema e contra o próprio quadro **[confere com o código: NÃO]**
**TRECHO** (p.55): "nenhum registro de dose é sobrescrito ou apagado"; (p.56): "Esse princípio aproxima-se da lógica de imutabilidade que rege o prontuário eletrônico"; Quadro 19 (p.61): "status — Desfecho da dose (confirmada, pulada, adiada)"; Quadro 10, regra 13 (p.50): "Adiar não registra desfecho"

**PROBLEMA IDENTIFICADO:** (a) `intake_logs` tem `updated_at` e `deleted_at`, sincroniza por upsert com LWW e é apagada fisicamente no direito de exclusão (p.49). "Nunca apagado" é categórico demais: a imutabilidade é uma convenção do caso de uso, não uma garantia do armazenamento, e o texto admite isso na p.56. (b) A analogia com o prontuário eletrônico não tem referência (normativa do CFM, certificação SBIS ou literatura de registro eletrônico de saúde). (c) O Quadro 19 lista "adiada" como desfecho, o que contradiz a regra 13. No código (`src/domain/entities/intake-log.ts`), o terceiro estado é `deferred`, que significa "ignorar por agora", e não adiar.

**POR QUE FRAGILIZA O TEXTO:** A seção 4.4.7 chama-se "os três estados da dose", mas nunca diz quais são. O quadro de dados dá o terceiro estado com o nome errado, contradizendo a regra que o próprio capítulo destaca.

**O QUE ESTÁ FALTANDO:** Nomear os três estados corretamente, qualificar a imutabilidade (por convenção de aplicação, com exceção do direito de exclusão) e fundamentar a analogia com o prontuário.

**PERGUNTA QUE EU PRECISO RESPONDER:** Quais são, exatamente, os três estados de um registro de ingestão? Em que o "ignorar por agora" difere de adiar? Qual norma rege a imutabilidade do prontuário que eu uso como analogia?

---

#### F12. Anexos, "recuperação de falhas" e "único artefato fora do aparelho" **[confere com o código: NÃO]**
**TRECHO** (p.39): "Para a sincronização e a recuperação de falhas, a aplicação comunica-se diretamente com a plataforma Supabase"; Quadro 17 (p.60): "attachment_sync_opt_out — Impede o envio do anexo para a nuvem, por decisão do paciente"; (p.74): "O relatório clínico em formato PDF [...] é o único artefato da aplicação que existe fora do aparelho"

**PROBLEMA IDENTIFICADO:** No código, nenhum arquivo (foto, anexo de receita) sobe para a nuvem. O caminho vai como `null` (`paraRemoto` em `sync-service.ts`), e o próprio comentário diz que "o backup de anexos ainda não funciona". Por isso o campo `attachment_sync_opt_out` não impede nada hoje, e a "recuperação de falhas" não recupera fotos nem receitas. Já a afirmação da p.74 contradiz o resto do texto: os dados clínicos sincronizam com o Supabase (RF 39) e há exportação completa dos dados (RF 42). Nenhum dos dois é "dentro do aparelho".

**POR QUE FRAGILIZA O TEXTO:** São afirmações sobre o fluxo de dados pessoais de saúde, justamente o que a LGPD e a minimização (seção 2.10.2) exigem descrever com precisão.

**O QUE ESTÁ FALTANDO:** Um mapa do fluxo de dados (o que fica no aparelho, o que vai para a nuvem, o que sai por exportação ou PDF) e a declaração explícita de que o backup de arquivos não foi implementado.

**PERGUNTA QUE EU PRECISO RESPONDER:** Quais dados, exatamente, saem do aparelho, por quais caminhos e por iniciativa de quem? O que o paciente perde se trocar de celular?

---

#### F13. A Clean Architecture é justificada por uma verificação que não aparece
**TRECHO** (p.51): "organizada em quatro camadas concêntricas"; "essas regras precisam ser verificáveis de forma independente de interface gráfica, banco de dados ou simulador de aparelho"; (p.51): "Essa decisão torna os cálculos determinísticos e verificáveis, permitindo simular a virada da meia-noite"

**PROBLEMA IDENTIFICADO:** (a) O texto anuncia quatro camadas e descreve três (domínio, dados, apresentação). A quarta não é nomeada. (b) O argumento central da escolha é a verificabilidade, mas o capítulo não mostra nenhuma verificação: nenhum caso de teste, nenhum resultado, nenhuma simulação de meia-noite. O repositório tem rotinas de conferência (`scripts/conferir-*.mjs`, como `conferir-resumo-de-adesao.mjs` e `conferir-reagendamento.mjs`), mas o TCC não as apresenta. A frase "não decorre de uma preferência teórica isolada, mas de uma necessidade prática" também pede evidência de que essa necessidade foi, de fato, atendida.

**POR QUE FRAGILIZA O TEXTO:** A justificativa fica como promessa ("permitindo simular") em vez de resultado ("simulei, e o resultado foi"). Esse é o ponto em que o trabalho mais poderia mostrar raciocínio científico, e ele não aparece.

**O QUE ESTÁ FALTANDO:** Nomear a quarta camada (ou corrigir o número) e apresentar as rotinas de conferência como evidência: o que verificam, quantos casos, que defeitos revelaram. O próprio texto já faz isso uma vez, com as cores na p.76, e é o trecho mais convincente do capítulo.

**PERGUNTA QUE EU PRECISO RESPONDER:** Quais são as quatro camadas? Que verificações executei sobre as regras de cálculo, com quais casos? Alguma delas encontrou um defeito que a arquitetura permitiu isolar?

---

#### F14. As "decisões negativas" não reforçam a independência do domínio
**TRECHO** (p.53): "Essas três decisões negativas reforçam o requisito não funcional de independência da camada de domínio em relação a frameworks externos"

**PROBLEMA IDENTIFICADO:** É uma conclusão que não decorre das premissas. Tailwind é da camada de apresentação, e ORM é da camada de dados. Pela própria regra de dependência descrita na p.51, a adoção deles não afetaria o domínio. As justificativas individuais também não têm base: "SQL direto mais legível" e "mostrou-se suficiente" não trazem critério nem evidência.

**POR QUE FRAGILIZA O TEXTO:** O parágrafo soa bem articulado, mas liga as decisões a um requisito com o qual elas não têm relação causal. Isso sugere que o argumento foi montado depois da decisão.

**O QUE ESTÁ FALTANDO:** O critério real de cada decisão (tamanho do bundle, curva de aprendizado, controle sobre SQL para migrações, necessidade de consultas específicas) e a relação correta com os requisitos.

**PERGUNTA QUE EU PRECISO RESPONDER:** Por que, de verdade, dispensei Tailwind, gerenciador de estado e ORM? Qual requisito cada decisão atende, se não o de independência do domínio?

---

#### F15. Números e contagens que não batem com o código **[confere com o código: NÃO]**
**TRECHO** (p.52): "estruturado em migrações sequenciais e estritamente aditivas, que apenas adicionam colunas ou tabelas" / "A base acumula vinte migrações"; (p.58): "em nove tabelas relacionais, definidas tanto na base local SQLite quanto na base remota"; RF 07 (p.44): "nove formas farmacêuticas"; RF 27 (p.45): "ações rápidas: confirmar e adiar"

**PROBLEMA IDENTIFICADO:** Há 21 migrações em `src/data/local/migrations/`. A 020 reescreve dados (`UPDATE … scheduled_for`) e a 021 apaga `sync_state`, então nem todas "apenas adicionam colunas ou tabelas". A base local tem mais que nove tabelas (catálogo CMED, `sync_state`, estado do app). O tipo `MedicationForm` tem dez valores, incluindo `other`, e o Quadro 10 (regra 09) cita "outra". O RF 27 lista duas ações rápidas, e o Quadro 25 e a p.71 descrevem três (tomei, pulei, adiar). O texto também não discute o custo da política aditiva, embora o código mostre que ele existe: colunas órfãs que bloqueavam a sincronização (`COLUNAS_ORFAS`).

**POR QUE FRAGILIZA O TEXTO:** Individualmente são pequenos, mas juntos transmitem imprecisão num capítulo cuja tese é rigor e fidelidade do registro.

**O QUE ESTÁ FALTANDO:** Conferência de cada número contra o código na versão final e uma frase sobre o preço da política aditiva.

**PERGUNTA QUE EU PRECISO RESPONDER:** Cada contagem do capítulo corresponde à versão entregue? Que custo a política de migrações só aditivas teve na prática?

---

#### F16. A gamificação muda de propósito ao longo do texto
**TRECHO** (p.40): "aplicar elementos de gamificação para estímulo à adesão"; (p.78): "A mensagem considera tanto as doses tomadas quanto as puladas, de modo que o reforço recai sobre o registro e não sobre o resultado"

**PROBLEMA IDENTIFICADO:** Na metodologia, a gamificação serve para estimular a *adesão*. Na implementação, ela reforça o *registro*, inclusive o de doses puladas. São objetivos diferentes. A segunda escolha pode até ser a mais correta, mas o texto não reconhece a mudança. Também não há evidência nem referência de que um indicador de progresso diário estimule adesão (Deterding et al., 2011, define gamificação e não mede efeito sobre adesão).

**POR QUE FRAGILIZA O TEXTO:** A promessa metodológica não é cumprida nem avaliada, e o leitor atento percebe a contradição entre as duas páginas.

**O QUE ESTÁ FALTANDO:** Assumir o objetivo real (estimular o registro, que alimenta a medida) e fundamentar ou delimitar o efeito esperado.

**PERGUNTA QUE EU PRECISO RESPONDER:** O indicador de progresso busca aumentar a adesão ou a completude do registro? Que evidência existe de que qualquer um dos dois acontece?

---

#### F17. Decisões de UX justificadas por afirmações sem apoio
**TRECHO** (p.49): "O histórico de adesão é o insumo do relatório levado à consulta, cujo intervalo costuma ser semestral"; (p.67): "A fim de transformar um ambiente complicado e denso de preenchimento em algo intuitivo e simples de operar"; (p.71): "A confirmação e o registro de dose pulada dispensam a abertura do aplicativo, decisão que reduz o esforço"; (p.76): "O padrão foi mantido por corresponder à convenção que o paciente já reconhece"

**PROBLEMA IDENTIFICADO:** São quatro decisões com justificativa apenas afirmada. (a) O intervalo "semestral" entre consultas não tem fonte e é usado para justificar a ausência de política de retenção, sem discutir o princípio de necessidade da LGPD. (b) "Intuitivo e simples" é um resultado de usabilidade que não foi medido. (c) Confirmar a dose pela tela de bloqueio reduz esforço, mas tensiona a heurística de prevenção de erros numa ação clínica. O comentário do código (`src/notifications/acoes.ts`) chama isso de "exceção consciente à confirmação visual que ações críticas exigem", e o texto não traz esse trade-off. (d) O conjunto de cores padrão reprovou no próprio teste de distinção, mas foi mantido "por convenção", sem evidência de que a convenção compense a falha para o público declarado.

**POR QUE FRAGILIZA O TEXTO:** Em (c) e (d), o texto tinha raciocínio de trade-off disponível (está no código) e o omitiu. Os argumentos ficam parecendo autoevidentes, e não ponderados.

**O QUE ESTÁ FALTANDO:** Fonte para a periodicidade de consulta, avaliação ou delimitação da afirmação de usabilidade e explicitação dos trade-offs em (c) e (d).

**PERGUNTA QUE EU PRECISO RESPONDER:** O que perco ao permitir confirmar sem abrir o app, e por que aceito essa perda? Por que manter como padrão um conjunto de cores que meu próprio teste reprovou?

---

#### F18. Afirmação técnica sobre a Notifee sem fonte e tensão com a seção 4.1
**TRECHO** (p.56): "Notifee, teve sua manutenção descontinuada, e seu mecanismo de reinicialização automática após a reinicialização do aparelho (boot receiver) deixou de ser corretamente invocado a partir do Android 12"; (p.42): "entrega o lembrete por meio do próprio sistema operacional do celular, e não por um mecanismo interno do aplicativo"; (p.58): "A reprodução do som é conduzida pela própria aplicação em serviço de primeiro plano, e não pelo canal de notificação"

**PROBLEMA IDENTIFICADO:** A descontinuação e o defeito no Android 12 são fatos técnicos verificáveis, mas não têm referência (repositório, issue, changelog). O texto também não diz se o defeito foi observado pelo autor. Além disso, a p.42 diz que o lembrete não depende de mecanismo interno, e a p.58 revela que o som depende de um serviço da própria aplicação. O texto não explica como esse serviço é iniciado com o app encerrado, nem o que acontece se ele falhar.

**POR QUE FRAGILIZA O TEXTO:** A troca de biblioteca é apresentada como decisão motivada por um defeito, mas a evidência do defeito não é mostrada. E a arquitetura do alarme parece mais simples na 4.1 do que é na 4.4.8.

**O QUE ESTÁ FALTANDO:** Uma fonte para o defeito (issue ou nota de versão) ou o relato do teste que o revelou, e a explicação de quem inicia o serviço de som e em que condição.

**PERGUNTA QUE EU PRECISO RESPONDER:** Como sei que o boot receiver da Notifee falha no Android 12, e onde isso está documentado? Quem inicia o serviço de som quando o app está encerrado?

---

#### F19. Repetição, fórmulas previsíveis e absolutos (estilo)
**TRECHO** (vários): "dose variável por horário" e "desconta a dose, não a unidade" aparecem em 3.2 (p.40), 4.2.1 (p.43), Quadro 5 (p.45), 4.3.2 (p.48), Quadro 10 (p.50) e 4.6.3 (p.72). "Adiamento uma única vez" aparece em p.43, Quadro 6, p.48, Quadro 10, Quadro 25 e p.72. RLS aparece em p.46, p.52 e p.55. LWW aparece em p.43, p.49, p.53 e Quadro 10. Contagem no texto: "nunca" 15 vezes; "deliberado/deliberada" 6; "Essa escolha/Essa decisão" 6; "de modo que/de modo a" 9; "em vez de" 7; "por sua vez" 5; "garant-" 10.

**PROBLEMA IDENTIFICADO:** O mesmo conteúdo reaparece como requisito, como regra e como jornada, quase sempre com a mesma formulação e sem acrescentar camada nova (por quê, evidência, limite). Os parágrafos seguem um molde fixo: afirmação, "Essa escolha/decisão é importante porque…", consequência em "de modo que…", contraste "e não X". Os absolutos ("nunca", "exatamente", "totalmente", "estritamente", "garante") aparecem com frequência justamente onde o código mostra exceções (F3, F6, F8, F11).

**POR QUE FRAGILIZA O TEXTO:** A repetição dá sensação de densidade sem aumentar o conteúdo, e o ritmo uniforme dilui o que é realmente importante. Os absolutos convertem decisões de projeto em garantias que o texto não demonstra.

**O QUE ESTÁ FALTANDO:** Cada reaparição deveria acrescentar algo. Por exemplo, o requisito diz *o quê*, a regra diz *por quê* e a jornada mostra *como o usuário percebe*. Os absolutos devem ficar só onde há garantia de fato.

**PERGUNTA QUE EU PRECISO RESPONDER:** Em cada vez que repito uma regra, o que o leitor aprende que não sabia na vez anterior? Onde escrevo "nunca", eu sei que é nunca?

---

#### F20. Frases de efeito com pouco conteúdo
**TRECHO** (p.40): "tratando a variação de dose, a correção auditável de registros e a granularidade do controle de estoque como núcleo do sistema, e não como funcionalidades acessórias de um aplicativo de saúde convencional"; (p.65): "de modo a demonstrar como decisões de arquitetura da informação, prevenção de erros e psicologia do design se materializam em telas"; (p.47): "As regras de negócio do Mapill operacionalizam, no comportamento do sistema, os princípios discutidos no referencial teórico"; (p.65): "Essa ordem não é arbitrária, ela é o que garante"

**PROBLEMA IDENTIFICADO:** São frases de enquadramento que anunciam rigor ("demonstrar", "operacionalizam", "núcleo") sem mecanismo. A seção 4.6 descreve telas, mas não *demonstra* nada, porque não há avaliação. "Operacionalizam os princípios" não diz qual princípio vira qual regra. "Aplicativo de saúde convencional" é uma categoria vaga que funciona só como contraste retórico.

**POR QUE FRAGILIZA O TEXTO:** O leitor recebe a promessa de uma análise que não vem, e o texto parece mais argumentativo do que é.

**O QUE ESTÁ FALTANDO:** Rastreabilidade explícita (princípio → regra → requisito → tela), que o texto já tem em parte nas remissões, e o verbo "descrever" no lugar de "demonstrar" onde não há avaliação.

**PERGUNTA QUE EU PRECISO RESPONDER:** Para cada frase de enquadramento, qual é a evidência concreta que ela anuncia, e ela aparece logo em seguida?

---

### Parte 2. Organização por categoria

#### Problemas de estilo e escrita
- **F19.** Repetição do mesmo conteúdo em requisito, regra e jornada; molde fixo de parágrafo; excesso de "nunca", "deliberado", "de modo que", "em vez de".
- **F20.** Frases de enquadramento que anunciam rigor sem entregá-lo ("demonstrar", "operacionalizam", "núcleo do sistema", "não é arbitrária").
- **F15.** Contagens e rótulos inconsistentes (20 ou 21 migrações, 9 ou 10 formas, 2 ou 3 ações, 9 tabelas locais). Estão aqui por serem de precisão redacional, mas tocam a sustentação.

#### Problemas de argumentação e raciocínio
- **F4 (parte c).** Critérios do Quadro 2 escolhidos para favorecer o Mapill; conclusão "troca amplitude por profundidade" circular.
- **F5.** Generalização sobre o mercado que contradiz a seção anterior.
- **F9.** LWW apresentado só pelas vantagens, e "nenhuma falha em silêncio" em tensão com o descarte silencioso.
- **F13 (parte b).** Arquitetura justificada por verificabilidade que não é mostrada.
- **F14.** "Decisões negativas reforçam a independência do domínio": conclusão que não decorre das premissas.
- **F16.** Gamificação que muda de objetivo (adesão → registro) sem reconhecimento.
- **F17.** Decisões de UX sem trade-off explícito (confirmar na tela de bloqueio, paleta padrão reprovada, "intuitivo").
- **F18 (parte 2).** Reconhece-se que o som depende de um serviço do app, em tensão com "não por mecanismo interno".

#### Problemas de sustentação científica
- **F1.** Metodologia sem procedimento de avaliação e sem protocolo do levantamento bibliográfico.
- **F2.** Público-alvo sem caracterização; heurísticas "estritamente" aplicadas sem avaliação heurística.
- **F3.** Garantia de alarme ("determinismo") contradita pelo código (janela de 7 dias, permissões).
- **F4 (partes a, b).** Afirmações sobre concorrentes sem referência; ausência de menção tratada como ausência de recurso.
- **F6.** "Totalmente offline" e "exclusão completa" condicionadas à rede no código.
- **F7.** Autorrelato tratado como "comportamento real"; medida de adesão não situada na literatura citada.
- **F8.** Estoque por eventos não resiste à sincronização (saldo materializado + LWW).
- **F10.** Filtro duplo de segurança descrito além do que o código faz.
- **F11.** Imutabilidade absoluta, analogia com prontuário sem fonte, terceiro estado da dose com nome errado.
- **F12.** Anexos não sobem, e o PDF não é o único dado que sai do aparelho.
- **F17 (parte a).** Periodicidade semestral de consulta sem fonte, usada para justificar retenção indefinida.
- **F18 (parte 1).** Defeito da Notifee no Android 12 sem fonte.

---

### Parte 3. Os três trechos prioritários

#### 1. A garantia do alarme (p.39-40, p.42 e p.56-57; F3, com F18)
**Por que é prioritário:** A confiabilidade do lembrete é a tese do trabalho. A seção 4.1 define o Mapill por ela, o RNF 02 a exige e a seção 4.4.8 inteira a defende. É também onde o texto é mais absoluto ("determinismo", "independentemente", "condição indispensável") e onde o código mais se afasta: só 7 dias de avisos ficam no sistema, reabastecidos apenas quando o app abre, sem tarefa de fundo, e com dependência de permissões que o próprio app diagnostica. Se a banca derrubar esse ponto, cai o diferencial principal.

**O que investigar antes de reescrever:**
- Levantar as condições exatas de disparo: janela de 7 dias, o que acontece no 8º dia sem abrir o app, permissões de alarme exato e de otimização de bateria, e se o comportamento vale só para Android.
- Executar e registrar testes em aparelho: app encerrado à força, reinicialização, vários dias sem abrir, modo economia de bateria. Anotar versão do Android e resultado.
- Conseguir uma fonte para o defeito da Notifee no Android 12 (issue ou changelog) ou relatar o teste que o evidenciou.
- Explicar quem inicia o serviço de som com o app encerrado.
- Reescrever a garantia como garantia condicionada, coerente com a regra 15 do próprio trabalho.

#### 2. Estado da arte e o Quadro 2 (p.40-41 e p.42; F4, com F5)
**Por que é prioritário:** É o único ponto em que o trabalho se compara com outros, e é dele que sai o posicionamento ("troca amplitude por profundidade", "a única a oferecer dose variável"). Hoje ele se apoia em fontes que não estão nas referências, em inferência a partir do silêncio de descrições de marketing e em critérios escolhidos pelo autor. A generalização da p.42 sobre "falhas recorrentes" do mercado contradiz o próprio quadro. A seção chama-se "trabalhos relacionados", mas não cita nenhum trabalho acadêmico.

**O que investigar antes de reescrever:**
- Instalar Medisafe e MyTherapy (versão e data registradas) e testar cada célula do quadro, em especial dose variável por horário, uso sem conta, estoque e código de barras.
- Registrar as páginas oficiais e os termos de uso usados (modelo de assinatura de 2026, repasse de dados) como referências com data de acesso.
- Buscar ao menos dois ou três trabalhos acadêmicos (TCCs, artigos de avaliação de apps de adesão) para compor os "trabalhos relacionados" e justificar a escolha dos critérios.
- Substituir a generalização da p.42 por uma afirmação delimitada ao que foi de fato observado.

#### 3. Consistência entre aparelhos: estoque por eventos, LWW e segurança (p.48, p.53-55; F8, F9 e F10)
**Por que é prioritário:** É a parte mais técnica e mais "científica" do capítulo, a que conecta o referencial de consistência eventual (Vogels, Kleppmann) à implementação. Nela, três afirmações não se sustentam juntas: o estoque "sem que uma ação apague o efeito da outra" é desfeito pelo LWW sobre o saldo materializado; o LWW é apresentado sem o custo de perda de escrita concorrente e de dependência do relógio do aparelho, enquanto o RNF 07 proíbe falha silenciosa e o trigger do servidor recusa em silêncio; e a "segunda camada" de filtro por usuário não existe no recebimento. Um avaliador de banco de dados ou sistemas distribuídos vai direto nesses pontos.

**O que investigar antes de reescrever:**
- Simular dois aparelhos na mesma conta confirmando doses offline e anotar o estoque final após sincronizar, comparado com a soma de `inventory_adjustments`.
- Decidir entre recalcular o saldo a partir dos eventos após a sincronização ou restringir a afirmação ao aparelho único.
- Ler em Kleppmann (2017) a discussão sobre LWW e relógios e escrever o trade-off: o que se perde, quando é aceitável e por que é aceitável no caso de um paciente com poucos aparelhos.
- Conciliar o RNF 07 com o descarte silencioso do LWW (o usuário é avisado?).
- Mapear no código quais operações têm filtro explícito por `user_id` e corrigir a descrição da redundância, incluindo a política de DELETE.

---

# Bloco 3: resultados e conclusão

## Diagnóstico crítico: Resumo, capítulo 5 (Resultados) e capítulo 6 (Conclusão)

Material analisado: RESUMO (p.7), capítulo 1 (p.16-18), capítulo 3 (p.39-41), trechos do capítulo 4 (p.42-58) e capítulos 5 e 6 (p.79-84).

Observação geral: os capítulos 5 e 6 são curtos, bem escritos e, em vários pontos, honestos. A limitação do Autostart está relatada e a conclusão reconhece o teste em aparelho único e a ausência de usuários. O problema central não está na frase. Está na distância entre o que foi testado (testes funcionais, feitos pelo autor, em um aparelho, com o segundo dispositivo simulado e sem métricas) e o que o resumo e o fechamento da conclusão afirmam (simplicidade de uso, redução de carga cognitiva, resposta à descontinuidade do tratamento). Soma-se a isso uma remissão metodológica que não se sustenta, porque a seção 3.1 não descreve a validação que o capítulo 5 diz executar.

---

### Parte 1. Fragilidades encontradas

#### 1. A validação remete a uma metodologia que não a descreve

**TRECHO:** "Este capítulo apresenta os resultados da validação técnica descrita na seção 3.1" (p.79). E também "Os cenários previstos na metodologia foram executados" (p.79) e "nos quatro cenários previstos na metodologia" (p.83).

**PROBLEMA IDENTIFICADO:** A seção 3.1 (p.39-40) trata de levantamento bibliográfico, stack, SQLite/Supabase, heurísticas de Nielsen, "determinismo dos alertas" e gamificação. Ela não descreve procedimento de validação, roteiro de testes, aparelho, critério de aprovação nem como o segundo dispositivo seria simulado. Os "cenários" só aparecem como objetivo específico (p.17) e na justificativa (p.18).

**POR QUE FRAGILIZA O TEXTO:** O leitor não consegue saber se os cenários e os critérios de "Aprovado" foram definidos antes ou depois dos testes. Sem isso, a validação parece construída a posteriori. A remissão também é falsa como referência cruzada, o que uma banca verifica facilmente.

**O QUE ESTÁ FALTANDO:** Um procedimento de validação no capítulo 3 com tipo de teste (funcional, manual), executor, ambiente (modelo, versão do Android), forma de simular o segundo dispositivo, lista de cenários, critério de aprovação e forma de registro.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Onde, no texto anterior ao capítulo 5, está escrito como a validação seria feita e o que contaria como sucesso? Se isso não existe, os critérios de aprovação foram fixados antes ou depois de observar o comportamento?

---

#### 2. "Aprovado, com os ajustes" esconde o resultado mais informativo, que foi a falha

**TRECHO:** "Os ajustes identificados ao longo dos testes foram incorporados e verificados novamente antes do registro de cada resultado" (p.79). No Quadro 28, três dos cinco cenários aparecem como "Aprovado, com os ajustes descritos na seção 5.2" (p.80).

**PROBLEMA IDENTIFICADO:** Só se registra o resultado final. As falhas observadas na primeira execução não são descritas: o que aconteceu, em qual cenário e com qual sintoma. A seção 5.2 lista correções ("a consulta à base local passou a aguardar...", "o critério LWW passou a ser aplicado também pelo servidor"), mas não diz qual comportamento incorreto cada uma corrigiu.

**POR QUE FRAGILIZA O TEXTO:** Num trabalho cuja contribuição declarada é justamente enfrentar "a sincronização assíncrona com a nuvem e a resolução de conflitos entre registros" (p.18), as falhas encontradas são o dado mais valioso. Apagá-las transforma um achado técnico ("LWW apenas na recepção não basta; o envio sobrescrevia edições mais novas") em um carimbo de aprovação. Também quebra a cadeia afirmação, evidência e interpretação da seção 5.2.

**O QUE ESTÁ FALTANDO:** Para cada ajuste, o par sintoma observado e causa identificada, e a correção como consequência. Por exemplo, qual dado se perdeu ou ficou divergente antes de o servidor aplicar o LWW no envio.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Na primeira execução, o que exatamente deu errado em cada um dos três cenários, e o que isso revela sobre a arquitetura offline-first que a literatura citada (Vogels; Kleppmann) não antecipava ou já antecipava?

---

#### 3. "Garantindo que prevaleça a edição mais recente" é categórico e ignora a limitação conhecida do LWW

**TRECHO:** "o critério LWW passou a ser aplicado também pelo servidor no envio, garantindo que prevaleça a edição mais recente" (p.80). Na conclusão: "passou a garantir a prevalência da edição mais recente" (p.83). No resumo: "refinamentos que garantem a prevalência da edição mais recente" (p.7).

**PROBLEMA IDENTIFICADO:** O LWW garante a prevalência do maior carimbo de tempo, não da edição mais recente no mundo real. Quando os carimbos vêm de relógios de aparelhos diferentes, eles podem estar dessincronizados. O teste usou "carimbo de tempo controlado" (p.79) e um minuto de diferença, o que elimina exatamente essa variável. A própria fonte citada no referencial (Kleppmann, 2017) discute a perda silenciosa de escritas no LWW e a falta de confiabilidade dos relógios.

**POR QUE FRAGILIZA O TEXTO:** A afirmação é repetida três vezes com "garantir" e sustenta-se em um cenário controlado desenhado para dar certo. É uma generalização além do que o teste permite, e a banca pode confrontá-la com a referência usada pelo próprio aluno.

**O QUE ESTÁ FALTANDO:** Explicar de onde vem o carimbo (relógio do aparelho ou do servidor), o que acontece com relógios divergentes e o que é descartado sem aviso. Depois, reformular o alcance da afirmação.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Se o relógio do aparelho offline estiver adiantado cinco minutos, qual edição vence? Essa situação foi testada ou apenas descartada, e por que o critério continua adequado para dados clínicos mesmo assim?

---

#### 4. O cenário de conflito é narrado, os demais só aparecem no quadro

**TRECHO:** "Os cenários previstos na metodologia foram executados [...] No cenário de conflito, o nome e o horário de um medicamento foram alterados" (p.79). E "Nos casos de controle, a edição do aparelho prevaleceu quando era a mais recente" (p.79).

**PROBLEMA IDENTIFICADO:** Só o conflito tem descrição de procedimento e resultado. Ausência de conexão, restabelecimento e restauração aparecem apenas como linhas do Quadro 28. Os "casos de controle" são mencionados em uma frase, sem procedimento. O Quadro 28 também não informa quantas vezes cada cenário foi executado nem que dados foram usados (um medicamento? vários? com doses já registradas?).

**POR QUE FRAGILIZA O TEXTO:** "Aprovado" sem descrição do que foi observado é uma afirmação sem evidência apresentada. O cenário "Sincronização por restauração", por exemplo, espera o "retorno de todos os dados, inclusive dos alarmes", mas não se diz como "todos" foi verificado.

**O QUE ESTÁ FALTANDO:** Para cada cenário, o volume e o tipo de dados usados, o número de execuções e o que foi conferido para dar o resultado como obtido. Um print ou registro de evidência ajudaria.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Que evidência concreta eu tenho de que "todos os dados" voltaram na restauração? Contei registros nas duas bases, comparei tabelas ou olhei as telas?

---

#### 5. A interpretação do conflito afirma mais do que o experimento isola

**TRECHO:** "Como nome e horário ficam em tabelas diferentes, apenas o nome esteve em conflito, o que confirma o critério da seção 4.3.5, no qual cada registro prevalece por inteiro" (p.79).

**PROBLEMA IDENTIFICADO:** O resultado (nome remoto e horário local convivendo) mostra que a granularidade do conflito é a tabela ou registro, não o medicamento como um todo. Isso é coerente com a regra, mas também revela algo que o texto não discute. Para o usuário, o "medicamento" final é uma combinação que nenhum dos dois lados produziu por inteiro, justamente o risco que a p.53 diz evitar ("poderia produzir um estado que nenhum dos dois dispositivos realmente gerou").

**POR QUE FRAGILIZA O TEXTO:** O dado é apresentado como confirmação quando, lido com rigor, expõe uma tensão com a justificativa do próprio critério. Além disso, uma única execução não "confirma" um critério. Ela ilustra.

**O QUE ESTÁ FALTANDO:** Discutir se a combinação nome remoto com horário local é aceitável clinicamente, e por quê. Seria preciso também reconhecer que "sem mesclagem" vale por tabela e não por entidade de domínio.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Se o nome remoto e o horário local se misturam, em que sentido isso difere da "mesclagem de campos" que a seção 4.4.6 diz evitar, e existe algum caso (por exemplo, a dose numa tabela e a forma farmacêutica em outra) em que essa mistura produz uma posologia incoerente?

---

#### 6. A falha na reinicialização contradiz um requisito não funcional e não é tratada como tal

**TRECHO:** "Após reiniciar o aparelho, sem abrir a aplicação, o alarme agendado não soou no horário previsto" (p.81). Compare com o RNF 02: "O lembrete deve funcionar com o aplicativo fechado e após reinicialização do aparelho" (p.47), e com a p.56-57, onde o disparo após o desligamento é "um requisito central deste projeto".

**PROBLEMA IDENTIFICADO:** Um requisito declarado como central não foi atendido no único aparelho testado. O texto trata isso como "limitação" atribuída ao fabricante, mas a seção 5.4 e a conclusão ("Os objetivos propostos foram atendidos", p.83) não dizem que o RNF 02 falhou. A mitigação (orientar o paciente a liberar o Autostart) também não aparece como testada. Não se informa se, depois de liberada a permissão, o alarme soou após reiniciar.

**POR QUE FRAGILIZA O TEXTO:** O resultado mais relevante para a confiabilidade, que é um dos três requisitos da pergunta de pesquisa, fica sem consequência no fechamento. O resumo omite essa falha por completo.

**O QUE ESTÁ FALTANDO:** Declarar o status do RNF 02 (não atendido ou atendido sob condição), testar a mitigação e explicar o que isso implica para a tese de que o alarme é confiável porque é delegado ao sistema operacional (p.57).

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Com o Autostart liberado, o alarme soou no horário após a reinicialização? Se não testei, posso afirmar que a mitigação resolve? E o RNF 02 está atendido ou não?

---

#### 7. Afirmação técnica categórica sem fonte e mitigação vaga

**TRECHO:** "Não há interface de programação que permita consultar ou conceder essa permissão. Como mitigação, a aplicação identifica alguns dos mais conhecidos fabricantes" (p.81).

**PROBLEMA IDENTIFICADO:** A primeira frase é uma afirmação universal sobre a plataforma, sem referência (documentação do Android ou da fabricante, ou literatura sobre restrições de OEM). "Alguns dos mais conhecidos fabricantes" não diz quais nem por que esses foram escolhidos.

**POR QUE FRAGILIZA O TEXTO:** É o argumento que transfere a responsabilidade da falha para fora do sistema. Sem fonte, é opinião do autor. A imprecisão sobre os fabricantes impede avaliar a cobertura da mitigação.

**O QUE ESTÁ FALTANDO:** Uma fonte que sustente a inexistência da API pública. A lista de fabricantes contemplados e o critério usado para escolhê-los.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Qual documento comprova que não existe API para consultar o Autostart da MIUI/HyperOS, e quais fabricantes a aplicação reconhece, com base em quê?

---

#### 8. O alarme promete quatro combinações e relata duas, sem a variável "conexão"

**TRECHO:** "A seção 3.1 estabelece que os alertas devem ser disparados independentemente de conexão e do estado da aplicação. O alarme foi verificado em aparelho nas quatro combinações [...]. Com o aparelho bloqueado, [...]. Com o aparelho em uso, [...]" (p.81).

**PROBLEMA IDENTIFICADO:** O texto anuncia quatro combinações, mas descreve o resultado agregado por apenas um dos eixos (bloqueado ou em uso). Não se sabe o que ocorreu com a aplicação ausente da lista de recentes, que é o caso crítico. A condição "sem conexão", citada como exigência na primeira frase, não aparece como variável testada. A seção 3.1 também não fala em "estado da aplicação", só em conexão (p.39-40).

**POR QUE FRAGILIZA O TEXTO:** O leitor não consegue verificar se a combinação mais difícil (bloqueado com a aplicação removida dos recentes) passou. A exigência anunciada e o teste relatado não coincidem.

**O QUE ESTÁ FALTANDO:** O resultado de cada uma das quatro combinações, se o modo avião estava ativo e quanto tempo entre agendamento e disparo (o Doze do Android age em períodos longos de inatividade).

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Com a aplicação removida dos recentes e o aparelho bloqueado por horas, sem conexão, o alarme soou no minuto exato? Quantas vezes testei isso?

---

#### 9. O atendimento aos objetivos é demonstrado por localização no texto, não por evidência

**TRECHO:** "O objetivo geral [...] foi atendido pela aplicação descrita no capítulo 4 e validada neste capítulo. [...] o levantamento de requisitos [...] está no capítulo 2 e na seção 4.2. [...] A implementação [...] está descrita ao longo do capítulo 4" (p.81-82).

**PROBLEMA IDENTIFICADO:** A seção 5.4 equivale "objetivo atendido" a "existe um capítulo que trata disso". O objetivo geral é dado como "validado neste capítulo", mas a validação cobriu só sincronização e alarme. Cronograma, estoque, compromissos, cadastro e relatório não passaram por nenhum teste relatado. O primeiro objetivo ("levantar, com base na literatura") exigiria mostrar a rastreabilidade de requisito para fonte, e não só apontar a seção. O quinto objetivo pede "analisar", e o capítulo 5 entrega aprovado ou reprovado sem análise.

**POR QUE FRAGILIZA O TEXTO:** Parece um checklist de sumário. Não se sustenta o verbo "atendido" para objetivos cujo produto não foi avaliado, e o leitor percebe a circularidade.

**O QUE ESTÁ FALTANDO:** Para cada objetivo, qual evidência mostra o atendimento e em que grau. Nos casos sem teste, a admissão explícita de que foram implementados, mas não validados.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Qual evidência, além da descrição no capítulo 4, mostra que o desconto de estoque, a geração de cronogramas e os compromissos funcionam corretamente? E quais requisitos do Quadro 8 eu consigo ligar a uma fonte específica do capítulo 2?

---

#### 10. A pergunta de pesquisa é respondida pela existência do artefato, e dois dos três requisitos não foram avaliados

**TRECHO:** "atendendo a requisitos de usabilidade, segurança e confiabilidade. A resposta construída ao longo do trabalho é o Mapill" (p.83).

**PROBLEMA IDENTIFICADO:** A pergunta é "de que maneira", e a resposta é o nome do artefato mais um princípio arquitetural (gravar primeiro no aparelho). A pergunta exige também atender a usabilidade, segurança e confiabilidade. A usabilidade não foi avaliada (a conclusão admite que não houve usuários). A segurança (RLS, isolamento por usuário, dupla verificação da p.55) não aparece em nenhum cenário do capítulo 5. A confiabilidade teve a falha da reinicialização.

**POR QUE FRAGILIZA O TEXTO:** A conclusão responde à parte arquitetural da pergunta e trata o restante como respondido. É o ponto em que a coerência entre problema, método e resultado mais falha.

**O QUE ESTÁ FALTANDO:** Separar o que foi demonstrado (comportamento offline-first em cenários controlados) do que foi apenas projetado (usabilidade por heurísticas, segurança por RLS), e dizer explicitamente que parte da pergunta fica em aberto.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Que evidência do capítulo 5 sustenta "usabilidade" e "segurança"? Testei, por exemplo, que um usuário não consegue ler as linhas de outro na base remota?

---

#### 11. O fechamento da conclusão e do resumo afirma efeitos que o trabalho excluiu do escopo

**TRECHO:** "o Mapill demonstra que é possível conciliar [...] a simplicidade de uso. Ao assumir as tarefas de lembrar, registrar e antecipar [...], a aplicação transfere ao aparelho parte da carga cognitiva [...], oferecendo uma resposta concreta à descontinuidade do tratamento" (p.83-84). O resumo repete quase igual: "Conclui-se que é possível conciliar [...] a simplicidade de uso, transferindo ao aparelho parte da carga cognitiva" (p.7).

**PROBLEMA IDENTIFICADO:** "Simplicidade de uso" não foi medida nem observada. "Transferir carga cognitiva" é um efeito sobre pessoas, fundamentado teoricamente (Risko e Gilbert, na seção 2.3.2), mas não verificado. "Resposta concreta à descontinuidade" implica efeito sobre a adesão, e a justificativa excluiu isso expressamente: "permanecendo a avaliação da eficácia terapêutica junto a usuários finais como proposta para trabalhos futuros" (p.18). O próprio parágrafo anterior da conclusão lista essas limitações, e o "Em síntese" as ignora.

**POR QUE FRAGILIZA O TEXTO:** É a extrapolação mais clara do trabalho, e está justamente nas frases que o leitor mais lê: a última do resumo e a última da conclusão. O texto contradiz sua própria delimitação de escopo.

**O QUE ESTÁ FALTANDO:** Distinguir "a aplicação foi projetada para" (hipótese apoiada na teoria) de "a aplicação demonstrou" (resultado). Hoje o texto usa o segundo registro para algo que só tem o primeiro tipo de sustentação.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Que dado deste trabalho mostra simplicidade de uso ou redução de carga cognitiva? Se não há, a frase é uma conclusão ou uma hipótese para o trabalho futuro (d)?

---

#### 12. O resumo relata a validação sem dizer como foi feita e omite a falha

**TRECHO:** "A validação técnica, conduzida em aparelho físico, confirmou o comportamento da arquitetura [...]. O alarme de dose foi verificado com o aparelho bloqueado e em uso" (p.7).

**PROBLEMA IDENTIFICADO:** O resumo não diz que os testes foram funcionais e manuais, feitos pelo autor, em um único aparelho e com o segundo dispositivo simulado. Também não menciona a falha após reinicialização. Quem lê só o resumo entende uma validação mais ampla e um alarme sem ressalvas. O resumo ainda afirma que a solução "tem a interface guiada pelas heurísticas de Nielsen", mas nada no resultado avalia isso.

**POR QUE FRAGILIZA O TEXTO:** O resumo é a parte do trabalho que circula sozinha (repositório, banca, busca). Ele deveria ser a síntese mais cautelosa, e é a mais otimista.

**O QUE ESTÁ FALTANDO:** O tipo e o alcance da validação em uma frase, o principal achado negativo (reinicialização e Autostart) e o ajuste da frase final ao que foi de fato demonstrado.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Se alguém ler apenas o resumo, que ideia terá sobre quem testou, em quantos aparelhos e com que resultado para o alarme? Essa ideia corresponde ao que aconteceu?

---

#### 13. As "decisões que distinguem a proposta" apoiam-se numa comparação por ausência de menção

**TRECHO:** "Entre as decisões que distinguem a proposta, destacam-se o desconto de estoque pela quantidade efetivamente administrada [...] e a distinção entre dose pulada e dose sem resposta, que mantém fiel o histórico levado ao profissional de saúde" (p.83).

**PROBLEMA IDENTIFICADO:** "Distinguem" pressupõe que os concorrentes não fazem isso. Mas a seção 3.2 diz apenas que as descrições públicas do Medisafe e do MyTherapy "não detalham" o desconto de estoque (p.40). Não detalhar não equivale a não fazer, e o Quadro 2 converte isso em "Não". Essas decisões também não foram validadas no capítulo 5. "Mantém fiel o histórico levado ao profissional" não foi verificado com nenhum profissional nem com nenhum relatório real.

**POR QUE FRAGILIZA O TEXTO:** A originalidade é afirmada sem teste dos concorrentes e sem teste da própria funcionalidade. A banca pode perguntar se o aluno instalou os aplicativos concorrentes.

**O QUE ESTÁ FALTANDO:** Uma verificação direta nos concorrentes, ou a reformulação para "não documentado publicamente". Faltam também evidências de que as três regras funcionam como descrito.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** Instalei o Medisafe e o MyTherapy e confirmei que descontam uma unidade fixa e não distinguem dose pulada de dose sem resposta? Se não, com que base afirmo que essas decisões distinguem o Mapill?

---

#### 14. Os trabalhos futuros não correspondem às limitações e deixam de fora o que a justificativa prometeu

**TRECHO:** "A partir das limitações apresentadas e das funcionalidades deixadas fora do escopo, identificam-se as seguintes frentes" (p.84), seguido do item b), "organização do cuidado por tratamento [...] como o de uma terapia oncológica, [...] sessões de radioterapia agendadas em lote".

**PROBLEMA IDENTIFICADO:** Há três desencontros. (i) A justificativa (p.18) remete a avaliação da eficácia terapêutica para trabalhos futuros, mas a seção 6.1 só traz a avaliação de usabilidade (d). (ii) O item b) não decorre de nenhuma limitação nem exclusão de escopo apresentada. A seção 4.1 não menciona agrupamento por tratamento nem radioterapia, e o item surge pela primeira vez aqui. (iii) As limitações técnicas mais diretas da validação não viram frentes de trabalho: teste com dois aparelhos reais e relógios independentes, testes automatizados e verificação de segurança.

**POR QUE FRAGILIZA O TEXTO:** A frase de abertura promete derivação lógica que a lista cumpre só em parte. O item b) parece um desejo de produto, não uma continuidade de pesquisa.

**O QUE ESTÁ FALTANDO:** Ligar cada item a uma limitação ou exclusão identificada no texto e incluir a avaliação de eficácia na adesão que a justificativa prometeu.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** De qual limitação observada nasce o item b)? E por que a avaliação de efeito sobre a adesão, prometida na p.18, não aparece na lista?

---

#### 15. Repetição literal de fórmulas entre resumo, resultados e conclusão, e contagem inconsistente de cenários

**TRECHO:** "a prevalência da edição mais recente e o recebimento, pelos demais aparelhos da mesma conta, de registros feitos sem conexão" aparece quase igual na p.7, na p.80 e na p.83. "é possível conciliar, em uma mesma aplicação, o funcionamento independente de conexão, a fidelidade do registro clínico e a simplicidade de uso" aparece igual na p.7 e na p.83. "nos quatro cenários previstos na metodologia" (p.83), contra os cinco cenários do Quadro 28 (p.80).

**PROBLEMA IDENTIFICADO:** A mesma ideia volta nas mesmas palavras, o que dá sensação de síntese sem acrescentar interpretação. A tríade "conexão, fidelidade, simplicidade" soa conclusiva, mas só o primeiro termo foi testado. Somam-se a repetição de "Aprovado, com os ajustes descritos na seção 5.2" em três linhas do quadro e a divergência entre quatro cenários (objetivo) e cinco (quadro), com "sincronização por restauração" e "entre dispositivos" desdobrados sem explicação.

**POR QUE FRAGILIZA O TEXTO:** A repetição cristaliza como "resultado" uma formulação que não passou por evidência. A contagem divergente sugere falta de controle sobre o próprio desenho experimental.

**O QUE ESTÁ FALTANDO:** Cada retomada deveria acrescentar algo (a interpretação na conclusão, o alcance no resumo), além de uma contagem de cenários coerente entre o objetivo, o quadro e a conclusão.

**PERGUNTA QUE EU PRECISO RESPONDER PARA APROFUNDAR O ARGUMENTO:** O que a conclusão diz sobre a sincronização que os resultados ainda não disseram? São quatro ou cinco cenários, e por que a sincronização se desdobrou em dois?

---

### Parte 2. Organização por categoria

#### Problemas de estilo e escrita
- **15.** Repetição literal de fórmulas entre resumo, resultados e conclusão, "Aprovado, com os ajustes" em série e contagem de cenários divergente.
- **9 (em parte).** A seção 5.4 tem construção enumerativa e repetitiva ("está no capítulo...", "está nas seções..."), como um índice remissivo.
- **5.2, primeiro parágrafo (ligado ao 2).** "O comportamento observado em cada cenário foi refinado de modo a preservar a convergência entre as bases que a consistência eventual pressupõe" (p.79) soa técnico, mas não diz qual comportamento nem como foi refinado.

#### Problemas de argumentação e raciocínio
- **1.** Remissão a uma metodologia de validação que não existe no capítulo 3.
- **5.** A interpretação do conflito "confirma" o critério, mas expõe uma tensão com a justificativa do próprio critério.
- **6.** A falha do RNF 02 não repercute no atendimento aos objetivos.
- **9.** Objetivo atendido é tratado como objetivo descrito em algum capítulo.
- **10.** A pergunta de pesquisa é respondida pela existência do artefato, com usabilidade e segurança sem avaliação.
- **14.** Trabalhos futuros desconectados das limitações e da promessa da justificativa.

#### Problemas de sustentação científica
- **2.** Falhas iniciais omitidas, correções sem sintoma e sem causa.
- **3.** "Garantir a edição mais recente" sem discutir o relógio, contra a própria referência (Kleppmann).
- **4.** Cenários aprovados sem procedimento, número de execuções nem evidência apresentada.
- **7.** Afirmação sobre a inexistência de API sem fonte e mitigação não especificada.
- **8.** Quatro combinações anunciadas e duas relatadas, sem a variável conexão.
- **11.** Simplicidade de uso, carga cognitiva e resposta à descontinuidade afirmadas sem dado.
- **12.** O resumo omite o tipo e o alcance da validação e o achado negativo.
- **13.** A distinção frente aos concorrentes se baseia em ausência de menção pública.

---

### Parte 3. Os três trechos prioritários

#### Prioridade 1. O fechamento da conclusão e a última frase do resumo (achados 11 e 12)

**Trechos:** "o Mapill demonstra que é possível conciliar [...] a simplicidade de uso [...] transfere ao aparelho parte da carga cognitiva [...], oferecendo uma resposta concreta à descontinuidade do tratamento" (p.83-84) e "Conclui-se que é possível conciliar [...]" (p.7).

**Por que é prioritário:** São as frases de maior visibilidade do trabalho, e são as que mais extrapolam. Afirmam efeitos sobre pessoas (simplicidade, carga cognitiva, adesão) num trabalho sem avaliação com usuários e que, na p.18, excluiu essa avaliação do escopo por escrito. A banca tende a ler resumo e conclusão primeiro, e a contradição com a própria justificativa é fácil de apontar.

**O que investigar antes de reescrever:**
1. Listar, para cada termo da tríade (independência de conexão, fidelidade do registro, simplicidade de uso), qual teste do capítulo 5 o sustenta. O que não tiver teste sai do registro de "demonstra".
2. Reler a seção 2.3.2 (Risko e Gilbert) e decidir se a transferência de carga cognitiva é uma premissa de projeto derivada da teoria ou um resultado. Hoje é apresentada como resultado.
3. Decidir o que, com honestidade, foi demonstrado: que uma arquitetura em que toda operação é gravada localmente primeiro se comportou como esperado em cenários controlados de conectividade num aparelho Android. Verificar se isso basta para responder à pergunta de pesquisa e dizer o que fica em aberto.
4. Incluir no resumo quem testou, em quantos aparelhos, com simulação do segundo dispositivo, e o achado da reinicialização.

#### Prioridade 2. A validação sem método e sem falhas registradas (achados 1, 2 e 4)

**Trechos:** "validação técnica descrita na seção 3.1" (p.79), "Os ajustes identificados ao longo dos testes foram incorporados e verificados novamente antes do registro de cada resultado" (p.79) e o Quadro 28 com "Aprovado, com os ajustes descritos na seção 5.2" (p.80).

**Por que é prioritário:** É a base empírica do trabalho inteiro, e hoje ela não tem procedimento declarado. O que o capítulo 5 chama de resultados é, na prática, o estado final depois das correções. Sem saber o que falhou, o leitor não consegue avaliar a contribuição que a justificativa reivindica ("cuja investigação e resolução constituem parte central da contribuição deste trabalho", p.18). As falhas encontradas são o conteúdo científico mais forte que o aluno tem, e estão escondidas.

**O que investigar antes de reescrever:**
1. Verificar se existe o roteiro de testes original, com datas, e se os cenários foram definidos antes da execução. Se sim, trazê-lo para o capítulo 3 (tipo de teste, executor, aparelho, simulação do segundo dispositivo, critério de aprovação, número de execuções).
2. Para cada um dos três cenários "aprovado com ajustes", recuperar, no histórico de commits ou nas anotações, o sintoma observado na primeira execução e a causa diagnosticada.
3. Definir para cada cenário o que foi conferido para declarar o resultado obtido (telas, consulta às duas bases, contagem de registros).
4. Resolver a contagem de cenários (quatro no objetivo e na conclusão, cinco no quadro).

#### Prioridade 3. A falha da reinicialização e o atendimento aos objetivos (achados 6, 9 e 10)

**Trechos:** "o alarme agendado não soou no horário previsto" (p.81), "O objetivo geral [...] foi atendido pela aplicação descrita no capítulo 4 e validada neste capítulo" (p.81) e "Os objetivos propostos foram atendidos" (p.83).

**Por que é prioritário:** A confiabilidade do alarme é apresentada no capítulo 4 como requisito central (RNF 02, p.47; p.56-57), e a confiabilidade é um dos três pilares da pergunta de pesquisa. O único teste que a contrariou não repercute no balanço dos objetivos. Ao mesmo tempo, a seção 5.4 declara validados componentes (estoque, cronograma, compromissos) que não passaram por nenhum teste relatado. O fechamento afirma atendimento pleno, e o conteúdo mostra atendimento parcial e condicionado.

**O que investigar antes de reescrever:**
1. Testar a mitigação: com o Autostart liberado no Redmi, reiniciar sem abrir o aplicativo e verificar se o alarme soa no horário. O resultado muda o status do RNF 02 de "não atendido" para "atendido sob condição de configuração do usuário", o que é defensável.
2. Buscar uma fonte (documentação do Android sobre restrições de OEM ou literatura sobre "background restrictions" de fabricantes) que sustente a afirmação de que não há API para o Autostart.
3. Montar, para cada objetivo específico e para cada termo da pergunta (usabilidade, segurança, confiabilidade), a evidência que existe no trabalho e classificar em demonstrado, implementado e não validado, ou não abordado. Reescrever a seção 5.4 e o segundo parágrafo da conclusão a partir dessa classificação, e não da localização dos capítulos.

---

