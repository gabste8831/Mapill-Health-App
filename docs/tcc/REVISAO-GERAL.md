# TCC: o que falta (guia único)

> **Conferido em 30/09, 17:45**, contra `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` (89
> páginas). **O texto está fechado:** todas as trocas de conteúdo entraram, inclusive as do resumo,
> do abstract e os cinco pontos rápidos do corpo. Formatação, referências, siglas, pré-textuais,
> numeração a partir da Introdução e alíneas da 6.1 estão certos. O histórico das revisões fica no
> git.
>
> **Falta:** 1 (figuras) → 2 (página em branco) → 3 (números de página, por último) → exportar PDF
> → 7 (conferência). O 5 fica para o dia da defesa, e o 6 é aprofundamento opcional.

---

## 1. Figuras 8, 10, 11 e 12

As quatro ainda usam a **mesma imagem de reserva** (a tela inicial repetida). Cada figura leva
**três capturas lado a lado**, na mesma altura e com espaçamento igual, do mesmo aparelho, com a
barra de status limpa e sem moldura de celular. Os dados são os da base de demonstração do
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md): o mesmo paciente fictício e os mesmos
medicamentos em todas as figuras. Manter o tamanho da imagem de reserva, para título, imagem e
fonte continuarem na mesma página.

### Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.73)

1. **Tela do alarme sobre a tela de bloqueio.**
2. **Notificação com os botões de ação**, Tomei e Pulei. No código, só a notificação comum tem
   botões, e o Adiar existe apenas na tela cheia do alarme. Para este print, usar um medicamento com
   o lembrete no modo **notificação**, e não alarme.
3. **Tela do alarme depois do adiamento, com dois medicamentos.** Mostra o agrupamento das doses do
   mesmo horário em um único aviso (4.2.1) e, sem o botão Adiar, que o adiamento é oferecido uma
   vez só. Conferir que o Adiar de fato não aparece.

### Figura 10 - Relatório clínico gerado em formato PDF (p.76)

1. **Print do PDF gerado a partir da tela de adesão.** Um print só serve, desde que o texto fique
   legível no tamanho da figura. Se o relatório tiver mais de uma página, duas páginas lado a lado
   leem melhor do que uma imagem reduzida. Usar um período com algumas faltas, para a seção de
   doses não tomadas não aparecer vazia.

### Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema (p.78)

O conjunto troca três cores no app inteiro: afirmativo (azul: dose tomada, estoque em dia),
negativo (laranja: dose atrasada, estoque zerado) e atenção (marrom: estoque acabando, receita
vencendo).

1. **Configurações de tema** com "Azul, marrom e laranja" marcado.
2. **Home** com esse conjunto aplicado (dose confirmada e dose atrasada à vista).
3. **Tela de estoque ou lista de medicamentos com um item acabando**, mostrando o aviso de
   reposição em marrom, a terceira cor, que a Home quase não mostra. Deixar um medicamento da base
   de demonstração abaixo do limite de aviso. Alternativa mais simples: tela de adesão ou
   calendário nas cores novas.

### Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste (p.79)

1. **Home no tema padrão.**
2. **Home no tema escuro.**
3. **Home no tema de alto contraste.**

Mesmos dados, mesmo dia e mesma rolagem nos três. Só o tema muda. Voltar o conjunto de cores para
o padrão antes, para não misturar com a Figura 11.

## 2. Página em branco (p.60)

A página em branco do fim saiu, mas apareceu outra na **p.60**, logo depois do primeiro parágrafo da
4.5 ("...os Quadros 16 a 24 contemplam o esquema completo do modelo de dados."). A Figura 2 não coube
no resto da p.59, desceu e deixou a p.60 vazia. Apagar a linha vazia entre esse parágrafo e o título
"Figura 2 - Diagrama entidade-relacionamento...". Se ainda assim sobrar uma página vazia, reduzir um
pouco a altura da Figura 2.

## 3. Números de página

As trocas de conteúdo empurraram tudo **uma página** a partir do capítulo 4. Depois de apagar a
página em branco do item 2, a regra é simples:

- **Sumário:** de "4. DESENVOLVIMENTO" até "6.1 TRABALHOS FUTUROS", somar 1 a cada número.
  REFERÊNCIAS já está com **86**, que fica certo depois do item 2.
- **Lista de quadros:** do Quadro 2 ao Quadro 28, somar 1.
- **Lista de figuras:** da Figura 1 à Figura 12, somar 1.

Até a 3.2 e o Quadro 1, nada muda. Fazer isto por último, depois das figuras, e exportar o PDF para
eu conferir.

## 4. Opcional

- **Quadro 26 (p.74).** A primeira linha do código (o comentário) está em Courier 9, e as demais em 10.
- **Objetivos com marcador (p.17).** A 6.1 usa alíneas, e os objetivos, marcadores. As duas formas
  são aceitas. A linha "Implementar a aplicação móvel..." parece esticada, mas é só a justificação de
  uma linha com palavras longas, e não há o que corrigir.

## 5. Folha de aprovação (p.3), no dia da defesa

- Data: hoje está "Rio do Sul, 30 de setembro de 2026.". Trocar pela data da defesa.
- Nomes dos dois professores da banca, depois de "Prof.".

---

## 6. Aprofundamento (opcional)

Pontos que a revisão crítica, feita com o prompt do orientador, apontou como frágeis. Não
contradizem o app e não impedem a entrega. Eu escrevo o texto novo de cada um quando quiser atacar.

