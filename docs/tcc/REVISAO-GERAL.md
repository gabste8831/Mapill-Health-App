# Revisão geral do TCC: o que falta

> **Atualizado em 30/09**, com o retorno do orientador (29/09 à noite), conferido contra
> `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` das 15:07 (88 páginas).
> Este é o guia completo: tudo o que ainda falta no documento, por menor que seja. O que já foi
> resolvido saiu daqui (fica no histórico do git).
>
> **Já conferido e certo:** sumário e listas (121 entradas), remissões, chamadas de quadros e
> figuras, citações contra referências, siglas, itálico, tempo verbal, resumo, abstract,
> referências, e na folha de aprovação o hífen de "Itajaí - UNIDAVI" e o título sem ponto final.
> No capítulo 4, todos os quadros e figuras já têm título, corpo e fonte na mesma página.

Ordem sugerida: 1 → 2 → 4 → exportar PDF → 5. O item 3 fica para depois da apresentação.

---

## 1. Números de página no sumário

As mudanças do orientador entraram todas (título 3.2, remissões, "Em síntese", página em branco,
6.1 no sumário). Faltam três números:

- 6. CONCLUSÃO: 84 → **83**
- 6.1 TRABALHOS FUTUROS: 85 → **84**
- REFERÊNCIAS: 86 → **85**

As outras 119 entradas do sumário e das listas estão certas.

## 2. Figuras 8, 10, 11 e 12

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

## 3. Pré-textuais

Epígrafe, dedicatória e agradecimentos já estão no documento (conferidos em 30/09, 14:38).

**Folha de aprovação (p.3).** A data está "Rio do Sul, 25 de junho de 2026.". Trocar pela data da
defesa. Os nomes da banca ficam para depois da apresentação, como o orientador indicou.

## 4. Negrito (reconferido em 30/09 contra o PDF das 15:07)

Já corrigidos: 5.1 a 5.4 sem negrito no sumário, e ISO, ISTEPANIAN e WHO 2011 com o subtítulo
normal. Falta:

1. **Sumário, linha 5.4.** O texto saiu do negrito, mas os pontinhos e o "81" continuam em negrito.
2. **Vírgula em negrito (p.19)**, logo depois de "Laxminarayan e Pattichis (2006)".
3. **Referências, subtítulo ainda em negrito.** Deixar em negrito só a parte marcada:
   - CAVOUKIAN: **Privacy by design**: the 7 foundational principles.
   - KLEPPMANN: **Designing data-intensive applications**: the big ideas behind reliable,
     scalable, and maintainable systems.
   - MARTIN 2019: **Arquitetura limpa**: o guia do artesão para estrutura e design de software.
   - MARTIN 2009: **Código limpo**: habilidades práticas do Agile Software.
   - META: **React Native**: a framework for building native apps using React.
   - MICROSOFT: **TypeScript**: typed JavaScript at any scale.
   - PINHEIRO: **Proteção de dados pessoais**: comentários à Lei n. 13.709/2018 (LGPD).
   - PRESSMAN: **Engenharia de software**: uma abordagem profissional.
   - SUPABASE: **Supabase documentation**: Row Level Security.
   - WHO 2003: **Adherence to long-term therapies**: evidence for action.

   Os dois-pontos também saem do negrito.
4. **Opcional.** "*Software*" em itálico na 2.5.1 (corpo e sumário), que não aparece em itálico no
   resto do texto.

## 4.1 Número de página nos pré-textuais

No PDF das 15:07, as páginas 1 a 15 ainda mostram número.

Pela NBR 14724, as páginas pré-textuais são contadas, mas o número só aparece a partir da
Introdução. O sumário ocupa três páginas (13 a 15), e a opção "primeira página diferente" esconde
só a primeira delas. O caminho no Google Docs:

1. Clicar no começo de "1. INTRODUÇÃO" e usar **Inserir › Quebra › Quebra de seção (próxima
   página)**. Se já houver uma quebra de página comum ali, apagar a comum.
2. Dar dois cliques no cabeçalho da página da Introdução e **desmarcar "Vincular ao anterior"**.
   O número fica.
3. Dar dois cliques no cabeçalho de uma página do sumário e **apagar o número**. Como o vínculo foi
   desfeito, isso não afeta o corpo. Se o sumário estiver em uma seção própria com "Layout
   diferente na primeira página" marcado, desmarcar, para as três páginas ficarem iguais (sem
   número).
4. Em **Inserir › Números de página › Mais opções**, na seção da Introdução, escolher **"Continuar
   da seção anterior"**, para a Introdução seguir mostrando 16.

Se as páginas pré-textuais estiverem em várias seções, repetir o passo 3 em cada uma que ainda
mostrar número.

## 5. Conferência final

Depois dos itens 1, 2 e 4, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro de novo o sumário (com 3.1, 3.2 e 6.1
novos), as listas, as remissões 3.1 e 6.1 e se algum quadro ou figura passou a quebrar página.
