# Apresentação da defesa: roteiro de estudo

> **Versão 5, 09/10.** O .pptx é o arquivo editado pelo Gabriel, e as mudanças são feitas direto
> nele. Slides em `apresentacao-mapill.pptx` (editável), com um PDF exportado para o computador da
> defesa, com a fonte embutida. Fonte de todo o conteúdo é o TCC entregue,
> `docs/TCC Gabriel Steffens Atualizado 06_10.docx.pdf`. A fala de cada slide também está nas notas
> do .pptx, para o modo apresentador.
>
> Modelo próprio, com a identidade do Mapill (o orientador confirmou que o modelo da UNIDAVI é só
> sugestão). A ordem das seções segue a orientação da disciplina.

## Tempo

| Bloco | Slides | Tempo |
|---|---|---|
| Contexto | 1 a 7 | 5 min 10 s |
| Mapill, parte teórica | 8 a 10 | 2 min 25 s |
| Demonstração | 11 (e 12, se precisar do vídeo) | 7 min 30 s |
| Resultados | 13 e 14 | 2 min |
| Fechamento | 15 a 18 | 2 min 5 s |
| **Total** | | **19 min 10 s** |

Sobram 50 s, que cobrem a troca para o espelhamento e a volta aos slides. Se a demo atrasar, os
cortes estão no slide 11.

---

## Contexto

### 1. Capa (20 s)
> Boa noite a todos. Meu nome é Gabriel Steffens e vou apresentar o meu trabalho de conclusão de
> curso, o Mapill, uma aplicação móvel para mitigação de falhas logísticas e cognitivas na adesão
> ao tratamento medicamentoso, orientado pelo professor e mestre, Marciel de Liz Santos.

### 2. Introdução (50 s)
> A descontinuidade do tratamento medicamentoso é um dos grandes desafios da saúde pública, reconhecido inclusive pela Organização Mundial da Saúde. São multiplos fatores que podem fazer uma pessoa falhar, dentre elas falhas cognitivas, que é simplesmente esquecer a dose, e a logística, que é o
> remédio acabar ou a consulta passar sem que a pessoa perceba.

### 3. Problema de pesquisa (30 s)
> Daí vem a pergunta que o trabalho responde. 

> "Como uma aplicação móvel, que funcione mesmo
> sem internet, pode concentrar os medicamentos, o estoque e os compromissos de saúde num lugar só,
> sendo fácil de usar, segura e confiável."

### 4. Justificativa, o problema (45 s)
> Os medicamento não funcionam em pacientes que não os tomam. 

> Essa frase abre o meu trabalho, e por mais que pareça óbvia, trata-se de uma grande problemática
> Os dois tipos de falhas que eu comentei,aparecem no dia a dia de formas bem concretas.
> Na cognitiva, o paciente esquece a dose, ou não lembra se já tomou. O Mapill avisa no horário, mesmo com o aplicativo fechado, e guarda cada resposta com data e hora. 

> Na logística, o remédio
acaba sem aviso, ou a consulta e a receita passam do prazo. O app desconta o estoque a cada dose
> e avisa antes de acabar, e lembra dos compromissos e da validade da receita.

### 5. Justificativa, o mercado (45 s)
> Aqui eu menciono os dois aplicativos mais conhecidos no mercado relacionado, o Medisafe e o MyTherapy. 

>O Medisafe passou, em janeiro deste ano, a aceitar só dois medicamentos no plano gratuito, e o aviso de estoque ficou pago. O MyTherapy é gratuito, mas se
sustenta repassando dados de uso, anonimizados, para empresas farmacêuticas. 

> Nenhum dos dois descreve suporte a uma dose que muda conforme o horário, comum em tratamentos como o de insulina por exemplo.

> Diante disso, o Mapill troca amplitude por profundidade, sem cobrar por nada e sem repassar dados.

### 6. Objetivos (50 s)
> O objetivo geral foi desenvolver uma aplicação móvel que apoiasse a gestão da rotina medicamentosa do usuário, juntando o agendamento e o registro das doses, o controle de estoque e os compromissos de saúde, numa arquitetura que funciona sem internet. 

>Para chegar lá, os objetivos específicos seguiram o caminho natural de um projeto de software, como listado nos 5 passos descritos. 

