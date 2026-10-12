### 1. Capa (20 s)

- Boa noite a todos. Meu nome é Gabriel Steffens
- Estudante do curso de sistemas de informação aqui na UNIDAVI
- E sob orientação do professor e mestre Marciel de Liz Santos, apresento meu trabalho de conclusão de curso, O Mapill
- Uma aplicação móvel para mitigação de falhas logísticas e cognitivas na adesão ao tratamento medicamentoso de usuários.

### 2. Introdução (30s)

- A descontinuidade do tratamento medicamentoso é um grande desafio da saúde pública, reconhecido inclusive pela OMS.
- São múltiplos fatores que podem fazer uma pessoa falhar no tratamento.
- Quem toma vários remédios, ou tem muitos compromissos, assume uma sobrecarga mental.
- E a partir dessa sobrecarga, existem dois tipos principais de falhas.
- As cognitivas, que é simplesmente esquecer a dose
- E as logísticas, que é o remédio acabar ou a consulta passar sem que a pessoa perceba.

### 3. Problema de pesquisa (25 s)

- Daí vem a pergunta que o trabalho responde.

- De que maneira uma aplicação móvel, baseada em arquitetura offline-first, pode centralizar medicamentos, estoque e compromissos terapêuticos, com usabilidade, segurança e confiabilidade?

### 4. Justificativa, o problema (50 s)

- Os medicamentos não funcionam em pacientes que não os tomam.

- Essa frase abre o meu trabalho, e por mais que pareça óbvia, ela representa um problema em vários aspectos.

- Para lidar com as falhas que eu comentei, as pessoas improvisam, e podem aderir métodos não ideais, pelo menos não no nível que a saúde merece

- Bilhetes colados na geladeira, grupo de anotações no WhatsApp, despertador do celular para a hora do remédio são alguns exemplos

- que além de não serem feitos para cuidar da saúde, eles ainda falhos em muitos pontos, como:

- gerenciamento do estoque, saber se você de fato tomou ou não, saber onde o remédio está na hora que vc precisa, saber quando vai acabar, e muitos outros

- E é nesses pontos que o Mapill soma na rotina das pessoas, com soluções úteis que elas só percebem quando começam a usar, e com tudo centralizado numa única fonte confiável, que estará quase 100% do tempo junto da pessoa

### 5. Justificativa, o mercado (45 s)

- Aqui eu menciono os dois aplicativos mais conhecidos no mercado, o Medisafe e o MyTherapy.

- O Medisafe passou, em janeiro deste ano, a aceitar só dois medicamentos no plano gratuito, e o
- aviso de estoque ficou pago. O MyTherapy é gratuito, mas se sustenta repassando dados de uso,
- anonimizados, para empresas farmacêuticas.

- Nenhum dos dois descreve suporte a uma dose que muda conforme o horário, comum em tratamentos
- como o de insulina, por exemplo.

- Diante disso, o Mapill troca amplitude por profundidade, sem cobrar por nada, sem repassar dados, e sem limitar o controle do usuário

### 6. Objetivos (45 s)

- O objetivo geral foi desenvolver uma aplicação móvel que apoiasse a gestão da rotina medicamentosa do usuário, desde o cadastro de medicamentos, consultas, estoque, lembretes... de uso simples e completo, que não precisasse de internet.

> Para chegar lá, os objetivos específicos seguiram o caminho natural de um projeto de software,
> nos cinco passos do slide.

> Primeiro levantar os requisitos na literatura, depois especificá-los, projetar a arquitetura e
> as telas, implementar e, por fim, analisar como a arquitetura offline-first se comporta em
> cenários controlados, com a aplicação funcionando.

### 7. Fundamentação (1 min)

> A fundamentação se apoia em três pilares, e cada um sustenta uma parte do Mapill.

> O primeiro é a cognição. A memória prospectiva é a que usamos para lembrar de fazer algo no
> futuro, como tomar o remédio às oito horas, e é ela que falha no esquecimento. A desoneração
> cognitiva é passar para uma ferramenta o que a cabeça teria de guardar ou calcular. Por isso o
> app lembra e calcula pelo paciente.

> O segundo são os dados. A fonte única de verdade é ter tudo num só lugar, o offline-first é
> funcionar sem internet, e o Last-Write-Wins decide qual versão vale quando duas edições entram em
> conflito.

> O terceiro é a interface e a proteção. As heurísticas de Nielsen, a WCAG e a LGPD orientam um
> app fácil de usar, acessível e com os dados protegidos.

---

## Mapill, parte teórica

### 8. Arquitetura (55 s)

A aplicação segue a Clean Architecture, do Robert Martin. A ideia é simples. O que é mais importante fica no centro e não depende de nada, e o que é detalhe fica por fora.

No centro está o domínio, com as regras de cuidado com o remédio, como gerar os horários, descontar o estoque e calcular a adesão. Ele é escrito em TypeScript puro, sem nenhuma biblioteca, e por isso dá para testar essas regras sem precisar de um celular.

Em volta fica a camada de dados, com o SQLite no aparelho e o Supabase na nuvem, e por fora as telas. A dependência sempre aponta para dentro, então dá para trocar uma peça de fora sem mexer nas regras. Foi o que aconteceu com a biblioteca de alarme, que precisou ser trocada no meio do projeto sem alterar nenhuma regra de negócio.

O app foi feito em React Native com Expo, e o alarme é entregue pelo agendador do próprio Android, e não por um processo do app. É isso que faz ele tocar mesmo com o aplicativo fechado.

