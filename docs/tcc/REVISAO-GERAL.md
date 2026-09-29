# Revisão geral do TCC

> **Feita em 29/09/2026** contra `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` (86 páginas). As
> páginas citadas são as do PDF, que coincidem com o número impresso.
>
> **Como usar.** Ordenado por prioridade. Marcar cada item conforme corrigir. O negrito ficou de fora,
> por decisão do Gabriel, e será avaliado à parte.
>
> **Este arquivo sai** quando tudo estiver aplicado e conferido num PDF novo.

---

## 1. Prioridade alta, erros que a banca vê

### 1.1 Figuras e Quadro 1 nunca citados no texto

A ABNT pede que toda ilustração seja citada no texto antes de aparecer. Das 12 figuras, só a Figura 2
é citada. O Quadro 1 também não é. A remissão entra no fim do parágrafo que antecede cada uma.

| Item | Página | Acrescentar ao fim do parágrafo anterior |
|---|---|---|
| Quadro 1 | 23 | "...ao longo do tratamento. O Quadro 1 compara os métodos de medição de adesão medicamentosa." |
| Figura 1 | 53 | "...a dose de uma edição com o horário de outra. A Figura 1 ilustra essa resolução entre o dispositivo e o servidor." |
| Figura 3 | 65 | "...e não como insumo do tratamento. A Figura 3 apresenta as telas de login, de consentimento e da ficha de saúde." |
| Figuras 4 e 5 | 66 | "...disponível de forma não obrigatória ao preenchimento. As Figuras 4 e 5 mostram, respectivamente, a identificação por código de barras e o formulário de cadastro." |
| Figura 6 | 68 | "...com a antecedência escolhida pelo paciente, conforme a Figura 6." |
| Figura 7 | 69 | "...não seja apresentada como pendência, como mostra a Figura 7." |
| Figura 8 | 70 | "...em vez de comunicá-la depois de consumada. A Figura 8 apresenta a notificação do alarme sobre a tela de bloqueio." |
| Figura 9 | 71 | "...que afirmaria algo que não ocorreu. A Figura 9 apresenta a tela de adesão e o calendário." |
| Figura 10 | 72 | "...apresentado na seção 2.10.2. A Figura 10 apresenta um relatório gerado." |
| Figura 11 | 74 | "O Quadro 27 apresenta um dos conjuntos, com a descrição exibida ao paciente, e a Figura 11, a escolha do conjunto nas configurações de tema." (reescreve a frase que já existe antes do Quadro 27) |
| Figura 12 | 75 | "...a preferência de redução de movimento do sistema operacional. A Figura 12 mostra a tela inicial nos três temas." |

### 1.2 Pré-textuais incompletos

- [ ] **p.2 e p.3** "curso de Sistemas **da** Informação" → "Sistemas **de** Informação". O próprio grau diz "Bacharel em Sistemas de Informação".
- [ ] **p.3** Banca examinadora com "Prof." em branco, duas vezes. Preencher os nomes.
- [ ] **p.3** "Rio do Sul, 25 de junho de 2026". Conferir a data, provavelmente é a da apresentação.
- [ ] **p.4 a 6** Epígrafe, dedicatória e agradecimentos com texto de modelo.

### 1.3 Palavras-chave (NBR 6028)

- [ ] **p.7** "Palavras-Chave: mHealth; Adesão medicamentosa; Offline-first." → "Palavras-chave: *mHealth*; adesão medicamentosa; *offline-first*."
- [ ] **p.8** "Keywords: mHealth; Medication adherence; Offline-first." → "Keywords: mHealth; medication adherence; offline-first."

### 1.4 Títulos do capítulo 5 no corpo

- [ ] **p.76 e 78** As seções 5.1 a 5.4 estão em caixa baixa no corpo ("5.1 Validação da Arquitetura Offline-First"), enquanto no sumário, e nas seções de mesmo nível dos outros capítulos, estão em caixa alta. Passar para "5.1 VALIDAÇÃO DA ARQUITETURA *OFFLINE-FIRST*", "5.2 AJUSTES DECORRENTES DA VALIDAÇÃO", "5.3 CONFIABILIDADE DO ALARME" e "5.4 ATENDIMENTO AOS OBJETIVOS".

