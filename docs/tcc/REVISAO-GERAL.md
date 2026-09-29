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
| Figura 9 | 71 | Já incluída no segundo parágrafo da 4.6.4, seção 6.7. |
| Figura 10 | 72 | "...apresentado na seção 2.10.2. A Figura 10 apresenta um relatório gerado." |
| Figura 11 | 74 | "O Quadro 27 apresenta um dos conjuntos, com a descrição exibida ao paciente, e a Figura 11, a escolha do conjunto nas configurações de tema." (reescreve a frase que já existe antes do Quadro 27) |
| Figura 12 | 75 | "...a preferência de redução de movimento do sistema operacional. A Figura 12 mostra a tela inicial nos três temas." |

### 1.2 Pré-textuais incompletos

Ficam para depois, por decisão de 29/09.

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

O trabalho está pronto e validado, mas dois trechos ainda falam no futuro, como no projeto. Texto
pronto nas seções 6.1 e 6.3.

- [ ] **p.15, introdução** "buscar-se-á desvincular" → "busca-se desvincular"; "a solução integrará" → "a solução integra".
- [ ] **p.40, seção 3.2** Todo o parágrafo está no futuro. "será operacionalizada" → "foi operacionalizada"; "será desenvolvida" → "foi desenvolvida"; "será construído" → "foi construído"; "adotará" → "adota"; "será guiada" → "foi guiada"; "será projetado" → "foi projetado"; "consistirá" → "consistiu".

---

## 2. Siglas e referências

### 2.1 Lista de siglas (p.9)

Lista completa pronta na seção 6.5. Os itens abaixo são o que ela corrige.

- [ ] **Acrescentar** as usadas no texto e ausentes da lista: CMED (Câmara de Regulação do Mercado de Medicamentos), FK (*Foreign Key*, chave estrangeira), IBM (*International Business Machines*), ORM (*Object-Relational Mapping*), PDF (*Portable Document Format*), PK (*Primary Key*, chave primária), SQL (*Structured Query Language*) e W3C (*World Wide Web Consortium*).
- [ ] **Grafia igual à do texto.** A lista traz "MHEALTH", "EHEALTH", "SSOT" e "EMEM", e o texto usa *mHealth*, *eHealth*, SSoT e eMEM.
- [ ] **Remover o "iOS" solto** no fim da lista, ou completar ("iOS: sistema operacional móvel da Apple"). Não é sigla.

### 2.2 Referências nunca citadas

- [ ] **CONSELHO BRASILEIRO DE OFTALMOLOGIA (CBO)**, 2003. Não é citada no texto. **Remover da lista** (decidido em 29/09; a lista pronta da seção 6.6 já está sem ela).
- [ ] **TABI et al.**, 2019. Não é citada no texto. **Remover da lista** (decidido em 29/09; a lista pronta da seção 6.6 já está sem ela).
- [ ] **ISO/IEC 25010:2023** é citada pelo nome da norma, mas sem a chamada autor-data. Frases prontas na seção 6.4, e entrada da lista na 6.6.

Conferido sem problema: todo autor citado no texto está na lista.

### 2.3 Formato da lista de referências (NBR 6023)

Lista completa pronta na seção 6.6, já com tudo abaixo aplicado.

