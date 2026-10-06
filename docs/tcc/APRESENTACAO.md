# Apresentação da defesa: texto dos slides e roteiro

> **Versão 1, 06/10**, para validação do Gabriel. Fonte de todo o conteúdo é o TCC fechado
> (`TCC Gabriel Steffens Atualizado 05_10.docx.pdf`). Regras da apresentação na skill `apresentacao-tcc`.
>
> **Como ler.** Cada slide tem o **texto do slide** (o que vai na tela, em tópicos curtos), o
> **visual** (figura ou quadro do TCC, quando houver) e o **roteiro** (o que falar, na sua voz). O
> tempo ao lado do título é uma estimativa.
>
> **Marcações.** `[VALIDAR]` é decisão sua. `[DEMO]` é o que acontece no celular espelhado.
> `[VÍDEO]` é o trecho que tem reserva gravada.

## Tempo total

| Bloco | Slides | Tempo |
|---|---|---|
| A. Contexto | 1 a 5 | 4 min 30 s |
| B. Mapill, parte teórica | 6 a 9 | 3 min 30 s |
| C. Demonstração | 10 | 8 min |
| D. Fechamento | 11 a 14 | 3 min 30 s |
| **Total** | | **19 min 30 s** |

Sobram 30 segundos de folga. Se a demo atrasar, os primeiros cortes estão indicados em cada bloco.

---

## A. Contexto

### Slide 1. Capa (15 s)

**Texto do slide**
- MAPILL: APLICAÇÃO MÓVEL PARA MITIGAÇÃO DE FALHAS LOGÍSTICAS E COGNITIVAS NA ADESÃO AO TRATAMENTO
  MEDICAMENTOSO
- Acadêmico: Gabriel Steffens
- Prof. Orientador: M.e Marciel de Liz Santos
- Data: `[VALIDAR: data da defesa]`

**Roteiro**
> Boa noite a todos. Meu nome é Gabriel Steffens, e vou apresentar o meu trabalho de conclusão de
> curso, o Mapill, uma aplicação móvel, para mitigação de falhas logísticas e cognitivas na adesão ao processo medicamentoso orientado
> pelo professor Marciel de Liz Santos.

---

### Slide 2. Introdução e problema (1 min)

> Junta os slides "Introdução" e "Problematização" do modelo. `[VALIDAR]` se prefere manter os dois
> separados.

**Texto do slide**
- Descontinuidade do tratamento, um desafio de saúde pública
- Polifarmácia e tratamentos longos geram sobrecarga mental
- Falhas cognitivas, como esquecer a dose
- Falhas logísticas, como o remédio acabar ou a consulta passar
- **Pergunta.** Como uma aplicação offline-first pode centralizar medicamentos, estoque e
  compromissos com usabilidade, segurança e confiabilidade?

**Roteiro**
> A descontinuidade do tratamento medicamentoso é um dos grandes desafios da saúde pública. A
> Organização Mundial da Saúde mostra que a adesão depende de muitos fatores, e que não dá para
> colocar a culpa só no paciente. Quem toma vários remédios por muito tempo precisa lembrar de
> vários horários, controlar quanto ainda tem de cada um e não perder as consultas. Isso gera dois
> tipos de falha. A cognitiva, que é simplesmente esquecer a dose, e a logística, que é o remédio
> acabar ou a receita vencer sem que a pessoa perceba. A pergunta que o trabalho tenta responder é
> como uma aplicação móvel, que funcione mesmo sem internet, pode concentrar tudo isso num lugar só,
> de forma segura e confiável.

---

### Slide 3. Justificativa (1 min)

**Texto do slide**
- Medisafe limita o plano gratuito a 2 medicamentos (desde jan. 2026)
- MyTherapy é gratuito, mas se mantém compartilhando dados dos usuários com empresas farmacêuticas
- Nenhum dos dois descreve suporte à dose variável por horário
- Mapill tem todas as funções sem custo, sem repasse de dados e com dose variável

**Visual** `[VALIDAR]`: versão reduzida do Quadro 2, só com as linhas "Funcionalidades essenciais
gratuitas", "Gratuidade sem repasse de dados a terceiros", "Funcionamento sem conta" e "Dose variável
por horário". Fonte: Medisafe (2026) e MyTherapy (2026).

