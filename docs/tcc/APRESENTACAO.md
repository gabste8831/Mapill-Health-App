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

- Para chegar lá, os objetivos específicos seguiram o caminho natural de um projeto de software,

- Primeiro levantar os requisitos na literatura
- depois especificá-los
- projetar a arquitetura e as telas, implementar e, por fim, analisar como a arquitetura offline-first se comporta em
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

**Onde o SOLID aparece no código?** (2.6.1, 4.4.2, RNF 09)
Os dois mais fortes são o S e o D, que são os que o TCC destaca. Responsabilidade única, porque cada
regra clínica é uma função que faz uma coisa só, como gerar os horários ou prever o fim do estoque,
e por isso cada uma é conferida separada. Inversão de dependência, porque o domínio declara portas,
como `NotificationGateway`, e a camada de dados as cumpre. Os outros três aparecem como
consequência. Aberto e fechado na troca da biblioteca de alarme, que foi um adaptador novo sem
modificar regra. Liskov porque qualquer implementação de uma porta substitui outra. E segregação de
interfaces porque há uma porta por assunto, e não uma interface única de banco. A tabela completa
está em "Onde entra o SOLID?", nas dúvidas de estudo.

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

---

## Dúvidas de estudo

Perguntas que fiz para entender melhor o projeto, com a resposta tirada do código.

### Obras de apoio para revisar

**Osterberg e Blaschke (2005)**
OSTERBERG, Lars; BLASCHKE, Terrence. Adherence to medication. *New England Journal of Medicine*,
v. 353, n. 5, p. 487-497, 2005.

O que o TCC usa dela, na seção 2.3.3 e no Quadro 1. O monitoramento eletrônico, feito por
dispositivos que registram a abertura da embalagem, é o método mais preciso para medir a adesão. O
registro no app continua sendo um autorrelato, porque depende da confirmação do paciente, mas
acrescenta o horário exato de cada resposta e separa dose tomada, pulada e sem resposta.

O que mais ela oferece, sem estar no texto do TCC. O mesmo artigo mostra que a adesão cai à medida
que aumenta o número de doses por dia. É um bom reforço para a pergunta de por que o app trata a
complexidade da posologia como problema central. Conferir a página antes de citar.

**WHO (2003)**
WORLD HEALTH ORGANIZATION (WHO). *Adherence to long-term therapies: evidence for action*.
Geneva: World Health Organization, 2003.

O que o TCC usa dela, na Introdução e na seção 2.1.1. A definição de adesão, como o grau em que o
comportamento do paciente corresponde ao plano combinado com o profissional de saúde, e a adesão
como fenômeno multidimensional, que não deve ser atribuído só ao paciente.

### A fala de que a descontinuidade é um desafio de saúde pública reconhecido pela OMS se sustenta?

Sim, e a fonte é a WHO (2003), que já está nas referências. A Introdução do TCC abre com essa ideia
e cita a WHO logo em seguida. O relatório inteiro trata a baixa adesão a tratamentos longos como um
problema mundial de saúde pública, e é dele a estimativa conhecida de que, nos países
desenvolvidos, só cerca de metade dos pacientes crônicos segue o tratamento. Conferir a página
antes de usar o número.

A fala não se justifica sozinha. O que a sustenta é a obra citada. No slide 2, vale colocar
"(WHO, 2003)" junto da frase. Se a banca perguntar de onde veio, a resposta é o relatório
*Adherence to long-term therapies*, da OMS, de 2003.

### Existe um campo em cada registro só para o Last-Write-Wins?

Sim, é o `updated_at`. Mas ele não trabalha sozinho. Toda tabela sincronizável herda o mesmo
conjunto de colunas de controle, definido em `src/domain/entities/syncable.ts`, e cada uma tem um
papel diferente.

| Coluna | Onde existe | Para que serve |
| --- | --- | --- |
| `id` | aparelho e nuvem | UUID gerado no aparelho, nunca autoincremento, para dois aparelhos não criarem o mesmo id |
| `updated_at` | aparelho e nuvem | Hora da última edição, pelo relógio de quem editou. É o critério do LWW |
| `synced_at` | só no aparelho | Até que versão a linha já subiu. Nulo quer dizer que nunca subiu |
| `deleted_at` | aparelho e nuvem | Exclusão lógica. A linha continua existindo para que a exclusão também viaje |
| `server_updated_at` | só na nuvem | Hora em que a linha chegou ao servidor, carimbada pelo próprio Postgres |

Além disso, o aparelho tem a tabela `sync_state`, que guarda por tabela a marca d'água do último
recebimento (`last_pulled_at`).

**Como uma sincronização acontece** (`src/data/remote/sync-service.ts`)

1. Primeiro o envio, sempre antes do recebimento. Se fosse o contrário, a versão antiga do servidor
   sobrescreveria uma edição local que ainda não subiu.
2. Sobe toda linha com `synced_at` nulo ou com `updated_at` maior que `synced_at`, ou seja, tudo
   que mudou desde o último envio. Linhas excluídas também sobem.
3. Depois que o servidor confirma, o app grava em `synced_at` o próprio `updated_at` da linha. Se a
   pessoa editar de novo durante o envio, o `updated_at` passa à frente e a linha continua
   pendente.
4. Depois vem o recebimento. O app pede ao servidor as linhas com `server_updated_at` maior que a
   marca d'água daquela tabela.
5. Para cada linha que desce, compara o `updated_at` remoto com o local. Se o local for igual ou
   mais novo, a linha remota é descartada. Se o remoto for mais novo, ele substitui o registro
   inteiro, sem misturar campos.
6. A linha que desce já é gravada com `synced_at` igual ao `updated_at`, senão o próximo envio a
   devolveria ao servidor num vaivém sem fim.

**O servidor também aplica o LWW** (`docs/supabase-schema.sql`)

O `upsert` do envio não compara datas. Quem faz isso na nuvem é o trigger `recusar_versao_antiga`,
que roda antes de cada atualização e ignora em silêncio a versão com `updated_at` mais velho que a
guardada. Esse foi o ajuste do cenário em que vencia a versão sincronizada por último, e não a
editada por último. Ele vale só para atualização, porque a exclusão pedida pelo titular na LGPD não
pode ser barrada por carimbo.

**Por que duas datas, `updated_at` e `server_updated_at`**

Elas respondem perguntas diferentes. O `updated_at` responde qual versão é a mais nova, e por isso
decide o conflito. O `server_updated_at` responde o que eu ainda não baixei, e por isso guia o
recebimento. Se o recebimento perguntasse pela data de edição, uma edição feita sem internet na
segunda e enviada só no domingo chegaria com data de segunda, abaixo da marca d'água de quem ficou
conectado, e nunca desceria. Esse foi o ajuste das edições offline que não chegavam ao outro
aparelho. A migration 021 zerou a marca d'água antiga justamente porque ela estava na unidade
errada.

**Resumo para falar.** Cada registro carrega a hora da sua última edição, e é ela que decide quem
vence, no aparelho e no servidor. O que muda de mão é o registro inteiro. A hora de chegada à nuvem
serve só para saber o que ainda falta baixar.

### Quais colunas aprovam ou recusam algo, e quando a sincronização não acontece?

Nem toda coluna de controle aprova ou recusa. Duas decidem, e duas só organizam a fila.

| Coluna | Onde existe | Decide ou organiza | O quê |
| --- | --- | --- | --- |
| `user_id` | só na nuvem | decide | **Quem** pode ler e gravar a linha, pelo RLS comparado ao JWT |
| `updated_at` | aparelho e nuvem | decide | **Qual versão** vence, pelo LWW |
| `synced_at` | só no aparelho | organiza | O que ainda falta **enviar** |
| `server_updated_at` | só na nuvem | organiza | O que ainda falta **baixar** |

Três cuidados com a forma de dizer.

- O `user_id` não existe no aparelho. O banco local é de uma pessoa só, então o app tira a coluna ao
  receber e a coloca de volta ao enviar.
- O `synced_at` não diz quando o registro entrou na nuvem. Ele diz até qual versão aquele aparelho
  já enviou. Quem diz quando entrou na nuvem é o `server_updated_at`, carimbado pelo servidor.
- O `updated_at` é por registro, e não por campo. Mudou qualquer campo, a linha inteira ganha a
  nova data.

Forma correta de falar. As nove tabelas têm, na nuvem, um `user_id`, e o RLS só deixa cada usuário
ler e gravar as próprias linhas. Todo registro tem um `updated_at`, que marca a última edição e
decide qual versão vence. No aparelho, o `synced_at` marca o que já foi enviado. Na nuvem, o
`server_updated_at` marca quando a linha chegou, e guia o que cada aparelho ainda precisa baixar.

**As duas filas, passo a passo**

*Fila de envio, no aparelho.* O app compara o `synced_at` com o `updated_at` da mesma linha.

| Momento | `updated_at` | `synced_at` | Situação |
| --- | --- | --- | --- |
| Cadastra o remédio às 10h | 10h | vazio | pendente, nunca subiu |
| Sincroniza às 10h05 | 10h | 10h | enviado, as duas datas iguais |
| Edita a dose às 14h | 14h | 10h | pendente, a edição é mais nova que o envio |
| Sincroniza às 14h10 | 14h | 14h | enviado de novo |

A regra é `synced_at` vazio ou `updated_at` maior que `synced_at`. O `synced_at` recebe o próprio
`updated_at` da linha, e não a hora do envio, para que as duas datas fiquem iguais quando está tudo
em dia.

*Fila de recebimento, na nuvem.* Aqui a comparação é com a **marca d'água**, a data guardada no
aparelho, na tabela `sync_state`, que diz até quando aquele aparelho já baixou.

| Momento | O que acontece |
| --- | --- |
| O celular A baixa às 10h | A marca d'água do A passa a ser 10h |
| O celular B envia uma edição às 11h | O servidor carimba a linha com `server_updated_at` 11h |
| O celular A sincroniza às 12h | Pede as linhas com `server_updated_at` depois das 10h, recebe a do B e passa a marca d'água para 11h |
| O celular A sincroniza às 13h | Pede o que chegou depois das 11h. Não há nada novo, nada desce |

Ou seja, o `synced_at` responde o que este aparelho ainda não enviou, e o `server_updated_at`,
comparado com a marca d'água, responde o que este aparelho ainda não recebeu. Nenhum dos dois
decide qual versão vence. Quem decide é o `updated_at`, depois que a linha chega.

**Casos em que algo não sincroniza ou é recusado**

1. **Sem conta vinculada.** A sincronização nem começa e não conta como erro, porque é o modo padrão
   do app (`sync-service.ts`, em `executarSync`). Tudo fica só no aparelho.
2. **Sem internet.** O envio falha, o erro aparece no resultado e nenhum `synced_at` é gravado.
   As linhas continuam pendentes e sobem na próxima tentativa.
3. **Sem token válido.** Se a sessão expirou e não foi renovada, o `auth.uid()` fica nulo no
   servidor. A leitura volta vazia e a gravação é recusada pela política do RLS. As linhas continuam
   pendentes até a pessoa entrar de novo.
4. **Linha de outra pessoa.** Uma gravação com `user_id` diferente do id do token é recusada pelo
   `with check` do RLS. O app sempre envia o id do próprio usuário, então esse caso só aparece se
   alguém tentar forjar a requisição fora do app.
5. **Versão mais velha chegando ao servidor.** O aparelho A editou às 8h, sem internet. O aparelho B
   editou o mesmo registro às 9h e já enviou. Quando o A volta a ter conexão, o trigger
   `recusar_versao_antiga` compara 8h com 9h e ignora o envio sem dar erro. Em seguida, o A baixa a
   versão das 9h. Os dois aparelhos terminam iguais, com a versão do B.
6. **Versão mais velha chegando ao aparelho.** No recebimento, se a linha local tem `updated_at`
   igual ou mais novo que a remota, a remota é descartada.
7. **Uma linha com dado inválido.** O envio vai em lotes de 200. Se o servidor recusa uma linha,
   aquele lote inteiro volta com erro, a sincronização para ali e tenta de novo na próxima vez. Os
   lotes anteriores já ficaram gravados.
8. **Duas sincronizações ao mesmo tempo.** A segunda não começa. Ela recebe o resultado da primeira,
   para as duas não disputarem as mesmas linhas.
9. **Fotos e anexos.** Nunca sobem. O caminho do arquivo vai como nulo, e no outro aparelho o
   registro chega sem a foto.

**Resumo para falar.** O `user_id` decide quem pode mexer na linha, e o `updated_at` decide qual
versão vale. O `synced_at` e o `server_updated_at` só controlam a fila do que falta enviar e
receber. Quando algo não sincroniza, a linha continua pendente no aparelho, e nada se perde por
falta de conexão.

### O que a pergunta "E se o relógio do celular estiver errado?" quer dizer?