### 1.5 Conteúdo incorreto ou incompleto

- [ ] **p.48, seção 4.3.5** O parágrafo anuncia "A exclusão ocorre em duas modalidades" e só apresenta a primeira. Trocar a última frase ("Os registros são removidos da nuvem antes do aparelho...") por "A solicitada pelo titular, que apaga todos os seus dados, é física, e os registros são removidos da nuvem antes do aparelho, ordem que impede que a sincronização seguinte os traga de volta."
- [ ] **p.36, seção 2.10.1** "versam sobre a saúde ou a vida genética do indivíduo" → "versam sobre a saúde, a vida sexual ou dados genéticos do indivíduo". "Vida genética" não existe no art. 5º, II da LGPD.
- [ ] **p.27, seção 2.4.5** "norma ISO/IEC 25010:2023 já apresentada na seção 2.5.3" → "norma ISO/IEC 25010:2023, apresentada na seção 2.5.3". A 2.5.3 vem depois, então a norma ainda não foi apresentada.
- [ ] **p.30, seção 2.6.1** "dependency version (inversão de dependência)" → "*dependency inversion* (inversão de dependência)".
- [ ] **p.81, conclusão** "Por fim" aparece duas vezes seguidas, no fim do penúltimo parágrafo e no começo do último. Trocar o segundo por "Em síntese, o Mapill demonstra...".

### 1.6 Tempo verbal de proposta em trabalho concluído

O trabalho está pronto e validado, mas dois trechos ainda falam no futuro, como no projeto.

- [ ] **p.15, introdução** "buscar-se-á desvincular" → "busca-se desvincular"; "a solução integrará" → "a solução integra".
- [ ] **p.40, seção 3.2** Todo o parágrafo está no futuro. "será operacionalizada" → "foi operacionalizada"; "será desenvolvida" → "foi desenvolvida"; "será construído" → "foi construído"; "adotará" → "adota"; "será guiada" → "foi guiada"; "será projetado" → "foi projetado"; "consistirá" → "consistiu".

---

## 2. Siglas e referências

### 2.1 Lista de siglas (p.9)

- [ ] **Acrescentar** as usadas no texto e ausentes da lista: CMED (Câmara de Regulação do Mercado de Medicamentos), FK (*Foreign Key*, chave estrangeira), IBM (*International Business Machines*), ORM (*Object-Relational Mapping*), PDF (*Portable Document Format*), PK (*Primary Key*, chave primária), SQL (*Structured Query Language*) e W3C (*World Wide Web Consortium*).
- [ ] **Grafia igual à do texto.** A lista traz "MHEALTH", "EHEALTH", "SSOT" e "EMEM", e o texto usa *mHealth*, *eHealth*, SSoT e eMEM.
- [ ] **Remover o "iOS" solto** no fim da lista, ou completar ("iOS: sistema operacional móvel da Apple"). Não é sigla.
- [ ] "Single Source of Truth" na lista e "*single source of truth*" no texto. Padronizar a caixa.

### 2.2 Referências nunca citadas

- [ ] **CONSELHO BRASILEIRO DE OFTALMOLOGIA (CBO)**, 2003. Não é citada no texto. Citar onde se fala da perda de contraste com a idade (seção 2.4.5 ou 4.6.5) ou remover da lista.
- [ ] **TABI et al.**, 2019. Não é citada no texto. Citar (provavelmente na seção 3.1, estado da arte) ou remover da lista.
- [ ] **ISO/IEC 25010:2023** é citada pelo nome da norma, mas sem a chamada autor-data. Acrescentar "(ISO, 2023)" nas duas menções (p.27 e p.28/29) e começar a entrada da lista por "INTERNATIONAL ORGANIZATION FOR STANDARDIZATION (ISO)".