**Roteiro**
> Já existem aplicativos para isso, e os dois mais conhecidos são o Medisafe e o MyTherapy. O
> Medisafe passou, em janeiro deste ano, para um modelo em que o plano gratuito aceita só dois
> medicamentos, e coisas básicas como o aviso de estoque ficaram pagas. O MyTherapy é gratuito, mas
> se sustenta repassando dados de uso, anonimizados, para empresas farmacêuticas e institutos de
> pesquisa. Além disso, nenhum dos dois descreve suporte a uma dose que muda conforme o horário, que
> é comum em tratamentos como o de insulina. O Mapill não cobra por nenhuma função, não repassa dados
> e trata a posologia com essa fidelidade. Em vez de ampliar o escopo para o bem-estar geral, ele se
> aprofunda no tratamento medicamentoso.

---

### Slide 4. Objetivos (1 min)

> Junta "Objetivo Geral" e "Objetivos Específicos" do modelo. `[VALIDAR]`

**Texto do slide**
- **Geral.** Desenvolver uma aplicação móvel para a rotina medicamentosa, com agendamento e registro
  de doses, estoque e compromissos, numa arquitetura offline-first (sem dependência de conexão)
- **Específicos**
  - Levantar os requisitos na literatura sobre mHealth e adesão
  - Especificar requisitos funcionais, não funcionais e regras de negócio
  - Projetar arquitetura, modelo de dados e interfaces
  - Implementar a aplicação
  - Analisar a arquitetura offline-first em cenários controlados de conexão

**Roteiro**
> O objetivo geral foi desenvolver uma aplicação móvel que apoiasse a gestão da rotina
> medicamentosa, juntando o agendamento e o registro das doses, o controle de estoque e os
> compromissos de saúde, numa arquitetura que funciona primeiro no aparelho. Para chegar lá, os
> objetivos específicos seguiram o caminho natural de um projeto de software. Primeiro levantar os
> requisitos na literatura, depois especificá-los, projetar a arquitetura e as telas, implementar e,
> por fim, analisar como a arquitetura se comporta sem conexão, na volta da conexão e em conflitos
> entre aparelhos.

---

### Slide 5. Fundamentação (1 min)

> No modelo é "Revisão da Literatura". Cada conceito aparece ligado à decisão que ele justifica.

**Texto do slide**
- Memória prospectiva (Baddeley; Eysenck; Anderson, 2010) → alarme
- Desoneração cognitiva (Risko; Gilbert, 2016) → o app lembra e calcula pelo paciente
- SSoT (Loshin, 2010) → um lugar só para remédio, estoque e consultas
- Offline-first (Allsopp, 2014) e LWW (Kleppmann, 2017) → funciona sem internet e sincroniza
- Heurísticas de Nielsen (1994), WCAG (W3C, 2018) e LGPD (Brasil, 2018) → interface e dados

**Roteiro**
> Vou passar rápido pela fundamentação, só pelo que justifica as principais decisões do projeto. Esquecer a dose
> é uma falha da memória prospectiva, que é lembrar de fazer algo no futuro, e por isso o centro do
> app é um alarme. A desoneração cognitiva explica por que o app deve calcular estoque e horários
> pelo paciente. O conceito de fonte única de verdade justifica juntar tudo num só lugar. O
> paradigma offline-first e o critério Last-Write-Wins sustentam o funcionamento sem internet e a
> sincronização. E as heurísticas de Nielsen, as diretrizes de acessibilidade da WCAG e a LGPD
> orientam a interface e o tratamento dos dados de saúde.

**Corte possível** `[VALIDAR]`: se o tempo apertar, este slide cai para 30 segundos, falando só da
memória prospectiva e do offline-first.

---

## B. Mapill, parte teórica

### Slide 6. O que é o Mapill (45 s)

> No modelo é "Desenvolvimento". `[VALIDAR]` trocar o título para "MAPILL", como pede a orientação.

**Texto do slide**
- Três exigências
  - funcionar sem internet
  - representar a posologia com fidelidade (dose variável por horário)
  - lembrar mesmo com o app fechado
- Registro clínico pessoal, que lembra e registra
- Não prescreve, não sugere dose e não avalia o tratamento
- Uma conta por paciente, e uso completo sem conta

**Roteiro**
> O desenvolvimento partiu de três exigências. O app tinha de funcionar sem internet, representar o
> tratamento com fidelidade, inclusive quando a dose muda ao longo do dia, e lembrar o paciente mesmo
> com o aplicativo fechado, que é justamente quando ele mais precisa. Desde o início, defini também o
> que o Mapill não é. Ele é um registro clínico pessoal, que lembra da dose e guarda o que de fato
> aconteceu. Ele não prescreve, não sugere dose e não avalia se o tratamento está certo, porque esse
> papel é do profissional de saúde. Cada conta é de um paciente, e dá para usar tudo sem criar conta.

