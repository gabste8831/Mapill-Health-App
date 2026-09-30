# Revisão geral do TCC: o que falta

> **Atualizado em 30/09**, com o retorno do orientador (29/09 à noite), conferido contra
> `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` das 13:37 (88 páginas).
> Este é o guia completo: tudo o que ainda falta no documento, por menor que seja. O que já foi
> resolvido saiu daqui (fica no histórico do git).
>
> **Já conferido e certo:** sumário e listas (121 entradas), remissões, chamadas de quadros e
> figuras, citações contra referências, siglas, itálico, tempo verbal, resumo, abstract,
> referências, e na folha de aprovação o hífen de "Itajaí - UNIDAVI" e o título sem ponto final.
> No capítulo 4, todos os quadros e figuras já têm título, corpo e fonte na mesma página.

Ordem sugerida: 1 → 2 → 3 → 4 → 5 → 6 → exportar PDF → 8.

---

## 1. Metodologia: trocar a ordem de 3.1 e 3.2 (pedido do orientador)

**PROCEDIMENTOS METODOLÓGICOS passa a ser a 3.1** e **ESTADO DA ARTE E TRABALHOS RELACIONADOS
passa a ser a 3.2**.

1. Recortar o título "3.2 PROCEDIMENTOS METODOLÓGICOS" com os quatro parágrafos dele (de "Quanto aos
   procedimentos metodológicos..." até "...diante das condições de uso previstas.").
2. Colar logo depois da introdução do capítulo 3, isto é, depois do parágrafo que termina em
   "...voltados ao contexto do cuidado com a saúde." e antes de "3.1 ESTADO DA ARTE".
3. Renumerar os dois títulos: "3.1 PROCEDIMENTOS METODOLÓGICOS" e "3.2 ESTADO DA ARTE E TRABALHOS
   RELACIONADOS".
4. **Duas remissões mudam**, porque apontam para os procedimentos:
   - 5 (abertura de Resultados): "validação técnica descrita na seção 3.2" → "**seção 3.1**".
   - 5.3: "A seção 3.2 estabelece que os alertas..." → "A **seção 3.1** estabelece...".
5. No sumário, trocar a ordem e os números das duas linhas (páginas no item 8).

O Quadro 2 continua sendo o Quadro 2, porque nenhum quadro vem antes dele na 3.1 nova.

## 2. Quadro 2: só Sim ou Não, e o texto que explica (pedido do orientador)

### 2.1 O quadro novo

Substituir o conteúdo das linhas. Título e fonte ficam como estão.

| Aspecto | Mapill | Medisafe | MyTherapy |
|---|---|---|---|
| Funcionalidades essenciais gratuitas | Sim | Não | Sim |
| Gratuidade sem repasse de dados a terceiros | Sim | Não | Não |
| Funcionamento sem conta | Sim | Não | Sim |
| Cadastro por código de barras | Sim | Não | Sim |
| Cadastro de compromissos clínicos | Sim | Sim | Sim |
| Controle de estoque com aviso, sem custo | Sim | Não | Sim |
| Dose variável por horário | Sim | Não | Não |
| Verificação de interação medicamentosa | Não | Sim | Não |
| Registro de medidas gerais de saúde | Não | Sim | Sim |
| Acesso de cuidador ou médico à conta do paciente | Não | Sim | Não |

O que mudou em relação ao atual: a linha "Como sustenta a gratuidade" virou "Gratuidade sem
repasse de dados a terceiros", que dá para responder com Sim ou Não; "Não confirmado
publicamente" e "Não mencionado publicamente" viraram Não; "Fora do escopo (seção 4.1)" virou Não
(explicado no segundo parágrafo abaixo).

### 2.2 Os parágrafos novos

Inserir **logo depois da fonte do Quadro 2** e antes de "4. DESENVOLVIMENTO". Com a troca do item
1, o Quadro 2 fica no fim da 3.2, e estes parágrafos fecham a seção.

> O Quadro 2 evidencia que o Mapill se destaca nos aspectos ligados ao acesso e ao tratamento. É
> a única das três soluções que oferece todas as funcionalidades sem custo e sem repasse de dados a
> terceiros, uma vez que o Medisafe cobra assinatura e o MyTherapy sustenta sua gratuidade com dados
> de uso. Também funciona sem conta, o que o Medisafe não permite, e é a única a oferecer dose
> variável por horário, necessária quando a quantidade muda ao longo do dia.
>
> Os aspectos marcados como Não para o Mapill correspondem a exclusões deliberadas de escopo,
> descritas na seção 4.1. A verificação de interação medicamentosa aproximaria a aplicação de um
> sistema de apoio à prescrição, o registro de medidas gerais de saúde desviaria o foco da adesão
> medicamentosa e o acesso de cuidador ou médico exigiria rever o modelo de uma conta por paciente,
> frente prevista nos trabalhos futuros. Assim, o Medisafe é a solução mais ampla, mas condiciona
> funcionalidades básicas ao pagamento, e o MyTherapy é gratuito, mas depende do repasse de dados,
> enquanto o Mapill troca amplitude por profundidade no tratamento medicamentoso.

(O "Não" vai sem aspas e sem itálico, como valor do quadro.)

## 3. Conclusão: subcapítulo de trabalhos futuros em tópicos (pedido do orientador)

**3.1 No capítulo 6, apagar o parágrafo inteiro** que começa em "Como trabalhos futuros, sugere-se
inicialmente..." e termina em "...complementaria a validação técnica realizada neste trabalho."

**3.2 No fim do parágrafo das limitações** (o que termina em "...que a aplicação pode orientar, mas
não contornar."), acrescentar a frase:

> As frentes de continuidade que decorrem dessas limitações são apresentadas na seção 6.1.

O parágrafo "Em síntese, o Mapill demonstra..." continua como fechamento do capítulo 6.

**3.3 Depois do "Em síntese"**, inserir o subcapítulo, no mesmo estilo de título de 5.1 (caixa
alta), e acrescentá-lo ao sumário:

> **6.1 TRABALHOS FUTUROS**
>
> A partir das limitações apresentadas e das funcionalidades deixadas fora do escopo, identificam-se
> as seguintes frentes para a continuidade do trabalho:
>
> a) desenvolvimento da versão para iOS, ampliando o alcance da aplicação aos usuários de aparelhos
> da Apple;
>
> b) organização do cuidado por tratamento, reunindo sob um mesmo contexto clínico, como o de uma
> terapia oncológica, os medicamentos, as sessões de radioterapia agendadas em lote e os demais
> compromissos, de modo a acompanhar a adesão ao tratamento como um todo, e não apenas a cada
> medicamento;
>
> c) acesso de acompanhamento destinado a médicos e responsáveis pelo paciente, com permissão
> apenas de consulta, o que exige rever o modelo de uma conta por paciente definido na seção 4.1;
>
> d) avaliação de usabilidade com pacientes idosos e polimedicados, complementando a validação
> técnica realizada neste trabalho;
>
> e) validação da entrega do alarme em aparelhos de outros fabricantes e versões do Android, dada a
> variação das restrições de inicialização automática entre eles.

