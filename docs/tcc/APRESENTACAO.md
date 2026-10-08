# Apresentação da defesa: roteiro de estudo

> **Versão 2, 08/10.** Slides em `apresentacao-mapill.pptx` (editável) e `apresentacao-mapill.pdf`
> (para o computador da defesa, com a fonte embutida). Fonte de todo o conteúdo é o TCC entregue,
> `docs/TCC Gabriel Steffens Atualizado 06_10.docx.pdf`. A fala de cada slide também está nas notas
> do .pptx, para o modo apresentador.
>
> Modelo próprio, com a identidade do Mapill (o orientador confirmou que o modelo da UNIDAVI é só
> sugestão). A ordem das seções segue a orientação da disciplina.

## Tempo

| Bloco | Slides | Tempo |
|---|---|---|
| Contexto | 1 a 6 | 4 min 30 s |
| Mapill, parte teórica | 7 a 10 | 3 min 10 s |
| Demonstração | 11 | 8 min |
| Fechamento | 12 a 16 | 3 min |
| **Total** | | **18 min 40 s** |

Sobra 1 min 20 s, que cobre a troca para o espelhamento e a volta aos slides. Se a demo atrasar, os
cortes estão no slide 11.

---

## Contexto

### 1. Capa (20 s)
> Boa noite a todos. Meu nome é Gabriel Steffens e vou apresentar o meu trabalho de conclusão de
> curso, o Mapill, uma aplicação móvel para mitigação de falhas logísticas e cognitivas na adesão
> ao tratamento medicamentoso, orientado pelo professor Marciel de Liz Santos.

### 2. Introdução (50 s)
> A descontinuidade do tratamento medicamentoso é um dos grandes desafios da saúde pública. A
> Organização Mundial da Saúde mostra que a adesão depende de muitos fatores, e que a
> responsabilidade não é só do paciente. Quem toma vários remédios por muito tempo precisa lembrar
> de vários horários, controlar quanto ainda tem de cada um e não perder as consultas. Isso gera
> dois tipos de falha. A cognitiva, que é simplesmente esquecer a dose, e a logística, que é o
> remédio acabar ou a consulta passar sem que a pessoa perceba.

### 3. Problema de pesquisa (30 s)
> Daí vem a pergunta que o trabalho tenta responder. Como uma aplicação móvel, que funcione mesmo
> sem internet, pode concentrar os medicamentos, o estoque e os compromissos de saúde num lugar só,
> sendo fácil de usar, segura e confiável.

### 4. Justificativa (1 min)
> Já existem aplicativos para isso, e os dois mais conhecidos são o Medisafe e o MyTherapy. O
> Medisafe passou, em janeiro deste ano, para um modelo em que o plano gratuito aceita só dois
> medicamentos, e coisas básicas como o aviso de estoque ficaram pagas. O MyTherapy é gratuito, mas
> se sustenta repassando dados de uso, anonimizados, para empresas farmacêuticas e institutos de
> pesquisa. Além disso, nenhum dos dois descreve suporte a uma dose que muda conforme o horário,
> que é comum em tratamentos como o de insulina. O Mapill não cobra por nenhuma função, não repassa
> dados e trata a posologia com essa fidelidade. Em vez de ampliar o escopo para o bem-estar geral,
> ele se aprofunda no tratamento medicamentoso.

### 5. Objetivos (50 s)
> O objetivo geral foi desenvolver uma aplicação móvel que apoiasse a gestão da rotina
> medicamentosa, juntando o agendamento e o registro das doses, o controle de estoque e os
> compromissos de saúde, numa arquitetura que funciona primeiro no aparelho. Para chegar lá, os
> objetivos específicos seguiram o caminho natural de um projeto de software. Primeiro levantar os
> requisitos na literatura, depois especificá-los, projetar a arquitetura e as telas, implementar
> e, por fim, analisar como a arquitetura se comporta sem conexão, na volta da conexão e em
> conflitos entre registros.

### 6. Fundamentação (1 min)
> Vou passar rápido pela fundamentação, só pelo que justifica as principais decisões do projeto.
> Esquecer a dose é uma falha da memória prospectiva, que é lembrar de fazer algo no futuro, e por
> isso o centro do app é um alarme. A desoneração cognitiva explica por que o app deve calcular
> estoque e horários pelo paciente. O conceito de fonte única de verdade justifica juntar tudo num
> só lugar. O paradigma offline-first e o critério Last-Write-Wins sustentam o funcionamento sem
> internet e a sincronização. E as heurísticas de Nielsen, as diretrizes de acessibilidade da WCAG
> e a LGPD orientam a interface e o tratamento dos dados de saúde.

