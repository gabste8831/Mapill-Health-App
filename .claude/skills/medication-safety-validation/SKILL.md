---
name: medication-safety-validation
description: Use this skill when implementing data validation, input constraints, or business rules around medication dosing, quantities, schedules, or stock in a health app — e.g. validating a dose/frequency entered by the user, checking for plausible ranges, preventing duplicate/overlapping schedule entries, or flagging data-entry anomalies before they're saved. This skill is strictly about software-level data validation and safe UX around clinical data entry (range checks, format checks, confirmation flows) — it does NOT determine correct doses or give medical dosing advice. Trigger for requests like "validate this dose input", "how do I prevent invalid posology data", "add a sanity check for quantity entered", "what happens if two schedules overlap".
---

# Medication Data Validation — Software Engineering Skill

**Scope boundary (important):** this skill helps build validation *logic in software* — it
does not supply actual medical dosing values, thresholds, or clinical recommendations for real
drugs. The correct dose, frequency, and duration for any medication always comes from the
user's own prescription (entered by the user or a pharmacist/doctor), never from the app or
from Claude. When a task risks crossing into "what should the dose be" rather than "is this
input well-formed and plausible," stop and flag that boundary rather than filling in a
clinical value.

## What this skill covers

- Input validation for dose amount, unit, frequency, and duration fields
- Plausibility/sanity checks (catching likely data-entry mistakes, not clinical judgment)
- Schedule conflict detection (overlapping times, duplicate entries)
- Stock/inventory math validation (can't go negative, must reconcile with confirmed intake)
- Safe confirmation UX for high-stakes data entry (per the usability-heuristics-health-ui skill)
- Audit-trail integrity (timestamps, immutability of historical logs)

## What this skill does NOT do

- Does not recommend or validate whether a specific dose is medically appropriate for a
  condition/patient — that determination belongs to the prescribing professional.
- Does not provide drug interaction or contraindication advice.
- Does not suggest dosage values to pre-fill for a user who hasn't specified them from their
  own prescription.

## Validation patterns

### 1. Structural validation (always do this)
- Dose amount: numeric, positive, non-zero. Reject `NaN`, negative, or empty values at the
  form layer before it ever reaches the domain layer.
- Unit: must be one of a fixed enum (mg, ml, comprimido, gota, UI, etc.) — never free text, to
  avoid downstream parsing ambiguity.
- Frequency/schedule: must resolve to at least one valid time; reject schedules with zero
  occurrences or contradictory intervals (e.g. "every 8 hours" combined with only 1x/day
  selected).
- Duration: start date must be ≤ end date (when an end date exists); open-ended (chronic)
  treatments should be explicitly modeled, not represented by a null end date.

### 2. Plausibility checks (data-entry safety net, not clinical judgment)
The goal here is catching likely *typos*, not asserting a clinical opinion. Frame these as
"this looks unusual, please confirm" — never as a silent auto-correction or a hard block that
assumes to know better than the prescription:

- Extremely high quantities relative to the unit (e.g. "500 comprimidos" in a single dose) —
  flag for confirmation, don't block.
- Frequency that's implausible for the unit chosen (e.g. "a cada 5 minutos") — flag, don't
  block, since edge cases (emergency protocols, etc.) do exist and the app shouldn't assume
  it knows better than what was prescribed.
- Always let the user proceed after an explicit "sim, está correto" confirmation — the app's
  role is friction against typos, not gatekeeping of medical decisions.

### 3. Schedule conflict / overlap detection
- Detect (and surface, not silently allow) overlapping dose times for the *same* medication
  within a tolerance window (e.g. two entries within `MAX_DOSE_TOLERANCE_MINUTES` of each other)
  — likely a duplicate entry.
- Do not automatically merge or delete a conflicting entry — surface it to the user to resolve.

### 4. Inventory/stock math
- Stock quantity is derived, not directly editable in most flows — it should decrement based
  on confirmed intake logs, not be freely typed, to keep it consistent with the audit trail.
- Never allow stock to go negative in the data model — clamp at zero and treat this as a
  trigger to prompt the user to reorder/restock, not a silent underflow.
- Reconciliation: if a user manually adjusts stock (e.g. after a real-world recount), log this
  as an explicit adjustment event, distinct from consumption via confirmed doses — preserves
  the audit trail described in the eMEM/monitoramento eletrônico approach.

### 5. Audit trail integrity
- `intake_logs` (or equivalent confirmation records) should be append-only / immutable once
  written — corrections happen via a new compensating entry, not by editing history, so the
  adherence record stays trustworthy for the patient or a care provider reviewing it later.
- Every clinically-relevant record needs a reliable `timestamp`, `synced_at`, and (per LGPD)
  `deleted_at` for soft-delete/right-to-erasure support.

## When a request needs an actual clinical value

If a task requires an actual dosing threshold, drug interaction rule, or similar clinical
content to hardcode into validation logic, say so explicitly and suggest the value be sourced
from the user's own prescription data, a licensed professional, or an official reference (bula,
Anvisa) rather than inferred or filled in generically — this keeps the validation logic honest
about where its clinical authority actually comes from (namely: not the app).