> Primeiro levantar os requisitos na literatura, depois especificá-los, projetar a arquitetura e as telas, implementar, e, por fim, analisar a união de tudo, com a aplicação funcionando


### 7. Fundamentação (1 min 10 s)
> A fundamentação do projeto foi baseada principalmente nessas obras. 

> A memória prospectiva é a que usamos para lembrar de fazer algo no futuro, como tomar o remédio às oito horas. 
Por isso o centro do app é um sistema de alarme, que lembra pelo paciente. 

> A desoneração cognitiva é passar para uma ferramenta aquilo que a cabeça teria de guardar ou calcular, e é o que o app faz com o estoque e os horários. 

> A fonte única de verdade é ter um só lugar com a informação certa, por isso remédios, estoque e consultas
ficam no mesmo aplicativo. 

> O offline-first é o app funcionar sem internet, e o Last-Write-Wins
> define que, num conflito entre duas edições, vence a mais recente. 

> As heurísticas de Nielsen, a WCAG e a LGPD orientam a interface, a acessibilidade e a proteção dos dados de utiliza.

---

### 8. Arquitetura (50 s)
> A aplicação segue a Clean Architecture, em três camadas, e a dependência sempre aponta para
> dentro. 

> No centro fica o domínio, com as regras de negócio escritas em TypeScript puro, sem depender de nenhuma biblioteca. Isso permite verificar cálculos como a geração de horários e a taxa de adesão sem precisar de um celular. 

> Em volta fica a camada de dados, com o SQLite no
aparelho e o Supabase na nuvem

> Por fora a apresentação, com as telas sobre um sistema de design próprio. O app foi feito em React Native com Expo, e o alarme é entregue pelo agendador do próprio
Android, e não por um processo do app. É isso que faz ele tocar mesmo com o aplicativo fechado.

### 9. Requisitos (50 s)
> Os requisitos partiram dos problemas que o paciente enfrenta. São quarenta e quatro requisitos
> funcionais, nove não funcionais e vinte regras de negócio, e aqui eles estão organizados pelo
> problema que resolvem. 

> Para o esquecimento, o alarme toca mesmo com o app fechado, remédios no mesmo horário geram um aviso só, e quem tomou atrasado confirma as doses de uma vez. 

> Para a posologia, o cadastro aceita dez formas farmacêuticas, quatro frequências e uma dose diferente em cada horário. 

> Para o estoque, o app desconta a dose de verdade, e não uma unidade, então quem toma dois comprimidos de uma vez,  tem dois descontados, e com isso prevê quando o remédio vai acabar. 

> Como complemento, consultas e exames ficam no mesmo calendário das doses, e o app avisa quando a receita está para vencer, mas só a dose tem alarme estilo despertador, porque é ela que tem consequência imediata.

> E tudo funciona sem internet e sem necessariamente uma conta, com o paciente podendo exportar ou apagar os próprios dados a qualquer momento.

### 10. Sincronização e segurança (45 s)
> Toda operação é gravada primeiro no próprio aparelho, e a nuvem funciona como cópia de segurança e ponte entre dispositivos. 

> Quando o mesmo registro é editado em dois lugares, vence a edição mais recente, e vence inteira, sem misturar campos. 

> No diagrama, o dispositivo B editou por último, então a versão dele prevalece nos dois lados. Se o app juntasse campos de versões diferentes, poderia criar uma posologia que ninguém escreveu de fato. 

> O servidor aplica o mesmo critério, e cada tabela tem políticas de segurança em nível de linha, então cada usuário só acessa os próprios dados, identificado pelo token JWT. O login é opcional, mas se caso o usuário opte por fazer, é possível somente pela sua conta google

---

## Demonstração

### 11. Demonstração (7 min 30 s)
> Agora vou mostrar o aplicativo funcionando no meu celular.

O slide 11 fica na tela enquanto você espelha o celular. Ele mostra as seis telas do caminho,
serve de roteiro visual e é o plano C, caso o celular e o vídeo falhem ao mesmo tempo. O slide 12
guarda o vídeo reserva.