**Corte possível.** Se o tempo apertar, fale só da memória prospectiva e do offline-first (30 s).

---

## Mapill, parte teórica

### 7. O que é o Mapill (45 s)
> Agora o Mapill em si. O desenvolvimento partiu de três exigências. O app tinha de funcionar sem
> internet, representar o tratamento com fidelidade, inclusive quando a dose muda ao longo do dia,
> e lembrar o paciente mesmo com o aplicativo fechado, que é justamente quando ele mais precisa.
> Desde o início, defini também o que o Mapill não é. Ele é um registro clínico pessoal, que lembra
> da dose e guarda o que de fato aconteceu. Ele não prescreve, não sugere dose e não avalia se o
> tratamento está certo, porque esse papel é do profissional de saúde. Cada conta é de um paciente,
> e dá para usar tudo sem criar conta.

### 8. Arquitetura (50 s)
> A aplicação segue a Clean Architecture, em três camadas, e a dependência sempre aponta para
> dentro. No centro fica o domínio, com as regras de negócio escritas em TypeScript puro, sem
> depender de nenhuma biblioteca. Isso permite verificar cálculos como a geração de horários e a
> taxa de adesão sem precisar de um celular. Em volta fica a camada de dados, com o SQLite no
> aparelho e o Supabase na nuvem, e por fora a apresentação, com as telas sobre um sistema de design
> próprio. O app foi feito em React Native com Expo, e o alarme é entregue pelo agendador do próprio
> Android, e não por um processo do app. É isso que faz ele tocar mesmo com o aplicativo fechado.

### 9. Regras de negócio (50 s)
> Das vinte regras de negócio, estas quatro mostram o cuidado com o registro clínico. Uma dose que
> o paciente não respondeu nunca é marcada como pulada só porque o tempo passou, porque o app não
> pode afirmar algo que ninguém disse. O estoque desconta exatamente a quantidade da dose, então
> quem toma dois comprimidos de uma vez tem dois descontados. Uma correção nunca apaga o registro
> antigo, ela cria um novo apontando para ele, como num prontuário. E remédios no mesmo horário
> geram um aviso só, que pode ser adiado uma única vez, por cinco minutos.

### 10. Sincronização e segurança (45 s)
> Toda operação é gravada primeiro no próprio aparelho, e a nuvem funciona como cópia de segurança
> e ponte entre dispositivos. Quando o mesmo registro é editado em dois lugares, vence a edição mais
> recente, e vence inteira, sem misturar campos. No diagrama, o dispositivo B editou por último,
> então a versão dele prevalece nos dois lados. Se o app juntasse campos de versões diferentes,
> poderia criar uma posologia que ninguém escreveu. O servidor aplica o mesmo critério, e cada
> tabela tem políticas de segurança em nível de linha, então cada usuário só acessa os próprios
> dados, identificado pelo token JWT.

---

## Demonstração

### 11. Demonstração (8 min)
> Agora vou mostrar o aplicativo funcionando no meu celular.

O slide mostra as seis telas do caminho. Ele serve de roteiro visual e é o plano C, caso o celular
e o vídeo falhem ao mesmo tempo.

| # | Tela | Tempo | Recado |
|---|---|---|---|
| a | Cadastro por código de barras | 1 min 30 s | catálogo da CMED no aparelho, campos que nascem vazios, dose variável |
| b | Tela inicial | 45 s | pendentes primeiro, estado por escrito, progresso do dia |
| c | Alarme com o celular bloqueado | 2 min | o Android dispara, "Tomei" desconta o estoque |
| d | Adesão, calendário e correção | 1 min 30 s | pulada e sem resposta separadas, correção sem apagar |
| e | Relatório em PDF | 1 min | gerado no aparelho, compartilhado pelo paciente |
| f | Temas e cores | 45 s | acessibilidade |
| | Folga | 30 s | |

**Se atrasar**, corte nesta ordem: f, depois e, depois a parte da correção em d.

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
> depois. Cada dose mostra o estado por escrito, e não só pela cor. Lá em cima, o progresso do dia.
> Uma dose que passou do horário aparece como atrasada, mas continua esperando a resposta do
> paciente. Ela nunca vira pulada sozinha.

**c. Alarme**
> Agora vou bloquear o celular e esperar a dose que deixei marcada. *(espera o alarme)* O alarme
> abre em tela cheia por cima da tela de bloqueio, mesmo com o app fechado, porque quem guarda o
> horário é o Android. Tenho tomei, pulei e adiar por cinco minutos, uma vez só. Vou tocar em
> tomei. *(toca)* O celular volta para a tela de bloqueio, sem mostrar mais nada do app. Abrindo de
> novo, a dose aparece confirmada, o estoque já foi descontado e o progresso do dia subiu, sem que
> eu fizesse mais nada.