O `updated_at` é gravado com a hora do próprio celular (`new Date()`), e não com a hora de um
servidor. Então o LWW confia que os relógios dos aparelhos estão certos. A pergunta da banca é o
que acontece quando um deles não está.

**Exemplo com o relógio atrasado.** O celular A está duas horas atrasado. Às 10h de verdade o
paciente edita a posologia no A, que grava 8h. Às 9h de verdade ele já tinha editado no B, que
gravou 9h. Na sincronização, 9h é maior que 8h, então vence a edição do B, que na verdade é a mais
antiga. A edição mais nova se perde sem aviso.

**Exemplo com o relógio adiantado.** Se o celular A estiver um dia adiantado, tudo o que ele editar
vence qualquer edição dos outros aparelhos até o relógio real alcançar aquela data.

**O que o app faz a respeito.** Para o conflito, nada além de aceitar o risco. É a fraqueza
conhecida do LWW, apontada pelo Kleppmann e assumida no TCC. O risco é pequeno porque o Android
acerta a hora sozinho pela rede, e porque o uso previsto é um aparelho principal por paciente,
então quase nunca há duas edições do mesmo registro competindo.

**Onde entra o `server_updated_at`.** Ele não resolve o conflito, resolve outro problema que também
vem do relógio do aparelho. Como a marca d'água do recebimento usa a hora do servidor, uma edição
com data antiga, seja por relógio errado ou por ter ficado dias sem internet, ainda assim desce para
os outros aparelhos. Ela chega, e só depois o `updated_at` decide se vence.

**Resumo para falar.** O LWW usa a hora do celular, então um relógio errado pode fazer a edição
errada vencer. É um custo aceito, porque o Android sincroniza a hora pela rede e o uso é de um
aparelho por paciente. O que o servidor garante é que nenhuma edição deixe de chegar, porque o
recebimento usa a hora de chegada à nuvem.

### Por que o estoque pode perder um desconto?

Porque o estoque guarda o **saldo pronto**, e não só os movimentos. Cada baixa faz duas coisas
dentro da mesma transação (`applyAdjustment` em `src/data/repositories/inventory-repository.ts`).

1. Cria uma linha nova em `inventory_adjustments`, com o `delta` (por exemplo, menos 1) e o motivo.
2. Atualiza o `quantity` de `inventory_items` para o novo saldo, e o `updated_at` da linha junto.

Os ajustes nunca entram em conflito, porque cada um é uma linha nova com UUID próprio, e os dois
aparelhos simplesmente somam as linhas. O problema está no item de estoque, que é uma linha só,
editada pelos dois lados. E o LWW troca a linha inteira, sem fazer conta.

**Exemplo.** A caixa tem 30 comprimidos, e os dois aparelhos estão sem internet.

| Momento | Aparelho A | Aparelho B |
| --- | --- | --- |
| Início | 30 | 30 |
| 8h, A registra uma dose de 1 | 29, `updated_at` 8h | 30 |
| 9h, B registra uma dose de 2 | 29 | 28, `updated_at` 9h |
| Os dois sincronizam | 28 | 28 |

O certo seria 27. O LWW comparou 8h com 9h, a linha do B venceu inteira e o desconto do A sumiu do
saldo. Os dois ajustes continuam registrados no histórico, mas o `quantity` não é recalculado a
partir deles, ele só é substituído.

**Por que isso foi aceito.** Só acontece com o mesmo estoque baixado em dois aparelhos da mesma
conta, os dois sem conexão ao mesmo tempo. Com um aparelho principal por paciente, esse cenário
quase não existe, e se acontecer o erro é de algumas unidades, que a recontagem manual corrige.

**Como se resolveria.** Calcular o saldo a partir da soma dos ajustes, em vez de guardar o total
pronto. Como os ajustes nunca se sobrescrevem, o saldo sairia certo em qualquer ordem de
sincronização. Isso exigiria tratar a recontagem manual como um ajuste que fixa o saldo, e por isso
ficou de fora do escopo.

**Resumo para falar.** O ajuste de estoque nunca se perde, porque cada um é uma linha nova. O que
se perde é o saldo, que é uma linha só e é substituído inteiro pelo LWW. Se dois aparelhos
descontam sem conexão, vence o saldo de quem editou por último, e o desconto do outro some da
conta.

### Como funcionam o RLS e o JWT, e o que existe de criptografia?

**O caminho do login** (`src/data/remote/supabase-auth-gateway.ts`)

1. O paciente toca em entrar com Google, e o app abre o navegador na tela do Google.
2. O Google confirma quem é a pessoa e devolve ao Supabase, que cria ou encontra o usuário e gera
   dois tokens.
3. O app recebe um **access token**, que é o JWT, e um **refresh token**, e guarda os dois no
   `AsyncStorage` (`src/data/remote/supabase-client.ts`).

O app nunca vê nem guarda a senha do Google.

**O que é o JWT.** É um texto em três partes, cabeçalho, conteúdo e assinatura. O conteúdo diz
quem é o usuário (o campo `sub`, que é o id dele) e até quando o token vale, cerca de uma hora. A
assinatura é feita pelo Supabase com uma chave secreta que só o servidor tem. O conteúdo não é
secreto, qualquer um consegue ler, mas ninguém consegue alterar. Se alguém trocar o id dentro do
token para o de outra pessoa, a assinatura deixa de bater e o servidor recusa. Quando o token
vence, o `supabase-js` usa o refresh token para pegar outro sozinho (`autoRefreshToken`).

**O que é o RLS.** Row Level Security é um recurso do próprio PostgreSQL que filtra linha por linha
quem pode ver ou mexer em cada registro. Toda requisição do app vai com o JWT, o Supabase confere a
assinatura e expõe o id do usuário dentro do banco pela função `auth.uid()`. As nove tabelas têm
uma coluna `user_id` e as mesmas quatro políticas (`docs/supabase-schema.sql`).

| Operação | Regra |
| --- | --- |
| Ler | só as linhas com `user_id = auth.uid()` |
| Inserir | só se a linha nova tiver `user_id = auth.uid()` |
| Alterar | só linhas suas, e sem trocar o dono |
| Apagar | só linhas suas |

A regra de inserir e alterar (`with check`) é o que impede alguém de gravar uma linha em nome de
outro. Sem ela, a leitura estaria protegida e a escrita não. E sem token, `auth.uid()` é nulo,
nenhuma linha casa, e o banco não devolve nada.

**Por que a chave do Supabase pode ficar dentro do app.** A `anon key` que vai no `.env` é pública
por projeto, qualquer um que abrir o APK consegue ver. Ela só identifica o projeto, não dá acesso a
dado nenhum. Quem libera ou bloqueia é o RLS junto com o JWT. Por isso o RLS ligado nas nove
tabelas não é um detalhe, é a proteção inteira.

**Criptografia, o que existe**

| Onde | Situação |
| --- | --- |
| No caminho entre app e nuvem | Criptografado, toda comunicação com o Supabase é HTTPS (TLS) |
| Na nuvem, em disco | Criptografado pelo próprio Supabase, que cifra os discos do banco |
| No aparelho, o SQLite | **Não** é cifrado pelo app. Fica na área privada do Mapill, que o Android isola dos outros apps, e o Android cifra o armazenamento do aparelho inteiro enquanto ele está bloqueado |
| No aparelho, os tokens | Ficam no `AsyncStorage`, também na área privada, e não no `expo-secure-store`, que usaria o cofre de chaves do Android |
| Fotos e anexos | Só no aparelho, na mesma área privada, e não sobem |

**Então os dados têm criptografia?** Têm, mas é a que a infraestrutura garante, e não uma que o
Mapill implementou. No envio, quem cifra é o HTTPS. Guardados na nuvem, quem cifra é o
Supabase, no disco onde roda o PostgreSQL. No aparelho, quem cifra é o Android. O app não cifra por
conta própria nenhum campo nem o banco SQLite. Na banca, o certo é dizer que os dados trafegam e
ficam armazenados cifrados, pela infraestrutura, e que uma criptografia própria do app no banco
local é melhoria futura. Dizer que não há criptografia seria pior do que a realidade.

**O que dá para dizer com honestidade.** A proteção entre usuários está no servidor e é sólida,
porque não depende do app se comportar bem. A proteção dentro do aparelho depende do Android, do
bloqueio de tela e do isolamento entre apps. Um celular com root ou desbloqueado na mão de outra
pessoa expõe os dados, porque o app não tem banco cifrado nem bloqueio próprio por senha ou
digital. A troca do `AsyncStorage` pelo `expo-secure-store`, o banco cifrado com SQLCipher, um
bloqueio por biometria e o teste ativo do RLS com outra conta são as melhorias naturais.

**Resumo para falar.** O login é feito pelo Google e o Supabase entrega um token assinado que diz
quem é o usuário. Esse token vai em toda requisição, e o banco aplica em cada linha a regra de que
o dono tem que ser quem está no token. Sem token ou com token de outra pessoa, nada volta. A
comunicação vai por HTTPS e a nuvem cifra o disco. No aparelho, quem protege é o isolamento e a
criptografia do próprio Android.

### Como o Google valida o usuário? Ele compara o e-mail?

Não. O login segue o OAuth 2.0 com OpenID Connect, e quem identifica a pessoa é um id fixo da conta
Google, e não o e-mail.

**O caminho completo**

1. O app pede ao Supabase o endereço de login do Google e abre esse endereço no navegador
   (`signInWithOAuth` em `src/data/remote/supabase-auth-gateway.ts`).
2. A pessoa entra **no site do Google**, com senha, verificação em duas etapas ou o que a conta
   exigir. O app e o Supabase nunca veem a senha.
3. O Google devolve ao Supabase um código de uso único. O Supabase troca esse código direto com o
   Google, usando uma credencial secreta que só o servidor tem.
4. Nessa troca o Google entrega o **id token**, que também é um JWT, assinado pelo Google. Dentro
   dele vão o `sub`, que é o id permanente da conta Google, o e-mail, se o e-mail foi verificado, e
   o nome.
5. O Supabase confere a assinatura com as chaves públicas do Google e procura na tabela
   `auth.identities` uma identidade do provedor Google com aquele `sub`. Se acha, é o mesmo usuário.
   Se não acha, cria um usuário novo com um UUID próprio, e é esse UUID que vira o `user_id` das
   tabelas do Mapill.
6. O Supabase gera o **seu próprio** JWT, assinado por ele, e manda de volta ao app pelo endereço
   `mapillapp://`. O app lê os tokens e abre a sessão (`setSession`).

**Por que o `sub` e não o e-mail.** O e-mail pode mudar e pode ser reaproveitado. O `sub` nunca
muda para aquela conta Google. Se a pessoa trocar o e-mail da conta, continua sendo o mesmo usuário
no Mapill. O e-mail só aparece na tela de conta.

**São dois JWT diferentes.** O do Google prova ao Supabase quem é a pessoa, e fica só entre os dois.
O do Supabase é o que o app guarda e manda em toda requisição, e é dele que o RLS tira o
`auth.uid()`.

**Um ponto a melhorar.** Os tokens voltam ao app no próprio endereço de retorno (o fluxo
implícito). O Supabase também oferece o fluxo com PKCE, em que volta só um código e o app o troca
pelos tokens com uma prova que só ele tem. É mais seguro contra outro app que tente se registrar no
mesmo endereço `mapillapp://`.

**Resumo para falar.** A senha é digitada no Google, nunca no app. O Google entrega ao Supabase um
token assinado com o id permanente da conta, o Supabase associa esse id a um usuário seu e emite o
token que o app usa dali em diante.

### O React Native se justifica pensando numa versão para iPhone?

Sim, e esse é o argumento mais forte da escolha. Mas o reaproveitamento não é total, e vale saber
onde ele para.

**O que serve para o iOS sem mudança**

- O domínio inteiro, em TypeScript puro, com as regras de horário, estoque e adesão.
- Os repositórios e o SQLite, porque o `expo-sqlite` funciona igual nos dois sistemas.
- A sincronização, o Supabase, o RLS e o login com Google.
- As telas, a navegação e o sistema de design.
- O catálogo da CMED e a leitura do código de barras.

Isso é a maior parte do código. E é a Clean Architecture que torna isso possível, porque as regras
não sabem em que sistema estão rodando.

**O que é só do Android e teria de ser refeito ou repensado**

- O módulo nativo `modules/desbloqueio`, escrito em Kotlin, que abre e fecha a tela do alarme por
  cima da tela de bloqueio. Não existe versão em Swift.
- A tela de alarme em tela cheia. O iOS historicamente não deixa um app comum tomar a tela
  bloqueada como um despertador. Hoje há caminhos, o AlarmKit nas versões novas do iOS e os
  alertas críticos, que exigem autorização da Apple, mas seria outra implementação.
- Os canais de notificação, a permissão de alarme exato e a ajuda de início automático do
  fabricante (`src/notifications`). São conceitos do Android que não existem no iOS. A ajuda de
  início automático simplesmente não seria necessária lá.
