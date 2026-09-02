/**
 * Ponto de entrada do app.
 *
 * **Existe só para registrar a tela de alarme antes do roteador subir.**
 *
 * O `expo-router/entry` continua sendo quem monta o app inteiro — o `import` no fim deste arquivo é
 * exatamente o que o `package.json` apontava antes. O que muda é que, antes dele, o componente de
 * alarme é registrado no `AppRegistry` com um nome próprio.
 *
 * A razão é como o Notifee abre a tela cheia: ele não navega para uma rota, porque no momento em
 * que o alarme dispara o app pode nem estar rodando. Ele pede ao Android para montar um componente
 * React **avulso**, pelo nome, por cima da tela de bloqueio. Esse nome precisa estar registrado
 * antes de qualquer coisa acontecer — inclusive antes de existir navegação.
 *
 * É também por isso que `AlarmeScreen` não é uma rota do `app/`: ela vive fora da árvore de
 * navegação, e é a única tela do projeto assim.
 */

import { AppRegistry } from "react-native";

import { COMPONENTE_DE_ALARME } from "./src/notifications/alarme-em-tela-cheia";
import { AlarmeRaiz } from "./src/telas/Alarme/AlarmeRaiz";

AppRegistry.registerComponent(COMPONENTE_DE_ALARME, () => AlarmeRaiz);

import "expo-router/entry";
