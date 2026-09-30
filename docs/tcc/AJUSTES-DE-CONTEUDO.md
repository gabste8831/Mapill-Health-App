# Ajustes de conteúdo: o que trocar, e por quê

> **Montado em 30/09** a partir da [`REVISAO-CRITICA.md`](REVISAO-CRITICA.md), contra
> `TCC Gabriel Steffens Atualizado 29_09.docx (2).pdf`. Cada item traz a página, o **texto atual**
> (para achar com Ctrl+F no Google Docs) e o **texto novo**, pronto para colar. As afirmações
> técnicas foram conferidas no código do app.
>
> São 36 trocas, a maioria de uma frase, em quatro blocos. Os blocos 1 a 3 corrigem pontos em que o texto afirma mais do que
> o app faz ou do que o teste mostrou, e são os que a banca pode cobrar. O bloco 4 é aprofundamento,
> para fazer se sobrar tempo.
>
> Várias trocas acrescentam linhas. Depois de aplicar, exportar o PDF para eu refazer os números do
> sumário e das listas.

---

## Bloco 1. O texto diz mais do que o app faz

### 1.1 Alarme: "determinismo" e "independentemente" (p.34, 40, 57, 81, 83)

O app agenda os avisos para os próximos sete dias, e essa janela se renova quando o paciente abre o
app ou responde a um aviso. A entrega também depende das permissões e do fabricante, como a 5.3
mostrou. O texto hoje promete disparo "no minuto exato" e "independentemente" de tudo.

**a) p.34, seção 2.8, fim do segundo parágrafo**

Atual:
> Essa abordagem garante o determinismo temporal, pois permite que os alertas locais ultrapassem
> barreiras de otimização de bateria, como o modo repouso, e sejam disparados no minuto exato,
> assegurando a integridade do suporte terapêutico independentemente de fatores externos de conexão.

Novo:
> Essa abordagem permite que os alertas sejam disparados no horário previsto mesmo com a aplicação
> fechada e sem conexão, desde que o sistema operacional não os retenha por políticas de economia de
> bateria ou por restrições próprias do fabricante, limitação discutida na seção 5.3.

**b) p.34, seção 2.8.1, fim do segundo parágrafo**

Atual:
> Simultaneamente, o uso de APIs nativas de agendamento garante o determinismo temporal, permitindo
> que os alertas locais sejam disparados com precisão, contornando os mecanismos convencionais de
> suspensão de recursos dos dispositivos móveis e assegurando a pontualidade rigorosa exigida pelo
> suporte terapêutico.

Novo:
> Simultaneamente, o uso das interfaces nativas de agendamento de alarmes exatos permite que o aviso
> seja entregue no horário mesmo com o aparelho em repouso, embora essa entrega continue sujeita às
> permissões concedidas pelo paciente e às políticas de cada fabricante.

**c) p.39 e 40, seção 3.1, última frase do parágrafo da UX**

Atual:
> O sistema foi projetado para operacionalizar o motor de disparos via notificações locais e
> alarmes, assegurando o determinismo dos alertas independentemente de conexão com a rede, além de
> aplicar elementos de gamificação para estímulo à adesão.

Novo:
> O sistema foi projetado para disparar os lembretes por meio de notificações locais e alarmes
> agendados no próprio sistema operacional, de modo que não dependam de conexão com a rede, além de
> aplicar elementos de gamificação para estímulo à adesão.

**d) p.57, seção 4.4.8.** Acrescentar depois de "...condição indispensável diante do contexto
apresentado." e antes de "Os botões de ação da notificação...":

> Os avisos são agendados para os sete dias seguintes, e essa janela é renovada sempre que o
> paciente abre a aplicação ou responde a um aviso. Um intervalo de mais de sete dias sem nenhuma das
> duas interações interromperia os lembretes, limitação aceita por pressupor um paciente que registra
> suas doses com regularidade.

**e) p.82, seção 5.4.** Acrescentar no fim da seção, depois de "...corresponde às seções 5.1 e 5.2.":

> O objetivo relativo às notificações foi atendido com uma ressalva, uma vez que, após a
> reinicialização do aparelho, o alarme só soou quando o aparelho foi desbloqueado, enquanto a
> restrição de inicialização automática do fabricante estava ativa, conforme a seção 5.3.