- O limite de agendamento. O iOS guarda no máximo 64 notificações locais pendentes por app. Os
  avisos de sete dias de quem toma vários remédios passariam disso, então a janela de agendamento
  teria de ser menor ou renovada com mais frequência.

**O que muda fora do código.** Para gerar e publicar no iOS é preciso uma conta de desenvolvedor da
Apple, que é paga, e compilar com o EAS do Expo ou num Mac.

**Comparando com a alternativa.** Com Kotlin nativo, o iPhone exigiria reescrever tudo em Swift,
domínio, banco, sincronização e telas, e manter duas bases com as mesmas regras. Com React Native, o
trabalho do iOS fica concentrado na parte de alarme e notificação, que é justamente a parte que
depende do sistema em qualquer tecnologia.

**Resumo para falar.** A escolha se justifica porque uma base só atende os dois sistemas, e a
arquitetura deixa as regras independentes da plataforma. O que precisaria de trabalho próprio no
iOS é o alarme, porque é a parte que conversa direto com o sistema operacional, e isso aconteceria
com qualquer tecnologia.

### O que são ORM, Tailwind e gerenciador de estado global, e por que o Mapill não usa?

**O Supabase não é um ORM.** O Supabase é uma plataforma de back-end. Ele entrega um PostgreSQL
hospedado, o login, as regras de RLS e uma API pronta que o app chama pela internet. A biblioteca
`supabase-js` tem uma escrita parecida com a de um ORM, como `.from("medications").upsert(...)`,
mas por baixo ela só monta uma requisição HTTP para essa API. Ela não cria classes a partir das
tabelas, não gera migrações e não cuida do banco local.

**O que é um ORM.** ORM quer dizer mapeamento objeto-relacional. É uma biblioteca, como Prisma,
TypeORM ou Drizzle, em que a pessoa descreve as tabelas como classes ou objetos no código e a
biblioteca escreve o SQL sozinha. Em vez de escrever `SELECT * FROM medications WHERE id = ?`,
escreve algo como `db.medications.find(id)`.

**O que o Mapill faz no lugar.** No SQLite do aparelho, o SQL é escrito à mão, e cada repositório
tem duas funções pequenas que convertem a linha do banco na entidade do domínio e vice-versa
(`toEntity` e `toRow`, em `src/data/repositories`). É o trabalho que o ORM faria, feito à mão. Isso
se justifica porque as consultas são poucas e específicas, e porque partes como a sincronização
precisam de SQL que um ORM esconderia, como o `ON CONFLICT` e a comparação de `updated_at` com
`synced_at`.

**O que é o Tailwind.** É uma forma de estilizar telas com classes curtas prontas, como
`p-4 bg-white rounded-lg`. No React Native ele chega pela biblioteca NativeWind. O Mapill usa no
lugar um sistema de design próprio em `src/shared/theme`, com cores, espaçamentos, tipografia e
sombras definidos uma vez e usados pelos componentes de `src/ui`. Isso evita uma camada a mais
entre o componente e o estilo, e deixa a troca de tema no mesmo lugar.

**O que é gerenciador de estado global.** Estado é o dado que a tela está mostrando naquele
momento, como a lista de remédios ou as doses de hoje. Quando várias telas precisam do mesmo dado,
muitos apps criam uma "memória central" compartilhada, e as telas leem dela. As bibliotecas mais
conhecidas para isso são Redux e Zustand. Quando uma tela muda algo nessa memória, as outras se
atualizam sozinhas.

**O que o Mapill faz no lugar.** A memória central do Mapill é o próprio SQLite. Cada tela tem um
hook (`src/hooks`, como `use-inventory-list.ts`) que lê o que precisa dos repositórios toda vez
que a tela ganha foco (`useFocusEffect`). Se o paciente registra uma dose e volta para o estoque, o
estoque relê o banco e já mostra o número novo. Assim não existem duas cópias do mesmo dado, uma no
banco e outra na memória, que poderiam ficar diferentes. Isso combina com a fonte única de verdade
do offline-first. A única coisa compartilhada entre as telas é o tema de cores, e para isso basta o
Context, que já vem no React (`src/shared/theme/tema-contexto.tsx`).

**O estado global com um exemplo.** Cada tela do React guarda os próprios dados numa variável
interna (`useState`), e essa variável some quando a tela fecha. Imagine a tela inicial mostrando
"3 doses pendentes" e a tela de doses mostrando a lista. Se cada uma guardasse a sua cópia,
confirmar uma dose na lista deixaria a tela inicial com o número velho até alguém recarregar. O
gerenciador de estado global resolve isso com um quadro de avisos único na memória do app. As duas
telas leem do mesmo quadro, e quando uma escreve nele a outra é avisada e se redesenha. Redux e
Zustand são bibliotecas que fazem esse quadro.

No Mapill, o quadro de avisos é o banco. A tela de doses grava a confirmação no SQLite, e quando a
tela inicial volta a aparecer ela relê o banco e já mostra 2. Ninguém precisa avisar ninguém,
porque o dado só existe em um lugar.

**Resumo para falar.** O Supabase é o back-end, não um ORM, e no aparelho o SQL é escrito direto
porque as consultas são poucas e a sincronização precisa de controle fino. O estilo vem de um
sistema de design próprio. E não há memória central de estado porque o banco local já é a fonte
única de verdade, e cada tela lê dele quando aparece.

### Por que Supabase e não um ORM?

**Eles não concorrem entre si.** Supabase e ORM resolvem problemas de camadas diferentes, e um
projeto pode usar os dois juntos. A pergunta da banca é sobre ORM contra SQL escrito à mão. A
escolha do Supabase é outra decisão, contra alternativas como o Firebase ou um servidor próprio.

**Por que o ORM não substituiria o Supabase.** Um ORM precisa de uma conexão direta com o banco,
com usuário e senha do banco. Um app de celular não pode ter isso, porque qualquer um que abrisse o
APK teria a senha do banco inteiro. Então, para usar um ORM no PostgreSQL da nuvem, seria preciso
construir e hospedar um servidor próprio, com Node e Prisma por exemplo, escrever as rotas da API,
o login e o controle de quem acessa o quê. É exatamente esse trabalho que o Supabase já entrega
pronto.

**O que justifica o Supabase**

- É PostgreSQL, relacional e com transações ACID, o mesmo modelo do SQLite do aparelho. As nove
  tabelas são iguais nos dois lados, e a sincronização só copia linhas.
- O RLS fica dentro do banco, então a separação entre usuários não depende de um servidor escrito
  por mim.
- O login com Google vem pronto.
- O plano gratuito cobre o uso de um TCC.
- É código aberto e pode ser hospedado em servidor próprio, então o projeto não fica preso a um
  fornecedor. Esse é um ponto a favor dele contra o Firebase, que também não é relacional.

**Onde um ORM faria sentido.** No SQLite do aparelho. Existe ORM que funciona com o `expo-sqlite`,
como o Drizzle, e seria uma escolha defensável. Ele foi deixado de lado por três motivos.

1. São poucas tabelas e poucas consultas, e as funções `toEntity` e `toRow` são curtas. O ganho de
   automatizar seria pequeno.
2. A parte mais delicada do app, a sincronização, trabalha com qualquer tabela pelo nome e precisa
   de SQL que um ORM esconde, como o `ON CONFLICT` e a comparação entre `updated_at` e `synced_at`.
   Ela continuaria em SQL de qualquer jeito.
3. Uma dependência a menos, com as próprias migrações, as próprias atualizações e o próprio jeito de
   gerar SQL. Com o SQL à vista, fica claro o que cada operação faz no banco.

**Resumo para falar.** O Supabase não compete com um ORM. Ele substitui o servidor inteiro que
seria preciso construir, com banco, login e controle de acesso. O ORM caberia no banco local, mas
com poucas consultas e uma sincronização que precisa de SQL direto, o ganho não pagava a dependência
a mais.

### Teste automatizado é a mesma coisa que CI/CD?

Não, são coisas diferentes que costumam andar juntas.

| Termo | O que é | Exemplo |
| --- | --- | --- |
| Teste automatizado | Código que confere se outro código faz o que deveria | Uma rotina que chama a previsão de estoque com 30 comprimidos e confere a data em que acaba |
| CI, integração contínua | Um serviço que roda os testes e as checagens sozinho a cada envio de código ao repositório, e avisa se algo quebrou | GitHub Actions rodando os testes a cada `git push` |
| CD, entrega contínua | O passo seguinte, que gera e publica o app sozinho quando tudo passa | Um build do EAS disparado e enviado à loja a cada versão aprovada |

O teste é o que confere. O CI é quem roda o teste sem ninguém lembrar. O CD é quem publica depois.
Dá para ter teste sem CI, rodando à mão, mas não faz sentido ter CI sem nada para rodar.

**O que o Mapill tem hoje**

- **Testes, em forma de rotinas de conferência.** São os arquivos `scripts/conferir-*.mjs`, como
  `conferir-previsao-de-estoque.mjs`. Cada um chama uma regra do domínio com casos montados à mão e
  imprime `ok` ou `FALHOU`. Funcionam sem aparelho porque a hora atual entra como parâmetro. São
  testes automatizados de verdade, só que escritos sem uma ferramenta como o Jest e rodados à mão,
  um por um.
- **Checagens antes de cada versão.** A checagem de tipos do TypeScript, a análise estática
  (`npm run lint`) e essas rotinas, rodadas por mim antes de gerar o APK.
- **Build na nuvem pelo EAS** (`eas.json`), disparado à mão.

**O que não tem**

- CI. Nenhum serviço roda as rotinas sozinho a cada envio, e não há pasta `.github/workflows`.
- CD. A geração e a distribuição do APK são feitas à mão.
- Testes das telas e da sincronização. As rotinas cobrem as regras do domínio, não o caminho
  inteiro pelo app.

É isso que o TCC chama de trabalho futuro. Primeiro reunir as rotinas num conjunto único, com
Jest por exemplo, e depois colocar esse conjunto num CI para rodar a cada alteração.

**Resumo para falar.** Teste é o código que confere o código. CI é rodar esses testes sozinho a
cada alteração, e CD é publicar sozinho quando passam. O Mapill tem os testes das regras de
domínio, rodados à mão antes de cada versão, e ainda não tem CI nem CD.

### Como falar da Clean Architecture com naturalidade

**A ideia numa frase.** O que é mais importante e muda menos fica no centro, o que é detalhe e muda
mais fica por fora, e quem está por fora depende de quem está dentro, nunca o contrário.

**Uma comparação que ajuda.** Pense numa receita médica. A receita diz o que tomar, quanto e de
quanto em quanto tempo. Ela não muda se o paciente compra na farmácia A ou B, nem se guarda o
remédio na gaveta ou no armário. No Mapill, as regras de cuidado são a receita, e o banco, a
biblioteca de alarme e as telas são a farmácia e o armário. Dá para trocar a farmácia sem
reescrever a receita.

**As três camadas no código**

| Camada | Pasta | O que tem | Depende de |
| --- | --- | --- | --- |
| Domínio, o centro | `src/domain` | entidades (`entities`), portas (`ports`) e casos de uso (`use-cases`) | ninguém |
| Dados, por fora | `src/data`, `src/notifications` | SQLite, Supabase e a biblioteca de alarme, cumprindo as portas | domínio |
| Apresentação, mais por fora | `src/app`, `src/telas`, `src/ui`, `src/hooks` | telas, componentes e os hooks que ligam a tela aos repositórios | domínio e dados |

O domínio não importa nenhuma biblioteca. Conferido no código, todos os `import` de `src/domain`
apontam só para outros arquivos do próprio domínio. Isso é o RNF 09.

**Os três termos que a banca pode puxar**

- **Entidade.** O conceito do mundo real, como medicamento, prescrição, horário de dose e registro
  de ingestão. É só o formato do dado, sem saber onde ele é guardado.
- **Caso de uso.** A regra de negócio como uma função. Recebe dados, devolve resultado, e não
  grava nada nem toca alarme. Exemplos são `generate-dose-schedules.ts`, que gera os horários a
  partir da posologia, e `resumir-adesao.ts`, que calcula a taxa de adesão.
- **Porta.** Um contrato que o domínio escreve dizendo do que precisa, sem dizer como. Por exemplo,
  `NotificationGateway`, em `src/domain/ports`, diz que precisa de agendar, cancelar e contar
  avisos. Quem cumpre o contrato é a camada de fora. Isso é a inversão de dependência, o D do
  SOLID.

**Três histórias do projeto para contar**

1. **A troca da biblioteca de alarme.** O Notifee foi arquivado em abril de 2026. O domínio só
   conhece a porta `NotificationGateway`, e quem a cumpre é `src/notifications/notifee-gateway.ts`.
   A troca para o `react-native-notify-kit` mudou o `import` desse arquivo, e nenhuma regra de
   horário, adiamento ou agrupamento foi tocada. É o exemplo mais forte, porque aconteceu de
   verdade.