### 9. Requisitos (1 min)

> Os requisitos foram levantados a partir dos problemas do paciente, e os quarenta e quatro
> requisitos funcionais estão organizados nessas seis áreas.

> Elas seguem o caminho do paciente dentro do app. Começa no primeiro acesso, que não exige conta,
> passa pelo cadastro do remédio, pelo dia a dia de confirmar as doses, pelos lembretes e pelas
> consultas, e termina no direito sobre os próprios dados, de exportar ou apagar tudo.

> Além deles, são nove requisitos não funcionais e vinte regras de negócio, e aqui eles se ligam à
> arquitetura que acabei de mostrar. Um dos não funcionais exige que o domínio não dependa de
> nenhuma biblioteca, e é nesse domínio que ficam as regras de negócio, como descontar a dose de
> verdade, e não uma unidade, ou deixar adiar o alarme uma vez só.

### 10. Sincronização e segurança (55 s)

> Toda operação é gravada primeiro no próprio aparelho, e a nuvem funciona como cópia de segurança
> e ponte entre dispositivos.

> Quando o mesmo registro é editado em dois lugares, vence a edição mais recente, e vence inteira,
> sem misturar campos.

> No diagrama, o dispositivo B editou por último, então a versão dele prevalece nos dois lados. Se
> o app juntasse campos de versões diferentes, poderia criar uma posologia que ninguém escreveu de
> fato.

> O servidor aplica o mesmo critério, e cada tabela tem políticas de segurança em nível de linha,
> então cada usuário só acessa os próprios dados, identificado pelo token JWT. O login é opcional,
> e quem quiser fazer entra com a própria conta Google.

## Resultados

### 12. Offline-first (1 min 5 s)

> A validação foi feita por mim, no meu aparelho físico, e o segundo aparelho foi simulado direto
> na base remota, com comandos SQL.

> Os cinco cenários da arquitetura offline-first foram aprovados, e três deles só depois de ajustes
> que os próprios testes revelaram.

> Na restauração, o app pedia de novo os termos e a ficha de saúde, porque olhava o banco local
> antes de receber os dados da nuvem.

> Doses futuras excluídas voltavam a aparecer, e a exclusão passou a ser lógica.

> Entre dois aparelhos, vencia a versão sincronizada por último, e não a mais recente, então o
> servidor passou a aplicar o mesmo critério.

> E as edições feitas sem conexão não chegavam ao outro aparelho, o que foi resolvido olhando o
> momento em que o dado chega à nuvem, e não o momento em que ele foi editado.

✂ Se o tempo apertar, fale só da restauração e do critério do servidor. Os outros dois ajustes
ficam para as perguntas.

### 13. Alarme (1 min)

> O alarme, que é o centro do app, foi testado nas quatro combinações de celular bloqueado ou em
> uso, com o app nos recentes ou fora deles.

> Com o celular bloqueado, a tela do alarme apareceu por cima da tela de bloqueio, e com o celular
> em uso, apareceu a notificação com os botões de tomar e pular.

> Em todas elas, quem dispara o alarme é o agendador do próprio Android, e não o app.

> A ressalva veio depois de reiniciar o celular. O alarme só tocou quando o aparelho foi
> desbloqueado, por uma restrição de inicialização automática que o fabricante aplica e que o
> Android não deixa contornar.

> Diante disso, o app passou a orientar o paciente a liberar essa permissão, numa tela de ajuda de
> alertas que leva direto ao ajuste do fabricante.

Onde fica no app, se a banca pedir para ver. Ajustes, depois Ajuda de alertas, no item "Permitir o
início automático". O botão abre a tela de início automático do fabricante. A tela inicial não
mostra esse aviso, porque o Android não deixa o app saber se a permissão está ligada.

---

## Fechamento

### 14. Conclusão (50 s)

> Para fechar, volto à pergunta do começo. O Mapill centraliza num só aplicativo os remédios, o
> estoque, as consultas e as receitas.

> É confiável porque o alarme toca mesmo com o aplicativo fechado, e nenhuma operação depende de
> internet.

> É seguro porque cada usuário só acessa os próprios dados, e quem não quiser vincular sua conta
> Google pode usar tudo pelo próprio aparelho, só sem a cópia na nuvem.

> O design foi guiado pelas heurísticas de Nielsen e por critérios de acessibilidade, mas ainda não
> foi testado com pacientes, e esse é justamente o primeiro passo que vem a seguir.

> Com isso, os objetivos do trabalho foram atendidos.

### 15. Trabalhos futuros (45 s)

> As limitações apontam os próximos passos a serem seguidos com o Mapill.

> Como não testei com usuários de forma oficial, o principal é fazer essa validação com pacientes
> reais, idosos e polimedicados, para medir a real eficácia do app na adesão.

> Como testei num só modelo de aparelho, quero validar o alarme em outros fabricantes.

> Como o app é só para Android, vem a versão para iOS e a publicação nas lojas.

> Além disso, quero permitir que médicos e cuidadores consultem a conta do paciente, e organizar o
> cuidado por tratamento, como numa terapia oncológica com várias sessões e remédios ao mesmo
> tempo.

### 16. Referências (5 s)

Só passar. Fica na tela se a banca pedir. A lista tem exatamente as obras citadas nos slides.

### 17. Obrigado (15 s)

> Encerro por aqui. Quem quiser conhecer o Mapill pode usar o QR code, que leva à página do
> aplicativo, onde também está o APK para instalar no Android. Obrigado pela atenção, e fico à
> disposição para as perguntas.

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