**f) p.83, capítulo 6, segundo parágrafo**

Atual:
> Os objetivos propostos foram atendidos.

Novo:
> Os objetivos propostos foram atendidos, com a ressalva sobre a reinicialização do aparelho
> apresentada na seção 5.3.

### 1.2 Ações da notificação (p.45 e 71)

No código, a **notificação comum** tem dois botões, Tomei e Pulei. O **Adiar** só existe na **tela
cheia do alarme**, e a notificação do modo alarme não leva botões.

**a) p.45, Quadro 6, requisito 27**

Atual:
> A notificação deve oferecer ações rápidas: confirmar e adiar

Novo:
> A notificação deve oferecer ações rápidas: confirmar e pular

**b) p.71, frase antes do Quadro 25**

Atual:
> O alarme de dose apresenta três ações diretamente na notificação, definidas no momento do
> agendamento, conforme o Quadro 25.

Novo:
> A tela do alarme de dose apresenta três ações, e a notificação comum oferece duas delas, confirmar
> e pular, definidas no momento do agendamento, conforme o Quadro 25.

**c) Título do Quadro 25 (p.71 e Lista de Quadros)**

Atual:
> Quadro 25 - Ações do alarme de dose disponíveis na notificação

Novo:
> Quadro 25 - Ações de resposta ao alarme de dose

### 1.3 Contagens que não batem com o código (p.43, 44, 51, 52, 83)

**a) p.43, seção 4.2.1:** "nove formas farmacêuticas" → "**dez** formas farmacêuticas".

**b) p.44, Quadro 4, requisito 07**

Atual:
> O sistema deve cadastrar medicamentos em nove formas farmacêuticas: comprimido, líquido, gota,
> injeção, pomada, sublingual, inalador, adesivo e sachê

Novo:
> O sistema deve cadastrar medicamentos em dez formas farmacêuticas: comprimido, líquido, gota,
> injeção, pomada, sublingual, inalador, adesivo, sachê e outra

**c) p.51, seção 4.4.1:** "organizada em quatro camadas concêntricas" → "organizada em **três**
camadas concêntricas". As subseções 4.4.2 a 4.4.4 descrevem três: domínio, dados e apresentação.

**d) p.52, seção 4.4.3, primeira frase**

Atual:
> estruturado em migrações sequenciais e estritamente aditivas, que apenas adicionam colunas ou
> tabelas, nunca removem ou renomeiam estruturas existentes.

Novo:
> estruturado em migrações sequenciais que adicionam colunas ou tabelas, nunca removem ou renomeiam
> estruturas existentes e, quando precisam converter dados, preservam o conteúdo já registrado.

**e) p.52, seção 4.4.3:** "A base acumula vinte migrações" → "A base acumula **vinte e uma**
migrações".

**f) p.83, capítulo 6:** "nos quatro cenários previstos na metodologia" → "nos cenários previstos na
metodologia" (o Quadro 28 tem cinco linhas, e a metodologia cita quatro situações).

### 1.4 Anexos e exclusão (p.49, 60, 74, 83)

Hoje os arquivos (fotos e receitas) ficam só no aparelho. A sincronização leva os dados, mas não os
arquivos. E, sem conexão, a exclusão pelo titular apaga o aparelho, mas não alcança a nuvem.

**a) p.60, Quadro 17, descrição de `attachment_sync_opt_out`**

Atual:
> Impede o envio do anexo para a nuvem, por decisão do paciente

Novo:
> Reservado para impedir o envio do anexo à nuvem, por decisão do paciente, quando o envio de
> arquivos for implementado

**b) p.74, seção 4.6.4**

Atual:
> O relatório clínico em formato PDF encerra a jornada e é o único artefato da aplicação que existe
> fora do aparelho.

Novo:
> O relatório clínico em formato PDF encerra a jornada e é o único documento que a aplicação gera
> para ser levado à consulta.

**c) p.49, seção 4.3.5.** Depois de "...ordem que impede que a sincronização seguinte os traga de
volta.", acrescentar:

> Sem conexão, os dados são apagados do aparelho, e a remoção na nuvem só ocorre quando a
> solicitação é feita com o aparelho conectado.

**d) p.83, parágrafo das limitações.** Depois de "...que a aplicação pode orientar, mas não
contornar.", acrescentar:

