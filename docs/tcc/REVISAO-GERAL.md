# Revisão geral do TCC: o que falta

> **Atualizado em 30/09**, com o retorno do orientador (29/09 à noite), conferido contra
> `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` das 14:38 (89 páginas).
> Este é o guia completo: tudo o que ainda falta no documento, por menor que seja. O que já foi
> resolvido saiu daqui (fica no histórico do git).
>
> **Já conferido e certo:** sumário e listas (121 entradas), remissões, chamadas de quadros e
> figuras, citações contra referências, siglas, itálico, tempo verbal, resumo, abstract,
> referências, e na folha de aprovação o hífen de "Itajaí - UNIDAVI" e o título sem ponto final.
> No capítulo 4, todos os quadros e figuras já têm título, corpo e fonte na mesma página.

Ordem sugerida: 1 → 2 → 3 → 4 → exportar PDF → 5.

---

## 1. Ajustes pendentes das mudanças do orientador

A troca de 3.1 e 3.2, o Quadro 2 com Sim e Não e seu texto, a 6.1 em alíneas e o Quadro 28 em uma
página já entraram. Ficaram estes pontos:

1. **Título duplicado (p.40).** O segundo título do capítulo 3, logo antes de "O mercado de
   aplicativos de gestão medicamentosa...", está "3.1 PROCEDIMENTOS METODOLÓGICOS". Trocar por
   **"3.2 ESTADO DA ARTE E TRABALHOS RELACIONADOS"**.
2. **Duas remissões ainda apontam para a 3.2.** Trocar por 3.1, porque falam dos procedimentos:
   - p.79, abertura de Resultados: "validação técnica descrita na seção 3.2" → "**seção 3.1**".
   - p.81, 5.3: "A seção 3.2 estabelece que os alertas..." → "A **seção 3.1** estabelece...".
3. **O fechamento da conclusão sumiu.** O parágrafo "Em síntese" saiu junto com o de trabalhos
   futuros. Colar de volta no fim do capítulo 6, depois do parágrafo das limitações (o que termina
   em "...são apresentadas na seção 6.1.") e antes de "6.1 TRABALHOS FUTUROS":

   > Em síntese, o Mapill demonstra que é possível conciliar, em uma mesma aplicação, o
   > funcionamento independente de conexão, a fidelidade do registro clínico e a simplicidade de
   > uso. Ao assumir as tarefas de lembrar, registrar e antecipar a reposição dos medicamentos, a
   > aplicação transfere ao aparelho parte da carga cognitiva que a rotina terapêutica impõe ao
   > paciente, oferecendo uma resposta concreta à descontinuidade do tratamento que motivou o
   > desenvolvimento do trabalho.

4. **Página em branco (p.85).** Entre o fim da 6.1 e as REFERÊNCIAS sobrou uma página vazia. Apagar
   as linhas vazias ou a quebra de página extra depois da alínea e).
5. **Sumário e lista de quadros.**
   - Acrescentar a linha "6.1 TRABALHOS FUTUROS" logo abaixo de "6. CONCLUSÃO".
   - 3.2 ESTADO DA ARTE: 41 → **40**.
   - 5.4 ATENDIMENTO AOS OBJETIVOS: 82 → **81**.
   - Quadro 2 (lista de quadros): 40 → **41**.
   - 6.1, REFERÊNCIAS e ANEXOS: esperar os itens 3 e 4, que mudam essas páginas. Eu passo os
     números na próxima conferência.

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

## 4. Negrito

Revisão à parte, combinada para depois. Ainda não feita.

## 5. Conferência final

Depois dos itens 1 a 4, exportar o PDF e trazer para `docs/` pelo Explorador de Arquivos (sem abrir
e salvar no editor, que corrompe o arquivo). Eu confiro de novo o sumário (com 3.1, 3.2 e 6.1
novos), as listas, as remissões 3.1 e 6.1 e se algum quadro ou figura passou a quebrar página.
