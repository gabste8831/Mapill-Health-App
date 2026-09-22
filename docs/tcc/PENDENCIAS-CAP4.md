# Pendências do Capítulo 4

> **Levantado em 22/09/2026**, contra `TCC Gabriel Steffens Atualizado 22_09.docx.md`.
>
> Organizado por natureza. As pendências de conteúdo exigem decisão ou escrita. As de
> acabamento ficam para o fechamento do trabalho, quando a estrutura não mudar mais.
>
> **Como usar.** Marcar cada item conforme resolver. Os números de linha referem-se ao
> arquivo Markdown exportado e mudam a cada nova exportação, servindo apenas como pista.

---

## 1. Conteúdo

### 1.1 Remissão a seção inexistente, na 4.2

**Status.** Pendente de decisão.

**Onde.** Seção 4.2, parágrafo de abertura, por volta da linha 494.

**O que diz hoje.**

> *"Os requisitos foram organizados em categorias e entregues de forma incremental ao longo
> das fases de desenvolvimento detalhadas na seção 4.5."*

**O problema.** A seção 4.5 é Modelo de Dados. Não existe, em nenhum ponto do capítulo, seção
que detalhe fases de desenvolvimento.

**Caminhos possíveis.** Escrever uma seção sobre as fases e ajustar o número, apontar a
remissão para outra seção existente, ou remover a remissão e encerrar a frase em
"de forma incremental".

---

### 1.2 Subseções 4.6.3 e 4.6.4

**Status.** Texto pronto, aguardando inserção.

**Arquivo.** `docs/tcc/4.6.3-e-4.6.4-jornada.md`

**O que falta.** Colar as duas subseções no Word e produzir quatro capturas de tela, marcadas
no texto como FIGURA 7 a FIGURA 10. O arquivo traz as legendas e as fontes prontas, além de
dois blocos de código já conferidos contra o repositório.

**Atenção ao colar.** Verificar se a primeira linha de cada bloco de código entra na lista
numerada, problema que ocorreu na 4.4.6 e na 4.4.8.

---

### 1.3 Proporção entre arquitetura e usabilidade

**Status.** Observação, não é lacuna.

A seção 4.4 reúne oito subseções sobre arquitetura, e a 4.6 terá quatro sobre a jornada do
usuário. O referencial teórico dedica a seção 2.4 inteira às heurísticas de usabilidade, com
cinco subseções, entre elas acessibilidade e psicologia das cores.

Vale conferir se esse referencial aparece no desenvolvimento na mesma medida que o de
arquitetura, ou se parte dele foi apresentada na fundamentação sem contrapartida prática.

---

## 2. Acabamento

> Itens para o fechamento, quando a estrutura estiver estável.

### 2.1 Remissão a figura com número errado, na 4.5

**Onde.** Seção 4.5, primeiro parágrafo, por volta da linha 773.

**O que diz hoje.** *"A figura 1 apresenta de forma simplificada a estrutura relacional do
projeto."*

**O correto.** A figura logo abaixo é a Figura 2, que traz o diagrama entidade-relacionamento.
A Figura 1 é o diagrama de sequência do Last-Write-Wins, na seção 4.4.6.

---

### 2.2 Figura 6 sem imagem

**Onde.** Final da seção 4.6.2, por volta da linha 485.

A Figura 6, sobre configurações adicionais do cadastro, tem legenda e fonte, mas nenhuma
imagem associada. As Figuras 1 a 5 possuem imagem. Verificar se a captura foi perdida na
exportação ou se ainda não foi inserida.

---

### 2.3 Numeração de figuras e sumário

Com a inclusão das Figuras 7 a 10 nas subseções novas, conferir a sequência completa e
atualizar o sumário. Nenhuma figura anterior precisa ser renumerada, uma vez que as novas
entram ao final.

---

## 3. Resolvido nesta rodada

Registro do que foi tratado em 22/09, para referência.

| Item | Situação |
|---|---|
| Subseções 4.4.1 a 4.4.5 reunidas em parágrafo único | Separadas, cada uma com título próprio |
| Título da 4.5 absorvido pelo parágrafo da 4.4.8 | Restaurado |
| Parágrafo da 4.3.5 com estilo de título | Corrigido |
| Padrão de maiúsculas divergente entre capítulos | Padronizado em Title Case |
| Blocos de código da 4.4.6 e 4.4.8 com primeira linha fora da lista | Corrigidos |
| Código do Last-Write-Wins divergente do repositório | Corrigido, com o `SELECT` e o nome de coluna corretos |
| Afirmação sobre dezesseis rotinas de conferência | Corrigida para oito, que é o número real de rotinas que exercitam o domínio |

---

## 4. Fora do Capítulo 4

Anotado para não se perder, ainda que não pertença a este capítulo.

**Capítulo 5 Resultados.** Existe como título, sem conteúdo.

**Remissões ao Capítulo 2.** O texto inserido na 4.4.3 remete à atomicidade da seção 2.9.1, e
o texto da 4.6.4 remete à minimização da seção 2.10.2. O capítulo 2 não foi consultado, e
convém verificar se ambas sustentam a remissão.

**Acentuação no código-fonte.** A refatoração de comentários removeu acentos em parte do
projeto, e 77 arquivos misturam as duas grafias. Não afeta o artigo, exceto se novos trechos
de código forem citados a partir deles.