> Além disso, os arquivos anexados, como fotos e receitas, permanecem apenas no aparelho, e a
> sincronização transporta somente os dados estruturados.

---

## Bloco 2. Sincronização: assumir o custo do LWW

O LWW faz prevalecer o **maior carimbo de tempo**, que vem do relógio do aparelho, e descarta a
versão perdedora. Kleppmann (2017), citado como apoio, é justamente quem aponta esses dois custos. O
texto precisa dizer isso e explicar por que o custo é aceitável no Mapill.

### 2.1 p.36, seção 2.9.3, segundo parágrafo

Atual (da segunda frase até o fim do parágrafo):
> Conforme fundamentado nas diretrizes modernas de sistemas distribuídos e replicação de dados
> (Kleppmann, 2017), a solução aplica a política de LWW, apoiada na resolução de conflitos por
> carimbos de tempo. Em cenários de conflito entre a edição na base offline e os dados da nuvem, o
> registro com o carimbo de tempo mais recente é preservado como o estado definitivo. Este rigor
> cronológico é vital para evitar a duplicidade de registros de medicação e garantir que o histórico
> de adesão do paciente seja fiel à sua última interação real com o fármaco.

Novo:
> Entre as estratégias descritas por Kleppmann (2017), a solução adota a política de LWW, na qual,
> diante de duas versões conflitantes de um mesmo registro, prevalece a que tiver o carimbo de tempo
> mais recente. O próprio autor aponta os custos dessa escolha, já que a versão descartada se perde
> sem aviso e o carimbo depende do relógio de cada aparelho, que pode estar adiantado ou atrasado. No
> Mapill, esse custo foi considerado aceitável porque cada conta pertence a um único paciente, o que
> torna raras as edições simultâneas do mesmo registro, e porque os registros de ingestão não são
> editados, mas corrigidos por um novo lançamento, de modo que o LWW não chega a descartar doses já
> registradas.

### 2.2 "Edição mais recente" (p.7, 8, 80, 83)

Trocar "edição mais recente" por "edição com o carimbo de tempo mais recente" nestes quatro lugares:

- **p.7, resumo:** "levou a refinamentos que garantem a prevalência da edição mais recente" →
  "levou a refinamentos que garantem a prevalência da edição com o carimbo de tempo mais recente".
- **p.8, abstract:** "ensure the prevalence of the most recent edit" → "ensure the prevalence of the
  edit with the most recent timestamp".
- **p.80, seção 5.2:** "garantindo que prevaleça a edição mais recente" → "garantindo que prevaleça
  a edição com o carimbo de tempo mais recente".
- **p.83, capítulo 6:** "passou a garantir a prevalência da edição mais recente" → "passou a garantir
  a prevalência da edição com o carimbo de tempo mais recente".

### 2.3 Estoque com dois aparelhos (p.48, seção 4.3.2)

No aparelho, o estoque é composto por eventos. Na sincronização, porém, o saldo do item segue o LWW
como qualquer outra linha. Assim, dois aparelhos descontando doses sem conexão podem perder um dos
descontos. Acrescentar no fim da 4.3.2, depois de "...sem que uma ação apague o efeito da outra.":

> Essa composição por eventos vale no aparelho. Na sincronização, o saldo do item de estoque segue o
> critério de LWW, como os demais registros, de modo que descontos feitos em dois aparelhos da mesma
> conta, ambos sem conexão, podem não se somar, limitação aceita diante do uso previsto de um
> aparelho principal por paciente.

---

## Bloco 3. Registro, validação, resumo e conclusão

### 3.1 O registro de dose é autorrelato (p.24 e 47)

Osterberg e Blaschke (2005) chamam de monitoramento eletrônico o dispositivo que registra a
abertura da embalagem. Tocar em "Tomei" é autorrelato com hora marcada. Não vale menos por isso, mas
precisa ser dito assim.

**a) p.24, seção 2.3.3, primeiro parágrafo**

Atual:
> A ação de confirmar a ingestão ou ignorar ativamente o gatilho fundamenta o que a literatura
> define como monitoramento eletrônico. Em arquiteturas móveis de saúde, cada uma dessas interações
> é rigorosamente registrada com um carimbo de data e hora exato (timestamp), gerando um histórico
> cronológico do comportamento real do paciente perante a terapia.