Conferido sem problema: todo autor citado no texto está na lista.

### 2.3 Formato da lista de referências (NBR 6023)

- [ ] **Data de acesso em todas as entradas online.** "Acesso em: 08 de maio de 2026." → "Acesso em: 8 maio 2026." Dia sem zero, sem "de", mês abreviado (maio fica por extenso). Vale para ALLSOPP, as duas BRASIL, CONSELHO, EXPO, IBM, META, MICROSOFT, SQLITE, SUPABASE, TABI, VOGELS, W3C e as duas WHO.
- [ ] **p.84, ordem alfabética.** "WORLD WIDE WEB CONSORTIUM (W3C)" vem antes das duas "WORLD HEALTH ORGANIZATION". As WHO vêm primeiro.
- [ ] **Prenomes.** Umas entradas por extenso ("ALLSOPP, John", "MARTIN, Robert C.") e outras abreviadas ("BATES, D. W.", "LOSHIN, D."). Escolher uma forma para toda a lista.
- [ ] **Títulos em inglês com maiúsculas em cada palavra.** KLEPPMANN, TABI, MICROSOFT, VOGELS e CAVOUKIAN. Pela ABNT, só a primeira palavra e nomes próprios ("Designing data-intensive applications: the big ideas...").
- [ ] **MARTIN** "Arquitetura Limpa" → "Arquitetura limpa", como já está em "Código limpo".
- [ ] **(eds.)** em ISTEPANIAN → "(ed.)", como em BRUNTON.
- [ ] **Editora.** "ArtMed" em BADDELEY e "Artmed" em BRUNTON. Usar "Artmed".
- [ ] **WHO.** "Genebra: World Health Organization" (2003) e "Genebra: WHO" (2011). Padronizar.
- [ ] **Local.** "Nova York", "Genebra" e "Ontário" traduzidos, e "Sebastopol", "Burlington" e "Cambridge, MA" no original. A NBR pede o local como aparece no documento ("New York", "Geneva"). Em CAVOUKIAN, Ontário é a província, e a cidade é Toronto.
- [ ] **DETERDING, trabalho em evento.** Seguir o modelo "In: INTERNATIONAL ACADEMIC MINDTREK CONFERENCE, 15., 2011, Tampere. *Proceedings* [...]. New York: ACM, 2011. p. 9-15."
- [ ] **TABI.** "set. 2019" e "Acesso em: 04 de setembro de 2026" na mesma entrada. Resolve junto com a data de acesso.
- [ ] **WHO 2003, URL.** Conferir o hífen em "...9560 e3b1d9c8a75c". Pode ser só a quebra de linha.

---

## 3. Itálico e padronização de termos

### 3.1 Termos estrangeiros sem itálico

Na maioria das ocorrências o termo já está em itálico, então é só completar as que escaparam.

- [ ] **p.7, resumo** "engenharia de software" → *software*.
- [ ] **p.10, lista de quadros** Quadro 28 "arquitetura offline-first" → *offline-first*.
- [ ] **p.11, lista de figuras** Figura 3 "Telas de Login" → "Telas de *login*".
- [ ] **p.13 e 14, sumário** "Práticas de Clean Code", "Borda (Edge)" e "Stack Tecnológica" → *Clean Code*, *Edge*, *Stack*, como no corpo.
- [ ] **p.17** "engenharia de software" e "arquitetura de software" → *software*, duas vezes.
- [ ] **p.18** "smartphones" → *smartphones*; "o mHealth estabelece-se" → *mHealth*.
- [ ] **p.27** "qualidade de software" → *software*.
- [ ] **p.39, Quadro 2** "Login de cuidador/médico" → "*Login*".
- [ ] **p.40, seção 3.2** "engenharia de software, mHealth e design de interfaces" → *software*, *mHealth*, *design*; "O frontend móvel" → *frontend*; "o framework React Native" → *framework*; "sistema de design próprio" → *design*; "paradigma offline-first" → *offline-first*.
- [ ] **p.41** "funciona de forma totalmente offline" → *offline*.
- [ ] **p.45** "a operação offline-first" → *offline-first*; "a frameworks externos" → *frameworks*.
- [ ] **p.46, Quadro 9** "com o app fechado" → *app*, ou "com o aplicativo fechado".
- [ ] **p.51** "dados criados offline" → *offline*; "sistema de design próprio" → *design*.
- [ ] **p.52** "sistema de design próprio" → *design*.
- [ ] **p.54** "pelo token de autenticação" → *token*.
- [ ] **p.64** "psicologia do design" → *design*; "a tela de login" → *login*.
- [ ] **p.65** Figura 3, legenda "Telas de Login" → "Telas de *login*" (corrige também a maiúscula).
- [ ] **p.77** Quadro 28, legenda "arquitetura offline-first" → *offline-first*.
- [ ] **p.78, seção 5.3** *Autostart* está em itálico e também entre aspas. Tirar as aspas.

