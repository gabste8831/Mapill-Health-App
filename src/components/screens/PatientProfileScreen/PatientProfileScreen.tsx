import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";
import { Button, Card, Chip, IconButton, SelectField, TextField, type SelectOption } from "@/components/ui";
import type { BiologicalSex, BloodType, EmergencyContact } from "@/domain/entities/patient-profile";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { colors } from "@/shared/theme";
import { styles } from "./PatientProfileScreen.styles";

const BLOOD_TYPE_OPTIONS: SelectOption<NonNullable<BloodType>>[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const BIOLOGICAL_SEX_OPTIONS: SelectOption<NonNullable<BiologicalSex>>[] = [
  { value: "female", label: "Feminino" },
  { value: "male", label: "Masculino" },
  { value: "intersex", label: "Intersexo" },
];

export type PatientProfileDraft = {
  firstName: string;
  lastName: string;
  /** ISO 8601 (`YYYY-MM-DD`) — convertido a partir do input `DD/MM/AAAA` da tela. */
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  bloodType: BloodType;
  allergies: string[];
  emergencyContact: EmergencyContact | null;
  notes: string | null;
};

type PatientProfileScreenProps = {
  /** Só chamado com nome, sobrenome e data de nascimento válidos preenchidos. */
  onContinue: (draft: PatientProfileDraft) => void;
  /** "Preencher depois": não salva nada agora, o paciente completa a ficha em Configurações. */
  onSkip: () => void;
};

/** Aceita só dígitos e insere as barras conforme o paciente digita — sem depender de libs de máscara. */
function formatDateOfBirthInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
  // Deleção: se o usuário está apagando, não força a barra de volta.
  if (rawValue.length < previousValue.length) return rawValue;

  const day = digitsOnly.slice(0, 2);
  const month = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4, 8);

  if (digitsOnly.length <= 2) return day;
  if (digitsOnly.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
}

/** `DD/MM/AAAA` plausível (dia/mês válidos, ano de 1900 até hoje) → ISO `YYYY-MM-DD`, ou `null` se inválida. */
function parseDateOfBirth(displayValue: string): string | null {
  const match = displayValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const currentYear = new Date().getFullYear();
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > currentYear) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const isRealCalendarDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealCalendarDate || date > new Date()) return null;

  return `${yearText}-${monthText}-${dayText}`;
}

