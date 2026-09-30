# Ajustes de conteúdo: o que falta trocar

> **Conferido em 30/09, 17:25**, contra `TCC Gabriel Steffens Atualizado 29_09.docx.pdf` (89
> páginas). Das 36 trocas da primeira rodada, 32 entraram (alarme, ações da notificação, contagens,
> anexos, exclusão, LWW, estoque, autorrelato, método da validação e fechamento da conclusão). Aqui
> fica só o que falta, com o **texto atual** (para achar com Ctrl+F) e o **texto novo**.
>
> O bloco 2 é novo: cinco pontos rápidos em que o texto ainda contradiz o código ou afirma sem fonte,
> que não estavam na primeira rodada.

---

## Bloco 1. Resumo e abstract

### 1.1 Resumo, última frase (p.7). Recomendado

A conclusão (capítulo 6) agora diz que o efeito sobre a carga cognitiva ainda precisa ser
verificado com usuários. O resumo continua afirmando esse efeito e a "simplicidade de uso" como
resultado. Quem ler o resumo e depois a conclusão encontra as duas versões. A troca abaixo mantém a
frase quase igual.

Atual:
> Conclui-se que é possível conciliar, em uma mesma aplicação, o funcionamento independente de
> conexão, a fidelidade do registro clínico e a simplicidade de uso, transferindo ao aparelho parte
> da carga cognitiva que a rotina terapêutica impõe ao paciente.

Novo:
> Conclui-se que é possível conciliar, em uma mesma aplicação, o funcionamento independente de
> conexão e a fidelidade do registro clínico, com o propósito de transferir ao aparelho parte da
> carga cognitiva que a rotina terapêutica impõe ao paciente.

### 1.2 Abstract (p.8). O abstract é a tradução do resumo e precisa acompanhá-lo

**a) A frase da validação.** O resumo já diz "conduzida pelo autor em aparelho físico, com um
segundo dispositivo simulado pela base remota", e o abstract ainda não.

Atual:
> The technical validation, conducted on a physical device, confirmed

Novo:
> The technical validation, conducted by the author on a physical device, with a second device
> simulated through the remote database, confirmed

**b) A última frase** (acompanha o item 1.1).

Atual:
> It is concluded that it is possible to reconcile, in a single application, operation independent
> of connection, fidelity of the clinical record and simplicity of use, transferring to the device
> part of the cognitive load that the therapeutic routine imposes on the patient.

Novo:
> It is concluded that it is possible to reconcile, in a single application, operation independent
> of connection and fidelity of the clinical record, with the purpose of transferring to the device
> part of the cognitive load that the therapeutic routine imposes on the patient.

### 1.3 Opcional: o alarme após reiniciar, no resumo

Não é incorreto deixar de fora: o resumo não afirma nada falso sobre o alarme. Se quiser incluir,
acrescentar ao fim da frase "O alarme de dose foi verificado com o aparelho bloqueado e em uso, com
a aplicação presente ou ausente da lista de recentes", antes do ponto:

> , e a entrega após a reinicialização mostrou-se dependente da restrição de inicialização
> automática imposta pelo fabricante

E no abstract, no mesmo lugar: ", and delivery after a restart proved dependent on the autostart
restriction imposed by the manufacturer".

---

## Bloco 2. Pontos rápidos que ficaram de fora da primeira rodada

### 2.1 Segurança: o "filtro duplo" (p.56, seção 4.4.6, fim)

No código, o identificador do usuário é enviado em cada gravação e em cada exclusão, e a política
do servidor confere. No **recebimento**, porém, a aplicação não repete o filtro: quem isola os dados
é só a política de segurança em nível de linha. O texto diz que o filtro é repetido em toda operação.

Atual:
> restringindo toda operação de leitura, inserção e atualização ao proprietário do registro,
> identificado pelo token de autenticação do usuário. Essa redundância é deliberada. Ainda que a
> política de segurança em nível de linha já seja suficiente para garantir o isolamento dos dados, a
> aplicação repete o filtro por identificador de usuário como uma segunda camada independente de
> verificação, de modo que as duas camadas precisam concordar entre si para que uma operação seja
> concluída.