2. **Testar sem celular.** Como os casos de uso são funções puras e recebem o instante presente como
   parâmetro, as rotinas de `scripts/conferir-*.mjs` simulam a virada da meia-noite ou uma dose
   atrasada no computador, em segundos, sem emulador e sem mexer no relógio.
3. **Medicamento separado de prescrição.** O medicamento é o que está na caixa, e a prescrição é
   como se toma. Se o médico muda a dose, muda a prescrição, e o medicamento e o histórico
   continuam os mesmos (seção 4.4.2).

**Versão de 30 segundos para falar.** "O Mapill segue a Clean Architecture. No centro ficam as
regras de cuidado com o remédio, como gerar os horários, descontar o estoque e calcular a adesão,
escritas em TypeScript puro, sem nenhuma biblioteca. Por fora ficam o banco, a nuvem e o alarme, e
por último as telas. A dependência sempre aponta para dentro, então o centro não sabe que existe
SQLite ou Android. Na prática, isso me deixou trocar a biblioteca de alarme no meio do projeto sem
mexer em nenhuma regra, e testar as regras no computador, sem celular."

**Armadilhas.** O TCC fala em três camadas. O desenho original do Martin tem quatro círculos,
entidades, casos de uso, adaptadores e frameworks, e o Mapill junta os dois de dentro no domínio e
os dois de fora em dados e apresentação. Se a banca citar os quatro, é essa a resposta. Os hooks
fazem parte da apresentação (seção 4.4.4). E a pasta `src/notifications` é camada de fora, porque
é ela que conhece a biblioteca de alarme.

### O que caracteriza uma Clean Architecture, além de separar em pastas?

Separar em pastas não basta. Muito projeto tem pasta de domínio, pasta de dados e pasta de telas e
não é Clean Architecture. O que define é **a direção da dependência**.

**A regra que define tudo, a regra de dependência.** O código de dentro nunca pode citar nada que
está fora. A regra de negócio não pode importar o banco, a biblioteca de alarme nem o React. Quem
está fora conhece quem está dentro, e nunca o contrário (Martin, 2019).

**O que muda em relação à arquitetura em camadas tradicional.** Na tradicional, a dependência desce
em cascata. A tela chama a regra, e a regra chama o banco, então a regra depende do banco. Na Clean
Architecture essa seta é invertida. A regra declara uma interface dizendo do que precisa, a porta,
e o banco é que se adapta a ela.

| | Camadas tradicional | Clean Architecture |
| --- | --- | --- |
| A regra de negócio conhece o banco? | Sim, chama direto | Não, só conhece a porta |
| Quem se adapta a quem? | A regra se adapta ao banco | O banco se adapta à regra |
| Trocar o banco mexe na regra? | Mexe | Não mexe |

No Mapill, a porta `DoseScheduleRepository` está em `src/domain/ports`, escrita pelo domínio. A
classe que fala com o SQLite está em `src/data/repositories` e cumpre essa porta. O domínio não
sabe que o SQLite existe.

**As características que resultam dessa regra** (Martin, 2019)

- Independente de framework. O React Native é uma ferramenta, não o centro.
- Independente de interface. A tela pode mudar sem mudar a regra.
- Independente de banco. O SQLite pode ser trocado.
- Independente de serviço externo. O alarme e a nuvem são detalhes.
- Testável. As regras rodam sem tela, sem banco e sem celular.

**Política e detalhe.** O Martin separa o que é política, as regras que dão valor ao sistema, do
que é detalhe, banco, tela, framework. A arquitetura protege a política dos detalhes. No Mapill, a
política é "dose sem resposta nunca vira pulada" ou "o estoque desconta a dose". O detalhe é se
isso fica em SQLite ou se o aviso sai pelo Notifee ou pelo notify-kit.

**Três perguntas para saber se um projeto é Clean.**

1. O domínio importa alguma biblioteca? No Mapill, não.
2. Dá para trocar o banco ou a biblioteca de alarme sem mexer na regra? No Mapill, sim, e a troca
   do alarme aconteceu.
3. Dá para testar a regra sem tela e sem banco? No Mapill, sim, pelas rotinas de conferência.

**Onde o Mapill é pragmático, e não purista.** Vale saber, caso a banca pergunte se é 100% Clean.
Os hooks da apresentação criam os repositórios concretos direto, com `new InventoryRepository()`,
em vez de receber tudo por injeção de dependência. E alguns hooks guardam pequenas regras de
montagem da tela, como escolher a prescrição vigente para a previsão de estoque. Nada disso quebra
a regra de dependência, porque a seta continua apontando para dentro, mas uma versão purista
passaria tudo isso para casos de uso. A resposta honesta é que o rigor foi aplicado onde importava,
nas regras clínicas.

**Resumo para falar.** O que caracteriza a Clean Architecture não é ter camadas, é a direção da
dependência. A regra de negócio fica no centro e não conhece nada de fora, e quem está fora se
adapta a ela por meio de interfaces. É isso que torna o centro testável e permite trocar banco,
tela ou biblioteca sem mexer nas regras.

### Mais perguntas prováveis, sobre requisitos, regras e arquitetura

**Qual a diferença entre requisito funcional, não funcional e regra de negócio?** (4.2, 4.3)
Pela classificação de Sommerville, o funcional diz o que o sistema faz, como confirmar ou pular uma
dose. O não funcional diz com que qualidade ou sob que restrição, como funcionar sem internet. A
regra de negócio diz como o domínio se comporta, independente da tela, como o estoque descontar a
dose e não uma unidade. São 44 funcionais, 9 não funcionais e 20 regras.

**Por que o adiamento só é permitido uma vez?** (RN 12 e 13)
Adiar sem limite vira uma forma de ignorar o alarme sem decidir nada. Uma vez dá cinco minutos de
folga, e depois o botão some. Adiar também não registra desfecho, a dose continua pendente.

**Por que um aviso por horário, e não um por remédio?** (RN 11)
Quem toma três remédios às 8h receberia três alarmes tocando juntos. Um aviso só, com as três doses,
é menos ruído e combina com o que a pessoa faz na prática, que é tomar tudo de uma vez.

**Por que qualquer edição apaga e refaz todos os avisos?** (RN 14)
Para não sobrar alarme órfão, de um horário que mudou ou de um tratamento encerrado. Reconstruir
tudo é mais simples e mais seguro do que descobrir quais avisos mudaram.

**Por que compromisso não toca alarme?** (RN 16)
O alarme de alta prioridade fica reservado para a dose, que tem consequência clínica imediata. Se
tudo tocasse como alarme, a pessoa aprenderia a ignorar o alarme.

**Por que os horários nascem vazios no cadastro?** (RN 08, Nielsen)
Horário sugerido é o que quem tem pressa aceita sem ler, e o app passaria a lembrar na hora errada
sem ninguém perceber. É a heurística de prevenção de erros.

**Por que o app recusa a previsão de estoque em vez de estimar?** (RN 03)
Quando a unidade da embalagem não combina com a da dose, qualquer número seria um palpite. Para um
dado de saúde, não mostrar é mais honesto do que mostrar errado.

**O que quer dizer que nenhuma operação pode falhar em silêncio?** (RNF 07)
Toda falha precisa voltar para quem chamou ou para a tela. Exemplo real, o adiamento devolve se
deu certo, porque antes a recusa acontecia calada no banco e cinco toques em adiar viravam cinco
lembretes. A sincronização também nunca lança erro escondido, ela devolve a mensagem para a tela.

**Por que as migrações só adicionam e nunca apagam?** (RNF 04, 4.4.3)
Porque o banco está no celular de quem já usa o app, com histórico clínico dentro. Uma migração que
apaga ou renomeia uma coluna poderia perder dados de tratamento. São 21 migrações, cada uma numa
transação própria, e a versão só é marcada depois de confirmada. Se falhar no meio, nada fica pela
metade.

**Exclusão lógica e física, qual a diferença e quando cada uma?** (RN 07 e 18, 4.3.5)
A lógica marca a linha como excluída e mantém o histórico, e é usada quando o paciente apaga um
tratamento. A física remove de verdade, e só acontece quando o titular pede para apagar tudo, pela
LGPD. Nesse caso a nuvem é apagada primeiro, para a sincronização não trazer os dados de volta.

**Se trocasse o SQLite por outro banco, o que mudaria?** (4.4.2)
Só os repositórios em `src/data/repositories`, que cumprem as portas do domínio. As regras e as
telas continuariam iguais. É a mesma lógica da troca da biblioteca de alarme.

**A tela acessa o banco direto?** (4.4.4)
Não. A tela usa um hook, o hook chama o repositório, e o repositório fala com o banco. Isso deixa
a tela sem saber se o dado vem do SQLite ou de outro lugar.

**Onde entra o SOLID?** (2.6.1, RNF 09)
Principalmente no D, a inversão de dependência, pelas portas. Também aparece o S, a
responsabilidade única, já que cada caso de uso faz uma coisa só, como gerar horários ou calcular
adesão, e por isso cada um pode ser conferido separado.

### Treino de respostas, com correção

As minhas respostas e o ajuste de cada uma.

**Requisito funcional, não funcional e regra de negócio.**
Minha resposta. O funcional é a funcionalidade em si. O não funcional é sobre o processo, como
latência e segurança. A regra de negócio é a condição de operação, como "se o usuário acionar o
lembrete, o alarme precisa tocar independente de tudo".
Ajuste. Os dois primeiros estão certos. O exemplo da regra de negócio, porém, é um requisito não
funcional, o RNF 02, porque fala de confiabilidade da plataforma. Um teste que ajuda é perguntar
se a regra valeria num caderno de papel. "O estoque desconta a dose, e não uma unidade" vale no
papel, então é regra de negócio. "O alarme toca com o app fechado" só existe no software, então é
requisito não funcional.

**Por que adiar só uma vez.**
Minha resposta. Entra na usabilidade, senão vira bagunça.
Ajuste. "Bagunça" é vago. O motivo é que adiar sem limite vira um jeito de ignorar o alarme sem
nunca decidir nada, e o alarme perde a função. Com uma vez só, a pessoa ganha cinco minutos e depois
precisa responder se tomou ou pulou. E adiar não registra desfecho, a dose continua pendente
(RN 12 e 13).

**Por que um aviso por horário.**
Minha resposta. O horário é o ponto em comum entre as medicações, faz sentido do ponto de vista de
classes.
Ajuste. A ideia do ponto em comum está certa, mas a banca quer o motivo para o paciente, e não para
o código. Quem toma três remédios às 8h receberia três alarmes tocando juntos. Um aviso só, com as
três doses numa tela, é menos ruído e combina com o que a pessoa faz, que é tomar tudo de uma vez.

**Por que toda edição refaz todos os avisos.**
Minha resposta. Para evitar o lembrete de uma posologia incerta.
Ajuste. Quase. A palavra melhor é desatualizada, e não incerta. Se o horário mudou de 8h para 9h,
o aviso das 8h não pode continuar agendado. E refazer tudo é mais seguro do que tentar descobrir
quais avisos mudaram, porque não sobra nenhum alarme órfão (RN 14).

**Por que compromisso não toca alarme.**
Minha resposta. A configuração define o alarme só para medicações, e o compromisso é menos
específico.
Ajuste. "A configuração define" explica como é, mas não por quê. O motivo é que o alarme fica
reservado para o que tem consequência clínica imediata, que é a dose. A consulta é conhecida com
dias de antecedência, então uma notificação antes resolve. E se tudo tocasse como alarme, a pessoa
aprenderia a ignorar o alarme, inclusive o da dose (RN 16). A palavra melhor é menos urgente, e não
menos específico.

**Por que os horários começam vazios.**
Minha resposta. Evita o preenchimento de uma posologia incorreta ou acidental.
Ajuste. Certo. Para completar, diga o mecanismo e a fonte. Um horário já sugerido é o que quem tem
pressa aceita sem ler, e o app passaria a lembrar na hora errada sem ninguém perceber. Com o campo
vazio, a pessoa é obrigada a pensar no horário. É a heurística de prevenção de erros de Nielsen
(RN 08).

**Por que o app recusa a previsão de estoque.**
Minha resposta. A previsão é relativa, o app mostra uma data aproximada, porque não controla o
estoque de fato, só ajuda a gerenciar.
Ajuste. Você juntou duas coisas que são verdade, mas são diferentes.
1. A RN 03 trata de quando a previsão **não aparece**. Isso acontece quando a unidade do estoque é
   diferente da unidade da dose. Exemplo, a gota se toma em gotas e se compra em ml. Converter
   exigiria saber quantas gotas tem um ml daquele frasco, e o app não sabe. Então, em vez de
   chutar, não mostra nada (`estimate-stock-depletion.ts`, que devolve nulo quando as unidades não
   batem).