| # | Tela | Tempo | Recado |
|---|---|---|---|
| a | Cadastro por código de barras | 1 min 30 s | catálogo da CMED no aparelho, campos que nascem vazios, dose variável |
| b | Tela inicial | 45 s | pendentes primeiro, estado por escrito, alerta de estoque |
| c | Alarme com o celular bloqueado | 2 min | o Android dispara, "Tomei" desconta o estoque |
| d | Adesão e calendário | 1 min | taxa por período e por remédio, consultas no mesmo calendário |
| e | Relatório em PDF | 1 min | gerado no aparelho, compartilhado pelo paciente |
| f | Temas e cores | 45 s | acessibilidade |
| | Folga | 30 s | |

**Se atrasar**, corte nesta ordem: f, depois e.

**a. Cadastro por código de barras**
> Vou cadastrar um remédio lendo o código de barras da caixa. O app consulta um catálogo que vem
> dentro dele, montado a partir da base pública da Anvisa, a CMED, com cerca de sete mil
> apresentações, e por isso funciona até sem internet. Ele já preenche o nome, o princípio ativo e
> a dosagem. Repare que os horários aparecem vazios. Isso é proposital, para que ninguém aceite um
> horário errado por pressa. E aqui dá para colocar uma dose diferente em cada horário. Enquanto o
> essencial não está preenchido, os campos opcionais ficam escondidos, e quando fecha, o app avisa
> que já dá para cadastrar. O resto, como receita, tipo de lembrete e estoque, fica disponível sem
> ser obrigatório.

**b. Tela inicial**
> Esta é a tela do dia a dia. As doses que ainda esperam resposta vêm primeiro, e as já registradas
> depois. Cada dose mostra o estado por escrito, e não só pela cor. Lá em cima fica o progresso do
> dia, e embaixo o aviso de estoque, quando algum remédio está perto de acabar.

**c. Alarme**
> Agora vou bloquear o celular e esperar a dose que deixei marcada. *(espera o alarme)* O alarme
> abre em tela cheia por cima da tela de bloqueio, mesmo com o app fechado, porque quem guarda o
> horário é o Android. Tenho tomei, pulei e adiar por cinco minutos, uma vez só. Vou tocar em
> tomei. *(toca)* O celular volta para a tela de bloqueio, sem mostrar mais nada do app. Abrindo de
> novo, a dose aparece confirmada, o estoque já foi descontado e o progresso do dia subiu, sem que
> eu fizesse mais nada.

**d. Adesão e calendário**
> Na tela de adesão vejo a taxa em sete, trinta ou noventa dias, e também por medicamento. Se ainda
> não houver nenhuma dose vencida, o app diz que ainda não há dados, em vez de mostrar zero por
> cento. No calendário consulto qualquer dia, com as doses e também as consultas, que ficam no
> mesmo lugar.

A tela de adesão mostra os contadores de puladas e de sem resposta. Você não comenta, mas se a
banca perguntar, a resposta está em "Perguntas prováveis".

**e. Relatório**
> Este é o relatório que o paciente leva à consulta. Ele traz a identificação, os tratamentos, a
> taxa de adesão e o histórico de doses. É gerado inteiro no aparelho, sem mandar os dados para
> nenhum serviço, e só sai do celular se o paciente decidir compartilhar.

**f. Temas e cores**
> Por fim, a acessibilidade. Além do tema claro, há o escuro e o de alto contraste, pensado para
> baixa visão e uso sob o sol. E como verde e vermelho são as cores que mais se confundem no
> daltonismo, a pessoa pode escolher outro conjunto de cores de estado. Todos passaram no contraste
> mínimo da WCAG e numa simulação dos três tipos de daltonismo.

**Fora da demo ao vivo.** Primeiro acesso (exige apagar os dados), cadastro de compromisso (as
consultas já aparecem no calendário do passo d) e modo avião (explicado no slide 10).

### 12. Vídeo reserva (só se precisar)
Se o espelhamento falhar, avance para o slide 12 e rode o vídeo no trecho em que parou. Você
continua narrando ao vivo, com a mesma fala acima. Se o celular voltar, volte para ele.

### Antes da defesa
- Base de demonstração com alguns dias de histórico, para a adesão, o calendário e o relatório não
  aparecerem vazios, e com ao menos uma consulta cadastrada.