### 6.1 Referencial teórico (capítulo 2)

- **Adesão multidimensional (p.19 e 20).** A WHO (2003) descreve cinco dimensões da não adesão (socioeconômica,
  sistema de saúde, condição, terapia e paciente), e o trabalho ataca o esquecimento e a logística
  sem delimitar isso. "Raramente é negligência intencional" não tem fonte.
  *Pergunta:* em qual das cinco dimensões o Mapill atua, e o que fica fora do alcance dele?
- **Eficácia de lembretes (p.16 e 19).** Nenhuma fonte mostra que aplicativos ou lembretes melhoram a
  adesão, que é a premissa do trabalho.
  *Pergunta:* qual revisão sistemática sustenta o efeito de lembretes digitais, e de que tamanho é?
- **Sweller (p.20).** O artigo de 1988 trata de aprendizagem e resolução de problemas, e o texto
  atribui a ele o "sucesso do indivíduo" em geral.
  *Pergunta:* a carga cognitiva entra como analogia ou como resultado do autor?
- **Bates et al. (p.23).** O artigo trata de apoio à decisão clínica para médicos, e não de pacientes.
  "Reduz drasticamente as taxas de omissão" e "fadiga de tratamento" estão sem fonte.
- **Brunton e Knollmann (p.22).** O argumento de precisão de horário vale para medicamentos de índice
  terapêutico estreito, e o texto generaliza para todos.
- **Comportamento do paciente sem evidência (p.18 e 21).** Bilhetes, grupos de mensagem e o público
  "majoritariamente idoso" aparecem sem dado ou fonte.
- **SSoT e réplicas (p.22 e 36).** O Mapill se diz fonte única da verdade e, ao mesmo tempo, mantém
  cópias com consistência eventual.
  *Pergunta:* em que sentido o aparelho é a fonte única, e em que sentido o sistema é replicado?
- **Offline-first e alarme (p.33 e 34).** Notificação local não depende de rede em nenhuma
  arquitetura. O 2.8.1 repete o 2.8.
- **LGPD (p.37).** O art. 11 admite hipóteses de tratamento de dado sensível sem consentimento, e o
  texto dá a entender que o consentimento é sempre exigido.
- **SRP e TypeScript (p.31 e 32).** O SRP é apresentado como isolamento de falhas em execução, e o
  TypeScript como algo que impede falhas lógicas. Os dois mecanismos estão descritos além do que
  fazem.
- **ISO/IEC 25010:2023 (p.28 e 30).** Conferir se as definições de confiabilidade e acessibilidade são
  as da versão de 2023.
- **Gamificação (p.27).** Efeitos e "motivação intrínseca" sem fonte.

### 6.2 Metodologia e desenvolvimento (capítulos 3 e 4)

- **Quadro 2 sem fonte nas referências (p.40 a 42).** As páginas oficiais do Medisafe e do MyTherapy
  não estão na lista, e "não menciona" virou "Não".
  *Pergunta:* com que data e versão cada concorrente foi consultado?
- **Mercado genérico (p.43).** "Falhas recorrentes" e "lembrete só com o app aberto" não têm fonte.
- **RNF 07 (p.48).** "Nenhuma operação pode falhar em silêncio", mas o servidor recusa em silêncio a
  versão mais antiga no envio (o LWW). Vale uma frase dizendo que essa recusa é intencional.
- **"Decisões negativas" (p.54).** Tailwind e ORM são das camadas de apresentação e de dados, então não
  afetam o domínio como o texto conclui.
- **Notifee (p.57).** O defeito no Android 12 não tem fonte.
- **Gamificação muda de objetivo.** Na 3.1 ela estimula a adesão; na 4.6.5, reforça o registro,
  inclusive de dose pulada.
- **Decisões de UX sem trade-off.** Intervalo "semestral" entre consultas sem fonte, e a confirmação
  pela tela de bloqueio é uma exceção consciente à prevenção de erros que o texto não assume.
- **Estilo.** A mesma regra reaparece como requisito, regra de negócio e jornada, e os absolutos
  ("nunca", "garante") ainda aparecem com frequência.

### 6.3 Resultados e conclusão (capítulos 5 e 6)

- **"Aprovado, com os ajustes" (Quadro 28).** Só o resultado final foi registrado, e a 5.2 lista as
  correções sem o sintoma de cada uma.
  *Pergunta:* o que deu errado na primeira execução de cada cenário?
- **Só o conflito é narrado (5.1).** Os demais cenários aparecem apenas no Quadro 28, sem dizer como
  "todos os dados" foi conferido na restauração.
- **O conflito "confirma o critério" (5.1).** Uma execução ilustra o critério, não o confirma.
- **Seção 5.4 como índice.** Estoque, cronograma e compromissos não passaram por teste relatado, e a
  seção diz onde cada objetivo está descrito, e não como foi verificado.
- **Pergunta de pesquisa (6).** Usabilidade e segurança não foram avaliadas. A segurança por RLS não
  aparece em nenhum cenário.
- **Decisões que "distinguem a proposta" (6).** Parte delas se apoia na ausência de menção nos
  concorrentes.
- **Trabalhos futuros (6.1).** Faltam as frentes técnicas que saem das limitações: dois aparelhos
  reais com relógios próprios, testes automatizados e verificação de segurança. O item b) não decorre
  de nenhuma limitação.

---

## 7. Conferência final

Depois dos itens 1 a 3, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro as trocas, as figuras e os números de página.