2. Quando as unidades batem, a previsão aparece, e aí sim ela é aproximada. A tela diz "cerca de" e
   "por volta desta data", porque é uma projeção, que muda a cada dose confirmada ou pulada.
Resposta curta. Com unidades diferentes, o app não arrisca um número errado num dado de saúde. Com
unidades iguais, mostra a data como aproximação.

**A tela acessa o banco direto?**
Minha resposta. Não.
Ajuste. Certo, mas diga o caminho. A tela usa um hook, o hook chama o repositório, e só o
repositório fala com o banco (seção 4.4.4).

### Nenhuma operação pode falhar em silêncio (RNF 07)

**O que quer dizer.** Quando algo dá errado, alguém precisa ficar sabendo, seja o código que pediu a
operação, seja o paciente na tela. O pior defeito num app de saúde não é o que trava, é o que parece
ter funcionado e não funcionou. O paciente confia que o lembrete está agendado, e ele não está.

**Exemplos reais do projeto**

1. **Os cinco toques em adiar.** O banco só deixava adiar uma vez, e recusava a segunda tentativa.
   Mas recusava calado, e o código que chamava seguia em frente e agendava o lembrete de novo.
   Cinco toques em "Adiar" viravam cinco lembretes. A correção foi fazer o
   `incrementSnoozeCount` devolver se o adiamento foi gasto agora ou já tinha sido gasto, e quem
   chama passou a respeitar essa resposta (`src/domain/ports/dose-schedule-repository.ts`).
2. **O aviso de receita que não saía.** O paciente marcava "me avisar antes de a receita vencer"
   sem mexer na antecedência. O app gravava nulo e o planejador descartava a receita inteira. A
   tela confirmava uma intenção que o app não cumpria. A migration 018 separou as duas informações
   em colunas diferentes.
3. **A sincronização.** Ela nunca lança erro escondido. Sempre devolve quantas linhas enviou, quantas
   recebeu e a mensagem de erro, e a tela mostra isso. E o que não subiu continua contado como
   pendente.

**Resumo para falar.** Toda falha precisa aparecer para quem pode fazer algo com ela. O caso mais
claro foi o adiamento, que era recusado em silêncio no banco e virava lembretes repetidos.

### Por que as migrações só adicionam e nunca apagam? (RNF 04)

**O que é migração.** O banco SQLite fica no celular de quem usa o app. Quando sai uma versão nova
que precisa de uma coluna ou tabela nova, não dá para apagar o banco e criar de novo, porque o
histórico clínico do paciente está ali dentro. A migração é um script que leva o banco da versão
antiga para a nova, sem perder o que existe. O Mapill tem 21, em `src/data/local/migrations`.

**Como rodam** (`src/data/local/migrations/index.ts`)

1. O banco guarda o número da versão em que está, no `PRAGMA user_version`.
2. Ao abrir o app, ele roda em ordem só as migrações com número maior que esse.
3. Cada uma roda numa transação própria. Se falhar no meio, nada dela fica aplicado, e a versão
   não avança. Na próxima abertura ela tenta de novo. É a atomicidade do ACID.

**As três regras**

- **Só adiciona.** Nunca remove nem renomeia coluna. Apagar uma coluna apagaria o dado que está
  nela no celular de todo mundo, e não tem como desfazer.
- **Migração publicada não se edita.** Se uma estava errada, a correção vem numa migração nova.
  Editar uma antiga não teria efeito em quem já rodou, e os aparelhos ficariam com bancos
  diferentes.
- **Ao converter dado, preserva o conteúdo.** A migração 020 reescreveu as datas dos horários num
  formato só, e só nas linhas que precisavam, sem perder nenhuma.

**Exemplo de coluna substituída, e não apagada.** O contato de emergência começou como três
colunas soltas (nome, telefone e parentesco). Depois virou uma lista, na migração 005. As colunas
antigas não foram apagadas, ficaram sem uso. A sincronização sabe que elas existem e não as envia
(`COLUNAS_ORFAS`, em `src/data/remote/tabelas-sincronizaveis.ts`).

**O custo.** O banco carrega algumas colunas mortas. É o preço aceito para nunca arriscar o
histórico do paciente.

**Resumo para falar.** O banco mora no celular do paciente, com o histórico dentro. Por isso cada
migração só acrescenta, roda numa transação e nunca é editada depois de publicada. Uma coluna que
deixou de ser usada fica para trás, em vez de ser apagada.

### Exclusão lógica e exclusão física (RN 07 e 18)

| | Lógica | Física |
| --- | --- | --- |
| O que acontece | A linha ganha uma data em `deleted_at` e continua no banco | A linha é apagada de verdade, com `DELETE` |
| Quando | No dia a dia, ao excluir um remédio, um tratamento ou um compromisso | Só quando o titular pede para apagar todos os dados, pela LGPD |
| Some da tela? | Sim, todas as consultas filtram `deleted_at IS NULL` | Sim |
| Volta pela sincronização? | Não, porque a exclusão também sincroniza | Não, porque a nuvem é apagada primeiro |

**Por que a exclusão do dia a dia é lógica.** Por dois motivos.

1. **Preservar o histórico.** Se o paciente encerra um tratamento, as doses que ele já tomou
   continuam no relatório. Só os horários futuros são marcados como excluídos
   (`deleteUpcoming`, em `src/data/repositories/dose-schedule-repository.ts`).
2. **Avisar os outros aparelhos.** Uma linha apagada de verdade some sem deixar rastro, e na próxima
   sincronização o outro aparelho, que ainda tem a linha, a enviaria de volta. A linha marcada com
   `deleted_at` viaja como qualquer edição, e o outro aparelho também a esconde. Esse foi um dos
   ajustes dos testes, quando doses futuras excluídas voltavam a aparecer.

**Por que o pedido do titular é físico.** O direito de exclusão da LGPD exige que o dado saia. Uma
linha marcada como excluída ainda é dado pessoal guardado num servidor (`apagar-na-nuvem.ts`). A
ordem também importa. A nuvem é apagada antes do aparelho, senão a sincronização traria tudo de
volta. E as tabelas são apagadas de filho para pai, para nada ficar apontando para um registro que
já não existe.

**Resumo para falar.** No dia a dia a exclusão é lógica, para preservar o histórico e para a
exclusão chegar aos outros aparelhos. Quando o titular pede, ela é física, primeiro na nuvem e
depois no aparelho, porque a LGPD exige que o dado deixe de existir.

### Onde entra o SOLID?

SOLID são cinco princípios de projeto de código, reunidos pelo Martin (seção 2.6.1). O TCC destaca
dois, o S e o D, e são esses que o Mapill aplica com mais clareza.

| Letra | Princípio | Em uma frase | No Mapill |
| --- | --- | --- | --- |
| **S** | Responsabilidade única | Cada módulo tem um só motivo para mudar | Cada caso de uso faz uma coisa. `generate-dose-schedules.ts` só gera horários, `estimate-stock-depletion.ts` só prevê o fim do estoque. A regra de para qual tela um aviso leva ficou num arquivo próprio, separada de quem escuta o toque na notificação |
| **O** | Aberto e fechado | Dá para estender sem modificar o que já funciona | Trocar a biblioteca de alarme foi escrever outro adaptador, sem modificar as regras. As migrações seguem a mesma ideia, uma nova é acrescentada e as antigas não são editadas |
| **L** | Substituição de Liskov | Qualquer implementação de um contrato pode tomar o lugar de outra | Qualquer classe que cumpra a porta `NotificationGateway` pode substituir a atual, inclusive uma falsa para teste. Todos os repositórios herdam de `SqliteRepository` e cumprem o mesmo `Repository` |
| **I** | Segregação de interfaces | Contratos pequenos e específicos, em vez de um gigante | Há uma porta por assunto, `DoseScheduleRepository`, `InventoryRepository`, `AuthGateway`, e não uma interface única de banco com tudo |
| **D** | Inversão de dependência | A regra depende de abstrações, não de detalhes | As portas em `src/domain/ports`. O domínio declara o que precisa e a camada de dados cumpre |

**Resumo para falar.** O SOLID são cinco princípios para o código ser fácil de mudar. No Mapill, os
mais fortes são o S, porque cada regra clínica é uma função com uma só responsabilidade, o que
permite testar cada uma separada, e o D, porque o domínio só conhece interfaces, e é isso que
sustenta a Clean Architecture.

### De onde vêm as regras de posologia, formas farmacêuticas e frequências?

Conferido contra `TCC Gabriel Steffens Finalizado - 08_10.docx.pdf`.

O TCC declara o método na seção 3.1. Os requisitos vieram de levantamento bibliográfico e
documental, e foram classificados segundo Sommerville (2018), na seção 4.2. A seção 4.1 diz de onde
saíram as três exigências centrais, que são o referencial teórico e a análise dos concorrentes da
seção 3.2. A fundamentação se divide em quatro camadas.

**1. Por que a complexidade da posologia é o problema**

| Autor | Seção | O que sustenta |
| --- | --- | --- |
| WHO (2003) | 2.1.1 | A adesão é multidimensional, e conciliar várias posologias sobrecarrega o paciente. A falha raramente é negligência |
| Sweller (1988) | 2.1.2 | Memorizar várias posologias é carga cognitiva extrínseca, que deve ser eliminada |
| Risko e Gilbert (2016) | 2.3.2 | Desoneração cognitiva, passar para a ferramenta o cálculo dos intervalos e do estoque |
| Bates et al. (2003) | 2.3.2 | Delegar a complexidade logística e matemática a algoritmos reduz o desgaste |

**2. Por que o horário tem que ser exato**

Brunton e Knollmann (2024), o Goodman & Gilman, na seção 2.3. Manter o nível terapêutico depende
de respeitar o intervalo entre as doses, e fora dele a concentração no sangue oscila entre a
toxicidade e a ineficácia. É isso que justifica a frequência gerar os horários (RF 11), o alarme
tocar com o app fechado e a dose poder mudar de um horário para outro (RF 10).

**3. O que o mercado não cobre**

Medisafe (2026) e MyTherapy (2026), na seção 3.2 e no Quadro 2. Nenhum dos dois descreve suporte a
dose variável por horário, e nenhum detalha se o estoque desconta a dose real ou uma unidade fixa.
Daí os RF 10 e 18.

**4. De onde vêm as formas e as apresentações**

Da base pública da CMED, da Anvisa, com cerca de sete mil apresentações comerciais, na seção 4.6.2.
É dela que saem o nome, o princípio ativo e a dosagem preenchidos pelo código de barras.

**5. As regras da tela**

As regras de que os horários nascem vazios, de que a unidade só é perguntada quando é ambígua e de
que um campo que perdeu o sentido é limpo vêm da heurística de prevenção de erros de Nielsen
(1994), nas seções 2.4.1, 4.3.3 e 4.6.2, e na RN 08.

**O que dizer se a banca apertar.** A lista exata, com dez formas farmacêuticas (RF 07) e quatro
frequências (RF 09), não vem de um autor. Ela é modelagem própria, a partir da base da Anvisa e da
análise de tratamentos reais, como o de insulina. O referencial justifica **por que** a posologia
precisa ser representada com fidelidade, e não qual lista usar. Essa resposta é honesta e se
sustenta, porque o app não prescreve nada. Ele registra o que o médico prescreveu, então precisa
cobrir as formas que existem no mercado, e a CMED é o retrato oficial delas.

**Reforço que já está nas referências.** Osterberg e Blaschke (2005), citados no TCC só pelos
métodos de medir adesão, também mostram no mesmo artigo que a adesão cai conforme aumenta o número
de doses por dia. Antes de usar isso na fala, confira a página no artigo original.

**Atenção.** A CMED e a Anvisa aparecem no texto e na lista de siglas, mas não têm entrada própria
nas Referências. Se a banca notar, a resposta é que a base é usada como fonte de dados do app, e
não como referência teórica.

**Resumo para falar.** A necessidade de representar posologias complexas vem da WHO, que liga a
falha de adesão à complexidade do tratamento, e do Goodman & Gilman, que mostra que o intervalo
entre doses define o efeito do remédio. As formas e apresentações vêm da base oficial da Anvisa. A
lista de frequências é modelagem própria, feita para cobrir os tratamentos reais que os
concorrentes não cobrem, como a dose de insulina que muda ao longo do dia.

### Requisito funcional, não funcional e regra de negócio, o panorama completo

Conferido contra `TCC Gabriel Steffens Finalizado - 08_10.docx`, seções 2.5.2, 4.2 e 4.3, Quadros 3
a 10.

**O que é cada um**

| | Pergunta que responde | Sobre o quê | Exemplo do Mapill |
| --- | --- | --- | --- |
| Requisito funcional | O que o sistema faz? | Um serviço, uma ação, a reação a uma entrada do usuário | RF 17, confirmar ou pular cada dose |
| Requisito não funcional | Com que qualidade, ou sob que restrição? | O sistema como um todo, e não uma tela específica | RNF 01, nenhuma operação clínica depende de rede |
| Regra de negócio | Qual política o domínio obedece? | Como o mundo do tratamento funciona, independente do software | RN 02, o estoque desconta a dose, e não a unidade |