Na lista de siglas, "Backend" (em "Backend as a Service") vai em itálico junto com o resto da expansão.

### 3.2 Grafia inconsistente

- [ ] **offline-first** Três grafias. "offline-first" (20 vezes), "Offline-first" (p.46, fora de início de frase) e "Offline-First" (p.76, no título da 5.1). Usar "offline-first" no meio de frase. No título, com a caixa alta do item 1.4, fica "*OFFLINE-FIRST*".
- [ ] **Clean Code** "Clean Code" (p.13 e p.30) e "clean code" (p.30). Usar "*Clean Code*".
- [ ] **backend** "Backend" (p.9) e "backend" (p.17). Usar "*backend*" no texto.

Conferidos sem variação: *mHealth*, *eHealth*, *Last-Write-Wins*, React Native, TypeScript, Supabase, SQLite e PostgreSQL.

---

## 4. Português

Achados dos revisores. As sugestões seguem o estilo do trabalho.

### 4.1 Capítulos 1 e 2

- [ ] **p.15** "qualquer intervenção clínica, contudo, a descontinuidade" → "qualquer intervenção clínica. Contudo, a descontinuidade" (duas orações emendadas por vírgula).
- [ ] **p.15** "uma interface segura, funcional, estritamente orientada" → "uma interface segura, funcional e estritamente orientada".
- [ ] **p.17, 18, 21 e 34** "Diferente de/dos..." → "Diferentemente de/dos...", quatro ocorrências. Funciona como advérbio.
- [ ] **p.21** "A aplicação desse conceito transcende (...), sendo estendido" → "sendo estendida".
- [ ] **p.22** "das notificações convencionais que podem ser ignoradas" → "das notificações convencionais, que podem ser ignoradas".
- [ ] **p.22** "no horário correto, ela exige um constante processamento" → "no horário correto. Ela exige um constante processamento".
- [ ] **p.24** "capacidade do usuário em interagir" → "capacidade do usuário de interagir".
- [ ] **p.24** "primordiais: Prevenção de erros" → "primordiais, a prevenção de erros (...) e o reconhecimento" (sem dois-pontos e em minúscula).
- [ ] **p.25** "que terminologias prévias (...) apresentavam-se" → "se apresentavam"; "enquanto a UI direciona-se" → "enquanto a UI se direciona".
- [ ] **p.32** "a estratégia de saúde digital para o Brasil" → "a Estratégia de Saúde Digital para o Brasil" (título de documento oficial).
- [ ] **p.33** "dois pilares arquiteturais essenciais: A eficiência energética" → "dois pilares arquiteturais essenciais, a eficiência energética".
- [ ] **p.34** "Aliada a essa independência funcional, o contexto é reforçado" → "Aliado a essa independência funcional, o contexto é reforçado".

### 4.2 Capítulos 3 e 4, até o modelo de dados