---

### Slide 7. Arquitetura (1 min)

**Texto do slide**
- Clean Architecture em três camadas
  - **Domínio.** Regras de negócio em TypeScript puro, sem framework
  - **Dados.** SQLite no aparelho e Supabase (PostgreSQL) na nuvem
  - **Apresentação.** Telas e sistema de design próprio
- React Native, Expo e TypeScript
- Alarme pelo agendador nativo do Android (react-native-notify-kit)

**Visual** `[VALIDAR]`: o TCC não tem figura de arquitetura. Opções são deixar só os tópicos ou
desenhar três círculos concêntricos (domínio no centro). Se desenhar, a fonte é "elaborado pelo autor".

**Roteiro**
> A aplicação segue a Clean Architecture, em três camadas. No centro fica o domínio, com as regras de
> negócio escritas em TypeScript puro, sem depender de nenhuma biblioteca. Isso permite testar
> cálculos como a geração de horários e a taxa de adesão sem precisar de um celular. Em volta fica a
> camada de dados, com o SQLite no aparelho e o Supabase na nuvem, e por fora a apresentação, com as
> telas sobre um sistema de design próprio. O app foi feito em React Native com Expo, e o alarme é
> entregue pelo agendador do próprio Android, e não por um processo do app. É isso que faz ele tocar
> mesmo com o aplicativo fechado.

---

### Slide 8. Regras que fazem diferença (1 min)

**Texto do slide**
- Dose sem resposta **nunca** vira "pulada" sozinha
- O estoque desconta a **dose**, e não uma unidade
- Correção **nunca** sobrescreve, gera um novo registro
- Um aviso por horário, e o adiamento só uma vez

**Visual**: recorte do Quadro 10 (regras 01, 02, 06, 11 e 12), se couber sem apertar.

**Roteiro**
> Das vinte regras de negócio, estas quatro mostram o cuidado com o registro clínico. Uma dose que o
> paciente não respondeu nunca é marcada como pulada só porque o tempo passou, porque o app não pode
> afirmar algo que ninguém disse. O estoque desconta exatamente a quantidade da dose, então quem toma
> dois comprimidos de uma vez tem dois descontados. Uma correção nunca apaga o registro antigo, ela
> cria um novo apontando para ele, como num prontuário. E remédios no mesmo horário geram um aviso
> só, que pode ser adiado uma única vez.

---

### Slide 9. Sincronização e segurança (45 s)


**Texto do slide**
- Tudo é gravado primeiro no aparelho
- A nuvem é cópia e ponte entre aparelhos
- Conflito resolvido por Last-Write-Wins, com o registro inteiro e sem mesclar campos
- Isolamento por usuário com RLS e token JWT

**Visual**: Figura 1 (diagrama de sequência do Last-Write-Wins).

**Roteiro**
> Toda operação é gravada primeiro no próprio aparelho, e a nuvem funciona como cópia de segurança e
> ponte entre dispositivos. Quando o mesmo registro é editado em dois lugares, vence a edição mais
> recente, e vence inteira, sem misturar campos. Se o app juntasse campos de versões diferentes,
> poderia criar uma posologia que ninguém escreveu. Na nuvem, cada tabela tem políticas de segurança
> em nível de linha, e cada usuário só acessa os próprios dados, identificado pelo token JWT.

---

## C. Demonstração

### Slide 10. Demonstração (8 min)

**Texto do slide**
- Demonstração

**Roteiro de abertura**
> Agora vou mostrar o aplicativo funcionando no meu celular.

Tela parada, com o vídeo a prontos... mas vou tentar a demonstração na hora

**Antes da defesa** (checklist)
- Base de demonstração com alguns dias de histórico, para a adesão, o calendário e o relatório não
  aparecerem vazios
- Uma dose cadastrada para tocar no minuto do passo c `[VALIDAR: horário]`
- Permissões de notificação e alarme, Autostart e Não Perturbe conferidos
- Espelhamento testado no computador do local
- Vídeo de reserva gravado **por trechos** (a até f), para pular direto ao que falhar
- Uma embalagem de remédio real à mão, para o código de barras

**Caminho**

