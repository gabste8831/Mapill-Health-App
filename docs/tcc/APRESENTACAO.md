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
