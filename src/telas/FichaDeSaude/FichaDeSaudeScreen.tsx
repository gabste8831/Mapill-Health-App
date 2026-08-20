import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAwareScrollView } from "@/ui";
import {
  BottomSheet,
  Button,
  Card,
  Chip,
  IconButton,
  SelectField,
  TextField,
  type SelectOption,
} from "@/ui";
import type {
  BiologicalSex,
  BloodType,
  EmergencyContact,
} from "@/domain/entities/patient-profile";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { colors } from "@/shared/theme";
import { styles } from "./FichaDeSaudeScreen.styles";

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
  { value: "other", label: "Prefiro não informar" },
];

export type PatientProfileDraft = {
  firstName: string;
  lastName: string;
  /** ISO 8601 (`YYYY-MM-DD`) — convertido a partir do input `DD/MM/AAAA` da tela. */
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  bloodType: BloodType;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  notes: string | null;
};

type FichaDeSaudeScreenProps = {
  /** Só chamado com nome, sobrenome e data de nascimento válidos preenchidos. */
  onContinue: (draft: PatientProfileDraft) => void;
  /** "Preencher depois": não salva nada agora, o paciente completa a ficha em Configurações. */
  onSkip: () => void;
  /**
   * Volta pra tela de consentimento. Omitir esconde o botão — quem sabe se há retorno
   * possível é o gate (`useFirstRunGate.canGoBack`), não esta tela.
   */
  onBack?: () => void;
};

/** Aceita só dígitos e insere as barras conforme o paciente digita — sem depender de libs de máscara. */
function formatDateOfBirthInput(
  rawValue: string,
  previousValue: string,
): string {
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
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1900 ||
    year > currentYear
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const isRealCalendarDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  if (!isRealCalendarDate || date > new Date()) return null;

  return `${yearText}-${monthText}-${dayText}`;
}

/**
 * Aceita só dígitos e monta a máscara `(DD) NNNNN-NNNN` (celular) ou `(DD) NNNN-NNNN` (fixo)
 * conforme o paciente digita — sem depender de libs de máscara. Igual ao formatDateOfBirthInput,
 * não força a máscara de volta durante a deleção.
 */
function formatPhoneInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 11);
  if (rawValue.length < previousValue.length) return rawValue;

  if (digitsOnly.length === 0) return "";

  const areaCode = digitsOnly.slice(0, 2);
  const subscriberDigits = digitsOnly.slice(2);
  // A partir do 9º dígito do assinante já dá pra saber que é celular (9 dígitos, não 8 do fixo).
  const isMobile = subscriberDigits.length > 8;
  const firstPartLength = isMobile ? 5 : 4;
  const firstPart = subscriberDigits.slice(0, firstPartLength);
  const secondPart = subscriberDigits.slice(firstPartLength);

  if (digitsOnly.length <= 2) return `(${areaCode}`;
  if (secondPart.length === 0) return `(${areaCode}) ${firstPart}`;
  return `(${areaCode}) ${firstPart}-${secondPart}`;
}

type EmergencyContactsFieldProps = {
  contacts: EmergencyContact[];
  onAdd: (contact: EmergencyContact) => void;
  onRemove: (index: number) => void;
  onFocusField: (event: NativeSyntheticEvent<TargetedEvent>) => void;
};

/**
 * Lista de contatos de emergência + popup "Adicionar" (mesmo padrão de bottom-sheet do
 * `SelectField`, só que com um mini-formulário em vez de uma lista de opções). Cada contato só
 * entra na lista depois de completo — nunca existe um contato salvo pela metade.
 */
