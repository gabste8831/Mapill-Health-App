# Como compilar e instalar no aparelho

> Movido de `docs/O-QUE-FALTA-TESTAR.md` para a skill em 25/09. O resto daquele arquivo era a
> lista de testes de 18/09, já superada.

**Dá para compilar aqui e instalar pelo cabo** - a máquina já tem tudo (JDK 21, SDK, NDK
27.1.12297006), e o EAS fica só para distribuir.

```powershell
# compila (3-4 min incremental)
$init = (Resolve-Path "gradle\cmake-do-windows.gradle").Path
.\android\gradlew.bat -p android assembleRelease -I $init

# instala
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
```

## ⚠️ O `expo run:android` não serve

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

## O resto do que importa

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
