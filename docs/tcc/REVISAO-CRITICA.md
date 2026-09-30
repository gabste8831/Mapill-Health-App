# Revisão crítica do TCC (prompt do orientador): o que continua em aberto

> **Feita em 30/09** com o prompt de revisão crítica do orientador, em três blocos (resumo,
> introdução e referencial; metodologia e desenvolvimento; resultados e conclusão), e **reconferida
> às 17:25** contra `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` (89 páginas).
>
> **Já resolvido e retirado daqui:** garantia do alarme (janela de sete dias, ressalva na 5.4 e na
> conclusão), ações da notificação, contagens (formas, camadas, migrações, cenários), anexos e
> exclusão sem conexão, custos do LWW e Kleppmann, estoque com dois aparelhos, registro de dose como
> autorrelato, método da validação na 3.1 e o fechamento da conclusão. Os três relatórios completos,
> com os 57 achados originais, ficam no histórico do git (commit `968d99c`).
>
> Os pontos rápidos, com texto pronto, estão no [`AJUSTES-DE-CONTEUDO.md`](AJUSTES-DE-CONTEUDO.md).
> Aqui fica o restante, cada um com a pergunta que precisa ser respondida antes de reescrever.

---

## 1. Resumo

- **Última frase (p.7) e abstract (p.8).** Ainda afirmam "simplicidade de uso" e a transferência de
  carga cognitiva como resultado, enquanto a conclusão já trata o efeito como algo a verificar.
  Texto pronto no AJUSTES, bloco 1.

## 2. Referencial teórico (capítulo 2)

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

## 3. Metodologia e desenvolvimento (capítulos 3 e 4)

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

## 4. Resultados e conclusão (capítulos 5 e 6)

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