// Todo o resto além de nome/sobrenome/nascimento é opcional de propósito — é uma "fichinha
// médica auxiliar" que o paciente preenche no próprio ritmo, nunca um formulário que bloqueia
// o uso do app.
export function PatientProfileScreen({ onContinue, onSkip }: PatientProfileScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirthInput, setDateOfBirthInput] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>(null);
  const [bloodType, setBloodType] = useState<BloodType>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");
  const [notes, setNotes] = useState("");

  const dateOfBirthIso = useMemo(() => parseDateOfBirth(dateOfBirthInput), [dateOfBirthInput]);
  const hasDateOfBirthError = dateOfBirthInput.length === 10 && dateOfBirthIso === null;

  // Grupo opcional como um todo, mas se o paciente começar a preencher, não faz sentido salvar
  // um contato pela metade (ex: telefone sem nome de quem atende) — então vira obrigatório
  // completar os três assim que qualquer um deles for tocado.
  const hasAnyEmergencyContactField =
    emergencyContactName.trim().length > 0 ||
    emergencyContactPhone.trim().length > 0 ||
    emergencyContactRelationship.trim().length > 0;
  const isEmergencyContactComplete =
    emergencyContactName.trim().length > 0 &&
    emergencyContactPhone.trim().length > 0 &&
    emergencyContactRelationship.trim().length > 0;
  const hasEmergencyContactError = hasAnyEmergencyContactField && !isEmergencyContactComplete;

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dateOfBirthIso !== null &&
    !hasEmergencyContactError;

  function addAllergy() {
    const value = allergyDraft.trim();
    if (value.length === 0) return;
    setAllergies((current) => [...current, value]);
    setAllergyDraft("");
  }

  function removeAllergy(index: number) {
    setAllergies((current) => current.filter((_, i) => i !== index));
  }

  function handleContinue() {
    if (!canContinue || dateOfBirthIso === null) return;
    onContinue({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirthIso,
      biologicalSex,
      bloodType,
      allergies,
      emergencyContact: isEmergencyContactComplete
        ? {
            name: emergencyContactName.trim(),
            phone: emergencyContactPhone.trim(),
            relationship: emergencyContactRelationship.trim(),
          }
        : null,
      notes: notes.trim().length > 0 ? notes.trim() : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.title}>Sua ficha de saúde</Text>
          <Text style={styles.subtitle}>Nome, sobrenome e nascimento são obrigatórios.</Text>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.onSecondaryContainer} />
          <Text style={styles.infoBannerText}>Fica só no seu dispositivo, a menos que você faça login.</Text>
        </View>

        <View style={styles.photoRow}>
          {/* TODO: integrar expo-image-picker quando formos anexar foto de verdade. */}
          <Pressable style={styles.photoPlaceholder} accessibilityRole="button" accessibilityLabel="Adicionar foto">
            <Ionicons name="camera-outline" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.photoAddLabel}>Adicionar foto</Text>
        </View>

        <Card>
          <TextField
            label="NOME"
            required
            placeholder="Seu nome"
            value={firstName}
            onChangeText={setFirstName}
            onFocus={scrollToFocusedInput}
          />
          <TextField
            label="SOBRENOME"
            required
            placeholder="Seu sobrenome"
            value={lastName}
            onChangeText={setLastName}
            onFocus={scrollToFocusedInput}
          />
          <TextField
            label="DATA DE NASCIMENTO"
            required
            placeholder="DD/MM/AAAA"
            value={dateOfBirthInput}
            onChangeText={(value) => setDateOfBirthInput(formatDateOfBirthInput(value, dateOfBirthInput))}
            onFocus={scrollToFocusedInput}
            keyboardType="number-pad"
            maxLength={10}
            error={hasDateOfBirthError ? "Data inválida." : undefined}
          />
          <SelectField
            label="SEXO BIOLÓGICO"
            value={biologicalSex}
            options={BIOLOGICAL_SEX_OPTIONS}
            onChange={setBiologicalSex}
          />
        </Card>

        <Card>
          <SelectField label="TIPO SANGUÍNEO" value={bloodType} options={BLOOD_TYPE_OPTIONS} onChange={setBloodType} />
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>ALERGIAS</Text>
          <View style={styles.allergyInputRow}>
            <TextField
              label=""
              containerStyle={styles.allergyInputField}
              placeholder="Ex: Dipirona, látex..."
              value={allergyDraft}
              onChangeText={setAllergyDraft}
              onSubmitEditing={addAllergy}
              onFocus={scrollToFocusedInput}
              returnKeyType="done"
            />
            <IconButton
              icon={<Ionicons name="add" size={20} color={colors.onPrimary} />}
              onPress={addAllergy}
              accessibilityLabel="Adicionar alergia"
            />
          </View>
          {allergies.length > 0 ? (
            <View style={styles.allergyChipsRow}>
              {allergies.map((allergy, index) => (
                <Chip key={`${allergy}-${index}`} label={allergy} onRemove={() => removeAllergy(index)} />
              ))}
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={styles.fieldLabel}>CONTATO DE EMERGÊNCIA</Text>
          <TextField
            label="NOME"
            placeholder="Nome do contato"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            onFocus={scrollToFocusedInput}
            error={hasEmergencyContactError}
          />
          <TextField
            label="TELEFONE"
            placeholder="(00) 00000-0000"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            onFocus={scrollToFocusedInput}
            keyboardType="phone-pad"
            error={hasEmergencyContactError}
          />
          <TextField
            label="VÍNCULO"
            placeholder="Ex: Filha, cônjuge, vizinho..."
            value={emergencyContactRelationship}
            onChangeText={setEmergencyContactRelationship}
            onFocus={scrollToFocusedInput}
            error={
              hasEmergencyContactError ? "Preencha nome, telefone e vínculo, ou deixe os três em branco." : undefined
            }
          />
        </Card>

        <Card>
          <TextField
            label="OBSERVAÇÕES"
            placeholder="Qualquer outra informação que você ache relevante..."
            value={notes}
            onChangeText={setNotes}
            onFocus={scrollToFocusedInput}
            multiline
          />
        </Card>

        <Button label="Salvar e continuar" onPress={handleContinue} disabled={!canContinue} />
        <Button variant="text" label="Preencher depois, nas Configurações" onPress={onSkip} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
