# Captura o logcat do celular enquanto o alarme dispara.
#
# O `adb` nao esta no PATH nesta maquina - ele vive dentro do SDK do Android Studio, e por isso
# `adb logcat` responde "command not found". Este script acha o executavel sozinho.
#
# Como usar:
#   1. Ligue o celular no cabo USB, com a depuracao USB ativada
#      (Ajustes > Sobre o telefone > toque 7x em "Numero da versao" > Opcoes do desenvolvedor >
#       Depuracao USB). Na primeira vez o celular pergunta se autoriza este computador: aceite.
#   2. Rode:  powershell -ExecutionPolicy Bypass -File scripts\logcat-alarme.ps1
#   3. Espere o alarme tocar.
#   4. Ctrl+C para parar. O arquivo fica em docs/logcat-alarme.txt.
#
# O filtro pega o que importa para o defeito da tela azul: o Notifee (quem monta a tela cheia e o
# servico de som), as excecoes do Android, e qualquer linha do proprio app.

$ErrorActionPreference = "Stop"

$candidatos = @(
  "$env:ANDROID_HOME\platform-tools\adb.exe",
  "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
  "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe"
)

$adb = $candidatos | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $adb) {
  Write-Host "Nao achei o adb.exe. Procurei em:" -ForegroundColor Red
  $candidatos | ForEach-Object { Write-Host "  $_" }
  exit 1
}

Write-Host "adb: $adb" -ForegroundColor DarkGray

# `devices` lista o que esta conectado. Sem isto o logcat trava esperando um aparelho, sem dizer
# por que - e "esperando" e "nao autorizado" se parecem na tela.
$devices = & $adb devices | Select-Object -Skip 1 | Where-Object { $_.Trim() -ne "" }
if (-not $devices) {
  Write-Host ""
  Write-Host "Nenhum celular conectado." -ForegroundColor Red
  Write-Host "Confira: cabo USB (de dados, nao so de carga), depuracao USB ligada, e a" -ForegroundColor Yellow
  Write-Host "autorizacao que aparece na tela do celular na primeira conexao." -ForegroundColor Yellow
  exit 1
}

Write-Host "Conectado: $($devices -join ', ')" -ForegroundColor Green

$saida = Join-Path $PSScriptRoot "..\docs\logcat-alarme.txt"
$saida = [System.IO.Path]::GetFullPath($saida)

& $adb logcat -c
Write-Host ""
Write-Host "Capturando. DISPARE O ALARME AGORA." -ForegroundColor Cyan
Write-Host "Quando ele tocar (ou falhar), aperte Ctrl+C." -ForegroundColor Cyan
Write-Host "Salvando em: $saida" -ForegroundColor DarkGray
Write-Host ""

# `-v time` carimba a hora em cada linha: e o que permite alinhar o instante do disparo com o que
# apareceu (ou nao) na tela.
& $adb logcat -v time |
  Select-String -Pattern "Notifee|notifee|ForegroundService|AndroidRuntime|mapillapp|Mapill|FullScreen|fullScreen|Keyguard|MissingForegroundServiceType" |
  Tee-Object -FilePath $saida
