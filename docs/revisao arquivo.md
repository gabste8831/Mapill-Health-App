# Anotações da revisão em aparelho

> O bloco de rascunho de cada rodada: o que passou, o que falhou e onde parou. Registrado aqui na
> hora, sem formatação, e consolidado depois no [HISTORICO-DE-PROGRESSO.md](HISTORICO-DE-PROGRESSO.md).

## 08/09 — blocos 7 a 11

```
7 - funcionando tudo
8 - tudo ok. a única coisa é a visualização da miniatura de anexo (foto do remédio, receita, e foto da ficha)
9 - funcionando (muito massa essa função - inclusive importante declarar no plano pra citar no trabalho)
10 - tá funcionando tudo sim!

11
14.5.1 - em "canais" o som consta "MUDO" e importância 4. mas meus volumes estão todos altos...

Parou no 11 e nos ajustes de visualização da miniatura das midias
```

**Resolvido depois:** a miniatura (a causa não estava no `FotoLocal`, e sim na árvore acima dele) e
o som dos canais — na rodada de 09/09 o alarme e as notificações tocaram normalmente.

> ⚠️ Sobre o "MUDO" do diagnóstico: o rótulo **pode mentir**. `sound` é o nome pedido na criação e
> `somUri` é o que o Android resolveu; pedindo `"default"`, alguns aparelhos devolvem o primeiro
> vazio e o segundo preenchido, e o canal toca. Mudo de verdade é quando **as duas** leituras estão
> vazias — está tratado em `DiagnosticoScreen`, mas vale reconferir no bloco 11.

## 09/09 — revisão de tipografia, temas e cores

Rodada longa, tela a tela, sem seguir o roteiro: o Gabriel navegando e apontando o que destoava. O
que saiu dela está consolidado no histórico. Os pontos que **ainda precisam de aparelho**:

- **Tudo o que mudou hoje** foi visto no Metro, não em build. A troca da caixa alta e os tamanhos de
  fonte mexem em praticamente toda tela — vale o bloco 10 (regressão) com a fonte do sistema no
  máximo, que é onde altura de linha apertada aparece.
- **A escolha de cores de estado** (`Ajustes → Configurações de tema`) nunca foi vista em aparelho.
  Ela repinta a Home inteira; se algum lugar continuar verde ou vermelho depois de trocar, aquele
  ponto não está lendo da paleta.
- **A logo nova** (dois PNGs, 1000×333) é desenhada a 120px de largura no cabeçalho. Se a palavra
  ficar serrilhada nessa redução, o caminho é gerar `@2x`/`@3x` em vez de deixar o sistema reduzir.
- **`imageWidth` da splash** foi de 160 para 110, e isso é configuração **nativa**: só entra com
  build nova.

## O que segue pendente do roteiro

| Bloco | Situação |
|---|---|
| **11** | Parou aqui em 08/09. O diagnóstico precisa ser percorrido antes dos testes de alarme |
| **12 a 19** | Alarme e notificação — dependem de esperar horário com o app fechado |
| **20 e 21** | Estoque, receita e o que mudou depois de os blocos 1-10 passarem |
| **2.6.2** | Apagar dados de saúde. Destrutivo, fica por último |

## Uma pendência de código, achada por leitura

**As doses podem acabar por volta do 30º dia num tratamento contínuo.** `generateDoseSchedules`
grava 30 dias no banco **no cadastro**, e não há caminho que reabasteça com o passar do tempo — o
agendador só agenda dose que existe no banco. Não foi verificado em execução; se confirmado, é uma
falha silenciosa (os avisos simplesmente param, sem nenhum sinal).