- [ ] **Data de acesso em todas as entradas online.** "Acesso em: 08 de maio de 2026." → "Acesso em: 8 maio 2026." Dia sem zero, sem "de", mês abreviado (maio fica por extenso). Vale para ALLSOPP, as duas BRASIL, EXPO, IBM, META, MICROSOFT, SQLITE, SUPABASE, VOGELS, W3C e as duas WHO.
- [ ] **p.84, ordem alfabética.** "WORLD WIDE WEB CONSORTIUM (W3C)" vem antes das duas "WORLD HEALTH ORGANIZATION". As WHO vêm primeiro.
- [ ] **Prenomes.** Umas entradas por extenso ("ALLSOPP, John", "MARTIN, Robert C.") e outras abreviadas ("BATES, D. W.", "LOSHIN, D."). Padronizado por extenso, que predomina.
- [ ] **Títulos em inglês com maiúsculas em cada palavra.** KLEPPMANN, MICROSOFT, VOGELS e CAVOUKIAN. Pela ABNT, só a primeira palavra e nomes próprios ("Designing data-intensive applications: the big ideas...").
- [ ] **MARTIN** "Arquitetura Limpa" → "Arquitetura limpa", como já está em "Código limpo".
- [ ] **(eds.)** em ISTEPANIAN → "(ed.)", como em BRUNTON.
- [ ] **Editora.** "ArtMed" em BADDELEY e "Artmed" em BRUNTON. Usar "Artmed".
- [ ] **WHO.** "Genebra: World Health Organization" (2003) e "Genebra: WHO" (2011). Padronizar.
- [ ] **Local.** "Nova York", "Genebra" e "Ontário" traduzidos, e "Sebastopol", "Burlington" e "Cambridge, MA" no original. A NBR pede o local como aparece no documento ("New York", "Geneva"). Em CAVOUKIAN, Ontário é a província, e a cidade é Toronto.
- [ ] **DETERDING, trabalho em evento.** Seguir o modelo "In: INTERNATIONAL ACADEMIC MINDTREK CONFERENCE, 15., 2011, Tampere. *Proceedings* [...]. New York: ACM, 2011. p. 9-15."
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

- [ ] **p.38** "questionamento principal: De que maneira". Pergunta de pesquisa em forma indireta, frase pronta na seção 6.2.
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

---

## 6. Textos prontos para colar

Os itens 1.6, 2.1, 2.2 e 2.3 e o item de p.38 da seção 4.2 apontam para cá. Nos trechos já
consolidados, só mudou o que a revisão pediu (tempo verbal, itálico, dois-pontos); o resto está
idêntico ao documento. Itálico marcado com asteriscos.

### 6.1 Introdução, p.15 (item 1.6)

Duas frases, trocando só o tempo verbal.

> Ao transformar o dispositivo móvel em um suporte utilitário, busca-se desvincular o auxílio terapêutico de espaços físicos fixos, combatendo a dependência de lembretes analógicos e promovendo a autonomia do indivíduo por meio de um monitoramento ininterrupto e preditivo.

> Atuando como uma SSoT, a solução integra o registro de ingestão, o controle de inventário e a gestão de rotinas clínicas, visando converter o ambiente digital em um ecossistema coeso de auxílio ao paciente.

### 6.2 Seção 3, abertura, p.38 (item de p.38 da seção 4.2)

A pergunta de pesquisa passa a indireta, sem dois-pontos e sem ponto de interrogação. O conteúdo é o
mesmo da seção 1.1.

> O trabalho busca responder de que maneira uma aplicação móvel, baseada em arquitetura *offline-first*, pode centralizar o gerenciamento de medicamentos, o controle de estoques e a organização de compromissos terapêuticos, atendendo a requisitos funcionais e não funcionais de usabilidade, segurança e confiabilidade voltados ao contexto do cuidado com a saúde.

### 6.3 Seção 3.2 inteira, p.40 (item 1.6)

Tempo verbal, itálico, os dois-pontos do segundo parágrafo e "elementos de gamificação".