- **Funcional.** Para Sommerville (2018), é a declaração de um serviço que o sistema oferece, de como
  ele reage a uma entrada e de como se comporta numa situação. Dá para testar usando o app, e o teste
  responde sim ou não: a dose foi confirmada?
- **Não funcional.** É uma restrição sobre os serviços, e costuma valer para o sistema inteiro.
  Responde ao "como", e não ao "o quê". Ele se liga a um atributo de qualidade, e a ISO/IEC
  25010:2023, citada na seção 2.5.3, é o catálogo desses atributos (confiabilidade, segurança,
  usabilidade, manutenibilidade, desempenho, compatibilidade, portabilidade).
- **Regra de negócio.** É uma política ou uma restrição do domínio, que define ou limita como o
  negócio opera. Ela existe antes do software e continuaria valendo se o controle fosse feito num
  caderno. O requisito funcional muitas vezes é a regra virando função: a RN 02 diz "o estoque
  desconta a dose", e o RF 18 diz "o sistema deve descontar a quantidade da dose".

**Como decidir em qual caixa algo entra**

1. Dá para apontar uma tela ou um botão que faz isso? Se sim, é **funcional**.
2. É uma qualidade que vale para tudo, e que ninguém "usa" diretamente? Se sim, é **não funcional**.
3. Valeria num caderno de papel, e alguém que entende do tratamento poderia ter decidido diferente?
   Se sim, é **regra de negócio**.

Exemplo dos três juntos, no adiamento do alarme:
- RF 28, o adiamento deve ser permitido uma única vez por horário. É o comportamento.
- RN 12 e 13, adiar é permitido uma vez, e adiar não registra desfecho. É a política, com a
  justificativa de que adiar sem limite vira uma forma de ignorar.
- RNF 02, o lembrete funciona com o app fechado. É a qualidade que torna o adiamento confiável.

**Panorama do Mapill**

*44 requisitos funcionais, em seis categorias, na ordem do caminho do paciente*

| Quadro | Categoria | RF | O essencial |
| --- | --- | --- | --- |
| 3 | Identidade e consentimento | 01 a 06 | Uso sem conta, Google opcional, consentimento com data e versão, ficha de saúde |
| 4 | Cadastro clínico | 07 a 15 | 10 formas, 4 frequências, dose variável por horário, código de barras, base da Anvisa |
| 5 | Operação diária | 16 a 24 | Agenda do dia, confirmar ou pular, desconto da dose, correção retroativa, estoque |
| 6 | Lembretes | 25 a 33 | Aviso com app fechado, 3 modos, ações rápidas, adiar uma vez, aviso agrupado |
| 7 | Agenda clínica | 34 a 38 | Consultas e exames no mesmo calendário, desfecho, receita vencendo |
| 8 | Dados e direitos | 39 a 44 | Sincronização, LWW, taxa de adesão, exportar, apagar, revogar |

*9 requisitos não funcionais, e o atributo da ISO/IEC 25010 de cada um*

| RNF | Requisito | Atributo |
| --- | --- | --- |
| 01 | Offline-first, nenhuma operação clínica depende de rede | Confiabilidade (disponibilidade) |
| 02 | Lembrete com app fechado e após reinício | Confiabilidade |
| 03 | Isolamento por usuário em toda tabela da nuvem (RLS) | Segurança |
| 04 | Migrações sequenciais, versionadas, preservando histórico | Manutenibilidade e confiabilidade |
| 05 | Respeitar a escala de fonte do sistema | Usabilidade (acessibilidade) |
| 06 | Nenhuma credencial no repositório | Segurança |
| 07 | Nenhuma operação falha em silêncio | Confiabilidade e usabilidade |
| 08 | Temas visuais alternativos | Usabilidade (acessibilidade) |
| 09 | Domínio sem dependência de bibliotecas externas | Manutenibilidade |

*20 regras de negócio, em seis grupos (seções 4.3.1 a 4.3.6)*

| Grupo | RN | Ideia central |
| --- | --- | --- |
| Integridade do registro clínico | 01, 06, 07 | Silêncio não é desfecho, correção não sobrescreve, excluir preserva o passado |
| Controle de estoque | 02, 03, 04, 05 | Desconta a dose, recusa previsão sem unidade compatível, ajuste é evento, recontar não é repor |
| Modelagem da posologia | 08, 09, 10 | Horários nascem vazios, unidade decorre da forma, campo sem sentido é limpo |
| Notificações e lembretes | 11 a 16 | Um aviso por horário, adiar uma vez, adiar não é desfecho, reagendar tudo, texto honesto, compromisso não toca alarme |
| Sincronização | 17, 18 | Vence o registro inteiro mais recente, a exclusão do titular começa pela nuvem |
| Cálculo de adesão | 19, 20 | Dose futura não conta, sem dose vencida não há percentual |

**Onde o RF e a RN dizem a mesma coisa, e por que isso não é repetição**

| RF | RN | Assunto |
| --- | --- | --- |
| 15 | 07 | Excluir preserva o histórico |
| 18 | 02 | Descontar a dose, e não a unidade |
| 20 | 06 | Correção gera novo registro |
| 23 | 05 | Recontagem diferente de reposição |
| 28 | 12 | Adiar uma vez |
| 29 | 11 | Aviso agrupado |
| 30 | 14 | Alterar tratamento cancela os avisos |
| 40 | 17 | Last-Write-Wins |

Se a banca perguntar, o RF diz **o que o sistema deve fazer**, e a RN diz **qual política está por
trás e por quê**. O Quadro 10 tem a coluna de justificativa justamente para isso. Uma regra pode
gerar mais de um requisito, e um requisito pode existir sem regra nenhuma, como o RF 14, leitura de
código de barras, que é só uma facilidade.

**Pontos que a banca pode apertar, e como responder**

- **"Qual o seu autor para regra de negócio?"** A seção 2.5.2 tem regra de negócio no título, mas a
  definição com autor é só a de RF e RNF, de Sommerville. Sobre regra de negócio, o texto se apoia
  em Pressman e Maxim (2021), na seção 2.5.1, que ligam os dados de configuração e as estruturas de
  dados ao núcleo das regras. Resposta honesta: "Sommerville classifica os requisitos. As regras de
  negócio eu tratei como as políticas do domínio clínico que os requisitos operacionalizam, e cada
  uma tem a justificativa no Quadro 10."
- **"Não tem nenhum requisito de desempenho?"** Não tem, embora a 4.2 fale em "restrições de
  qualidade e desempenho". Resposta: o gargalo de um app de adesão não é velocidade, é
  confiabilidade. Como tudo roda local no SQLite, sem esperar rede, a resposta já é imediata, e por
  isso os RNF se concentraram em confiabilidade, segurança e usabilidade. O RNF 01 cobre isso
  indiretamente, porque nenhuma ação clínica espera a internet.
- **"Temas visuais não seriam funcional?"** (RNF 08) Oferecer a opção de tema é uma função, mas o
  motivo de existir é acessibilidade, contraste para quem enxerga pior. Por isso entrou como
  qualidade. As duas leituras são defensáveis, o importante é saber dizer o motivo.
- **"RN 14, 17 e 18 não são técnicas demais para regra de negócio?"** São as que menos passam no
  teste do caderno. A defesa é que cada uma é uma **escolha de política**, que poderia ter sido
  outra. A RN 17 decide qual versão vence num conflito, e daria para mesclar campos, mas o Mapill
  escolheu não mesclar para não criar um registro que ninguém escreveu. A RN 18 decide a ordem da
  exclusão para cumprir o direito do titular na LGPD. A RN 14 é a mais próxima de uma decisão de
  implementação, e a justificativa é clínica: nenhum alarme de tratamento encerrado pode continuar
  tocando.
- **"O RNF 02 foi cumprido?"** Com a ressalva da seção 5.3. Após reiniciar, o alarme só tocou depois
  do desbloqueio enquanto a restrição de inicialização automática do fabricante estava ativa. É uma
  limitação da plataforma, e o próprio TCC declara isso na conclusão.

**Resumo para falar.** O requisito funcional é o que o sistema faz, como confirmar uma dose. O não
funcional é com que qualidade ele faz, como funcionar sem internet, e cada um se liga a um atributo
da ISO 25010. A regra de negócio é a política do tratamento que está por trás, e que valeria até
num caderno, como descontar a dose real e não uma unidade. No Mapill são 44 funcionais, em seis
áreas que seguem o caminho do paciente, 9 não funcionais, focados em confiabilidade, segurança e
usabilidade, e 20 regras de negócio, em seis grupos, cada uma com a sua justificativa no Quadro 10.

### Como funciona o mobile por baixo: permissões e o alarme com a tela bloqueada

Conferido no código, em `app.json`, `src/notifications/permissoes-de-alarme.ts`,
`src/notifications/notifee-gateway.ts` e `plugins/`.

**A diferença em relação à web.** Na web, o código só roda enquanto a aba está aberta, e o navegador
quase não pede autorização. No celular, o app passa a maior parte do tempo **fechado**, e quem
decide se ele pode acordar, tocar som, aparecer na tela ou usar a bateria é o Android. Por isso o
centro do trabalho mobile não é escrever a função, é **convencer o sistema a deixar a função rodar
na hora certa**. O alarme do Mapill é exatamente esse problema.

**Os três tipos de permissão do Android**

