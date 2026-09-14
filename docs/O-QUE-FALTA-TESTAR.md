# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

**Antes de qualquer teste de alarme: deixe o volume de mídia alto.** O alarme ainda sai por ele.

---

## Na build de preview de 14/09

**Os quatro passos são nesta mesma build** — a de 14/09, commit `27a2a38`, a 14ª do projeto. Ela
tem o módulo de desbloqueio (que os passos 1 e 3 exigem) e o bundle dentro do APK (que o passo 4
exige). Não há mais nada esperando outra build.

### 1. C.1 — Entrar no app pela tela azul exige desbloqueio

Celular **bloqueado**, o alarme toca, a tela azul sobe.

**Passa se:**
- **"Tomei"**, **"Pulei"**, **silenciar** e **adiar** funcionam **sem pedir senha**, e o celular
  volta para o bloqueio depois — sem mostrar o app
- **"Ver e confirmar no app"** → o celular **pede a senha ou a biometria** antes de abrir
- **Cancelando a senha** → volta para a tela azul com o alarme ainda tocando, e o app não aparece

> Confira também com o celular **desbloqueado**: aí o botão abre o app direto, sem pedir nada.

### 2. C.2 — Apagar os dados tem que cancelar os alarmes

Adie um alarme e apague todos os dados de saúde antes dos 5 minutos.

**Passa se:** o alarme adiado **não toca**. Confira também que nenhuma dose da grade continua
agendada no Diagnóstico.

### 3. A tela azul não sobe com o celular em uso

Celular **desbloqueado**, usando outro app, e o alarme dispara. Toque na notificação.

**Passa se:** abre a tela **"Hora do remédio"**, e não a tela azul.

> Só vale nesta build: a decisão depende do módulo de desbloqueio, que é nativo. Nas anteriores a
> tela azul continua subindo, e isso não é a correção falhando.

### 4. D.5 — A tela azul com o app fora dos recentes

Tire o app dos recentes e espere o alarme. **Tente 4 vezes** — é defeito de corrida de tempo, e
"passou" e "passou nas 4 tentativas" não são a mesma informação.

**Passa se:** a tela azul sobe e fica, nas 4.

> É o passo que exigia a preview: numa build de development o JavaScript vem do Metro, e tirar o
> app dos recentes mata o processo. A tela piscar e parar lá era a carga não terminando, não o
> defeito. Aqui o bundle está dentro do APK, e o que se vir é o comportamento real.

---

## Validado em 14/09 — não precisa repetir

| # | O que era | Resultado |
|---|---|---|
| B.7 | 2 ou 3 remédios na tela azul | ✅ com os ajustes de layout do dia |
| B.8 | 4 ou mais: contagem e botão | ✅ |
| B.20 | 4 ou mais: nome e dose de cada | ✅ |
| B.4 | Alarme → notificação → alarme | ✅ nos dois sentidos |
| B.9 | Aviso de estoque às 00:01 | ✅ |
| B.17 | Tela azul com o app nos recentes | ✅ apareceu de primeira em todos os testes |

---

## Fora de escopo — vira "trabalhos futuros" no artigo

**E.1 — o alarme no volume de despertador, e o silêncio com o celular em uso.** São o mesmo
problema, e o teste de 14/09 (o antigo B.17b) mostrou que o segundo é pior que o primeiro: com o
celular em uso **o alarme não emite som nenhum** — canal sonoro, URI resolvida, todos os volumes
altos. Tocar na notificação abre a tela e aí o som sai, porque quem toca é a tela.

Descartados com evidência: canal mudo, volume baixo, notificação cancelada antes de tocar, versão
velha do canal, e `ongoing: true`. Sem causa provada — o que resta é o Android não tocar o som do
canal ao rebaixar uma notificação de tela cheia para heads-up, comportamento que a documentação
oficial não descreve.

**A correção não depende de descobrir a causa:** o app passa a tocar o próprio som. Falta um
**foreground service** para isso funcionar sem depender de a tela montar — e a biblioteca já expõe
o necessário (`registerForegroundService`), então não é código nativo novo. O patch do player está
pronto e **não registrado** em
[`plugins/som-do-alarme-em-despertador.js`](../plugins/som-do-alarme-em-despertador.js), com o que
falta escrito nele.

A metade difícil já está provada em aparelho: o app tocando o próprio som é o que acontece toda vez
que a tela azul sobe.

> **Enquanto isso, o artigo não pode alegar que o alarme toca no silencioso** — hoje ele sai no
> volume de mídia, o silencioso o corta, e com o celular em uso ele não toca.

**E.2 — o fuso.** Decidido, e o comportamento atual está certo: a dose segue o **instante**, então
21:00 em São Paulo toca às 20:00 em Manaus. Não é teste, é decisão.

---

## Como reportar

Só o que falhar, com o número do passo:

```
C.1 passou — voltou pro bloqueio
C.2 falhou — o alarme adiado tocou mesmo assim
resto ok
```

**No D.5, diga quantas vezes tentou.**