- Um remédio com estoque baixo, para o aviso aparecer no passo b.
- Uma dose marcada para tocar no meio do passo c. Conte uns 4 minutos depois do início da demo.
- Permissões de notificação e alarme, Autostart e Não Perturbe conferidos.
- Espelhamento testado no computador do local, com o cabo que vai ser usado.
- Uma embalagem de remédio real à mão, para o código de barras.
- O vídeo do slide 12 abrindo no computador da defesa. Se ele estiver só vinculado, e não
  incorporado ao pptx, o arquivo precisa estar na mesma pasta.
- Vídeo reserva e PDF dos slides também num pendrive.

---

## Vídeo reserva

O vídeo cobre a demo se o celular, o cabo ou o espelhamento falharem. Ele substitui só a tela, e
você continua narrando ao vivo.

**Como gravar**
- **Siga o caminho a a f desta página**, na mesma ordem e com os mesmos recados, para conseguir
  pular para o trecho certo no meio da fala.
- **Sem áudio.** Assim o ritmo é seu, e dá para pausar ou avançar enquanto fala.
- **Um arquivo por trecho**, de `a-cadastro.mp4` a `f-temas.mp4`, mais um arquivo com tudo junto.
  Se só o alarme falhar ao vivo, você abre direto o trecho c e volta ao celular depois.
- **Ferramenta.** O gravador de tela do próprio celular (no Redmi, em Ferramentas ou na central de
  controle) grava também a tela de bloqueio, que é o trecho mais importante. Se preferir gravar pelo
  computador, o scrcpy espelha e grava ao mesmo tempo (`winget install Genymobile.scrcpy`, depois
  `scrcpy --record a-cadastro.mp4`). Ele não está instalado nesta máquina.
- **Mesma base da demo.** Grave com os mesmos dados que vão estar no celular no dia, para o vídeo e
  o ao vivo mostrarem a mesma coisa.
- **Trecho c.** Deixe uma dose marcada para 1 ou 2 minutos depois de começar a gravar, bloqueie o
  celular e espere tocar. Se o trecho ficar longo, corte a espera depois.

**No dia**
- Deixe os arquivos abertos num player antes de começar, já pausados no início.
- Confira se o computador da defesa abre .mp4 sem instalar nada.

---

## Resultados

### 13. Offline-first (1 min)
> A validação foi feita por mim, no meu aparelho físico, e também na base remota via comanddos SQL basicamente.

> Os cinco cenários da arquitetura offline-first foram aprovados, e três deles só depois de ajustes que os próprios testes revelaram. 

> Na restauração, o app pedia de novo os termos e a ficha de saúde, porque olhava o banco local antes de receber os dados da nuvem. 

> Doses futuras excluídas voltavam a aparecer, e a exclusão passou a ser lógica. Entre dois aparelhos, vencia a versão sincronizada por último, e não a mais recente, então o servidor passou a aplicar o mesmo critério. 

> E as edições feitas sem conexão não chegavam ao outro aparelho, o que foi resolvido olhando o momento em que o dado chega à nuvem, e não necessariamente a data em que foi cadastrado de fato

### 14. Alarme (1 min)
> O alarme, que é o centro do app, foi testado nas quatro combinações de celular bloqueado ou em uso, com o app nos recentes ou fora deles. 

> Com o celular bloqueado, a tela do alarme apareceu por cima da tela de bloqueio, e com o celular em uso, apareceu a notificação com os botões de tomar e pular. 

> Em todas elas, quem dispara o alarme é o agendador do próprio Android, e não o app

> A ressalva veio depois de reiniciar o celular. O alarme só tocou quando o aparelho foi desbloqueado, por uma restrição de inicialização automática que o fabricante aplica e que o Android não deixa contornar. 

> Diante disso, o app passou a orientar o paciente a iberar essa permissão. (verificar certinho onde ele faz isso)

---

## Fechamento

### 15. Conclusão (1 min)
> Para fechar, volto à pergunta do começo. O Mapill centraliza num só aplicativo os remédios, o estoque, as consultas e as receitas. 

> É confiável porque o alarme toca mesmo com o aplicativo fechado, e nenhuma operação depende de internet. 

