# Pendências do TCC

> **Atualizado em 25/09/2026.** Só o que falta fazer. A edição é feita no Google Docs.
>
> **Referência de paginação:** PDF de 25/09 às 16:01, com o sumário em três páginas (12 a 14), a
> Introdução na página 15 e o número impresso igual à página do PDF. Os 28 quadros e as 12 figuras estão em sequência, com título igual
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
- Capítulos com ponto ("4. DESENVOLVIMENTO"), como o Gabriel padronizou em 25/09 no sumário e no
  corpo. A NBR 6024 pede sem ponto; vale o que o modelo da UNIDAVI usar. 5.1 a 5.4 em caixa alta.
- Se trocar os números fizer o sumário voltar a duas páginas, tudo volta uma página.
- Reaplicar o itálico em *Last-Write-Wins* e *offline-first* nas listas.
- Alternativa: gerar o sumário pelo Google Docs (Inserir, Índice), que numera sozinho e se atualiza.

### Sumário

O documento hoje para na 4.1. Faltam 2.4.5, 2.9.3, 2.10.1, 2.10.2, 4.2 a 4.6 com as subseções e 5.1
a 5.4, e várias páginas estão antigas.

```
1. INTRODUÇÃO	15
1.1 PROBLEMA DE PESQUISA	15
1.2 OBJETIVOS	16
1.2.1 Geral	16
1.2.2 Específicos	16
1.3 JUSTIFICATIVA	17
2. REFERENCIAL TEÓRICO	18
2.1 O ECOSSISTEMA MHEALTH E A ADESÃO TERAPÊUTICA	18
2.1.1 O Desafio da Descontinuidade do Tratamento	18
2.1.2 Intervenção Digital como Suporte Cognitivo e Logístico	19
2.2 GESTÃO ESPECIALIZADA VERSUS FERRAMENTAS GENÉRICAS	20
2.2.1 A Restrição Espacial dos Artefatos Físicos e a Descentralização	20
2.2.2 A Centralização Operacional como SSoT	20
2.3 GESTÃO TEMPORAL E INTERVENÇÕES ATIVAS EM MHEALTH	21
2.3.1 Memória Prospectiva e Gatilhos de Interrupção	21
2.3.2 Desoneração Cognitiva e Planejamento Antecipatório	22
2.3.3 Auditoria Clínica e Monitoramento Eletrônico	23
2.4 HEURÍSTICAS DE USABILIDADE APLICADAS AO COMPORTAMENTO DO USUÁRIO	24
2.4.1 Heurísticas de Nielsen e a Redução da Carga Mental	24
2.4.2 Conceitos Fundamentais: Interface do Usuário e Experiência do Usuário	25
2.4.3 Psicologia do Design e Indução ao Uso	25
2.4.4 Gamificação e Reforço Positivo	26
2.4.5 Acessibilidade como Atributo de Qualidade	26
2.5 ENGENHARIA DE SOFTWARE APLICADA A SISTEMAS DE SAÚDE	27
2.5.1 O Papel Sistêmico da Engenharia de Software	27
2.5.2 Engenharia de Requisitos e Estruturação de Regras de Negócio	28
2.5.3 Garantia de Qualidade e Sistemas Orientados à Criticidade	29
2.6 PADRÕES ARQUITETURAIS E CLEAN ARCHITECTURE	29
2.6.1 Princípios SOLID e o Desacoplamento Estrutural	30
2.6.2 Práticas de Clean Code e Legibilidade	30
2.7 PARADIGMAS DE ARQUITETURA DE SOFTWARE MÓVEL	31
2.7.1 Tipagem Estática e Confiabilidade Algorítmica: O Papel do TypeScript	31
2.7.2 Computação Móvel e Ubiquidade no Cuidado	31
2.7.3 Arquiteturas Multiplataforma Baseadas em Pontes Nativas: React Native e Expo	32
2.8 PARADIGMA OFFLINE-FIRST EM SISTEMAS CRÍTICOS	32
2.8.1 Processamento em Segundo Plano e Despertadores Nativos	33
2.9 PERSISTÊNCIA EMBARCADA E MODELOS DE CONSISTÊNCIA EVENTUAL	33
2.9.1 O Padrão Relacional em Borda (Edge): O Motor SQLite	34
2.9.2 BaaS e Integridade na Nuvem: Supabase e PostgreSQL	34
2.9.3 Arquitetura Híbrida e Sincronização Assíncrona	35
2.10 PRIVACIDADE E SEGURANÇA DE DADOS EM MHEALTH	35
2.10.1 A LGPD e o Tratamento de Dados Sensíveis	36
2.10.2 Minimização e o Controle do Ciclo de Vida do Dado	36
3. METODOLOGIA DA PESQUISA	38
3.1 ESTADO DA ARTE E TRABALHOS RELACIONADOS	38
3.2 PROCEDIMENTOS METODOLÓGICOS	40
4. DESENVOLVIMENTO	41
4.1 VISÃO GERAL DA APLICAÇÃO E DELIMITAÇÃO DO ESCOPO	41
4.2 LEVANTAMENTO DE REQUISITOS	42
4.2.1 Requisitos Funcionais	42
4.2.2 Requisitos Não Funcionais	45
4.3 REGRAS DE NEGÓCIO	46
4.3.1 Integridade do Registro Clínico	46
4.3.2 Controle de Estoque	47
4.3.3 Modelagem da Posologia	47
4.3.4 Notificações e Lembretes	47
4.3.5 Sincronização de Dados	48
4.3.6 Cálculo de Adesão	48
4.4 ARQUITETURA DE SOFTWARE	50
4.4.1 Decisão Estrutural	50
4.4.2 Camada de Domínio	50
4.4.3 Camada de Dados	51
4.4.4 Camada de Apresentação	51
4.4.5 Stack Tecnológica	51
4.4.6 Sincronização e Consistência Eventual	52
4.4.7 Trilha de Auditoria e os Três Estados da Dose	54
4.4.8 Garantia de Entrega do Alarme	55
4.5 MODELO DE DADOS	57
4.6 JORNADA E EXPERIÊNCIA DO USUÁRIO	64
4.6.1 Primeiro Acesso	64
4.6.2 Cadastro de Medicamentos	65
4.6.3 Rotina Diária e Resposta ao Alarme	68
4.6.4 Acompanhamento e Relatório Clínico	70
4.6.5 Acessibilidade e Linguagem Visual	73
5. RESULTADOS	76
5.1 VALIDAÇÃO DA ARQUITETURA OFFLINE-FIRST	76
5.2 AJUSTES DECORRENTES DA VALIDAÇÃO	76
5.3 CONFIABILIDADE DO ALARME	78
5.4 ATENDIMENTO AOS OBJETIVOS	78
6. CONCLUSÃO	80
REFERÊNCIAS	81
ANEXOS	85
```

