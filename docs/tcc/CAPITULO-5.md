# Capítulo 5 - texto para inclusão

> **Escrito em 25/09/2026**, depois da validação em aparelho dos quatro cenários da seção 3.2 e das
> duas correções da sincronização feitas no mesmo dia.
>
> **Onde entra.** No lugar do título solto "5 RESULTADOS", antes de "6. CONCLUSÃO".
>
> **Fontes do conteúdo.** Os resultados estão nos blocos 1 (restauração, 08/09), 22 (conflito,
> 25/09) e 23 (registros feitos offline, 25/09) do `docs/ROTEIRO-DE-TESTE.md`. O alarme e os
> defeitos anteriores a 25/09 estão no `docs/HISTORICO-DE-PROGRESSO.md` (08/09, 12/09 e 16/09) e
> nos commits `08cffb2`, `00588fe`, `d8438d1`, `ed7b9bf` e `55bd0a8`.
>
> **Este arquivo sai** depois que o texto estiver no documento e conferido.

---

**5 RESULTADOS**

	Este capítulo apresenta os resultados da validação técnica descrita na seção 3.2, voltada ao comportamento da arquitetura *offline-first* em cenários controlados e à confiabilidade do disparo do alarme de dose. A validação consistiu em testes funcionais conduzidos pelo autor em aparelho físico, um Xiaomi Redmi Note 14 Pro 5G com Android 16, seguindo um roteiro no qual cada passo registra o procedimento executado e o resultado esperado. Os defeitos encontrados ao longo dos testes foram corrigidos e verificados novamente antes do registro de cada resultado.

**5.1 Validação da Arquitetura *Offline-First***

	Os cenários previstos na metodologia foram executados sobre a sincronização entre a base local e a base remota apresentada na seção 4.4.6. Nos cenários que envolvem um segundo dispositivo, as edições desse dispositivo foram simuladas por operações diretas na base remota, com carimbo de tempo controlado, o que permite reproduzir com precisão a ordem dos acontecimentos.

	No cenário de conflito, a edição feita sem conexão alterou o nome e o horário de um medicamento, e a base remota recebeu um novo nome um minuto depois. Após a reconexão, prevaleceram o nome da base remota e o horário do aparelho. O resultado decorre de nome e horário pertencerem a registros distintos, das tabelas de medicamentos e de prescrições, dos quais apenas o primeiro esteve em conflito. O comportamento corresponde ao critério da seção 4.3.5, aplicado ao registro inteiro e sem mescla de campos. Dois casos de controle completaram o cenário. Quando a edição do aparelho era a mais recente, ela prevaleceu nas duas bases, e sem edição pendente o aparelho recebeu a versão remota ao retornar ao primeiro plano.

	O Quadro 28 sintetiza os procedimentos e os resultados obtidos em todos os cenários.

Quadro 28 - Cenários de validação da arquitetura *offline-first*

| Cenário | Procedimento | Resultado esperado | Resultado obtido |
|---|---|---|---|
| Ausência de conexão | Cadastro de medicamento com o modo avião ativado | Cadastro concluído sem erro e alteração registrada como pendente de envio | Aprovado. A tela de conta indicou uma alteração aguardando envio |
| Restabelecimento da conectividade | Desativação do modo avião e retorno à aplicação | Envio automático da alteração pendente | Aprovado. A pendência foi enviada sem intervenção do paciente |
| Sincronização por restauração | Reinstalação da aplicação e acesso com a mesma conta | Retorno do consentimento, da ficha de saúde, dos medicamentos, do histórico e dos alarmes | Aprovado, após as correções descritas na seção 5.2 |
| Sincronização entre dispositivos | Registro enviado à base remota com data de edição anterior à última sincronização do aparelho | Recebimento do registro pelo aparelho | Aprovado, após as correções descritas na seção 5.2 |
| Conflito entre registros | Edição sem conexão no aparelho, seguida de edição posterior do mesmo registro na base remota e da reconexão | Prevalência da edição mais recente nas duas bases | Aprovado, após as correções descritas na seção 5.2 |

Fonte: elaborado pelo autor.

