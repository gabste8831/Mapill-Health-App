import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { BloodType } from "@/domain/entities/patient-profile";
import { colors } from "@/shared/theme";
import { styles } from "./PatientProfileScreen.styles";

const BLOOD_TYPE_OPTIONS: NonNullable<BloodType>[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export type PatientProfileDraft = {
  firstName: string;
  lastName: string;
  bloodType: BloodType;
  allergies: string[];
  notes: string | null;
};

type PatientProfileScreenProps = {
  /** Só chamado com `firstName` preenchido — é o único campo obrigatório (ver screens-and-flows.md). */
  onContinue: (draft: PatientProfileDraft) => void;
  /** "Preencher depois": não salva nada agora, o paciente completa a ficha em Configurações. */
  onSkip: () => void;
};

// Todo o resto além do nome é opcional de propósito — é uma "fichinha médica auxiliar" que o
// paciente preenche no próprio ritmo, nunca um formulário que bloqueia o uso do app.
export function PatientProfileScreen({ onContinue, onSkip }: PatientProfileScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bloodType, setBloodType] = useState<BloodType>(null);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyDraft, setAllergyDraft] = useState("");
  const [notes, setNotes] = useState("");

  const canContinue = firstName.trim().length > 0;

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
    if (!canContinue) return;
    onContinue({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bloodType,
      allergies,
      notes: notes.trim().length > 0 ? notes.trim() : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Sua ficha de saúde</Text>
          <Text style={styles.subtitle}>Só o nome é obrigatório — o resto você preenche quando quiser.</Text>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.onSecondaryContainer} />
          <Text style={styles.infoBannerText}>
            Esses dados funcionam como uma ficha cadastral com informações relevantes à sua
            saúde — uma fonte de dados pessoal que pode ser útil em algum momento (ex: tipo
            sanguíneo, alergias). Fica salva só no seu dispositivo, a menos que você faça login.
          </Text>
        </View>

        <View style={styles.photoRow}>
          {/* TODO: integrar expo-image-picker quando formos anexar foto de verdade. */}
          <Pressable style={styles.photoPlaceholder} accessibilityRole="button" accessibilityLabel="Adicionar foto">
            <Ionicons name="camera-outline" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Text style={styles.photoAddLabel}>Adicionar foto</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              NOME <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={colors.onSurfaceVariant}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SOBRENOME</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu sobrenome"
              placeholderTextColor={colors.onSurfaceVariant}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>TIPO SANGUÍNEO</Text>
          <View style={styles.bloodTypeRow}>
            {BLOOD_TYPE_OPTIONS.map((option) => {
              const selected = bloodType === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.bloodTypeChip, selected && styles.bloodTypeChipSelected]}
                  onPress={() => setBloodType(selected ? null : option)}
                  accessibilityRole="button">
                  <Text style={[styles.bloodTypeChipText, selected && styles.bloodTypeChipTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>ALERGIAS</Text>
          {allergies.length > 0 ? (
            <View style={styles.allergyChipsRow}>
              {allergies.map((allergy, index) => (
                <View key={`${allergy}-${index}`} style={styles.allergyChip}>
                  <Text style={styles.allergyChipText}>{allergy}</Text>
                  <Pressable
                    style={styles.allergyChipRemove}
                    onPress={() => removeAllergy(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover alergia ${allergy}`}>
                    <Text style={styles.allergyChipRemoveText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.allergyInputRow}>
            <TextInput
              style={styles.allergyInput}
              placeholder="Ex: Dipirona, látex..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={allergyDraft}
              onChangeText={setAllergyDraft}
              onSubmitEditing={addAllergy}
              returnKeyType="done"
            />
            <Pressable style={styles.allergyAddButton} onPress={addAllergy} accessibilityRole="button">
              <Text style={styles.allergyAddButtonText}>+ Adicionar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>OBSERVAÇÕES</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Qualquer outra informação que você ache relevante..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Salvar e continuar</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={onSkip} accessibilityRole="button">
          <Text style={styles.skipButtonText}>Preencher depois, nas Configurações</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