Novo:
> restringindo toda operação de leitura, inserção, atualização e exclusão ao proprietário do
> registro, identificado pelo token de autenticação do usuário. Nas gravações e nas exclusões, a
> aplicação também informa o identificador do usuário, e a operação só é aceita quando ele coincide
> com o do token, o que acrescenta uma segunda verificação. No recebimento, o isolamento fica a cargo
> exclusivamente da política de segurança em nível de linha.

### 2.2 Imutabilidade absoluta (p.57, seção 4.4.7)

O registro corrigido não é alterado, mas é apagado quando o titular pede a exclusão de todos os
seus dados (seção 4.3.5). O "nunca" contradiz a própria 4.3.5.

Atual:
> O registro anterior nunca é alterado nem removido.

Novo:
> O registro anterior não é alterado nem removido pela correção, e só deixa de existir quando o
> titular solicita a exclusão de todos os seus dados, conforme a seção 4.3.5.

### 2.3 RLS não é anonimização (p.36, seção 2.9.2, fim)

RLS é controle de acesso. Não anonimiza nada, e a LGPD não exige RLS especificamente. O que ela
exige são medidas de segurança contra acesso não autorizado.

Atual:
> Essa arquitetura é um requisito indispensável para atender às diretrizes de privacidade e
> anonimização exigidas pela Lei Geral de Proteção de Dados (Brasil, 2018).

Novo:
> Esse isolamento atende à exigência da Lei Geral de Proteção de Dados (Brasil, 2018) de que o
> controlador adote medidas técnicas capazes de proteger os dados pessoais de acessos não
> autorizados.

### 2.4 Autostart, afirmação categórica sem fonte (p.82, seção 5.3)

Atual:
> Não há interface de programação que permita consultar ou conceder essa permissão.

Novo:
> O Android não oferece uma interface de programação padronizada para consultar ou conceder essa
> permissão, que cada fabricante implementa de forma própria.

### 2.5 Alarme: quatro combinações anunciadas, duas relatadas (p.82, seção 5.3)

O texto diz que o alarme foi verificado em quatro combinações (bloqueado ou em uso, com o app
presente ou ausente dos recentes), mas só descreve o bloqueado e o em uso. Acrescentar depois de
"...e o toque levou à tela correspondente.":

> Nas duas situações, o comportamento foi o mesmo com a aplicação presente ou ausente da lista de
> recentes.

**Confira antes de colar** que foi isso que você observou nos testes. Se em alguma combinação o
resultado foi diferente, me diga qual, que eu reescrevo a frase.

---

## Bloco 3. Aprofundamento (se sobrar tempo)

Não contradizem o app, mas a revisão crítica apontou como frágeis. Detalhes e perguntas em
[`REVISAO-CRITICA.md`](REVISAO-CRITICA.md). Eu escrevo o texto novo de cada um quando quiser atacar.

- **p.19 e 20:** a WHO (2003) descreve a não adesão como multidimensional, e o trabalho ataca o
  esquecimento e a logística sem delimitar isso. "Raramente é negligência intencional" não tem
  fonte.
- **p.16 e 19:** nenhuma fonte mostra que lembretes digitais melhoram a adesão, que é a premissa do
  trabalho.
- **p.20:** Sweller (1988) trata de aprendizagem e resolução de problemas. A ligação com o paciente
  precisa ser dita como analogia.
- **p.23:** Bates et al. (2003) trata de apoio à decisão para médicos, e "reduz drasticamente as
  taxas de omissão" e "fadiga de tratamento" estão sem fonte.
- **p.40 a 42:** as páginas oficiais do Medisafe e do MyTherapy, que sustentam o Quadro 2, não estão
  nas referências.
- **Estilo:** "garante" e variações ainda aparecem com frequência, assim como "nunca". Vale uma
  passada nos absolutos.
