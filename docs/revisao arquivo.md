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
que saiu dela está consolidado no histórico.

**Validado em aparelho na mesma rodada:**

- ✅ **A caixa de texto** — os 86 rótulos em caixa de frase e os tamanhos novos.
- ✅ **A escolha de cores de estado** (`Ajustes → Configurações de tema`), que repinta a Home
  inteira. Nenhum ponto ficou preso no verde/vermelho antigo.

**Ainda sem confirmação em aparelho:**

- **A regressão com a fonte do sistema no máximo.** A caixa de frase mudou a largura de quase todo
  rótulo, e a altura de linha foi corrigida em três tokens — o bloco 10 é o que fecha isso.
- **A logo nova** (dois PNGs, 1000×333) é desenhada a 96px de largura no cabeçalho. Se a palavra
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

## Uma pendência de código, achada por leitura (não testada)

**Suspeita: as doses podem acabar por volta do 30º dia num tratamento contínuo.**

Existem **duas** janelas no app, com nomes parecidos e destinos diferentes:

| Janela | Onde | Reabastecida? |
|---|---|---|
| Avisos agendados no sistema | 7 dias, `reagendar-avisos.ts` | ✅ a cada vez que o app vai a primeiro plano |
| `DoseSchedule` gravados no banco | 30 dias, `use-medication-registration.ts` | ❓ nenhum código encontrado |

A primeira funciona e está documentada. A segunda é a dúvida: `generateDoseSchedules` grava 30 dias
**no cadastro**, e o comentário do `SCHEDULE_HORIZON_DAYS` diz que *"a janela é reabastecida depois
(bloco C1)"* — mas um `grep` por `generateDoseSchedules` mostra que os outros usos são projeções de
leitura (calendário, previsão de estoque, resumo), que calculam na hora sem gravar.

Se for isso, o encadeamento é: o agendador só agenda dose que existe no banco → o banco tem 30 dias
a partir do cadastro → ninguém regenera. Num uso contínuo os avisos parariam por volta do 30º dia
**mesmo com o app sendo aberto todo dia**, e sem nenhum sinal de que pararam.

**Como verificar sem esperar um mês:** cadastrar um remédio contínuo, abrir o diagnóstico
(`Ajustes → Desenvolvimento`) e comparar "esperado pelo banco" com o total de dias. Ou adiantar o
relógio do aparelho em 31 dias (o bloco 19 já faz isso) e ver se a Home ainda mostra doses.

⚠️ **Não confirmado em execução.** Pode haver um caminho que eu não encontrei.