**d. Adesão, calendário e correção**
> Na tela de adesão vejo a taxa em sete, trinta ou noventa dias, e por medicamento. Doses puladas e
> doses sem resposta aparecem separadas, porque pular é uma decisão do paciente e não responder é a
> falta de registro, e o médico precisa saber a diferença. Se não houver nenhuma dose vencida, o
> app diz que ainda não há dados, em vez de mostrar zero por cento. No calendário consulto qualquer
> dia anterior, com as doses e as consultas. E se eu marquei algo errado, posso corrigir. A correção
> cria um novo registro e mantém o antigo, como num prontuário.

**e. Relatório**
> Este é o relatório que o paciente leva à consulta. Ele traz a identificação, os tratamentos, a
> taxa de adesão e o histórico de doses. É gerado inteiro no aparelho, sem mandar os dados para
> nenhum serviço, e só sai do celular se o paciente decidir compartilhar.

**f. Temas e cores**
> Por fim, a acessibilidade. Além do tema claro, há o escuro e o de alto contraste, pensado para
> baixa visão e uso sob o sol. E como verde e vermelho são as cores que mais se confundem no
> daltonismo, a pessoa pode escolher outro conjunto de cores de estado. Todos passaram no contraste
> mínimo da WCAG e numa simulação dos três tipos de daltonismo.

**Fora da demo ao vivo.** Primeiro acesso (exige apagar os dados), compromissos (aparecem no
calendário do passo d) e modo avião (explicado no slide 10).

### Antes da defesa
- Base de demonstração com alguns dias de histórico, para a adesão, o calendário e o relatório não
  aparecerem vazios.
- Uma dose marcada para tocar no meio do passo c. Conte uns 4 minutos depois do início da demo.
- Permissões de notificação e alarme, Autostart e Não Perturbe conferidos.
- Espelhamento testado no computador do local, com o cabo que vai ser usado.
- Uma embalagem de remédio real à mão, para o código de barras.
- Vídeo reserva e PDF dos slides no computador e num pendrive.

---

## Vídeo reserva

O vídeo cobre a demo se o celular, o cabo ou o espelhamento falharem. Ele substitui só a tela, e
você continua narrando ao vivo, com a mesma fala acima.

**Como gravar**
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

## Fechamento

### 12. Resultados (1 min)
> A validação foi feita por mim, num aparelho físico, seguindo um roteiro escrito em que cada passo
> tinha o resultado esperado. O segundo aparelho foi simulado direto na base remota. Os cinco
> cenários da arquitetura offline-first foram aprovados, três deles depois de ajustes que os
> próprios testes revelaram, como fazer a edição mais recente prevalecer também no servidor. O
> alarme funcionou nas quatro combinações de celular bloqueado ou em uso, com o app nos recentes ou
> fora deles. A limitação apareceu depois de reiniciar o celular. O alarme só tocou quando o
> aparelho foi desbloqueado, por uma restrição de inicialização automática que o fabricante aplica,
> e que o Android não deixa contornar. O app passou a orientar o paciente a liberar essa permissão.

### 13. Conclusão (1 min)
> Os objetivos foram atendidos, com a ressalva do alarme depois de reiniciar o celular. O trabalho
> mostra que é possível ter, no mesmo aplicativo, o funcionamento sem internet e a fidelidade do
> registro clínico. Os diferenciais em relação ao que as soluções analisadas descrevem são
> descontar o estoque pela dose de verdade, corrigir sem apagar o que foi registrado e separar a
> dose pulada da dose sem resposta, o que deixa confiável o histórico levado ao médico. As
> limitações são claras. Testei em um só modelo de aparelho, sem usuários do público-alvo, e apenas
> no Android, e as fotos e receitas anexadas ainda ficam só no aparelho.

### 14. Trabalhos futuros (40 s)
> Como próximos passos, o principal é avaliar o app com os pacientes para quem ele foi pensado,
> idosos e polimedicados, porque só assim dá para medir o efeito real na adesão. Também quero
> validar o alarme em aparelhos de outros fabricantes, fazer a versão para iOS e publicar nas lojas,
> permitir que médicos e cuidadores consultem a conta do paciente e organizar o cuidado por
> tratamento, como numa terapia oncológica com várias sessões e remédios ao mesmo tempo.

### 15. Referências (5 s)
Só passar. Fica na tela se a banca pedir.

### 16. Obrigado (15 s)
> Encerro por aqui. Obrigado pela atenção, e fico à disposição para as perguntas.

---

## Perguntas prováveis da banca

Respostas curtas, cada uma com a seção do TCC que a sustenta.

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
