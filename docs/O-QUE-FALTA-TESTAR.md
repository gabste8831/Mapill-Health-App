# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

**Antes de qualquer teste de alarme: suba o volume de DESPERTADOR.** Mudou nesta build — o alarme
saía no de mídia até a anterior. Se nada tocar, confira esse volume antes de reportar falha.

---

## Na build de preview de 14/09

**Os cinco passos são nesta mesma build**, a 14ª do projeto. Ela tem o módulo de desbloqueio (que
os passos 1 e 3 exigem), o serviço de som (passo 4) e o bundle dentro do APK (passo 5). Não há mais
nada esperando outra build.

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

### 4. E.1 — 🔊 O som do alarme

Mudou quem toca: era o sistema, passou a ser o app, por um serviço que não depende de tela.
**Quatro cenários, e o som tem que sair nos quatro:**

| Cenário | O que esperar |
|---|---|
| Celular **bloqueado** | tela azul sobe **e** toca |
| Celular **em uso**, em outro app | a notificação chega **e toca** — era isto que falhava |
| App **fechado** (fora dos recentes) | toca do mesmo jeito |
| Volume de **mídia no zero**, despertador alto | toca — é a prova de que saiu pelo stream certo |

**Passa se:** sai som nos quatro, **no volume de despertador**.

**E o som tem que parar** em cada um destes: "Tomei", "Pulei", "Silenciar", "Adiar", "Responder
depois", e ao tocar na notificação (que leva à tela do horário). Som que continua depois de
respondido é o pior defeito possível aqui — se acontecer, me diga em qual botão.

> Confira também o **silencioso**: o alarme deve furar, o lembrete de dose **não**.

### 5. D.5 — A tela azul com o app fora dos recentes

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

## Decidido, não testado

**E.1 saiu daqui em 14/09** — virou o passo 4. O som passou a ser do app, tocado por um foreground
service no volume de despertador. O histórico da investigação — as duas builds gastas no canal, a
issue #297 fechada como *not planned*, e o teste que mostrou o alarme mudo com o celular em uso —
está no [anexo do roteiro](ROTEIRO-DE-TESTE.md).

> **Se o passo 4 passar, o artigo pode voltar a alegar que o alarme toca no silencioso.** Se
> falhar, o E.1 volta a ser trabalho futuro e a alegação precisa sair do texto.

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
