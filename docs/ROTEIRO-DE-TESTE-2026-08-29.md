# Roteiro de teste — 29/08/2026

> Só o que **mudou** desde a sua revisão de 27/08. Os 22 achados daquele dia estão fechados
> ([`REVISAO-2026-08-27.md`](./REVISAO-2026-08-27.md)), e este documento é a conferência deles.
>
> **Curto de propósito: 8 blocos, 15 a 20 minutos.** A validação completa continua em
> [`ROTEIRO-DE-TESTE-EM-APARELHO.md`](./ROTEIRO-DE-TESTE-EM-APARELHO.md), para antes da defesa.
>
> Depois deste roteiro, o próximo passo é o [`ROTEIRO-DE-PRINTS.md`](./ROTEIRO-DE-PRINTS.md).

## Antes de começar

**Instale a build nova** (perfil `development`). Nada aqui funciona recarregando só o Metro: o
`_layout` e os hooks de abertura mudaram, e o bloco 1 depende exatamente disso.

```bash
npx expo start --dev-client
```

**Confirme em 5 segundos que é a versão certa:** abra o cadastro de um remédio, vá em
**"Definir horários"** e toque numa dose. Precisa abrir **dois campos numéricos grandes**. Se
aparecer o mostrador redondo, o JS é antigo — aperte `r` no terminal.

## Como reportar

Só o que falhar, com o número. `resto ok` para o restante.

🔴 marca o que existe para pegar um bug específico.

---

## 1 — Reabrir o app 🔴 (F7)

**O bloco mais importante do roteiro.** Era o app travado no fundo azul.

**1.1** Abra o app e espere chegar na Home.

**1.2** 🔴 Feche completamente: botão de recentes → **deslize o Mapill para fora**.

**1.3** 🔴 Abra de novo pelo ícone.

> ✅ 🔴 O app chega na **Home**. A tela azul da splash aparece e **sai sozinha**.
> ❌ Se ficar parado no azul, é o F7 de novo — avise, com o print.

**1.4** 🔴 Repita **três vezes seguidas**. Era intermitente, então uma vez não prova.

> ✅ As três vezes abrem normalmente.

---

## 2 — Relógio de digitação 🔴 (F1)

**2.1** **Remédios** → **+** → **Cadastro manual**. Nome `Teste Relogio`, **Comprimido**,
dose `1`, **Todo dia**, **2×**.

**2.2** Toque em **"Definir horários"** e depois na caixa da **1ª DOSE**.

> ✅ 🔴 Abrem **dois campos numéricos grandes**, com **HORA** e **MINUTO** embaixo.
> ✅ 🔴 **Não** aparece o mostrador redondo.
> ✅ Embaixo tem a frase "Formato de 24 horas — 20:00 é oito da noite."

**2.3** 🔴 Digite `20` no campo da hora.

> ✅ 🔴 Vira **20**, sem AM/PM em lugar nenhum.

**2.4** 🔴 Digite `99` na hora e toque fora do campo.

> ✅ 🔴 Vira **23**, e não um erro na tela.

**2.5** Digite `7` na hora e toque fora.

> ✅ Vira **07**.

**2.6** Defina `08:00` e `20:00` e toque em **"Pronto"**.

> ✅ O teclado fecha junto com o popup.
> ✅ As fichinhas mostram 08:00 e 20:00.

---

## 3 — Dependência entre campos 🔴 (F6)

**Este é o bug que você achou.** Ele salvava dose inválida no banco.

**3.1** Novo cadastro manual. Nome `Teste Dependencia`.

**3.2** Em **COMO VOCÊ TOMA?**, escolha **"Líquido (xarope, solução)"**, unidade **ml**.

**3.3** Na dose, digite **`7,5`**.

**3.4** 🔴 Agora **volte** em COMO VOCÊ TOMA e troque para **"Comprimido ou cápsula"**.

> ✅ 🔴 O campo de dose **fica vazio**. O `7,5` sumiu.
> ❌ Se o `7,5` continuar lá, é o F6 — comprimido não aceita fração, e antes isso salvava.

**3.5** 🔴 Digite `2` na dose e complete o cadastro com **"Prazo definido"**, `7` **dias**.

**3.6** 🔴 Troque para **"Uso contínuo"** e depois **volte** para **"Prazo definido"**.

> ✅ 🔴 O campo de dias está **vazio** — o `7` não voltou sozinho.

**3.7** Complete e salve.

---

## 4 — Compromisso vencido 🔴 (F5)

**Faça este bloco de tarde ou à noite**, senão o caso principal não acontece.

**4.1** **Calendário** → **+** → **"Cadastrar um compromisso"**. Descrição `Consulta de hoje`.

**4.2** Em **DATA**, olhe primeiro o layout.

> ✅ 🔴 **DATA** e **HORÁRIO** estão em **linhas separadas**, cada um com largura inteira.

**4.3** 🔴 Coloque a data de **hoje** e o horário de **uma hora atrás** (ex: são 15h, ponha 08:00).

