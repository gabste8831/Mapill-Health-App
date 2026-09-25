# Pendências do TCC

> **Atualizado em 25/09/2026.** Só o que falta fazer. A edição é feita no Google Docs.
>
> **Referência de paginação:** PDF de 25/09 às 15:22, com a Introdução na página 14 e o número
> impresso igual à página do PDF. Os 28 quadros e as 12 figuras estão em sequência, com título igual
> ao das listas e com título e fonte na mesma página.

---

## 1. Figuras 8, 10, 11 e 12

Hoje estão com imagem duplicada, só para reservar espaço. O que cada captura real mostra fica em
[`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md). Ao trocar, conferir se a captura tem o mesmo
tamanho da duplicada, senão a fonte pode descer para a página seguinte.

## 2. Decidir antes de numerar

Os dois pontos abaixo deslocam todas as páginas das listas da seção 3. Decidir primeiro.

- **Epígrafe, dedicatória e agradecimentos** ainda com texto de modelo (páginas 4 a 6). São
  opcionais na ABNT; escrever ou remover. Remover as três muda todas as páginas em 3.
- **Número impresso nas páginas 1 a 13**, inclusive na capa. Pela NBR 14724 as pré-textuais contam a
  partir da folha de rosto, mas o número só aparece a partir da Introdução, e a capa não conta.
  Confirmar com o modelo da UNIDAVI se a Introdução é mesmo a página 14.

## 3. Sumário e listas prontos para copiar

Valem para o PDF de referência. Se algo da seção 2 mudar, exportar um PDF novo e refazer os números.

**Antes de colar:**

- Entre o título e o número há um tab, que vira pontilhado com a régua de tabulação do documento.
- O sumário já traz duas correções que precisam ser feitas também nos títulos do corpo: **capítulos
  sem ponto** ("1 INTRODUÇÃO", pela NBR 6024), hoje com ponto no 1, 2, 3 e 6; e **5.1 a 5.4 em caixa
  alta**, como as demais seções de mesmo nível.
- Reaplicar o itálico em *Last-Write-Wins* e *offline-first* nas listas.
- Alternativa: gerar o sumário pelo Google Docs (Inserir, Índice), que numera sozinho e se atualiza.

### Sumário

O documento hoje para na 4.1. Faltam 2.4.5, 2.9.3, 2.10.1, 2.10.2, 4.2 a 4.6 com as subseções e 5.1
a 5.4, e várias páginas estão antigas.

```
1 INTRODUÇÃO	14
1.1 PROBLEMA DE PESQUISA	14
1.2 OBJETIVOS	15
1.2.1 Geral	15
1.2.2 Específicos	15
1.3 JUSTIFICATIVA	16
2 REFERENCIAL TEÓRICO	17
2.1 O ECOSSISTEMA MHEALTH E A ADESÃO TERAPÊUTICA	17
2.1.1 O Desafio da Descontinuidade do Tratamento	17
2.1.2 Intervenção Digital como Suporte Cognitivo e Logístico	18
2.2 GESTÃO ESPECIALIZADA VERSUS FERRAMENTAS GENÉRICAS	19
2.2.1 A Restrição Espacial dos Artefatos Físicos e a Descentralização	19
2.2.2 A Centralização Operacional como SSoT	19
2.3 GESTÃO TEMPORAL E INTERVENÇÕES ATIVAS EM MHEALTH	20
2.3.1 Memória Prospectiva e Gatilhos de Interrupção	20
2.3.2 Desoneração Cognitiva e Planejamento Antecipatório	21
2.3.3 Auditoria Clínica e Monitoramento Eletrônico	22
2.4 HEURÍSTICAS DE USABILIDADE APLICADAS AO COMPORTAMENTO DO USUÁRIO	23
2.4.1 Heurísticas de Nielsen e a Redução da Carga Mental	23
2.4.2 Conceitos Fundamentais: Interface do Usuário e Experiência do Usuário	24
2.4.3 Psicologia do Design e Indução ao Uso	24
2.4.4 Gamificação e Reforço Positivo	25
2.4.5 Acessibilidade como Atributo de Qualidade	25
2.5 ENGENHARIA DE SOFTWARE APLICADA A SISTEMAS DE SAÚDE	26
2.5.1 O Papel Sistêmico da Engenharia de Software	26
2.5.2 Engenharia de Requisitos e Estruturação de Regras de Negócio	27
2.5.3 Garantia de Qualidade e Sistemas Orientados à Criticidade	28
2.6 PADRÕES ARQUITETURAIS E CLEAN ARCHITECTURE	28
2.6.1 Princípios SOLID e o Desacoplamento Estrutural	29
2.6.2 Práticas de Clean Code e Legibilidade	29
2.7 PARADIGMAS DE ARQUITETURA DE SOFTWARE MÓVEL	30
2.7.1 Tipagem Estática e Confiabilidade Algorítmica: O Papel do TypeScript	30
2.7.2 Computação Móvel e Ubiquidade no Cuidado	30
2.7.3 Arquiteturas Multiplataforma Baseadas em Pontes Nativas: React Native e Expo	31
2.8 PARADIGMA OFFLINE-FIRST EM SISTEMAS CRÍTICOS	31
2.8.1 Processamento em Segundo Plano e Despertadores Nativos	32
2.9 PERSISTÊNCIA EMBARCADA E MODELOS DE CONSISTÊNCIA EVENTUAL	32
2.9.1 O Padrão Relacional em Borda (Edge): O Motor SQLite	33
2.9.2 BaaS e Integridade na Nuvem: Supabase e PostgreSQL	33
2.9.3 Arquitetura Híbrida e Sincronização Assíncrona	34
2.10 PRIVACIDADE E SEGURANÇA DE DADOS EM MHEALTH	34
2.10.1 A LGPD e o Tratamento de Dados Sensíveis	35
2.10.2 Minimização e o Controle do Ciclo de Vida do Dado	35
3 METODOLOGIA DA PESQUISA	37
3.1 ESTADO DA ARTE E TRABALHOS RELACIONADOS	37
3.2 PROCEDIMENTOS METODOLÓGICOS	39
4 DESENVOLVIMENTO	40
4.1 VISÃO GERAL DA APLICAÇÃO E DELIMITAÇÃO DO ESCOPO	40
4.2 LEVANTAMENTO DE REQUISITOS	41
4.2.1 Requisitos Funcionais	41
4.2.2 Requisitos Não Funcionais	44
4.3 REGRAS DE NEGÓCIO	45
4.3.1 Integridade do Registro Clínico	45
4.3.2 Controle de Estoque	46
4.3.3 Modelagem da Posologia	46
4.3.4 Notificações e Lembretes	46
4.3.5 Sincronização de Dados	47
4.3.6 Cálculo de Adesão	47
4.4 ARQUITETURA DE SOFTWARE	49
4.4.1 Decisão Estrutural	49
4.4.2 Camada de Domínio	49
4.4.3 Camada de Dados	50
4.4.4 Camada de Apresentação	50
4.4.5 Stack Tecnológica	50
4.4.6 Sincronização e Consistência Eventual	51
4.4.7 Trilha de Auditoria e os Três Estados da Dose	53
4.4.8 Garantia de Entrega do Alarme	54
4.5 MODELO DE DADOS	56
4.6 JORNADA E EXPERIÊNCIA DO USUÁRIO	63
4.6.1 Primeiro Acesso	63
4.6.2 Cadastro de Medicamentos	64
4.6.3 Rotina Diária e Resposta ao Alarme	67
4.6.4 Acompanhamento e Relatório Clínico	69
4.6.5 Acessibilidade e Linguagem Visual	72
5 RESULTADOS	75
5.1 VALIDAÇÃO DA ARQUITETURA OFFLINE-FIRST	75
5.2 AJUSTES DECORRENTES DA VALIDAÇÃO	75
5.3 CONFIABILIDADE DO ALARME	77
5.4 ATENDIMENTO AOS OBJETIVOS	77
6 CONCLUSÃO	79
REFERÊNCIAS	80
ANEXOS	84
```

### Lista de quadros

No documento, os quadros estão sem número de página.

```
Quadro 1 - Comparativo dos métodos de medição de adesão medicamentosa	22
Quadro 2 - Comparação entre o Mapill e soluções de mercado	38
Quadro 3 - Requisitos funcionais: identidade e consentimento	42
Quadro 4 - Requisitos funcionais: cadastro clínico	42
Quadro 5 - Requisitos funcionais: operação diária	43
Quadro 6 - Requisitos funcionais: lembretes	43
Quadro 7 - Requisitos funcionais: agenda clínica	44
Quadro 8 - Requisitos funcionais: dados e direitos	44
Quadro 9 - Requisitos não funcionais	45
Quadro 10 - Regras de negócio	48
Quadro 11 - Resolução de conflito de sincronização pelo critério Last-Write-Wins	52
Quadro 12 - Estrutura do registro de ingestão de dose	53
Quadro 13 - Correção retroativa de um registro de dose	54
Quadro 14 - Verificação de alarme já exibido	55
Quadro 15 - Encerramento da tela do alarme no módulo nativo	56
Quadro 16 - medications - Modelo de dados referente às medicações	57
Quadro 17 - prescriptions - Modelo de dados referente às prescrições	58
Quadro 18 - dose_schedules - Modelo de dados referente aos horários de dose	59
Quadro 19 - intake_logs - Modelo de dados referente aos registros de ingestão	59
Quadro 20 - inventory_items - Modelo de dados referente aos itens de estoque	60
Quadro 21 - inventory_adjustments - Modelo de dados referente aos ajustes de estoque	60
Quadro 22 - appointments - Modelo de dados referente aos compromissos	61
Quadro 23 - patient_profiles - Modelo de dados referente aos perfis de paciente	62
Quadro 24 - consent_records - Modelo de dados referente aos registros de consentimento	63
Quadro 25 - Ações do alarme de dose disponíveis na notificação	68
Quadro 26 - Critério de exclusão de doses no cálculo de adesão	70
Quadro 27 - Definição de um conjunto de cores de estado	73
Quadro 28 - Cenários de validação da arquitetura offline-first	76
```

### Lista de figuras

No documento, as figuras estão com a numeração antiga (Figura 1 na 32 a Figura 12 na 44).

```
Figura 1 - Diagrama de sequência da resolução de conflito de sincronização entre dispositivo local e servidor em nuvem pelo critério Last-Write-Wins	52
Figura 2 - Diagrama entidade-relacionamento do modelo de dados do Mapill	57
Figura 3 - Telas de Login, consentimento e ficha de saúde	64
Figura 4 - Identificação do medicamento por código de barras	65
Figura 5 - Formulário de cadastro de medicação	66
Figura 6 - Configurações adicionais do cadastro de medicação	67
Figura 7 - Tela inicial com as doses do dia agrupadas por estado	68
Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio	69
Figura 9 - Tela de adesão e calendário de acompanhamento	70
Figura 10 - Relatório clínico gerado em formato PDF	71
Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema	73
Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste	74
```

## 4. Linhas vazias no sumário

As linhas vazias com estilo de título entre as seções são espaçamento intencional. Se o sumário for
gerado automaticamente, conferir se elas entram como entradas vazias e, se entrarem, removê-las.

---

## Capítulo 5 Resultados

**No documento e conferido em 25/09**, no `.docx` das 15:19. Os ajustes de tom e o Quadro 28 na lista
de quadros já entraram, assim como a frase nova da 4.4.6. O `CAPITULO-5.md` pode sair.

Detalhes que restam: "Autostart" na 5.3 está entre aspas e vai em itálico; conferir se LWW está na
lista de siglas.

**Padrão de fonte.** Todas as fontes do documento estão como "Fonte: elaborado pelo autor (2026).".

## Capítulo 6 Conclusão

Tem só o parágrafo de trabalhos futuros. É o próximo bloco de escrita. Deve incluir as limitações
da validação: testes manuais conduzidos pelo autor, um único modelo de aparelho, segundo dispositivo
simulado pela base remota e ausência de teste com usuários.

## Resumo e Abstract

Revisar depois dos capítulos 5 e 6, para que citem os resultados.