| # | Tela | Tempo | Recado |
|---|---|---|---|
| a | Cadastro por código de barras | 1 min 30 s | catálogo da CMED no aparelho, campos que nascem vazios, dose variável |
| b | Tela inicial | 45 s | pendentes primeiro, estados e progresso |
| c | Alarme com o celular bloqueado | 2 min | o Android dispara, "Tomei" desconta o estoque |
| d | Adesão, calendário e correção | 1 min 30 s | pulada e sem resposta separadas, correção sem apagar |
| e | Relatório em PDF | 1 min | gerado no aparelho, compartilhado pelo paciente |
| f | Temas e cores | 45 s | acessibilidade |
| | Folga | 30 s | |

**a. Cadastro por código de barras** `[DEMO]` `[VÍDEO]`
> Vou cadastrar um remédio lendo o código de barras da caixa. O app consulta um catálogo que vem
> dentro dele, montado a partir da base pública da CMED, com cerca de sete mil apresentações, e por
> isso funciona até sem internet. Ele já preenche o nome, o princípio ativo e a dosagem. Repare que
> os horários aparecem vazios. Isso é proposital, para que ninguém aceite um horário errado por
> pressa. E aqui dá para colocar uma dose diferente em cada horário. Enquanto o essencial não está
> preenchido, os campos opcionais ficam escondidos, e quando fecha, o app avisa que já dá para
> concluir. O resto, como receita, tipo de lembrete e estoque, fica disponível sem ser obrigatório.

**b. Tela inicial** `[DEMO]`
> Esta é a tela do dia a dia. As doses que ainda esperam resposta vêm primeiro, e as já registradas
> depois. Cada dose mostra o estado por escrito, e não só pela cor. Lá em cima, o progresso do dia.
> Uma dose que passou do horário aparece como atrasada, mas continua esperando a resposta do
> paciente. Ela nunca vira pulada sozinha.

**c. Alarme** `[DEMO]` `[VÍDEO]`
> Agora vou bloquear o celular e esperar a dose que deixei marcada. `[espera o alarme]` O alarme
> abre em tela cheia por cima da tela de bloqueio, mesmo com o app fechado, porque quem guarda o
> horário é o Android. Tenho três opções, tomei, pulei e adiar por cinco minutos, uma vez só. Vou
> tocar em tomei. `[toca]` O celular volta para a tela de bloqueio, sem mostrar mais nada do app.
> Abrindo de novo, a dose aparece confirmada, o estoque já foi descontado e o progresso do dia
> subiu, sem que eu fizesse mais nada.

**d. Adesão, calendário e correção** `[DEMO]`
> Na tela de adesão vejo a taxa em sete, trinta ou noventa dias, e por medicamento. Doses puladas e
> doses sem resposta aparecem separadas, porque pular é uma decisão do paciente e não responder é a
> falta de registro, e o médico precisa saber a diferença. Se não houver nenhuma dose vencida, o app
> diz que ainda não há dados, em vez de mostrar zero por cento. No calendário consulto qualquer dia
> anterior, com as doses e as consultas. E se eu marquei algo errado, posso corrigir. A correção
> cria um novo registro e mantém o antigo, como num prontuário.

**e. Relatório** `[DEMO]`
> Este é o relatório que o paciente leva à consulta. Ele traz a identificação, os tratamentos, a taxa
> de adesão e o histórico de doses. É gerado inteiro no aparelho, sem mandar os dados para nenhum
> serviço, e só sai do celular se o paciente decidir compartilhar.

**f. Temas e cores** `[DEMO]`
> Por fim, a acessibilidade. Além do tema claro, há o escuro e o de alto contraste, pensado para
> baixa visão e uso sob o sol. E como verde e vermelho são as cores que mais se confundem no
> daltonismo, a pessoa pode escolher outro conjunto de cores de estado. Todos foram testados em
> simulação dos três tipos de daltonismo e no contraste mínimo da WCAG.

**Fora da demo ao vivo** `[VALIDAR]`
- **Primeiro acesso** (login, consentimento e ficha de saúde). Sugestão é não mostrar ao vivo, porque
  exige apagar os dados. Se quiser citar, uma frase no passo b basta.
- **Compromissos** (consultas e exames). Aparecem no calendário do passo d sem precisar de passo
  próprio.
- **Sincronização e modo avião.** Explicados no slide 9.

**Se a demo atrasar**, corte nesta ordem: f, depois e, depois a parte da correção em d.

