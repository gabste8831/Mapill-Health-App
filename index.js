/**
 * Ponto de entrada do app.
 *
 * **Existe para registrar duas coisas antes de o roteador subir**, e as duas pelo mesmo motivo: no
 * instante em que um aviso dispara, o app pode nem estar rodando.
 *
 * O `expo-router/entry` continua sendo quem monta o app inteiro — o `import` no fim deste arquivo é
 * exatamente o que o `package.json` apontava antes.
 *
 * ## 1. A tela de alarme
 *
 * O Notifee não navega para uma rota ao abrir a tela cheia: ele pede ao Android para montar um
 * componente React **avulso**, pelo nome, por cima da tela de bloqueio. Esse nome precisa estar
 * registrado antes de qualquer coisa acontecer — inclusive antes de existir navegação.
 *
 * É também por isso que `AlarmeScreen` não é uma rota do `app/`: ela vive fora da árvore de
 * navegação, e é a única tela do projeto assim.
 *
 * ## 2. O handler de segundo plano
 *
 * É ele que grava a dose quando alguém toca em "Tomei" com o celular bloqueado. Precisa ser
 * registrado **fora do ciclo de vida do React**: com o app fechado não há componente montado para
 * assinar nada, e registrá-lo dentro de um `useEffect` faria o botão não funcionar exatamente no
 * caso mais comum — que é para o que o alarme existe.
 *
 * Foi o que a unificação em torno do Notifee destravou. Enquanto o `expo-notifications` cuidava dos
 * lembretes, a resposta dependia de `getLastNotificationResponseAsync` no bootstrap, isto é, de a
 * pessoa **abrir o app** para o toque ser processado. Para um botão que promete não abrir o app,
 * isso não era detalhe: era a promessa.
 */

import { AppRegistry } from "react-native";

import { registrarEventosEmSegundoPlano } from "./src/notifications/escutar-avisos";
import { COMPONENTE_DE_ALARME } from "./src/notifications/canais-notifee";
import { AlarmeRaiz } from "./src/telas/Alarme/AlarmeRaiz";

AppRegistry.registerComponent(COMPONENTE_DE_ALARME, () => AlarmeRaiz);
registrarEventosEmSegundoPlano();

import "expo-router/entry";