- [ ] **p.38** "questionamento principal: De que maneira" → "questionamento principal, de que maneira", sem dois-pontos.
- [ ] **p.39, Quadro 2** "Não, somente alerta um responsável em casos de doses não tomadas." Única célula com ponto final. Tirar o ponto.
- [ ] **p.40** "da seguinte maneira: A partir da estruturação" → "da seguinte maneira. A partir da estruturação".
- [ ] **p.43, Quadro 4, item 09** "ciclo com pausa, e sob demanda" → "ciclo com pausa e sob demanda".
- [ ] **p.43, Quadro 4, item 13** "no cadastro medicamentos" → "no cadastro de medicamentos".
- [ ] **p.44, Quadro 5, item 19** "Pular dose não desconta estoque" → "Pular dose não deve descontar do estoque", como os demais itens.
- [ ] **p.44, Quadro 5, item 24** "O sistema deve lembrar de conferir o estoque físico" → "O sistema deve lembrar o usuário de conferir o estoque físico".
- [ ] **p.45, Quadro 8, item 40** "Conflito de edição deve resolver por Last-Write-Wins" → "Conflito de edição deve ser resolvido por *Last-Write-Wins*".
- [ ] **p.46, Quadro 9, item 04** "preservar o histórico clínico." Única célula com ponto final. Tirar o ponto.
- [ ] **p.49, Quadro 10, regra 17** "Sincronização resolve por LWWs, tudo ou nada" → "Sincronização se resolve pelo mais recente, tudo ou nada" ("LWWs" é erro de digitação).
- [ ] **p.52** "a capacidade de prevenção a erros" → "a capacidade de prevenção de erros".
- [ ] **p.55** "A regra que efetivamente impõe essa restrição, está no caso de uso" → sem a vírgula.
- [ ] **p.55** "e não na entidade, ela apenas declara o formato do dado" → "e não na entidade, que apenas declara o formato do dado".
- [ ] **p.57** "pela reprodução do som, e o Quadro 15 apresenta a solução adotada." → "pela reprodução do som. O Quadro 15 apresenta a solução adotada."
- [ ] **p.58, Quadro 16** "injeção etc)" → "injeção etc.)".

### 4.3 Capítulo 4, do modelo de dados em diante, e capítulos 5 e 6

- [ ] **p.59, Quadro 17** "UI etc)" → "UI etc.)"; "(ex: com alimento)" → "(ex.: com alimento)".
- [ ] **p.62, Quadro 22** "faltou etc)" → "faltou etc.)".
- [ ] **p.64** "A primeira tela aparente ao usuário" → "A primeira tela apresentada ao usuário".
- [ ] **p.66** "(medicamento, a dose e a posologia)" → "(o medicamento, a dose e a posologia)".
- [ ] **p.66** "orienta uma decisão central, onde todo campo" → "orienta uma decisão central, segundo a qual todo campo".
- [ ] **p.73** "a perda de contraste e da precisão motora são condições comuns" → "a perda de contraste e a de precisão motora são condições comuns".
- [ ] **p.76** "juntamente ao horário definido no aparelho" → "juntamente com o horário definido no aparelho".

Opcional:
- **p.73** "como tomada, atrasada ou é agora". São os rótulos da tela ("TOMADA", "ATRASADA", "É AGORA"), e a p.68 descreve os estados com outros nomes ("confirmada", "na hora"). Para não parecer contradição, escrever os rótulos como aparecem na tela, em caixa alta.

---

## 5. Conferido sem problema

- Sumário, lista de quadros e lista de figuras: as 121 entradas batem com o corpo.
- Numeração dos 28 quadros e das 12 figuras em sequência, com título e fonte na mesma página.
- Remissões a seções: todas as seções citadas existem.
- Remissões a quadros: todos os quadros de 2 a 28 são citados antes de aparecer.
- Resumo com 297 palavras e abstract com 295, dentro do limite da NBR 6028.
- Todo autor citado no texto está na lista de referências.
- Todas as entradas de referência terminam com ponto, têm ano e trazem "Acesso em" quando têm "Disponível em".