Formato das alíneas (NBR 6024): letra minúscula seguida de parêntese, recuo em relação à margem,
cada uma termina em ponto e vírgula e a última em ponto. O texto que as introduz termina em
dois-pontos, e aqui eles são exigência da norma.

## 4. Quadro 28 (p.80 e 81): passa de uma página

O orientador pediu título, corpo e fonte sempre na mesma página. No capítulo 4 isso já está
certo. O único que ainda quebra é o **Quadro 28**, no capítulo 5: a última linha (conflito entre
registros) e a fonte caem na p.81. Encurtar as células resolve sem mexer na fonte do quadro:

| Cenário | Procedimento | Resultado esperado | Resultado obtido |
|---|---|---|---|
| Ausência de conexão | Cadastro de medicamento com o modo avião ativado | Cadastro concluído e alteração pendente de envio | Aprovado |
| Restabelecimento da conectividade | Desativação do modo avião | Envio automático da alteração pendente | Aprovado |
| Sincronização por restauração | Reinstalação e acesso com a mesma conta | Retorno de todos os dados, inclusive dos alarmes | Aprovado, com os ajustes da seção 5.2 |
| Sincronização entre dispositivos | Registro remoto com data de edição anterior à última sincronização | Recebimento do registro pelo aparelho | Aprovado, com os ajustes da seção 5.2 |
| Conflito entre registros | Edição sem conexão, edição posterior na base remota e reconexão | Prevalência da edição mais recente | Aprovado, com os ajustes da seção 5.2 |

Se ainda assim não couber, reduzir a fonte do quadro para 10 (a ABNT permite fonte menor em
ilustrações). Como os itens 1 a 3 acrescentam texto antes do capítulo 5, conferir de novo no PDF
final se nenhum outro quadro ou figura passou a quebrar.

## 5. Figuras 8, 10, 11 e 12

As quatro ainda usam a **mesma imagem de reserva** (a tela inicial repetida). Cada figura leva
**três capturas lado a lado**, na mesma altura e com espaçamento igual, do mesmo aparelho, com a
barra de status limpa e sem moldura de celular. Os dados são os da base de demonstração do
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md): o mesmo paciente fictício e os mesmos
medicamentos em todas as figuras. Manter o tamanho da imagem de reserva, para título, imagem e
fonte continuarem na mesma página.

### Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio (p.72)

O texto em volta fala do alarme sobre o bloqueio, das ações sem abrir o app e do adiamento de
cinco minutos oferecido uma vez só.