> Quanto aos procedimentos metodológicos, recorre-se ao levantamento bibliográfico e documental com foco em áreas como engenharia de *software*, *mHealth* e *design* de interfaces, subsidiando o levantamento de requisitos e as decisões de projeto da aplicação.
>
> A pesquisa foi operacionalizada da seguinte maneira. A partir da estruturação teórica e do levantamento de requisitos arquiteturais, a aplicação, denominada Mapill, foi desenvolvida adotando um ecossistema multiplataforma. O *frontend* móvel foi construído utilizando o *framework* React Native orquestrado pelo Expo, com a linguagem TypeScript para garantir segurança de tipagem e um sistema de *design* próprio para a estilização das interfaces.
>
> A infraestrutura de persistência adota o paradigma *offline-first*, utilizando o banco de dados SQLite localmente para garantir o funcionamento de forma autônoma e independente de conectividade. Para a sincronização e a recuperação de falhas, a aplicação comunica-se diretamente com a plataforma Supabase, que expõe uma interface de programação de aplicações sobre o banco de dados PostgreSQL e atua como repositório secundário em nuvem.
>
> A concepção de UX foi estritamente guiada pelas heurísticas de Nielsen, priorizando fluxos simplificados e alta legibilidade para atender ao público-alvo, composto majoritariamente por idosos e pacientes polimedicados. O sistema foi projetado para operacionalizar o motor de disparos via notificações locais e alarmes, assegurando o determinismo dos alertas independentemente de conexão com a rede, além de aplicar elementos de gamificação para estímulo à adesão.
>
> Por fim, a etapa de validação técnica do trabalho consistiu na análise do comportamento da arquitetura *offline-first* em cenários controlados, simulando situações de ausência de conexão, restabelecimento de conectividade, sincronização de dados e conflito entre registros locais e remotos, de modo a verificar a confiabilidade e a consistência da solução proposta diante das condições de uso previstas.

Além do tempo verbal, "mecânicas de gamificação" passou a "elementos de gamificação" (decidido em
29/09), porque a 4.6.5 descreve só o indicador de progresso e a mensagem de dia completo.

### 6.4 Frases com a ISO/IEC 25010 (item 2.2)

**Seção 2.4.5, p.27.** Já inclui a correção da remissão à 2.5.3 (item 1.5) e o itálico.

> Essa exigência dialoga diretamente com a norma ISO/IEC 25010:2023 (ISO, 2023), apresentada na seção 2.5.3 deste trabalho, que reconhece a acessibilidade como uma característica formal de qualidade de *software*, e não como um complemento estético ao produto.

**Seção 2.5.3, p.28 e 29.** Só o começo muda, o resto da frase segue igual.

> Segundo a norma internacional ISO/IEC 25010:2023 (ISO, 2023), que estabelece o modelo de qualidade de produto de *software*, destacam-se para este contexto os atributos de confiabilidade (...)

### 6.5 Lista de abreviaturas e siglas completa (item 2.1)

Substitui a lista inteira da p.9. Em ordem alfabética, com a grafia usada no texto e a expansão em
inglês em itálico.

O que mudou em relação à lista atual:

- **Entraram** Anvisa, CMED, FK, IBM, ORM, PDF, PK, SQL e W3C, todas usadas no texto.
- **Grafia corrigida** para a do texto: EHEALTH → *eHealth*, EMEM → eMEM, MHEALTH → *mHealth*, SSOT → SSoT.
- **eMEM** passa a "Monitoramento Eletrônico de Medicamentos", como no Quadro 1 ("Monitoramento eletrônico de medicamentos (eMEM)").
- **Saiu** o "iOS" solto no fim, que não é sigla.
- As demais entradas conferidas e mantidas, todas usadas no texto ou na capa (UNIDAVI).