> É seguro porque cada usuário só acessa os próprios dados, e quem não quiser vincular sua conta google, pode usar todos os recursos 100% pelo aparelho. 

> O design foi guiado pelas heurísticas de Nielsen e por critérios de acessibilidade, mas ainda não foi testado com
pacientes, e esse é justamente o primeiro passo que vem a seguir. 

> Com isso, os objetivos do trabalho foram atendidos.

### 16. Trabalhos futuros (45 s)
> As limitações apontam os próximos passos a serem seguidos com o mapill. 

> Como não testei com usuários de forma oficial, o principal fazer essa validação com usuários reais, validando assim a real eficácia do app no processo 

> Como testei num só modelo de aparelho, quero validar o alarme em outros fabricantes. 

> Como o app é só para Android, vem a versão para iOS e a publicação nas lojas.

> Além disso, quero permitir que médicos e cuidadores consultem a conta do paciente, 

> organizar o cuidado por tratamento, como numa terapia oncológica com várias sessões e remédios ao mesmo tempo.

### 17. Referências (5 s)
Só passar. Fica na tela se a banca pedir. A lista tem exatamente as obras citadas nos slides.

### 18. Obrigado (15 s)
> Encerro por aqui. Quem quiser conhecer o Mapill pode usar o QR code, que leva à página do aplicativo, onde também está o APK para instalar no Android. Obrigado pela atenção.

O QR code aponta para `https://mapill-website.vercel.app/`. Antes da defesa, confira se o APK já
está publicado na página, porque alguém da banca pode escanear na hora.

---

## Perguntas prováveis da banca

Respostas curtas, cada uma com a seção do TCC que a sustenta.

**Na tela de adesão aparece "sem resposta". Qual a diferença para pulada?** (4.3.1, RN 01)
Pular é uma decisão do paciente, que tocou em "pulei". Sem resposta é a dose que passou do horário
sem nenhum registro. O app nunca transforma uma na outra só porque o tempo passou, porque não pode
afirmar algo que o paciente não disse. Para o médico, a diferença importa, já que esquecer e decidir
não tomar pedem conversas diferentes.

**Qual é o modelo de dados?** (4.5, Figura 2, Quadros 16 a 24)
São nove tabelas, iguais no SQLite e no PostgreSQL. Medicamentos, prescrições, horários de dose,
registros de ingestão, itens de estoque, ajustes de estoque, compromissos, perfil do paciente e
registros de consentimento. Na nuvem, cada uma tem ainda a coluna de chegada ao servidor, usada na
sincronização.

**Por que Last-Write-Wins, e não mesclar os campos?** (2.9.3, 4.4.6)
Mesclar campos poderia produzir um registro que nenhum aparelho gerou, como a dose de uma edição
com o horário de outra. O custo do LWW, que é perder a versão mais antiga sem aviso, foi aceito
porque cada conta é de um paciente, então edições simultâneas são raras, e porque os registros de
dose não são editados, são corrigidos por um novo lançamento. Assim o LWW nunca descarta uma dose
registrada.

**E se o relógio do celular estiver errado?** (2.9.3, 4.4.6)
É um custo que o próprio Kleppmann aponta, e o TCC o assume. Para o recebimento, o servidor usa a
hora de chegada à base remota, que só existe no servidor, e não a data de edição do aparelho. Isso
garante que uma edição feita sem conexão chegue aos outros aparelhos.

**Há alguma situação em que o LWW perde informação?** (4.3.2)
Sim, no estoque. Descontos feitos em dois aparelhos da mesma conta, os dois sem conexão, podem não
se somar. Foi uma limitação aceita, porque o uso previsto é um aparelho principal por paciente.

**Como o alarme toca com o app fechado?** (4.4.8)
O agendamento é entregue ao gerenciador de alarmes do Android, pela biblioteca
react-native-notify-kit. Quem guarda o horário é o sistema, e não um processo do app. Os avisos
são agendados para sete dias e renovados sempre que o paciente abre o app ou responde a um aviso.

**Por que trocaram de biblioteca de alarme?** (4.4.8)
O Notifee teve o repositório arquivado em abril de 2026, sem versões desde dezembro de 2024.
Defeitos no reagendamento depois de reiniciar o aparelho deixariam de ser corrigidos. O
react-native-notify-kit é o fork mantido, indicado pela própria mantenedora, com a mesma interface.

