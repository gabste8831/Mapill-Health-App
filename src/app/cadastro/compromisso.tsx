import { useRouter } from "expo-router";

import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";

export default function CompromissoScreen() {
  const router = useRouter();

  return (
    <EmConstrucaoScreen
      icon="calendar-month"
      title="Novo compromisso"
      description="O cadastro de consultas, exames e renovação de receita ainda está sendo desenvolvido."
      onBack={() => router.back()}
    />
  );
}