```
ACID: Atomicity, Consistency, Isolation, Durability (Atomicidade, Consistência, Isolamento e Durabilidade)
Anvisa: Agência Nacional de Vigilância Sanitária
API: Application Programming Interface (Interface de Programação de Aplicações)
BaaS: Backend as a Service (Backend como Serviço)
CDSS: Clinical Decision Support Systems (Sistemas de Suporte à Decisão Clínica)
CMED: Câmara de Regulação do Mercado de Medicamentos
CSS: Cascading Style Sheets (Folhas de Estilo em Cascata)
CTO: Chief Technology Officer (Diretor de Tecnologia)
eHealth: Electronic Health (Saúde Eletrônica)
eMEM: Electronic Medication Monitoring (Monitoramento Eletrônico de Medicamentos)
FK: Foreign Key (Chave Estrangeira)
IBM: International Business Machines
ISO/IEC: International Organization for Standardization / International Electrotechnical Commission
JWT: JSON Web Token
LGPD: Lei Geral de Proteção de Dados
LWW: Last-Write-Wins (Última Gravação Prevalece)
mHealth: Mobile Health (Saúde Móvel)
ORM: Object-Relational Mapping (Mapeamento Objeto-Relacional)
PDF: Portable Document Format (Formato de Documento Portátil)
PK: Primary Key (Chave Primária)
RLS: Row Level Security (Segurança em Nível de Linha)
SGBD: Sistema Gerenciador de Banco de Dados
SOLID: Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion
SQL: Structured Query Language (Linguagem de Consulta Estruturada)
SRP: Single Responsibility Principle (Princípio de Responsabilidade Única)
SSoT: Single Source of Truth (Fonte Única de Verdade)
UI: User Interface (Interface do Usuário)
UNIDAVI: Centro Universitário para o Desenvolvimento do Alto Vale do Itajaí
UX: User Experience (Experiência do Usuário)
W3C: World Wide Web Consortium
WCAG: Web Content Accessibility Guidelines (Diretrizes de Acessibilidade para Conteúdo Web)
WHO: World Health Organization (Organização Mundial da Saúde)
```

Itálico: a expansão em inglês de cada sigla (ex.: *Application Programming Interface*), e *Backend*
na tradução de BaaS. A sigla em si fica sem itálico, exceto *eHealth* e *mHealth*, que o texto já usa
em itálico. SGBD passou ao singular, que é a forma de verbete.

### 6.6 Lista de referências completa (item 2.3)

Substitui a lista inteira das p.82 a 85. Segue a NBR 6023 e o padrão que já predomina no documento.

O que mudou em relação à lista atual:

- **Prenomes por extenso** em todas, que é o padrão de 14 das 21 entradas com autor pessoal. Os 7
  completados foram BATES (David W.), BRETTEL, VIÉNOT e MOLLON (Hans, Françoise, John D.), BRUNTON e
  KNOLLMANN (Laurence L., Björn C.), DETERDING (Sebastian), LOSHIN (David), OSTERBERG e BLASCHKE
  (Lars, Terrence) e RISKO e GILBERT (Evan F., Sam J.). Vale conferir os nomes contra a fonte.
- **Data de acesso** no formato da norma ("8 maio 2026").
- **Títulos em inglês** só com a primeira letra maiúscula e nomes próprios.
- **Local** como aparece no documento: New York, Geneva, Toronto.
- **ISO** com a sigla no cabeçalho, como já é feito com W3C e WHO, para casar com "(ISO, 2023)".
- **DETERDING** no modelo de trabalho em evento. **ISTEPANIAN** com "(ed.)". **BADDELEY** com
  "Artmed". **MARTIN** com "Arquitetura limpa". **WHO 2011** com a editora por extenso.
- **Ordem alfabética**: as duas WORLD HEALTH ORGANIZATION antes da WORLD WIDE WEB CONSORTIUM.
- **URLs da WHO** sem as quebras que a extração do PDF criou ("9560-e3b1d9c8a75c" e "content").
  Conferir no documento se as quebras existem mesmo.

O negrito fica como está hoje (título principal em negrito), a ser conferido na revisão do negrito.
Em DETERDING, o negrito passa para "*Proceedings*".

**CONSELHO BRASILEIRO DE OFTALMOLOGIA** e **TABI** saíram da lista, por decisão de 29/09, já que nenhuma
das duas é citada no texto. A lista ficou com 33 entradas.

