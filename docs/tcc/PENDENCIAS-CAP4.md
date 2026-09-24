# Pendências do Capítulo 4

> **Atualizado em 23/09/2026**, contra `TCC Gabriel Steffens Atualizado 23_09.docx.md`.
>
> **O texto do capítulo 4 está fechado.** Enviado ao orientador para validação em 23/09. As
> próximas mudanças no capítulo dependem do retorno dele.

---

## 1. Pendente

### 1.1 Figuras 6 a 12

O texto e as legendas estão no documento. O que cada captura mostra, e o estado de cada uma,
fica em [`ROTEIRO-DAS-FIGURAS.md`](ROTEIRO-DAS-FIGURAS.md).

### 1.2 Sumário

As linhas vazias com estilo de título entre as seções são espaçamento intencional. Ao gerar o
sumário automático, conferir se elas entram como entradas vazias e, se entrarem, removê-las do
sumário.

---

## 2. Resolvido

### Rodada de 23/09

| Item | Situação |
|---|---|
| 4.6.3 e 4.6.4 inseridas no meio da 4.6.2 | Reposicionadas, e a 4.6.2 voltou a fechar com as Figuras 4, 5 e 6 |
| Frase de apresentação do código da 4.6.3 ausente | Incluída |
| Título "4.6..4" e título vazio abaixo dele | Corrigidos |
| Proporção entre arquitetura e usabilidade | Escrita a 4.6.5 Acessibilidade e Linguagem Visual, que dá contrapartida às seções 2.4.3, 2.4.4 e 2.4.5 |
| Remissão da 4.2 às "fases de desenvolvimento detalhadas na seção 4.5" | Remissão removida, a frase encerra em "de forma incremental" |
| Remissão da 4.5 à figura errada | Corrigida para Figura 2 |
| 4.4.9 Limitações Técnicas | Descartada por decisão do Gabriel |

A 4.6.5 foi conferida contra o código. O conjunto padrão de cores de estado reprova em
`scripts/conferir-cores-de-estado.mjs`, e o texto diz isso em vez de afirmar que todos passam.
A mensagem de dia completo conta doses tomadas e puladas, e o texto a apresenta como reforço do
registro, não do resultado.

### Rodada de 22/09

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

## 3. Fora do Capítulo 4

**Capítulo 5 Resultados.** Existe como título, sem conteúdo. É o próximo bloco de escrita.

**Remissões ao Capítulo 2.** A 4.4.3 remete à atomicidade da seção 2.9.1, e a 4.6.4 à
minimização da seção 2.10.2. Conferir se ambas sustentam a remissão.

**Acentuação no código-fonte.** A refatoração de comentários removeu acentos em parte do
projeto, e 77 arquivos misturam as duas grafias. Não afeta o artigo, exceto se novos trechos
de código forem citados a partir deles.