**O alarme falhou depois de reiniciar. Isso não compromete o objetivo?** (5.3, 5.4)
O objetivo foi atendido com ressalva, e o TCC registra isso. O agendamento sobreviveu à
reinicialização. Quem reteve a entrega foi o Autostart do fabricante, que o Android não deixa
consultar nem conceder por código. O app identifica os fabricantes mais conhecidos e leva o
paciente direto à tela dessa permissão.

**Por que não testou com usuários?** (1.3, 5.4, 6.1)
Pelo prazo do TCC, o escopo ficou em projetar, implementar e validar tecnicamente a arquitetura. A
avaliação com idosos e polimedicados é o primeiro trabalho futuro, e é o que vai medir o efeito
real na adesão.

**Como fica a LGPD?** (2.10, 4.3.5, 4.6.1)
O consentimento vem antes de qualquer dado clínico, com a versão do termo registrada, e uma nova
versão exige novo aceite. A exclusão pedida pelo titular apaga primeiro a nuvem e depois o
aparelho, para a sincronização não trazer os dados de volta. Há exportação de todos os dados, RLS
em todas as tabelas, e o relatório é gerado no aparelho, sem enviar dados a nenhum serviço.

**A segurança por RLS foi testada?** (6.1, item c)
As políticas estão aplicadas às nove tabelas, e a gravação confere o identificador do usuário
contra o token. Testar ativamente a leitura e a alteração de dados de outra conta ficou como
trabalho futuro.

**Por que o app não verifica interação medicamentosa nem sugere dose?** (3.2, 4.1)
Foi uma exclusão deliberada de escopo. Isso aproximaria o app de um sistema de apoio à prescrição,
e esse papel é do profissional de saúde. O Mapill registra e lembra.

**A taxa de adesão do app é confiável?** (2.3.3, 4.3.6)
Ela continua sendo um autorrelato, porque depende da confirmação do paciente, e por isso não
alcança a precisão do monitoramento eletrônico de embalagem. O ganho em relação ao relato manual é
o horário exato de cada resposta e a separação entre tomada, pulada e sem resposta. Doses futuras
não entram na conta, e sem dose vencida o app não mostra percentual.

**Como funciona o catálogo de medicamentos?** (4.6.2)
É derivado da base pública da Anvisa, a CMED, com cerca de sete mil apresentações. É importado
para a base local uma vez por instalação, então a leitura do código de barras funciona sem
internet.

**Por que React Native, e não Kotlin nativo?** (2.7.3, 4.4.5)
Uma base de código única com acesso aos recursos nativos, e o Expo cuidando da configuração. Onde
precisou, houve código nativo, como o módulo em Kotlin que fecha a tela do alarme. A validação foi
só no Android, e o iOS está nos trabalhos futuros.

**Por que sem ORM, sem Tailwind e sem gerenciador de estado global?** (4.4.5)
O critério foi não adotar dependência sem necessidade concreta. As consultas são poucas e
específicas, então SQL direto é mais legível. Os hooks com os repositórios bastaram para o estado,
e o sistema de design próprio tirou uma camada de indireção.

**Tem testes automatizados?** (4.7, 6.1, item d)
Há rotinas de conferência que exercitam as regras de domínio sem aparelho, porque o instante
presente é recebido como parâmetro. Nenhuma versão era gerada sem a checagem de tipos, a análise
estática e essas rotinas. Reuni-las num conjunto automatizado a cada alteração, incluindo a
sincronização e as telas, é trabalho futuro.

**Como a IA foi usada?** (4.7)
O Google Stitch gerou as primeiras propostas de tela, ajustadas no Figma. O Claude Code apoiou a
implementação, a revisão de código e a montagem do roteiro de testes, seguindo arquivos de
instrução com as regras do projeto. A execução e a aprovação de cada teste foram feitas por mim, no
aparelho.

**As fotos e receitas sincronizam?** (6, 6.1, item e)
Não. Os anexos ficam só no aparelho, e a sincronização leva apenas os dados estruturados. Isso
está nas limitações e nos trabalhos futuros.