**5.2 Defeitos Identificados Durante a Validação**

	A validação revelou cinco defeitos na sincronização, todos corrigidos e verificados novamente em aparelho. Nenhum deles provocava perda definitiva de dados, uma vez que a base remota preservava os registros, mas todos comprometiam a convergência entre as bases que a consistência eventual pressupõe, conforme discutido na seção 2.9.3.

	Na primeira execução do cenário de restauração, a aplicação reinstalada solicitava novamente o aceite dos termos e o preenchimento da ficha de saúde, e nenhum medicamento retornava. A causa era de ordem, e não de ausência de sincronização. A aplicação consultava a base local, ainda vazia, antes de concluir o recebimento dos dados remotos. A correção inverteu essa ordem e passou a reagendar os alarmes ao final do recebimento, uma vez que o agendamento reside no sistema operacional e não acompanha os dados restaurados.

	Corrigida a ordem, as alergias ainda não retornavam. As colunas que armazenam listas, como alergias, contatos de emergência e posologia, são texto na base local e *jsonb* na base remota, e atravessavam a fronteira entre as duas sem conversão. A correção passou a converter esses valores nos dois sentidos, e uma rotina de conferência automatizada passou a verificar essa travessia.

	O terceiro defeito envolvia a exclusão das doses futuras de um tratamento, que apagava fisicamente as linhas da base local. Uma linha inexistente não é enviada, de modo que a exclusão nunca alcançava a base remota, e um segundo aparelho ou uma reinstalação trazia as doses de volta. A correção substituiu a exclusão física pela lógica, que se propaga pela sincronização conforme a modalidade descrita na seção 4.3.5.

	Os dois últimos defeitos foram identificados na análise do código que antecedeu o cenário de conflito. No primeiro, o envio gravava a versão local na base remota sem comparar carimbos de tempo, de modo que prevalecia o aparelho que sincronizasse por último, e não a edição mais recente. A correção levou o critério *Last-Write-Wins* também ao servidor, que passou a recusar a atualização mais antiga que a armazenada. No segundo, o recebimento selecionava os registros cuja data de edição fosse posterior à última sincronização. Um registro editado sem conexão chegava à base remota depois, com data antiga, e nunca era buscado pelos demais aparelhos da mesma conta. A correção separou as duas funções da data, de modo que o carimbo de edição continua decidindo o conflito, enquanto o recebimento passou a considerar o instante de chegada à base remota, registrado pelo próprio servidor. O segundo defeito foi reproduzido em aparelho antes da correção, e ambos foram validados depois dela.

**5.3 Confiabilidade do Alarme**

	A seção 3.2 estabelece que os alertas devem ser disparados independentemente de conexão e do estado da aplicação. O alarme foi verificado em aparelho nas quatro combinações entre aparelho bloqueado ou em uso e aplicação presente ou ausente da lista de recentes. Com o aparelho bloqueado, a tela do alarme foi exibida sobre a tela de bloqueio, e a confirmação registrou o desfecho da dose. Com o aparelho em uso, o sistema exibiu a notificação com as ações de confirmar e pular, e o toque levou à tela do horário correspondente.

	A validação revelou um defeito de privacidade. Responder à dose com o aparelho bloqueado deixava a aplicação acessível sem autenticação, porque a permissão de exibição sobre a tela de bloqueio pertencia à atividade principal, compartilhada por toda a aplicação. A correção isolou a tela do alarme em uma atividade própria, e o encerramento do alarme passou a devolver o aparelho ao bloqueio.

	O teste de reinicialização revelou uma limitação de plataforma. Após reiniciar o aparelho, sem abrir a aplicação, o alarme agendado não soou no horário previsto, e soou no instante em que o aparelho foi desbloqueado. O agendamento sobreviveu à reinicialização, mas a entrega ficou retida pela restrição de inicialização automática que a fabricante aplica a aplicativos de terceiros, conhecida como *Autostart*. Não há interface de programação que permita consultar ou conceder essa permissão, e a mitigação adotada foi orientar o paciente na tela de ajuda de alertas da própria aplicação.

**5.4 Atendimento aos Objetivos**

	O objetivo geral, desenvolver uma aplicação móvel de apoio à gestão da rotina medicamentosa sob arquitetura *offline-first*, foi atendido pela aplicação descrita no capítulo 4 e validada neste capítulo. Quanto aos objetivos específicos, o levantamento de requisitos com base na literatura sobre *mHealth* e adesão medicamentosa está no capítulo 2 e na seção 4.2. A especificação dos requisitos funcionais, não funcionais e das regras de negócio está nas seções 4.2 e 4.3, sintetizada nos Quadros 3 a 10. A arquitetura, o modelo de dados e as interfaces estão nas seções 4.4, 4.5 e 4.6. A implementação do cadastro de medicamentos, da geração de cronogramas, das notificações, do registro de ingestões, do controle de estoque e da organização de compromissos está descrita ao longo do capítulo 4. Por fim, a análise da arquitetura nos cenários de ausência de conexão, restabelecimento, sincronização e conflito corresponde às seções 5.1 e 5.2.

---

## Frase para a 4.4.6

Para o capítulo 4 continuar fiel ao app depois das correções de 25/09. Entra depois do parágrafo que
começa com "O empate favorece a versão local".

	O mesmo critério é aplicado pelo servidor no envio, que recusa a atualização mais antiga que a armazenada. O recebimento, por sua vez, seleciona os registros pelo instante de chegada à base remota, e não pela data de edição, de modo que uma edição feita sem conexão alcance os demais aparelhos da mesma conta.

## Decisões de redação

- **Sem menção a cuidador.** O Quadro 2 põe o "login de cuidador" fora do escopo, e citar cuidador
  aqui pareceria contradição. O texto fala em "demais aparelhos da mesma conta".
- **Sem datas nem commits no texto.** Estão acima, como fonte, para a defesa.
- **O defeito do envio não foi reproduzido em aparelho antes da correção**, por decisão de 25/09 de
  registrar só o processo validado. O texto diz isso com precisão, e só afirma a reprodução prévia
  para o defeito do recebimento.
