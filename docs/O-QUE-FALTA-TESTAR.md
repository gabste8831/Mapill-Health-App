# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O que já passou - e o que cada defeito ensinou - está no
> [`HISTORICO-DE-PROGRESSO.md`](HISTORICO-DE-PROGRESSO.md). Os passos escritos para executar em
> aparelho estão no [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

---

> **Atualizado em 18/09, tarde.** O módulo do alarme fechou em 16/09 e saiu desta lista - seis
> cenários validados em aparelho, com a tela do alarme em Activity própria.
>
> **A build com as correções de UI está instalada no aparelho** (seção 1). O que falta agora é
> percorrer a seção 2 com o app na mão - nada ali foi visto ainda.

---

## 1. ✅ A build - feita e instalada em 18/09

**Compilada às 09:39** (`BUILD SUCCESSFUL in 3m 41s`) e **instalada no aparelho às 16:39**, sobre a
instalação de 15/09 - a assinatura bateu, então o `install -r` atualizou sem apagar nada e os dados
de teste continuam lá.

Conferido dentro do APK, para não testar build velha por engano: os textos novos do ciclo estão no
bundle e os quatro antigos sumiram; a `AlarmeActivity` está no manifest com `showWhenLocked`; as
duas activities com `adjustResize`; os patches do `expo-audio` conferidos antes de compilar.

> O que isso prova é que **o código correto está dentro do APK**. Se as correções resolvem o que
> aparecia na tela - principalmente o salto do relógio - é o que os itens abaixo vão dizer.

O comando, se precisar refazer, está na [seção 5](#5-como-compilar-e-instalar). **Não é o
`expo run:android`** - ver o aviso lá.

---

## 2. 📱 O que testar nesta build

### 2.1 O relógio de horário - **o item de maior incerteza**

O Gabriel relatou que o relógio "fica meio bugado ao abrir". A causa apurada foi o `Host` do
Jetpack Compose, que mede **depois** de montar: dentro de um popup ainda animando, o primeiro quadro
tem altura indefinida e o relógio aparece espremido antes de saltar para o tamanho certo.

Corrigido com uma altura mínima reservada desde o primeiro quadro - mas **isso foi deduzido do
código, não medido**. É o que mais precisa de confirmação.

> ✅ Abrir o relógio pelo ícone, no cadastro de **medicamento** e no de **compromisso**, algumas
> vezes seguidas. Ele deve aparecer já no tamanho final, sem espremer nem saltar.

Saíram junto duas props (`variant`, `showVariantToggle`) que o Android ignora para hora - elas
prometiam um popup em modo digitação e um botão de alternar que nunca existiram. O mostrador redondo
é o único modo, e quem prefere digitar usa o campo ao lado.

### 2.2 Teclado no Calendário

Era a única tela do app sem saída de teclado. Fechar o popup de revisão com o teclado ainda subindo
deixava-o sobre a grade, e o primeiro toque num dia era gasto só dispensando-o.

> ✅ Abrir o popup de revisão, digitar na observação, fechar o popup e tocar direto num dia do
> calendário. O dia deve ser selecionado **no primeiro toque**.

### 2.3 O popup de contato de emergência (Ficha de Saúde)

Os campos dentro do popup mandavam rolar a tela **de trás**: o campo em foco não se mexia e o fundo
deslizava sozinho.

> ✅ Abrir "Novo contato de emergência" e tocar em Nome, Telefone e Vínculo. Nada atrás do popup
> deve se mover.

### 2.4 Os rótulos do ciclo ("a cada X dias")

Não é defeito, é legibilidade: o primeiro campo pede a **volta completa** (uso + pausa), e o rótulo
antigo sugeria intervalo entre doses. O placeholder dava dois exemplos de categorias opostas - 30 na
injeção **é** o intervalo, 28 na cartela é uma soma que ninguém tem na mão.

> ✅ Cadastrar um anticoncepcional de cartela (28 / 21) e conferir se os rótulos levam ao número
> certo sem precisar adivinhar. A frase final em datas reais é a prova: *"Você toma até X, faz a
> pausa, e recomeça em Y."*

---

## 3. ⏳ Pontas soltas

### 3.1 O som para nos quatro botões restantes

"Silenciar" e o toque na notificação já foram confirmados em 15/09. Faltam **"Tomei", "Pulei",
"Adiar" e "Responder depois"**.

Som que continua depois de respondido é o pior defeito possível aqui.

### 3.2 Os dois achados de teclado que dependem de aparelho

Levantados por leitura de código em 18/09 e **deixados de fora de propósito** - mexer neles às cegas
tem chance real de piorar o que hoje funciona. Só valem correção com sintoma medido.

| O que é | Onde | O sintoma a procurar |
|---|---|---|
| `behavior="height"` do `KeyboardAvoidingView` empilhado com o `adjustResize` do manifest - dois encolhimentos sobre a mesma janela | `src/ui/KeyboardAwareScrollView/` | faixa morta no fim de um formulário longo, ou o scroll parando antes do fim com o teclado aberto |
| A barra de abas do `NativeTabs` provavelmente sobe junto com o teclado, comendo ~60dp | `src/app/(abas)/_layout.tsx` | busca em Remédios e popup do Calendário ficando apertados |

Se o scroll travar em formulário longo, o primeiro é o suspeito nº 1 e a correção é de uma linha.

### 3.3 Autoscroll dentro dos popups

Nenhum popup traz o campo em foco para a área visível. Irrelevante nos curtos; no seletor de
horários com **5 ou 6 doses**, focar a quinta pode deixá-la atrás do teclado.

Não foi corrigido porque exigiria expor `ref` e `onScroll` no `BottomSheet`, que serve todos os
popups do app - trabalho estrutural para um caso que ainda não foi visto.

> ✅ Cadastrar um remédio com 6 doses e variação de dose ativa, e tocar nos últimos campos.

### 3.4 A build preview do EAS

Para a validação final. **A cota reseta em 01/10.**

---

## 4. ✅ Decidido, não testado

**E.2 - o fuso.** O comportamento atual está certo: a dose segue o **instante**, então 21:00 em São
Paulo toca às 20:00 em Manaus. Não é teste, é decisão.

---

## 5. Como compilar e instalar

**Dá para compilar aqui e instalar pelo cabo** - a máquina já tem tudo (JDK 21, SDK, NDK
27.1.12297006), e o EAS fica só para distribuir.

```powershell
# compila (3-4 min incremental)
$init = (Resolve-Path "gradle\cmake-do-windows.gradle").Path
.\android\gradlew.bat -p android assembleRelease -I $init

# instala
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
```

### ⚠️ O `expo run:android` não serve

Ele chama o Gradle por conta própria e **não passa o `-I`** - então o init script que força o CMake
3.31 não vale, e a build morre no loop `ninja: error: manifest 'build.ninja' still dirty after 100
tries`, em `expo-modules-core` e `react-native-reanimated`.

Só aparece quando o `android/` é recriado do zero (um `prebuild`); com a pasta já compilada o
problema fica escondido.

**O caminho do `-I` precisa ser absoluto.** Relativo, o Gradle o resolve contra o `-p android` e
procura em `android/gradle/`.

**Se o `android/` for recriado**, rodar `node scripts/aplicar-patches.js` antes: é o prebuild que
aplica os patches do `expo-audio`, e sem eles o alarme volta ao volume de mídia sem nada no log
denunciando.

### O resto do que importa

- **`--variant release` é essencial.** Em debug o JavaScript vem do Metro e o arranque do processo
  muda - justamente o que os passos do alarme medem. Release embute o bundle, como a preview.
- **A primeira compilação demora** (20-40 min, baixando o Gradle). As seguintes ficam em 2-5 min.
- A assinatura difere da do EAS, então pode ser preciso **desinstalar o app antes**. O
  `adb install -r` costuma preservar os dados; se recusar por assinatura, os dados de teste se perdem.
- O Gradle precisa do `android/local.properties` apontando o SDK, e o CMake 3.22.1 (padrão do AGP)
  trava num loop de `Re-running CMake` no Windows - o 3.31.0 pelo `sdkmanager` resolve.

Para ler o que o aparelho faz no disparo:

```
powershell -ExecutionPolicy Bypass -File scripts\logcat-alarme.ps1
```

O `adb` está na máquina mas **fora do PATH** - o script o encontra sozinho.

---

## 6. Como reportar

Só o que falhar, com o número do item:

```
2.1 falhou - o relogio ainda salta ao abrir
2.3 ok
3.1 - o som continuou depois do "Pulei"
resto ok
```
