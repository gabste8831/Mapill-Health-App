import { useRouter } from "expo-router";

import { AjudaDeAlertasScreen } from "@/telas/AjudaDeAlertas/AjudaDeAlertasScreen";

/**
 * Fica **dentro** do grupo `cadastro`, e não como rota irmã na raiz.
 *
 * O grupo inteiro sobe como modal por cima das abas (ver `app/_layout.tsx`). Uma rota irmã na raiz
 * empilharia um segundo modal sobre o primeiro — que no Android é caminho conhecido para tela
 * travada, e foi justamente o que obrigou a ajuda a viver dobrada dentro do popup até agora. Aqui
 * ela é um `push` comum dentro do modal que já está aberto.
 */
export default function AjudaDeAlertasRoute() {
  const router = useRouter();

  return (
    <AjudaDeAlertasScreen
      onBack={() => router.back()}
      onAbrirTermos={() => router.push("/termos")}
    />
  );
}
