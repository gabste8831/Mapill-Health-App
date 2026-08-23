import { useRouter } from "expo-router";

import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";

export default function CalendarioScreen() {
  const router = useRouter();

  return (
    <EmConstrucaoScreen
      icon="calendar-month"
      title="Calendário"
      description="A agenda de consultas, exames e renovação de receita ainda está sendo desenvolvida."
      // Aba, mas com retorno: quem entrou aqui por engano espera desfazer isso pelo mesmo gesto
      // que usa no resto do app, em vez de ter que caçar a aba anterior na barra.
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
    />
  );
}
