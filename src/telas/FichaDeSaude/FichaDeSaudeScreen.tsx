import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  BiologicalSex,
  BloodType,
  EmergencyContact,
  PatientProfileDraft,
} from "@/domain/entities/patient-profile";
import { useProfilePhotoPicker } from "@/hooks/use-profile-photo";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { colors } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  Card,
  Chip, Header, IconButton, KeyboardAwareScrollView, SelectField,
  TextField,
  type SelectOption
} from "@/ui";
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

type FichaDeSaudeScreenProps = {
  /** Só chamado com o nome preenchido e a data vazia ou válida. */
  onContinue: (draft: PatientProfileDraft) => void;
  /**
   * Volta pra tela anterior. Omitir esconde o botão - quem sabe se há retorno possível é quem
   * conhece a navegação, não esta tela.
   */
  onBack?: () => void;
  /** Ficha já salva, quando a tela abre em modo edição. Ausente = primeira execução. */
  initialValue?: PatientProfileDraft;
  /** O rótulo muda com o contexto: primeira execução continua o fluxo, edição só salva. */
  submitLabel?: string;
  /** Texto acima do botão. A primeira execução avisa que dá pra completar depois. */
  footerHint?: string;
};

/** `YYYY-MM-DD` guardado no banco → `DD/MM/AAAA` do input. Vazio continua vazio. */
function toDateOfBirthInput(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Aceita só dígitos e insere as barras conforme o paciente digita - sem depender de libs de máscara. */
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
 * conforme o paciente digita - sem depender de libs de máscara. Igual ao formatDateOfBirthInput,
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
 * entra na lista depois de completo - nunca existe um contato salvo pela metade.
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

// Todo o resto além de nome/sobrenome/nascimento é opcional de propósito - é uma "fichinha
// médica auxiliar" que o paciente preenche no próprio ritmo, nunca um formulário que bloqueia
// o uso do app.
export function FichaDeSaudeScreen({
  onContinue,
  onBack,
  initialValue,
  submitLabel = "Salvar e continuar",
  footerHint,
}: FichaDeSaudeScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } =
    useScrollToFocusedInput();
  const [fullName, setFullName] = useState(initialValue?.fullName ?? "");
  const [photoUri, setPhotoUri] = useState<string | null>(initialValue?.photoUri ?? null);
  const { isPicking, pickPhoto } = useProfilePhotoPicker();
  const [dateOfBirthInput, setDateOfBirthInput] = useState(
    toDateOfBirthInput(initialValue?.dateOfBirth ?? ""),
  );
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex>(initialValue?.biologicalSex ?? null);
  const [bloodType, setBloodType] = useState<BloodType>(initialValue?.bloodType ?? null);
  const [allergies, setAllergies] = useState<string[]>(initialValue?.allergies ?? []);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >(initialValue?.emergencyContacts ?? []);
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  const dateOfBirthIso = useMemo(
    () => parseDateOfBirth(dateOfBirthInput),
    [dateOfBirthInput],
  );
  /**
   * A data é opcional, mas ou está vazia ou está completa e válida. O estado do meio - meia
   * digitada - não pode passar: seria descartada em silêncio no salvamento.
   */
  const dateOfBirthError =
    dateOfBirthInput.length === 0 || dateOfBirthIso !== null
      ? undefined
      : dateOfBirthInput.length === 10
        ? "Data inválida."
        : "Complete a data ou deixe o campo em branco.";

  // O nome é o mínimo da ficha: sem ele, ela não identifica ninguém num atendimento.
  const canContinue =
    fullName.trim().length > 0 && dateOfBirthError === undefined;

  // Texto de UI fica aqui (camada de apresentação) — o hook só devolve o motivo da falha.
  async function handlePickPhoto() {
    const result = await pickPhoto();
    if (result.status === "picked") {
      setPhotoUri(result.uri);
      return;
    }
    // Desistir de escolher é uma ação normal, não um erro digno de alerta.
    if (result.reason === "cancelled") return;
    Alert.alert(
      result.reason === "permission-denied" ? "Sem acesso às fotos" : "Não foi possível usar a foto",
      result.reason === "permission-denied"
        ? "Para escolher uma imagem, libere o acesso às fotos nas configurações do aparelho."
        : "Tente novamente com outra imagem.",
    );
  }

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
    if (!canContinue) return;
    onContinue({
      fullName: fullName.trim(),
      photoUri,
      // Vazio quando o paciente não informou - a ficha guarda a ausência, não um valor inventado.
      dateOfBirth: dateOfBirthIso ?? "",
      biologicalSex,
      bloodType,
      allergies,
      emergencyContacts,
      notes: notes.trim().length > 0 ? notes.trim() : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Ficha de saúde" onBack={onBack} />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Mantenha seus dados clínicos atualizados no Mapill. Informações como tipo sanguíneo e alergias fazem a diferença em consultas e situações de emergência.
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
          <Pressable
            style={photoUri ? styles.photoFrame : styles.photoPlaceholder}
            onPress={handlePickPhoto}
            disabled={isPicking}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? "Trocar foto da ficha" : "Adicionar foto à ficha"}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
            ) : (
              <Ionicons name="camera-outline" size={24} color={colors.onSurfaceVariant} />
            )}
          </Pressable>
          <Pressable onPress={handlePickPhoto} disabled={isPicking} accessibilityRole="button">
            <Text style={styles.photoAddLabel}>{photoUri ? "Trocar foto" : "Adicionar foto"}</Text>
          </Pressable>
          {photoUri ? (
            <Pressable onPress={() => setPhotoUri(null)} accessibilityRole="button">
              <Text style={styles.photoRemoveLabel}>Remover</Text>
            </Pressable>
          ) : null}
        </View>

        <Card>
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>DADOS BÁSICOS</Text>
            <Text style={styles.sectionHint}>
              O nome completo é obrigatório. É o mínimo para a ficha identificar você num
              atendimento.
            </Text>
          </View>
          <TextField
            label="NOME COMPLETO"
            required
            placeholder="Seu nome completo"
            value={fullName}
            onChangeText={setFullName}
            onFocus={scrollToFocusedInput}
            maxLength={120}
          />
        </Card>

        <Card>
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>COMPLEMENTAR</Text>
            <Text style={styles.sectionHint}>
              Tudo daqui pra baixo é opcional. Serve para você centralizar suas informações
              médicas e ter acesso facilitado a elas no seu cotidiano.
            </Text>
          </View>
          <TextField
            label="DATA DE NASCIMENTO"
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
            error={dateOfBirthError}
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
          <View style={styles.fieldGroup}>
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

        {footerHint ? <Text style={styles.footerHint}>{footerHint}</Text> : null}
        <Button
          label={submitLabel}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