```
ALLSOPP, John. The web's future is offline. beyond tellerrand, 2014. Disponível em: https://www.youtube.com/watch?v=VvwhcoZhoI4. Acesso em: 8 maio 2026.

BADDELEY, Alan; ANDERSON, Michael C.; EYSENCK, Michael W. Memória. Porto Alegre: Artmed, 2010.

BATES, David W. et al. Ten commandments for effective clinical decision support: making the practice of evidence-based medicine a reality. Journal of the American Medical Informatics Association, v. 10, n. 6, p. 523-530, 2003.

BRASIL. [Lei Geral de Proteção de Dados Pessoais (LGPD)]. Lei nº 13.709, de 14 de agosto de 2018. Brasília, DF: Presidência da República, 2018. Disponível em: http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.html. Acesso em: 10 maio 2026.

BRASIL. Ministério da Saúde. Estratégia de Saúde Digital para o Brasil 2020-2028. Brasília, DF: Ministério da Saúde, 2020. Disponível em: https://bvsms.saude.gov.br/bvs/publicacoes/estrategia_saude_digital_Brasil.pdf. Acesso em: 10 maio 2026.

BRETTEL, Hans; VIÉNOT, Françoise; MOLLON, John D. Computerized simulation of color appearance for dichromats. Journal of the Optical Society of America A, v. 14, n. 10, p. 2647-2655, 1997.

BRUNTON, Laurence L.; KNOLLMANN, Björn C. (ed.). As bases farmacológicas da terapêutica de Goodman & Gilman. 14. ed. Porto Alegre: Artmed, 2024.

CAVOUKIAN, Ann. Privacy by design: the 7 foundational principles. Toronto: Information and Privacy Commissioner of Ontario, 2009.

DETERDING, Sebastian et al. From game design elements to gamefulness: defining gamification. In: INTERNATIONAL ACADEMIC MINDTREK CONFERENCE, 15., 2011, Tampere. Proceedings [...]. New York: ACM, 2011. p. 9-15.

EXPO. Expo documentation. 2024. Disponível em: https://docs.expo.dev/. Acesso em: 7 maio 2026.

IBM. ACID properties of transactions. 2024. Disponível em: https://www.ibm.com/docs/pt-br/cics-tx/11.1.0?topic=processing-acid-properties-transactions. Acesso em: 14 maio 2026.

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION (ISO). ISO/IEC 25010: systems and software engineering - systems and software quality requirements and evaluation (SQuaRE) - product quality model. Geneva: ISO/IEC, 2023.

ISTEPANIAN, Robert S. H.; LAXMINARAYAN, Swamy; PATTICHIS, Constantinos S. (ed.). M-health: emerging mobile health systems. New York: Springer, 2006.

KLEPPMANN, Martin. Designing data-intensive applications: the big ideas behind reliable, scalable, and maintainable systems. Sebastopol: O'Reilly Media, 2017.

LOSHIN, David. Master data management. Burlington: Morgan Kaufmann, 2010.

MARTIN, Robert C. Arquitetura limpa: o guia do artesão para estrutura e design de software. Rio de Janeiro: Alta Books, 2019.

MARTIN, Robert C. Código limpo: habilidades práticas do Agile Software. Rio de Janeiro: Alta Books, 2009.

META. React Native: a framework for building native apps using React. 2024. Disponível em: https://reactnative.dev/docs/getting-started. Acesso em: 7 maio 2026.

MICROSOFT. TypeScript: typed JavaScript at any scale. 2024. Disponível em: https://www.typescriptlang.org/. Acesso em: 10 maio 2026.

NIELSEN, Jakob. Usability engineering. San Diego: Academic Press, 1994.

NORMAN, Donald A. The design of everyday things. Revised and expanded edition. New York: Basic Books, 2013.

OSTERBERG, Lars; BLASCHKE, Terrence. Adherence to medication. New England Journal of Medicine, v. 353, n. 5, p. 487-497, 2005.

PINHEIRO, Patrícia Peck. Proteção de dados pessoais: comentários à Lei n. 13.709/2018 (LGPD). 2. ed. São Paulo: Saraiva, 2020.

PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 9. ed. Porto Alegre: AMGH, 2021.

RISKO, Evan F.; GILBERT, Sam J. Cognitive offloading. Trends in Cognitive Sciences, v. 20, n. 9, p. 676-688, 2016.

SOMMERVILLE, Ian. Engenharia de software. 10. ed. São Paulo: Pearson Education do Brasil, 2018.

SQLITE. SQLite documentation. 2026. Disponível em: https://www.sqlite.org/docs.html. Acesso em: 8 maio 2026.

SUPABASE. Supabase documentation: Row Level Security. 2026. Disponível em: https://supabase.com/docs/guides/auth/row-level-security. Acesso em: 8 maio 2026.

SWELLER, John. Cognitive load during problem solving: effects on learning. Cognitive Science, v. 12, n. 2, p. 257-285, 1988.

VOGELS, Werner. Eventually consistent - revisited. All Things Distributed, 2008. Disponível em: https://www.allthingsdistributed.com/2008/12/eventually_consistent.html. Acesso em: 29 maio 2026.

WORLD HEALTH ORGANIZATION (WHO). Adherence to long-term therapies: evidence for action. Geneva: World Health Organization, 2003. Disponível em: https://iris.who.int/server/api/core/bitstreams/121c6b73-8651-442f-9560-e3b1d9c8a75c/content. Acesso em: 29 abr. 2026.

WORLD HEALTH ORGANIZATION (WHO). mHealth: new horizons for health through mobile technologies. Geneva: World Health Organization, 2011. Disponível em: https://iris.who.int/server/api/core/bitstreams/ad1b13c0-7c82-47b4-8dd5-f0a26c3a3cc3/content. Acesso em: 13 maio 2026.

WORLD WIDE WEB CONSORTIUM (W3C). Web Content Accessibility Guidelines (WCAG) 2.1. Cambridge, MA: W3C, 2018. Disponível em: https://www.w3.org/TR/WCAG21/. Acesso em: 10 set. 2026.
```