function EmergencyContactsField({
  contacts,
  onAdd,
  onRemove,
  onFocusField,
}: EmergencyContactsFieldProps) {
  const [isAddingContact, setAddingContact] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const canSaveContact =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    relationship.trim().length > 0;

  function closeAndResetDraft() {
    setAddingContact(false);
    setName("");
    setPhone("");
    setRelationship("");
  }

  function handleSaveContact() {
    if (!canSaveContact) return;
    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    });
    closeAndResetDraft();
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>CONTATO DE EMERGÊNCIA</Text>

      {contacts.length > 0 ? (
        <View style={styles.contactList}>
          {contacts.map((contact, index) => (
            <View key={`${contact.name}-${index}`} style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactMeta}>
                  {contact.relationship} · {contact.phone}
                </Text>
              </View>
              <Pressable
                style={styles.contactRemove}
                onPress={() => onRemove(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remover contato ${contact.name}`}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyHint}>Nenhum contato adicionado ainda.</Text>
      )}

      <Button
        variant="outline"
        label="Adicionar contato"
        icon={<Ionicons name="add" size={18} color={colors.onSurface} />}
        onPress={() => setAddingContact(true)}
      />

      <BottomSheet
        visible={isAddingContact}
        onClose={closeAndResetDraft}
        title="Novo contato de emergência"
      >
        <TextField
          label="NOME"
          placeholder="Nome do contato"
          value={name}
          onChangeText={setName}
          onFocus={onFocusField}
          maxLength={60}
        />
        <TextField
          label="TELEFONE"
          placeholder="(00) 00000-0000"
          value={phone}
          onChangeText={(value) => setPhone(formatPhoneInput(value, phone))}
          onFocus={onFocusField}
          keyboardType="phone-pad"
          maxLength={15}
        />
        <TextField
          label="VÍNCULO"
          placeholder="Ex: Filha, cônjuge, vizinho..."
          value={relationship}
          onChangeText={setRelationship}
          onFocus={onFocusField}
          maxLength={40}
        />
        <Button
          label="Salvar contato"
          onPress={handleSaveContact}
          disabled={!canSaveContact}
        />
      </BottomSheet>
    </View>
  );
}

// Todo o resto além de nome/sobrenome/nascimento é opcional de propósito — é uma "fichinha
// médica auxiliar" que o paciente preenche no próprio ritmo, nunca um formulário que bloqueia
// o uso do app.
export function FichaDeSaudeScreen({
  onContinue,
  onSkip,
  onBack,
}: FichaDeSaudeScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } =
    useScrollToFocusedInput();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirthInput, setDateOfBirthInput] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>(null);
  const [bloodType, setBloodType] = useState<BloodType>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [notes, setNotes] = useState("");

  const dateOfBirthIso = useMemo(
    () => parseDateOfBirth(dateOfBirthInput),
    [dateOfBirthInput],
  );
  const hasDateOfBirthError =
    dateOfBirthInput.length === 10 && dateOfBirthIso === null;

  const canContinue =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dateOfBirthIso !== null;

  function addAllergy() {
    const value = allergyDraft.trim();
    if (value.length === 0) return;
    setAllergies((current) => [...current, value]);
    setAllergyDraft("");
  }

  function removeAllergy(index: number) {
    setAllergies((current) => current.filter((_, i) => i !== index));
  }

  function addEmergencyContact(contact: EmergencyContact) {
    setEmergencyContacts((current) => [...current, contact]);
  }

  function removeEmergencyContact(index: number) {
    setEmergencyContacts((current) => current.filter((_, i) => i !== index));
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
      emergencyContacts,
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
        scrollEventThrottle={16}
      >
        {onBack ? (
          <IconButton
            variant="outline"
            style={styles.backButton}
            onPress={onBack}
            accessibilityLabel="Voltar para o consentimento"
            icon={<Ionicons name="arrow-back" size={20} color={colors.onSurface} />}
          />
        ) : null}

        <View style={styles.header}>
          <Text style={styles.title}>Sua ficha de saúde</Text>
          <Text style={styles.subtitle}>
            Aqui você pode registrar informações pessoais e médicas, para uma
            melhor experiencia no aplicativo, e segurança pessoal.
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.onSecondaryContainer}
          />
          <Text style={styles.infoBannerText}>
            Esses dados são sensíveis e ficam protegidos. O Mapill não
            compartilha essas informações com ninguém sem o seu consentimento.
          </Text>
        </View>

        <View style={styles.photoRow}>
          {/* TODO: integrar expo-image-picker quando formos anexar foto de verdade. */}
          <Pressable
            style={styles.photoPlaceholder}
            accessibilityRole="button"
            accessibilityLabel="Adicionar foto"
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={colors.onSurfaceVariant}
            />
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
            maxLength={60}
          />
          <TextField
            label="SOBRENOME"
            required
            placeholder="Seu sobrenome"
            value={lastName}
            onChangeText={setLastName}
            onFocus={scrollToFocusedInput}
            maxLength={60}
          />
          <TextField
            label="DATA DE NASCIMENTO"
            required
            placeholder="DD/MM/AAAA"
            value={dateOfBirthInput}
            onChangeText={(value) =>
              setDateOfBirthInput(
                formatDateOfBirthInput(value, dateOfBirthInput),
              )
            }
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
          <SelectField
            label="TIPO SANGUÍNEO"
            value={bloodType}
            options={BLOOD_TYPE_OPTIONS}
            onChange={setBloodType}
          />
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
              maxLength={40}
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
                <Chip
                  key={`${allergy}-${index}`}
                  label={allergy}
                  onRemove={() => removeAllergy(index)}
                />
              ))}
            </View>
          ) : null}
        </Card>

        <Card>
          <EmergencyContactsField
            contacts={emergencyContacts}
            onAdd={addEmergencyContact}
            onRemove={removeEmergencyContact}
            onFocusField={scrollToFocusedInput}
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
            maxLength={500}
          />
        </Card>

        <Button
          label="Salvar e continuar"
          onPress={handleContinue}
          disabled={!canContinue}
        />
        <Button
          variant="text"
          label="Preencher depois, nas Configurações"
          onPress={onSkip}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