---

## D. Fechamento

### Slide 11. Resultados da validação (1 min)

> O modelo não tem este slide. Ele entra antes de "Considerações Finais". `[VALIDAR]`

**Texto do slide**
- Testes em aparelho físico (Redmi Note 14 Pro 5G, Android 16), com roteiro escrito
- 5 cenários offline-first aprovados
  - ausência de conexão, retorno da conexão, restauração, entre dispositivos e conflito
- Alarme aprovado nas 4 combinações (bloqueado ou em uso, app nos recentes ou não)
- **Limitação.** Após reiniciar, o alarme esperou o desbloqueio por causa do Autostart do fabricante

**Visual** `[VALIDAR]`: Quadro 28, se couber legível. Senão, só os tópicos.

**Roteiro**
> A validação foi feita por mim, num aparelho físico, seguindo um roteiro escrito em que cada passo
> tinha o resultado esperado. O segundo aparelho foi simulado direto na base remota. Os cinco
> cenários da arquitetura offline-first foram aprovados, três deles depois de ajustes que os
> próprios testes revelaram, como fazer a edição mais recente prevalecer também no servidor. O
> alarme funcionou nas quatro combinações de celular bloqueado ou em uso, com o app nos recentes ou
> fora deles. A limitação apareceu depois de reiniciar o celular. O alarme só tocou quando o aparelho
> foi desbloqueado, por uma restrição de inicialização automática que o fabricante aplica, e que o
> Android não deixa contornar. O app passou a orientar o paciente a liberar essa permissão.

---

### Slide 12. Considerações finais (1 min)

**Texto do slide**
- Objetivos atendidos, com a ressalva do alarme após reinicialização
- Funcionar sem conexão e manter o registro clínico fiel são compatíveis
- Diferenciais
  - estoque descontado pela dose
  - correção que preserva o original
  - pulada distinta de sem resposta
- Limitações: um modelo de aparelho, sem teste com usuários e só Android

**Roteiro**
> Os objetivos foram atendidos, com a ressalva do alarme depois de reiniciar o celular. O trabalho
> mostra que é possível ter, no mesmo aplicativo, o funcionamento sem internet e a fidelidade do
> registro clínico. Os diferenciais em relação ao que existe no mercado são descontar o estoque pela
> dose de verdade, corrigir sem apagar o que foi registrado e separar a dose pulada da dose sem
> resposta, o que deixa o histórico levado ao médico confiável. As limitações são claras. Testei em
> um só modelo de aparelho, sem usuários do público-alvo, e apenas no Android.

---

### Slide 13. Trabalhos futuros (45 s)

> No modelo é "Recomendações Futuras".

**Texto do slide**
- Avaliação de usabilidade com pacientes idosos e polimedicados
- Validação do alarme em outros fabricantes
- Versão para iOS
- Acesso de consulta para médicos e cuidadores
- Organização do cuidado por tratamento (ex.: oncologia)

**Roteiro**
> Como próximos passos, o principal é avaliar o app com os pacientes para quem ele foi pensado,
> idosos e polimedicados, porque só assim dá para medir o efeito real na adesão. Também quero validar
> o alarme em aparelhos de outros fabricantes, fazer a versão para iOS, permitir que médicos e
> cuidadores consultem a conta do paciente e organizar o cuidado por tratamento, como numa terapia
> oncológica com várias sessões e remédios ao mesmo tempo.

---

### Slide 14. Obrigado (15 s)

**Texto do slide**
- OBRIGADO!
- Acadêmico: Gabriel Steffens
- Curso: Sistemas de Informação, Fase 8
- Prof. Orientador: M.e Marciel de Liz Santos
- E-mail: `[VALIDAR]`

**Roteiro**
> Encerro por aqui. Obrigado pela atenção, e fico à disposição para as perguntas.

---

## Depois do "Obrigado" (não apresentados)

`[VALIDAR]` Ficam escondidos, para usar só se a banca perguntar.

- **Referências.** Só as que aparecem nos slides (WHO 2003, Baddeley et al. 2010, Risko e Gilbert
  2016, Loshin 2010, Allsopp 2014, Kleppmann 2017, Nielsen 1994, W3C 2018, Brasil 2018, Medisafe
  2026, MyTherapy 2026), no formato da lista do TCC.
- **Modelo de dados.** Figura 2.
- **Requisitos.** Quadros 3 a 9.
- **Regras de negócio completas.** Quadro 10.