| Tipo | Como é concedida | Exemplos no Mapill |
| --- | --- | --- |
| Normal | Basta declarar no manifesto, e o Android concede na instalação, sem perguntar | `WAKE_LOCK`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE` |
| Em tempo de execução | O app abre uma janela pedindo, e a pessoa aceita ou nega | `POST_NOTIFICATIONS` (Android 13+), câmera |
| Especial | Não tem janela. A pessoa precisa ir numa tela das configurações e ligar uma chave | Alarme exato ("Alarmes e lembretes"), sobrepor outros apps, acesso ao Não perturbe |

E existe uma quarta coisa que **nem é permissão do Android**: o início automático e a economia de
bateria que fabricantes como Xiaomi e Samsung acrescentam por conta própria. Elas não aparecem em
nenhuma API, e foi uma delas que causou a ressalva da seção 5.3.

**Onde se declara.** No projeto Expo, o manifesto do Android (`AndroidManifest.xml`) é **gerado** a
cada build. Por isso as permissões ficam na lista `android.permissions` do `app.json`, e o que
precisa de mais ajuste no manifesto fica nos config plugins da pasta `plugins/`. Mudou o
`app.json`, precisa de build nova. Recarregar o app não basta.

**Como saber qual permissão usar.** Não se chuta. O caminho é sempre o mesmo.

1. Começa pelo comportamento. "Quero que toque às 8h exatas, com o celular dormindo."
2. Descobre qual API do Android faz isso. Aqui, o `AlarmManager`.
3. A documentação dessa API diz o que ela exige. O alarme exato exige `SCHEDULE_EXACT_ALARM` ou
   `USE_EXACT_ALARM` a partir do Android 12.
4. A documentação da biblioteca (o notify-kit) diz o que ela já declara sozinha e o que fica por
   conta do app.
5. Testa no aparelho físico. O que faltou aparece como erro ou como comportamento errado, e volta
   para o passo 2.

O passo 5 foi o que mais ensinou no projeto. Três exemplos reais, registrados nos comentários dos
plugins:

- **02/09.** O alarme tocou, mas a tela cheia não apareceu. Faltava dizer no manifesto que a tela
  do alarme pode subir sobre o bloqueio (`showWhenLocked` e `turnScreenOn`).
- **05/09.** Agendou, reiniciou o celular, o horário passou e nada tocou. O Android apaga os alarmes
  no reboot, e os receptores que reagendam estavam declarados de um jeito que o Android 12+ ignora.
  O plugin `alarme-em-tela-cheia.js` corrige isso.
- **15/09.** Responder o alarme com o celular bloqueado deixava o app inteiro aberto, sem senha. A
  correção foi dar ao alarme uma tela própria (`AlarmeActivity`), e só ela tem licença de aparecer
  sobre o bloqueio.

**Cada permissão do `app.json` e para que serve**

| Permissão | Tipo | Para que |
| --- | --- | --- |
| `POST_NOTIFICATIONS` | tempo de execução | Mostrar qualquer aviso (Android 13+). Sem ela, nada aparece |
| `SCHEDULE_EXACT_ALARM` e `USE_EXACT_ALARM` | especial / normal | Tocar na hora exata, e não "por volta de". Duas porque cada versão do Android aceita uma |
| `USE_FULL_SCREEN_INTENT` | especial no Android 14+ | Abrir a tela do alarme por cima de tudo, como um despertador |
| `SYSTEM_ALERT_WINDOW` | especial | Abrir a tela do alarme quando a pessoa está usando outro app |
| `ACCESS_NOTIFICATION_POLICY` | especial | Tocar mesmo no modo Não perturbe |
| `WAKE_LOCK` e `DISABLE_KEYGUARD` | normal | Acender a tela e manter o aparelho acordado enquanto o alarme toca |
| `RECEIVE_BOOT_COMPLETED` | normal | Ser avisado quando o celular liga, para reagendar os alarmes |
| `FOREGROUND_SERVICE` e `..._MEDIA_PLAYBACK` | normal | Manter o som do alarme tocando em loop, sem depender da tela |
| `VIBRATE` | normal | Vibrar |

**O caminho do alarme, do cadastro até tocar com a tela bloqueada**

1. **Agendar.** Ao salvar o remédio, o app calcula os horários dos próximos sete dias e entrega cada
   um ao `AlarmManager` do Android, no modo `SET_ALARM_CLOCK` (`notifee-gateway.ts`). É o mesmo modo
   do despertador do relógio. Os outros modos podem ser adiados pelo Doze, a economia de energia do
   Android, e no teste o aviso só chegava quando a pessoa pegava o celular.
2. **O app pode fechar.** Quem guarda o horário agora é o sistema, e não o Mapill. Por isso o app
   pode estar fora dos recentes.
3. **Na hora.** O Android acorda o receptor da biblioteca, que publica a notificação num canal de
   importância alta, com som e com permissão de furar o Não perturbe (`canais-notifee.ts`).
4. **A tela.** A notificação leva um pedido de tela cheia, que abre a `AlarmeActivity`. Como ela é a
   única com `showWhenLocked` e `turnScreenOn`, a tela acende e o alarme aparece sobre o bloqueio.
   Com o celular em uso, o Android troca a tela cheia por um aviso no topo, com os botões de tomar e
   pular.
5. **O som.** Um serviço em primeiro plano, do tipo `mediaPlayback`, mantém o som em loop até a
   pessoa responder. O Android 14 exige que o tipo esteja no manifesto, e é outro ajuste do plugin.
6. **Depois de reiniciar.** O Android avisa `BOOT_COMPLETED`, e os receptores reagendam tudo.
   Além disso, toda vez que o app abre ou o paciente responde um aviso, os avisos são reconstruídos.

**Dá para garantir que o alarme vai tocar?** A resposta honesta é que **nenhum app garante 100%**,
nem o despertador do próprio celular, porque a pessoa pode revogar qualquer autorização. O que o
Mapill faz é reduzir o risco em quatro camadas.

1. **Declarar** tudo o que o alarme precisa, no `app.json` e nos plugins.
2. **Pedir** o que tem janela, na primeira execução.
3. **Conferir de novo** toda vez que o app volta para a frente. O `diagnosticarPermissoes` lê o
   estado real no sistema, e nunca de uma memória do app, porque a pessoa pode ter desligado algo
   enquanto o app estava fechado. O que falta aparece na tela inicial, e o toque leva direto à
   tela do Android onde se resolve, com a instrução do que ligar.
4. **Testar no aparelho físico**, nas quatro combinações de bloqueado ou em uso, com o app nos
   recentes ou fora deles, e depois de reiniciar (seção 5.3).

O limite que sobrou é o início automático do fabricante. O Android não deixa nenhum app ler se ele
está ligado, então o Mapill só consegue levar a pessoa até a tela e confiar que ela ligou. Por isso
o RNF 02 foi cumprido com ressalva.

**Sobre ter usado IA.** A insegurança é natural, mas o que a banca avalia não é quem digitou cada
linha, é se você entende as decisões. E as decisões do alarme não saíram prontas da IA. Elas saíram
de testar no aparelho, ver falhar, entender o motivo e corrigir, como nos três exemplos acima. Isso
é desenvolvimento mobile de verdade, porque o comportamento no Android só se confirma no celular.
Se perguntarem, a frase é: "A IA acelerou a escrita do código, mas cada comportamento do alarme foi
validado por mim no aparelho, e vários só funcionaram depois de eu entender por que o Android
estava bloqueando."

**Resumo para falar.** No celular, o app fica quase sempre fechado, e quem decide se ele pode tocar
é o Android. Por isso o alarme do Mapill não depende do app: o horário é entregue ao agendador do
sistema no modo de despertador, e na hora o sistema abre uma tela própria que tem licença de
aparecer sobre o bloqueio. As permissões foram escolhidas a partir do comportamento desejado, pela
documentação do Android, e confirmadas no aparelho. Como nenhuma autorização é garantida para
sempre, o app confere o estado real a cada abertura e mostra ao paciente o que falta.

### O que é o Expo, e como o JavaScript conversa com o Android?

**Primeiro, o React Native.** É o framework da Meta que deixa escrever o app em JavaScript ou
TypeScript, com componentes do React, e que desenha **telas nativas de verdade**. Um `<Text>` vira
um `TextView` do Android, e não uma página web dentro do app. O que ele não resolve sozinho é o
resto: compilar, configurar o projeto Android, e dar acesso a câmera, notificação, banco e arquivos.

**O Expo é um framework e um conjunto de ferramentas em cima do React Native.** Ele não substitui o
React Native, ele o completa. No Mapill, quatro partes dele foram usadas.

| Parte | O que faz | No Mapill |
| --- | --- | --- |
| SDK de módulos nativos | Bibliotecas prontas que já trazem o código Kotlin e Swift por baixo, com uma interface em JavaScript | `expo-sqlite`, `expo-camera`, `expo-notifications`, `expo-audio`, `expo-secure-store` |
| Prebuild e config plugins | Gera a pasta `android/` inteira a partir do `app.json`, e os plugins ajustam o manifesto sem editar o projeto nativo à mão | As permissões do `app.json` e os cinco plugins da pasta `plugins/` |
| Expo Router | A navegação baseada em arquivos, cada arquivo de `src/app` vira uma tela | As rotas do app |
| EAS Build | Compila o APK na nuvem, sem precisar do Android Studio configurado na máquina | O `eas.json` |

E ele também oferece o **Expo Modules API**, para escrever um módulo nativo próprio quando nenhuma
biblioteca resolve. Foi o caso do `modules/desbloqueio`, em Kotlin.

**Então dá para dizer que o Expo poupa configuração nativa?** Sim, e é um argumento correto, desde
que dito com a ressalva certa.

- **O que ele poupa.** Montar o projeto Android à mão, configurar o Gradle, ligar cada biblioteca
  nativa, escrever o acesso ao banco, à câmera e às notificações. Cada módulo do SDK tem a
  documentação por versão, com as opções, as permissões que exige e o que precisa ir no `app.json`.
  É por isso que o TCC diz, na seção 2.7.3, que o esforço pôde se concentrar nas regras de negócio.
- **O que ele não poupa.** O comportamento que nenhuma biblioteca previu. O alarme sobre a tela de
  bloqueio exigiu cinco config plugins e um módulo em Kotlin, porque nem o Expo nem a biblioteca de
  notificação expõem o bloqueio de tela. A diferença é que, com o Expo, essa configuração ficou
  **versionada em plugins**, e é refeita igual a cada build, em vez de ser uma edição manual que se
  perde.

Frase para a banca: "O Expo cuidou da configuração nativa padrão, e onde o app precisou de algo que
nenhuma biblioteca oferecia, como o alarme sobre a tela de bloqueio, o próprio Expo deu o caminho
oficial para estender, com config plugins e um módulo nativo em Kotlin."

**Como o JavaScript chega no Android? É uma requisição?**

Não é uma requisição de rede. É uma **chamada de função entre duas linguagens, dentro do mesmo
processo**, no próprio celular. O JavaScript chama uma função, e por baixo ela executa um código
Kotlin, que chama a API do Android. Mas a forma de usar lembra uma requisição, e a comparação ajuda.

| | Requisição web | Chamada a módulo nativo |
| --- | --- | --- |
| Onde roda | Em outro computador, pela internet | No mesmo celular, no mesmo app |
| Como chama | `fetch(url)` | `modulo.estaBloqueado()` |
| O que volta | Uma `Promise` com a resposta | Uma `Promise` com o resultado |
| Pode falhar? | Sim, sem rede ou com erro do servidor | Sim, sem permissão ou sem o módulo na build |
| Contrato | A API do servidor | As funções que o módulo declara |

Na nova arquitetura do React Native, essa ponte se chama **JSI**. O JavaScript segura uma referência
direta ao objeto nativo, sem converter tudo em texto como a ponte antiga fazia.

**Exemplo real, do próprio Mapill.** A tela do alarme precisa saber se o celular está bloqueado.

```
JavaScript   modules/desbloqueio/src/index.ts     modulo.estaBloqueado()
     ↓  JSI, chamada de função
Kotlin       DesbloqueioModule.kt                 AsyncFunction("estaBloqueado")
     ↓  API do Android
Android      KeyguardManager.isKeyguardLocked     → true ou false
     ↑  volta como Promise<boolean>