### Lista de quadros

No documento, os quadros estão sem número de página.

```
Quadro 1 - Comparativo dos métodos de medição de adesão medicamentosa	23
Quadro 2 - Comparação entre o Mapill e soluções de mercado	39
Quadro 3 - Requisitos funcionais: identidade e consentimento	43
Quadro 4 - Requisitos funcionais: cadastro clínico	43
Quadro 5 - Requisitos funcionais: operação diária	44
Quadro 6 - Requisitos funcionais: lembretes	44
Quadro 7 - Requisitos funcionais: agenda clínica	45
Quadro 8 - Requisitos funcionais: dados e direitos	45
Quadro 9 - Requisitos não funcionais	46
Quadro 10 - Regras de negócio	49
Quadro 11 - Resolução de conflito de sincronização pelo critério Last-Write-Wins	53
Quadro 12 - Estrutura do registro de ingestão de dose	54
Quadro 13 - Correção retroativa de um registro de dose	55
Quadro 14 - Verificação de alarme já exibido	56
Quadro 15 - Encerramento da tela do alarme no módulo nativo	57
Quadro 16 - medications - Modelo de dados referente às medicações	58
Quadro 17 - prescriptions - Modelo de dados referente às prescrições	59
Quadro 18 - dose_schedules - Modelo de dados referente aos horários de dose	60
Quadro 19 - intake_logs - Modelo de dados referente aos registros de ingestão	60
Quadro 20 - inventory_items - Modelo de dados referente aos itens de estoque	61
Quadro 21 - inventory_adjustments - Modelo de dados referente aos ajustes de estoque	61
Quadro 22 - appointments - Modelo de dados referente aos compromissos	62
Quadro 23 - patient_profiles - Modelo de dados referente aos perfis de paciente	63
Quadro 24 - consent_records - Modelo de dados referente aos registros de consentimento	64
Quadro 25 - Ações do alarme de dose disponíveis na notificação	69
Quadro 26 - Critério de exclusão de doses no cálculo de adesão	71
Quadro 27 - Definição de um conjunto de cores de estado	74
Quadro 28 - Cenários de validação da arquitetura offline-first	77
```

### Lista de figuras

No documento, as figuras estão com a numeração antiga (Figura 1 na 32 a Figura 12 na 44).

```
Figura 1 - Diagrama de sequência da resolução de conflito de sincronização entre dispositivo local e servidor em nuvem pelo critério Last-Write-Wins	53
Figura 2 - Diagrama entidade-relacionamento do modelo de dados do Mapill	58
Figura 3 - Telas de Login, consentimento e ficha de saúde	65
Figura 4 - Identificação do medicamento por código de barras	66
Figura 5 - Formulário de cadastro de medicação	67
Figura 6 - Configurações adicionais do cadastro de medicação	68
Figura 7 - Tela inicial com as doses do dia agrupadas por estado	69
Figura 8 - Notificação do alarme de dose sobre a tela de bloqueio	70
Figura 9 - Tela de adesão e calendário de acompanhamento	71
Figura 10 - Relatório clínico gerado em formato PDF	72
Figura 11 - Escolha do conjunto de cores de estado nas configurações de tema	74
Figura 12 - Tela inicial nos temas claro, escuro e de alto contraste	75
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