1. **Tela cheia do alarme sobre a tela de bloqueio**, com o nome do medicamento, a dose e o local
   de guarda legíveis e os botões Tomei, Pulei e Adiar visíveis.
2. **Notificação com as ações rápidas**, com o aparelho desbloqueado e em uso (outra tela aberta
   ao fundo), mostrando as ações direto na notificação.
3. **O alarme depois de um adiamento**, cinco minutos depois, já **sem o botão Adiar**. Comprova a
   regra de que o adiamento é oferecido uma única vez por horário.

### Figura 10 - Relatório clínico gerado em formato PDF (p.75)

Não é tela do app, é o PDF gerado, aberto no visualizador do celular. O texto diz que ele reúne
a identificação do paciente, os tratamentos, a taxa de adesão e o histórico de doses.

1. **Topo da primeira página**: o cabeçalho com o nome do paciente e o período, e logo abaixo a
   seção "Média de adesão aos medicamentos" com a taxa em destaque.
2. **Seção "Tratamentos em curso"**, com a lista dos medicamentos do período.
3. **Seções "Doses não tomadas" e "Compromissos do período"**, que formam o histórico levado à
   consulta.

Gerar o relatório de um período com algumas faltas (a base de demonstração tem adesão entre 80 e
90%), para a seção de doses não tomadas não aparecer vazia.

### Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema (p.77)

O Quadro 27, logo acima, mostra o conjunto "Azul, marrom e laranja" (`azulLaranja`) em código.
Usar esse mesmo conjunto amarra o texto à imagem.

1. **Configurações de tema com a lista dos conjuntos de cores**, com as descrições visíveis (Verde,
   amarelo e vermelho; Azul, marrom e laranja; Azul, petróleo e vermelho; Roxo, petróleo e âmbar;
   Turquesa, marrom e magenta).
2. **"Azul, marrom e laranja" selecionado**, com a marcação de escolhido visível.
3. **Tela inicial com esse conjunto aplicado**, com doses em estados diferentes (atrasada, na
   hora, confirmada) para mostrar as cores novas.

### Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste (p.78)

1. **Tema claro.**
2. **Tema escuro.**
3. **Tema de alto contraste.**

A mesma tela inicial, com os mesmos dados, no mesmo dia e na mesma posição de rolagem. Só o tema
muda. No alto contraste, deixar à vista um cartão, porque o texto diz que ali a sombra dá lugar ao
contorno. Voltar o conjunto de cores para o padrão antes, para não misturar com a Figura 11.

## 6. Pré-textuais

**Epígrafe, dedicatória e agradecimentos (p.4 a 6).** Textos definidos em 30/09. Cada um na sua
página. Epígrafe e dedicatória sem título, alinhadas à direita, no terço inferior da página.
Agradecimentos com o título AGRADECIMENTOS e texto justificado, como o corpo.

*Epígrafe (p.4)*, citada por Osterberg e Blaschke (2005), que já estão nas referências:

> Os medicamentos não funcionam em pacientes que não os tomam.
> (C. Everett Koop)

*Dedicatória (p.5)*

> Aos meus pais, Celio e Solange, à minha avó Norma e à minha namorada Elisa, pela presença
> constante ao longo desta caminhada.
> E a mim mesmo, pela persistência de chegar até aqui.

*Agradecimentos (p.6)*

> Aos meus pais, Celio Steffens e Solange Aparecida Maciel Steffens, agradeço pelo apoio ao longo
> de toda a graduação e por me ensinarem o valor do esforço e da dedicação. Foi na rotina da nossa
> família, marcada pela presença constante de medicamentos, que nasceu a ideia do Mapill, e este
> trabalho carrega um pouco do cuidado que sempre vi dentro de casa.
>
> À minha avó, Norma Alda Steffens, pelo carinho de sempre e por ser parte importante de quem eu
> sou. À minha namorada, Elisa Patzlaff, pela paciência nos dias dedicados a este trabalho, pelo
> incentivo nos momentos de cansaço e por acreditar neste projeto junto comigo.
>
> Ao meu orientador, Prof. Me. Marciel de Liz Santos, pelas orientações e correções que deram forma
> a este trabalho.
>
> Por fim, agradeço a mim mesmo, pela disciplina de levar adiante um projeto que começou como uma
> ideia e se tornou uma aplicação real.

**Folha de aprovação (p.3).** A data está "Rio do Sul, 25 de junho de 2026.". Trocar pela data da
defesa. Os nomes da banca ficam para depois da apresentação, como o orientador indicou.

## 7. Negrito

Revisão à parte, combinada para depois. Ainda não feita.

## 8. Conferência final

Depois dos itens 1 a 7, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro de novo o sumário (com 3.1, 3.2 e 6.1
novos), as listas, as remissões 3.1 e 6.1 e se algum quadro ou figura passou a quebrar página.