```

O Kotlin declara a função com `AsyncFunction("estaBloqueado")`, pergunta ao `KeyguardManager` do
Android e devolve o resultado. O TypeScript recebe uma `Promise<boolean>`, exatamente como receberia
a resposta de um `fetch`.

**E mostrar uma notificação?** O mesmo princípio, em três passos.

1. O JavaScript chama `notifee.displayNotification({ title, body, android: { channelId } })`.
2. O módulo nativo da biblioteca monta a notificação em Kotlin e chama o `NotificationManager`, que
   é o serviço do Android responsável por todas as notificações do aparelho.
3. O Android desenha a notificação na barra. A `Promise` resolve dizendo que deu certo, ou falha se
   não houver permissão.

**O caminho de volta, do Android para o JavaScript.** Aqui está a diferença para a web. Além de o
app perguntar, o **Android também chama o app**, por eventos. Quando a pessoa toca em "Tomei" na
notificação, o Android avisa a biblioteca, e ela dispara um evento que o JavaScript escuta
(`src/notifications/escutar-avisos.ts`). Funciona como um `addEventListener` do navegador.

**E o alarme agendado, com o app fechado?** É o caso mais diferente da web. O app entrega o horário
ao `AlarmManager` e pode ser fechado. Na hora, **o próprio Android acorda o app**, mandando uma
mensagem interna chamada **Intent**, que é o sistema de mensagens entre componentes do Android. Um
receptor da biblioteca recebe essa Intent e publica a notificação. Se for comparar com a web, é
mais parecido com um **webhook** do que com uma requisição: não é o app que pergunta, é o sistema
que chama o app quando chega a hora.

**Resumo para falar.** O React Native permite escrever o app em TypeScript com telas nativas, e o
Expo completa com módulos prontos, geração do projeto Android e build na nuvem. O código em
TypeScript acessa o Android chamando funções de módulos nativos, que respondem com uma `Promise`,
parecido com uma requisição, só que local. E no caminho contrário o Android chama o app por eventos
e Intents, que é o que faz o alarme tocar mesmo com o app fechado.

### Se o Expo é um framework, como o RNF 09 se sustenta?

**A pergunta da banca.** "O seu requisito diz independência de frameworks, mas o app inteiro é feito
com Expo e React Native. Isso não é contraditório?"

**A resposta curta.** Não, porque o RNF 09 não diz que o **app** não usa framework. Ele diz que a
**camada de domínio** não pode depender de bibliotecas externas. O framework existe, mas fica nas
bordas, e o centro não sabe que ele existe.

**O que a Clean Architecture pede de verdade.** O Martin não proíbe frameworks. Ele diz que o
framework é um **detalhe**, uma ferramenta, e que o sistema não deve "se casar" com ele. A regra de
dependência deixa o framework entrar, desde que fique nos círculos de fora e que a dependência
aponte sempre para dentro. Um app sem nenhum framework seria impossível no celular, porque alguém
precisa desenhar a tela e falar com o Android.

**Onde cada coisa mora no Mapill**

| Camada | Usa framework? | Exemplo |
| --- | --- | --- |
| Domínio, `src/domain` | **Não.** Só TypeScript puro | Gerar horários, prever o estoque, calcular a adesão |
| Dados, `src/data` e `src/notifications` | Sim | `expo-sqlite`, Supabase, notify-kit |
| Apresentação, `src/app`, `src/telas`, `src/hooks` | Sim | React Native, Expo Router |

Conferido no código: nenhum arquivo de `src/domain` importa algo de fora do próprio domínio,
enquanto 62 arquivos das camadas de fora importam Expo ou React. É a regra de dependência medida.

**Por que a independência vale a pena, se o app usa Expo de qualquer jeito.** Porque framework e
biblioteca mudam, e a regra clínica não deveria mudar junto.

- **Já aconteceu.** O Notifee foi arquivado no meio do projeto e trocado pelo notify-kit. Mudou um
  arquivo da camada de fora, e nenhuma regra de horário, adiamento ou agrupamento foi tocada.
- **Testar sem celular.** Como o domínio não depende de nada, as regras rodam no computador, nas
  rotinas `scripts/conferir-*.mjs`, sem emulador.
- **Se um dia trocar o Expo.** O que se reescreve são as telas, o acesso ao banco e o alarme. As
  regras clínicas, que são o valor do sistema, são aproveitadas inteiras, e poderiam rodar até num
  servidor ou numa versão web.

**Uma distinção que ajuda.** TypeScript é a **linguagem**, e não um framework. O domínio depende da
linguagem, como qualquer código depende da sua. O que ele não pode é depender de algo que alguém de
fora pode arquivar, mudar ou abandonar, como o Expo, o React ou o notify-kit.

**Resumo para falar.** O RNF 09 vale para o domínio, e não para o app inteiro. A Clean Architecture
não proíbe frameworks, ela os coloca nas bordas. O Expo e o React Native estão nas camadas de dados
e de apresentação, e o domínio, onde ficam as regras clínicas, é TypeScript puro, sem nenhum import
de fora. A prova é que a biblioteca de alarme foi trocada sem tocar em nenhuma regra.

### Quando a sincronização acontece?

Conferido em `src/hooks/use-sync.ts`, `src/data/remote/sync-service.ts` e nos hooks que a chamam.

**Não existe timer, e não sincroniza ao trocar de aba.** A sincronização roda em momentos
escolhidos, e cada passada faz sempre o ciclo completo: primeiro envia tudo o que está pendente,
depois baixa tudo o que chegou à nuvem, comparando as datas como explicado nas seções anteriores.

| Gatilho | Onde está | Espera a rede? |
| --- | --- | --- |
| O app abre | `useSync`, montado em `src/app/_layout.tsx` | Não |
| O app volta para a frente, vindo do segundo plano | `useSync`, pelo `AppState` mudando para `active` | Não |
| O paciente confirma ou pula uma dose | `subirDesfecho`, em `use-today-doses.ts` | Não |
| Cadastra, edita ou exclui um remédio | `use-medication-registration.ts` | Não |
| Edita a ficha de saúde | `use-patient-profile.ts` | Não |
| Entra com o Google, ou reinstala com a sessão ainda válida | `use-first-run-gate.ts` | **Sim**, para restaurar os dados antes de pedir a ficha de novo |
| Toca em sincronizar, na tela de Conta | `ContaScreen.tsx` | Mostra o andamento |

**"Não espera a rede"** quer dizer que a tela não fica esperando. O dado já foi gravado no SQLite, e
é ele que vale. A sincronização roda por trás, e se falhar por falta de internet a linha continua
pendente e sobe na próxima passada.

**Por que esses momentos, e não um timer.** O comentário do `useSync` explica. Voltar ao app é
quando a conexão costuma estar de volta e quando a pessoa vai olhar a tela. Um timer de 15 minutos
gastaria bateria para descobrir que nada mudou, num celular que passa o dia no bolso.

**Por que alguns dados sobem na hora.** São os que mais custam se ficarem só no aparelho.

- **A dose confirmada ou pulada.** É o histórico que o médico lê. Antes, só subia quando a pessoa
  abria a tela de Conta, e quem confirma dose todo dia nunca tinha motivo para abrir ali.
- **A exclusão de remédio.** Enquanto ela não sobe, a nuvem ainda tem o remédio vivo, e um
  recebimento poderia trazê-lo de volta, com os alarmes junto.
- **A ficha de saúde.** Quem edita costuma continuar no app, então esperar a próxima volta ao
  primeiro plano poderia levar horas.

**Proteções de cada passada**

- **Sem conta vinculada**, a função volta na hora, sem erro. É o modo padrão do app.
- **Duas passadas ao mesmo tempo não acontecem.** Se o paciente confirma uma dose enquanto outra
  passada roda, a segunda recebe o resultado da primeira (`emAndamento`).
- **Se algo desceu**, os alarmes são reagendados, porque o Android do aparelho novo não conhece os
  alarmes do antigo.

**O que vale saber, caso a banca aperte.**

- Com o app **fechado**, não sincroniza. Não há sincronização em segundo plano. O que foi feito
  offline sobe na próxima abertura.
- **Não sincroniza ao voltar a internet** enquanto o app está aberto, porque não há um ouvinte de
  conexão. Sobe na próxima ação que dispara a passada ou na próxima volta ao app.
- Compromissos e ajustes de estoque feitos à mão não disparam a passada na hora. Eles sobem na
  próxima passada, que pode vir da próxima dose confirmada ou da próxima abertura. Como cada passada
  envia **tudo** o que está pendente, nada se perde, só chega um pouco depois.

**Resumo para falar.** A sincronização não roda em intervalo fixo. Ela acontece quando o app abre,
quando volta para a frente, e logo depois das ações que mais importam, como confirmar uma dose ou
excluir um remédio. Nenhuma delas trava a tela, porque o dado já está no aparelho. Cada passada
envia tudo o que está pendente e depois baixa o que chegou, então qualquer coisa que ficou para trás
sobe na próxima.

### O estoque mudou em outro aparelho. O aviso de estoque se ajusta?

Conferido em `src/notifications/reagendar-avisos.ts`,
`src/domain/use-cases/planejar-avisos-de-estoque.ts`, `src/data/remote/sync-service.ts` e
`src/hooks/use-inventory-list.ts`.

**O cenário.** No aparelho A, o estoque dura até o dia 18, com aviso pedido para 15 dias antes. No
aparelho B, com a mesma conta, a pessoa reconta o estoque de 10 para 5 unidades, e agora ele dura
só até o dia 13.

**O que acontece, passo a passo**

1. **No B.** A recontagem grava o ajuste e o novo saldo no SQLite, com um `updated_at` novo. Ela não
   dispara a sincronização na hora (é um dos casos da seção anterior), então sobe na próxima
   passada do B, quando ele volta ao primeiro plano ou confirma uma dose.
2. **Na nuvem.** O saldo 5 chega com `updated_at` mais novo, e o servidor aceita.
3. **No A.** Na próxima passada do A, o recebimento traz o item de estoque com o saldo 5. Como o
   `updated_at` remoto é mais novo, ele substitui o local inteiro.
4. **Reagendamento.** Como algo desceu, a sincronização chama `reagendarTodosOsAvisos`. Ele cancela
   todos os avisos e recalcula tudo a partir do banco, inclusive a previsão de estoque, com o saldo
   novo. A previsão passa a dizer dia 13, e os avisos de estoque são refeitos a partir dessa data.

Ou seja, **não fica um aviso velho apontando para o dia 18**. É a RN 14: qualquer mudança refaz
tudo, e o dado novo vem da sincronização. O cartão da tela inicial também mostra a data nova assim
que o saldo desce, porque ele lê o banco toda vez que a tela aparece.

**Os detalhes que valem saber**

- **O aviso "está acabando" pode não ser enviado.** O app marca esse aviso para o dia em que a
  previsão entra na antecedência pedida, que aqui seria dia 13 menos 15 dias. Se esse dia já
  passou, o que acontece justamente quando o estoque cai de uma vez, o aviso é descartado por estar
  no passado. Sobram o cartão da tela inicial, que mostra o estoque baixo, e o aviso "acaba hoje",
  no último dia. Isso vale também num aparelho só, sempre que uma recontagem ou uma antecedência
  maior que o estoque restante põe a previsão dentro da janela de uma vez. É uma limitação real, e a
  correção seria agendar o aviso para logo em seguida quando a data de entrada já tiver passado.
- **O aviso "acaba hoje" só é agendado na última semana.** Os avisos são agendados para os próximos
  sete dias e renovados a cada abertura do app ou resposta a um aviso. Um fim de estoque a doze dias
  entra no agendamento quando estiver a sete.
- **Se já avisou, não avisa de novo por uma queda.** O app guarda a quantidade do momento em que
  avisou, e só volta a avisar depois que o estoque **subir**, por reposição. Consumir mais ou
  recontar para baixo é a mesma queda já avisada. Isso evita um aviso novo a cada dose confirmada.
- **Os dois aparelhos sem conexão.** Se o A também descontou doses offline, vale a limitação da
  seção 4.3.2: vence o saldo inteiro do aparelho que editou por último, e um dos descontos some da
  conta.

**Resumo para falar.** Quando o estoque muda em outro aparelho, o saldo novo desce na próxima
sincronização, e como algo desceu, o app cancela e refaz todos os avisos a partir do banco. A
previsão é recalculada com o saldo novo, então o aviso não fica preso à data antiga. A ressalva é
que, se a queda já põe o estoque dentro da antecedência pedida, o aviso "está acabando" não sai, e
o paciente fica com o cartão da tela inicial e o aviso do último dia.

---

## Treino em casa: só as perguntas

Responda em voz alta, sem olhar, e depois confira na seção correspondente acima.

**Problema, escopo e validação**
- A fala de que a descontinuidade do tratamento é um desafio de saúde pública reconhecido pela OMS se sustenta? De onde vem?
- Por que o app não verifica interação medicamentosa nem sugere dose?
- Por que não testou com usuários?
- A taxa de adesão do app é confiável?
- Na tela de adesão aparece "sem resposta". Qual a diferença para pulada?
- De onde vêm as regras de posologia, as formas farmacêuticas e as frequências?
- Como funciona o catálogo de medicamentos?
- Como a IA foi usada no projeto?

**Requisitos e regras de negócio**
- Qual a diferença entre requisito funcional, não funcional e regra de negócio?
- Como você decide se algo é RF, RNF ou regra de negócio?
- Quantos requisitos e regras são, e como estão organizados?
- Por que o RF e a RN às vezes dizem a mesma coisa? Isso não é repetição?
- Qual o seu autor para regra de negócio?
- Não tem nenhum requisito de desempenho?
- Temas visuais não seriam um requisito funcional?
- As RN 14, 17 e 18 não são técnicas demais para serem regra de negócio?
- O RNF 02 foi cumprido?
- Por que o adiamento só é permitido uma vez?
- Por que um aviso por horário, e não um por remédio?
- Por que qualquer edição apaga e refaz todos os avisos?
- Por que compromisso não toca alarme?
- Por que os horários nascem vazios no cadastro?
- Por que o app recusa a previsão de estoque em vez de estimar?
- O que quer dizer que nenhuma operação pode falhar em silêncio?

**Arquitetura e código**
- O que caracteriza uma Clean Architecture, além de separar em pastas?
- Explique a Clean Architecture do Mapill em 30 segundos.
- O TCC fala em três camadas, e o Martin em quatro círculos. Como fica?
- O seu requisito diz independência de frameworks, mas o app é feito com Expo. Isso não é contraditório?
- O que é o SOLID, e onde ele aparece no código?
- Se trocasse o SQLite por outro banco, o que mudaria?
- A tela acessa o banco direto?
- O Mapill é 100% Clean Architecture?
- Por que sem ORM, sem Tailwind e sem gerenciador de estado global?
- O que é um gerenciador de estado global? Dê um exemplo.
- Por que Supabase, e não um ORM?
- Tem testes automatizados?
- Teste automatizado é a mesma coisa que CI/CD?

**Mobile, Expo e alarme**
- Por que React Native, e não Kotlin nativo?
- O React Native se justifica pensando numa versão para iPhone? O que teria de ser refeito?
- O que é o Expo, e o que ele poupou no projeto?
- Como o JavaScript conversa com o Android? É uma requisição?
- Como uma notificação é mostrada, do código até a tela?
- Quais são os tipos de permissão do Android, e como você soube quais usar?
- Como o alarme toca com o app fechado?
- Como o alarme aparece com a tela bloqueada?
- Dá para garantir que o alarme vai tocar?
- Por que trocaram de biblioteca de alarme?
- O alarme falhou depois de reiniciar. Isso não compromete o objetivo?

**Dados e sincronização**
- Qual é o modelo de dados?
- Existe um campo em cada registro só para o Last-Write-Wins? Quais são as colunas de controle?
- Quais colunas aprovam ou recusam algo, e quais só organizam a fila?
- Por que existem duas datas, `updated_at` e `server_updated_at`?
- Explique a fila de envio e a fila de recebimento.
- Quando a sincronização acontece?
- Em que casos algo não sincroniza ou é recusado?
- Por que Last-Write-Wins, e não mesclar os campos?
- E se o relógio do celular estiver errado?
- Há alguma situação em que o LWW perde informação? Por que o estoque pode perder um desconto?
- O estoque mudou em outro aparelho. O aviso de estoque se ajusta?
- Por que as migrações só adicionam e nunca apagam?
- Exclusão lógica e física: qual a diferença, e quando cada uma é usada?
- As fotos e receitas sincronizam?

**Segurança e LGPD**
- Como fica a LGPD?
- Como funcionam o RLS e o JWT?
- Por que a chave do Supabase pode ficar dentro do app?
- Os dados têm criptografia?
- Como o Google valida o usuário? Ele compara o e-mail?
- A segurança por RLS foi testada?