Novo:
> A ação de confirmar a ingestão ou registrar a dose pulada aproxima-se do que a literatura define
> como monitoramento eletrônico. Em arquiteturas móveis de saúde, cada uma dessas interações é
> registrada com data e hora exatas (timestamp), gerando um histórico cronológico das respostas do
> paciente perante a terapia.

**b) p.24, seção 2.3.3, segundo parágrafo (até antes de "O Quadro 1 compara...")**

Atual:
> Esse registro contínuo e objetivo supera o simples acompanhamento diário individual. Segundo o
> estudo de Osterberg e Blaschke (2005), o monitoramento eletrônico representa o método mais preciso
> para aferir a adesão, sobrepondo-se a relatos manuais ou contagem de pílulas. Com isso, a
> plataforma atua como um repositório confiável, viabilizando a construção de um histórico clínico
> transparente e permitindo ao próprio paciente, ou aos profissionais de saúde, a consulta exata das
> tomadas concluídas e das eventuais omissões ao longo do tratamento.

Novo:
> Segundo Osterberg e Blaschke (2005), o monitoramento eletrônico, feito por dispositivos que
> registram a abertura da embalagem, é o método mais preciso para aferir a adesão. O registro feito
> em uma aplicação não alcança essa objetividade, pois depende da confirmação do próprio paciente e
> permanece, portanto, uma forma de autorrelato, sujeita ao viés apontado no Quadro 1. Em relação ao
> relato manual, contudo, ele acrescenta o horário exato de cada resposta e a distinção entre dose
> tomada, pulada e sem resposta, o que torna o histórico mais detalhado e rastreável para o paciente
> e para os profissionais de saúde.

**c) p.47, seção 4.3.1:** "como um documento fiel ao comportamento real do paciente" → "como um
documento fiel ao que o paciente de fato respondeu".

### 3.2 A validação ganha método (p.40, seção 3.1)

A 3.1 não diz como a validação foi feita, e o capítulo 5 remete a ela. Trocar o último parágrafo da
3.1.

Atual:
> Por fim, a etapa de validação técnica do trabalho consistiu na análise do comportamento da
> arquitetura offline-first em cenários controlados, simulando situações de ausência de conexão,
> restabelecimento de conectividade, sincronização de dados e conflito entre registros locais e
> remotos, de modo a verificar a confiabilidade e a consistência da solução proposta diante das
> condições de uso previstas.

Novo:
> Por fim, a etapa de validação técnica consistiu em testes funcionais conduzidos pelo autor em
> aparelho físico, seguindo um roteiro escrito no qual cada passo registra o procedimento executado e
> o resultado esperado. Foram analisados o comportamento da arquitetura offline-first em situações de
> ausência de conexão, restabelecimento de conectividade, sincronização de dados e conflito entre
> registros locais e remotos, e a entrega do alarme de dose com o aparelho bloqueado, em uso e após a
> reinicialização. As edições de um segundo dispositivo foram simuladas por operações diretas na base
> remota, com carimbo de tempo controlado. Um cenário foi considerado aprovado quando o resultado
> observado no aparelho coincidiu com o resultado esperado registrado no roteiro, e, quando divergiu,
> a causa foi corrigida e o cenário executado novamente.

### 3.3 Resumo e abstract (p.7 e 8)

**a) Resumo, a frase da validação**

Atual:
> A validação técnica, conduzida em aparelho físico, confirmou

Novo:
> A validação técnica, conduzida pelo autor em aparelho físico, com um segundo dispositivo simulado
> pela base remota, confirmou

**b) Resumo, a frase do alarme**

Atual:
> O alarme de dose foi verificado com o aparelho bloqueado e em uso, com a aplicação presente ou
> ausente da lista de recentes.

Novo:
> O alarme de dose foi verificado com o aparelho bloqueado e em uso, com a aplicação presente ou
> ausente da lista de recentes, e a entrega após a reinicialização mostrou-se dependente da
> restrição de inicialização automática imposta pelo fabricante.

**c) Resumo, a última frase**

Atual:
> Conclui-se que é possível conciliar, em uma mesma aplicação, o funcionamento independente de
> conexão, a fidelidade do registro clínico e a simplicidade de uso, transferindo ao aparelho parte
> da carga cognitiva que a rotina terapêutica impõe ao paciente.