> ✅ 🔴 Aparece o aviso de que o compromisso já passou.
> ✅ 🔴 A seção **LEMBRETES some por completo**.
> ❌ Se LEMBRETES continuar lá, é o F5 — antes ele salvava um lembrete para um horário vencido.

**4.4** 🔴 Agora troque o horário para **daqui a 3 horas**.

> ✅ 🔴 A seção **LEMBRETES volta a aparecer**.

**4.5** 🔴 Configure o lembrete (**Sim**, **Sim** no dia). Depois **volte a data para ontem**.

> ✅ 🔴 Além do aviso de que já passou, aparece uma segunda frase dizendo que **o lembrete
> configurado foi descartado**.

**4.6** Salve e confira que ele aparece no calendário, no dia de ontem.

---

## 5 — Dose "É AGORA" 🔴 (X11)

**5.1** 🔴 Cadastre um remédio com horário **para daqui a 2 minutos**. Dose `1`, estoque `10`.

**5.2** Espere o horário chegar e vá na **Home**.

> ✅ 🔴 A dose aparece em **verde**, com o rótulo **É AGORA**.
> ✅ Os botões Confirmar e Pular estão disponíveis.

**5.3** 🔴 Espere passar de **30 minutos** do horário (ou cadastre outro para conferir depois).

> ✅ 🔴 Aí sim ela fica **vermelha**, com **ATRASADA**.

**5.4** Olhe uma dose de mais tarde no mesmo dia.

> ✅ Fica em azul (**PRÓXIMA DOSE**) ou cinza (**A SEGUIR**).

---

## 6 — Acordeão e termos 🔴 (F3, F4)

**6.1** Num cadastro, abra **"Configurar lembrete"**.

> ✅ 🔴 **Alarme** e **Notificação** dividem a primeira linha; **Os dois** ocupa a **linha inteira**
> embaixo deles.

**6.2** 🔴 Abra **"Como funcionam os alertas"** e role até o fim.

> ✅ 🔴 O scroll desce **e sobe** normalmente.
> ❌ Se descer e não subir mais, é o F3.

**6.3** 🔴 Toque em **"Ler os Termos de Uso completos"** e depois volte.

> ✅ 🔴 Você volta **para o popup de lembrete**, com a ajuda **ainda aberta** — e não para o
> formulário nu.
> ✅ O cadastro continua preenchido.

**6.4** 🔴 Olhe o botão no fim do popup.

> ✅ 🔴 Ele **não está colado** na base da tela — tem respiro embaixo.

---

## 7 — Anexos e dicas (X3, X2)

**7.1** Num cadastro, escolha **"Líquido (xarope, solução)"**.

> ✅ 🔴 A dica do copinho tem fundo **amarelo claro** com uma **barra amarela viva** à esquerda —
> não mais o marrom.

**7.2** 🔴 Vá na seção **ANEXOS**, no rótulo **RECEITA MÉDICA**, e toque no quadrado.

> ✅ 🔴 Abre um popup com **três** opções: **Tirar foto agora**, **Escolher da galeria** e
> **Escolher arquivo**.
> ✅ 🔴 Fora do quadrado há um único rótulo: **"Adicionar arquivo"** — e não mais dois links.

**7.3** Escolha **"Tirar foto agora"**.

> ✅ Abre a câmera e a foto aparece no quadrado.

**7.4** 🔴 Toque em **"Alterar anexo"** e escolha **"Escolher arquivo"**, com um PDF.

> ✅ Troca para o ícone de PDF, com o nome do arquivo.

---

## 8 — Calendário e textos (X8, X9, X1, X6, X7)

**8.1** 🔴 Vá na aba **Calendário** e **role a lista para baixo**.

> ✅ 🔴 A **grade do mês sobe junto** e sai da tela.
> ✅ 🔴 A fileira de filtros (**Tudo / Compromissos / Remédios**) **gruda no topo** e fica visível.

**8.2** Toque num dia **vazio**.

> ✅ 🔴 "Nada marcado para este dia." tem **espaço em volta**, sem estar colado no título.

**8.3** Vá em **Ajustes**.

> ✅ 🔴 A linha "Conta e dados" tem **ícone de pessoa**, e não o logo do Google.
> ✅ Se você tem conta vinculada, o subtítulo é o seu e-mail; senão, "Gerencie aqui sua conta,
> dados e sincronizações".

**8.4** Vá em **Remédios** e role até o botão de estoque.

> ✅ 🔴 Diz **"Gerenciar estoques"**, sem o "dos medicamentos".

**8.5** Vá na **Home**, no card de Estoque.

> ✅ 🔴 O subtítulo termina com **"toque para gerenciar"**.

---

## Se algo falhar

Manda a lista com o número do passo e o que apareceu. Eu corrijo, você recarrega o Metro (`r`) e
reconfere só aquele passo.

Passando tudo, seguimos para o [`ROTEIRO-DE-PRINTS.md`](./ROTEIRO-DE-PRINTS.md).