### 6.7 Seção 4.6.4, os dois primeiros parágrafos (29/09)

Por decisão de 29/09, só os dois primeiros parágrafos mudam. A p.70 tem espaço para umas duas linhas a
mais, e a p.71 está cheia até a Figura 9, então o segundo parágrafo precisa manter o tamanho, mesmo
com a remissão à Figura 9. Crescer ali empurra a figura para a p.72 e desloca o resto do capítulo.

**Primeiro parágrafo** (cresce cerca de uma linha, com o que a tela mostra: períodos de 7, 30 e 90
dias, puladas separadas de sem resposta, conferido no código):

> O acompanhamento de longo prazo reúne o histórico que a rotina diária produz. A tela de adesão apresenta a taxa consolidada em períodos de sete, trinta ou noventa dias, com a distribuição dia a dia e as doses puladas contadas separadamente das que ficaram sem resposta. O cálculo exclui as doses não vencidas e não respondidas, conforme a regra detalhada no Quadro 26.

**Segundo parágrafo** (mesmo tamanho do original, já com a remissão à Figura 9 do item 1.1):

> As duas condições são exigidas em conjunto, pois uma dose futura sem resposta é apenas uma previsão, e uma já respondida é um fato registrado. Sem nenhuma dose vencida, a tela indica que ainda não há dados suficientes, em vez de uma taxa de zero por cento que afirmaria algo que não ocorreu. A Figura 9 apresenta a tela de adesão e o calendário.

Os parágrafos do calendário e do relatório ficam como estão. A remissão à Figura 10 (item 1.1) ainda
precisa entrar no fim do parágrafo do relatório: "...apresentado na seção 2.10.2. A Figura 10
apresenta um relatório gerado."

**Opcional, não aplicado.** O terço em branco da p.72 só se preenche com texto depois da Figura 9. Se
um dia quiser, estes dois acréscimos cabem ali:

> (no parágrafo do calendário, depois da primeira frase) Enquanto a tela de adesão resume o período em números, o calendário responde a perguntas pontuais, como se a dose de uma data específica foi tomada, pulada ou ficou sem resposta.

> (parágrafo novo, depois da Figura 10) O próprio documento declara, em seu rodapé, que foi gerado a partir dos registros feitos pelo paciente e que não substitui avaliação clínica nem constitui prescrição. A ressalva delimita o papel da aplicação, que organiza e apresenta o que foi registrado sem interpretá-lo clinicamente, tarefa que cabe ao profissional de saúde.