Novo:
> Conclui-se que é possível conciliar, em uma mesma aplicação, o funcionamento independente de
> conexão e a fidelidade do registro clínico, e que a avaliação com usuários do público-alvo é o
> passo necessário para verificar os efeitos da aplicação sobre a rotina terapêutica.

**d) Abstract, as três frases equivalentes**

- "The technical validation, conducted on a physical device, confirmed" → "The technical
  validation, conducted by the author on a physical device, with a second device simulated through
  the remote database, confirmed"
- "The dose alarm was verified with the device locked and in use, with the application present in
  or absent from the recent apps list." → "The dose alarm was verified with the device locked and in
  use, with the application present in or absent from the recent apps list, and delivery after a
  restart proved dependent on the autostart restriction imposed by the manufacturer."
- "It is concluded that it is possible to reconcile, in a single application, operation independent
  of connection, fidelity of the clinical record and simplicity of use, transferring to the device
  part of the cognitive load that the therapeutic routine imposes on the patient." → "It is
  concluded that it is possible to reconcile, in a single application, operation independent of
  connection and fidelity of the clinical record, and that an evaluation with users from the target
  audience is the necessary next step to verify the effects of the application on the therapeutic
  routine."

### 3.4 Conclusão, o fechamento (p.83 e 84)

"Simplicidade de uso" e "transfere parte da carga cognitiva" não foram medidos, porque não houve
usuários. O fechamento passa a dizer o que foi feito e o que falta verificar.

Atual:
> Em síntese, o Mapill demonstra que é possível conciliar, em uma mesma aplicação, o funcionamento
> independente de conexão, a fidelidade do registro clínico e a simplicidade de uso. Ao assumir as
> tarefas de lembrar, registrar e antecipar a reposição dos medicamentos, a aplicação transfere ao
> aparelho parte da carga cognitiva que a rotina terapêutica impõe ao paciente, oferecendo uma
> resposta concreta à descontinuidade do tratamento que motivou o desenvolvimento do trabalho.

Novo:
> Em síntese, o Mapill demonstra que é possível conciliar, em uma mesma aplicação, o funcionamento
> independente de conexão e a fidelidade do registro clínico. Ao assumir as tarefas de lembrar,
> registrar e antecipar a reposição dos medicamentos, a aplicação foi projetada para transferir ao
> aparelho parte da carga cognitiva que a rotina terapêutica impõe ao paciente. Verificar esse
> efeito, e com ele a contribuição do Mapill diante da descontinuidade do tratamento que motivou este
> trabalho, é o passo que a avaliação com usuários indicada na seção 6.1 deverá cumprir.

---

## Bloco 4. Aprofundamento (se sobrar tempo)

Os itens abaixo não contradizem o app, mas a revisão crítica apontou que estão frágeis. Estão
detalhados na [`REVISAO-CRITICA.md`](REVISAO-CRITICA.md), com página e pergunta a responder. Eu
escrevo o texto novo de cada um quando você quiser atacar.

- **p.19 e 20:** a WHO (2003) descreve a não adesão como multidimensional, e o trabalho ataca o
  esquecimento e a logística, sem delimitar isso. "Raramente é negligência intencional" não tem
  fonte.
- **p.16 e 19:** nenhuma fonte mostra que lembretes digitais melhoram a adesão, que é a premissa do
  trabalho. Vale uma revisão sistemática sobre o tema.
- **p.20:** Sweller (1988) trata de aprendizagem e resolução de problemas. A ligação com o paciente
  precisa ser dita como analogia, e não como resultado do autor.
- **p.23:** Bates et al. (2003) trata de apoio à decisão para médicos, e "reduz drasticamente as
  taxas de omissão" e "fadiga de tratamento" estão sem fonte.
- **p.36:** RLS é controle de acesso, e não anonimização.
- **p.40 e 41:** as páginas oficiais do Medisafe e do MyTherapy, que sustentam o Quadro 2, não estão
  nas referências.
- **Estilo:** "garante" e variações aparecem 26 vezes, "assegura" 17, "nunca" 15. Vale uma passada
  trocando os absolutos onde o código tem exceção.
