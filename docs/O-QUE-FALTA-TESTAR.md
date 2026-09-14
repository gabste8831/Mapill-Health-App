# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

**Antes de qualquer teste de alarme: deixe o volume de mídia alto.** O alarme ainda sai por ele.

---

## Agora, na build que já está no aparelho

Nada aqui precisa de build nova.

### 1. B.7 — Dois ou três remédios no mesmo horário

Cadastre 2 ou 3 remédios no mesmo horário e espere o alarme.

**Passa se:** a tela azul lista cada um, com nome e dose, legível sem rolar.

### 2. B.8 — Quatro ou mais no mesmo horário

Mesma coisa, com 4 ou mais.

**Passa se:** a tela azul mostra a contagem e o botão de abrir o app.

### 3. B.20 — Nome e dose com quatro ou mais

No mesmo cenário do B.8, olhe o conteúdo da lista.

**Passa se:** aparece nome e dose de cada remédio.

### 4. B.4 — Trocar de alarme para notificação e voltar

Alarme → editar para notificação → salvar → voltar para alarme.

**Passa se:** a tela azul sobe nas duas vezes.

### 5. B.17b — O som com o celular em uso

Celular **desbloqueado**, usando outro app, e o alarme dispara. A tela cheia não aparecer aqui é o
esperado — o que se mede é o som.

**Passa se:** chega a notificação **com som em loop**.

---

## Depois, numa build de development nova

Preciso implementar antes. A build é uma só, para os dois.

### 6. C.1 — Entrar no app pela tela azul exige desbloqueio

Celular **bloqueado**, o alarme toca, a tela azul sobe.

**Passa se:**
- **"Tomei"**, **"Pulei"**, **silenciar** e **adiar** funcionam **sem pedir senha**, e o celular
  volta para o bloqueio depois — sem mostrar o app
- **"Ver e confirmar no app"** → o celular **pede a senha ou a biometria** antes de abrir
- **Cancelando a senha** → volta para a tela azul com o alarme ainda tocando, e o app não aparece

> Confira também com o celular **desbloqueado**: aí o botão abre o app direto, sem pedir nada.

### 7. C.2 — Apagar os dados tem que cancelar os alarmes

Adie um alarme e apague todos os dados de saúde antes dos 5 minutos.

**Passa se:** o alarme adiado **não toca**. Confira também que nenhuma dose da grade continua
agendada no Diagnóstico.

---

## Por último, numa build de preview

### 8. D.5 — A tela azul com o app fora dos recentes

Tire o app dos recentes e espere o alarme. **Tente 4 vezes** — é defeito de corrida de tempo, e
"passou" e "passou nas 4 tentativas" não são a mesma informação.

**Passa se:** a tela azul sobe e fica, nas 4.

> Só vale na preview: numa build de development o JavaScript vem do Metro, e tirar o app dos
> recentes mata o processo. A tela piscar e parar aqui é a carga não terminando, não o defeito.

---

## Fora de escopo — vira "trabalhos futuros" no artigo

**E.1 — o alarme no volume de despertador.** Sai no volume de mídia. É a única característica
sabidamente incompleta. A causa está medida e o caminho de correção descrito no
[anexo do roteiro](ROTEIRO-DE-TESTE.md#anexo--as-decisoes-de-1309-sobre-alarme-e-fuso), no fim
do arquivo.

> **Tentado de novo em 14/09, e parado antes da build — o caminho "canal mudo" está incompleto.**
>
> O plano era silenciar o canal e deixar a tela tocar, com `USAGE_ALARM` no player. O patch ficou
> pronto ([`plugins/som-do-alarme-em-despertador.js`](../plugins/som-do-alarme-em-despertador.js),
> **não registrado** no `app.json`), e a revisão do código mostrou que ele abre um buraco pior:
>
> Com o **app fechado e o celular em uso** — o caso mais comum do dia —, o Android rebaixa a tela
> cheia e o processo está morto, então nem a Activity nem a rota montam a tela. Sem som no canal,
> **ninguém toca nada**. Hoje esse caso é coberto pelo `loopSound` do canal, que some junto.
>
> Falta um **foreground service** para tocar o som sem depender de tela nem de processo vivo — que
> é o que os requisitos do Play descrevem para apps de alarme. A biblioteca já expõe o necessário
> (`registerForegroundService`), então não é código nativo novo, mas é mudança no núcleo do alarme.
>
> **Enquanto isso, o artigo não pode alegar que o alarme toca no silencioso** — hoje ele sai no
> volume de mídia e o silencioso o corta.

**E.2 — o fuso.** Decidido, e o comportamento atual está certo: a dose segue o **instante**, então
21:00 em São Paulo toca às 20:00 em Manaus. Não é teste, é decisão.

---

## Como reportar

Só o que falhar, com o número do passo:

```
B.7 falhou — o local do remedio nao apareceu na tela azul
C.1 passou — voltou pro bloqueio
resto ok
```

**No D.5, diga quantas vezes tentou.**
