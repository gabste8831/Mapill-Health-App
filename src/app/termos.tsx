import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import type { ConsentRecord } from "@/domain/entities/consent";
import { ConsentRepository } from "@/data/repositories/consent-repository";
import { TermosScreen } from "@/telas/Termos/TermosScreen";

export default function TermosRoute() {
  const router = useRouter();
  const [consent, setConsent] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    new ConsentRepository().getCurrent().then(setConsent);
  }, []);

  return (
    <TermosScreen
      acceptedVersion={consent?.termsVersion ?? null}
      acceptedAt={consent?.acceptedAt ?? null}
      onBack={() => router.back()}
    />
  );
}
