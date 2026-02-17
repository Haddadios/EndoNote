import { createContext, useContext, useReducer, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { NoteData, Template, Preferences, ProcedureDefaults, ToothDiagnosis, CanalMAF, AnesthesiaAmounts, TemplateScope, SavedDraft, ToothTreatmentPlan, ReferralTemplate, SavedReferralTemplate, StoredData } from '../types';
import { getToothType } from '../data';
import { templateScopeFields } from '../utils/templateUtils';
import { defaultReferralTemplate, normalizeReferralTemplate, buildUSCReferralTemplate, USC_REFERRAL_TEMPLATE_NAME } from '../utils/referralTemplate';

// Helper to create empty tooth diagnosis
const createEmptyToothDiagnosis = (toothNumber = ''): ToothDiagnosis => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  toothNumber,
  toothType: toothNumber ? getToothType(toothNumber) : 'molar',
  pulpalDiagnosis: '',
  periapicalDiagnosis: '',
  prognosis: '',
  treatmentOptionsOffered: [],
});

// Helper to create empty tooth treatment plan
const createEmptyToothTreatmentPlan = (toothNumber = ''): ToothTreatmentPlan => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  toothNumber,
  toothType: toothNumber ? getToothType(toothNumber) : 'molar',
  canalConfiguration: [],
  customCanalNames: [],
  canalMAFs: [],
  workingLengthMethod: [],
  coronalFlare: [],
  coronalFlareOther: '',
  restoration: '',
  treatmentOutcome: '',
  treatmentPerformed: [],
});

// Initial anesthesia amounts
const initialAnesthesiaAmounts: AnesthesiaAmounts = {
  lidocaine_epi: '',
  lidocaine_no_epi: '',
  articaine_epi: '',
  articaine_200: '',
  carbocaine: '',
  bupivacaine: '',
  marcaine: '',
};

const createId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const normalizeToothDiagnoses = (items?: ToothDiagnosis[], fallbackTooth?: string): ToothDiagnosis[] => {
  if (items && items.length > 0) {
    return items.map((diagnosis) => {
      const fallback = createEmptyToothDiagnosis(diagnosis.toothNumber || '');
      return {
        ...fallback,
        ...diagnosis,
        id: diagnosis.id || fallback.id,
      };
    });
  }

  return [createEmptyToothDiagnosis(fallbackTooth || '')];
};

const normalizeToothTreatmentPlans = (items?: ToothTreatmentPlan[]): ToothTreatmentPlan[] => {
  if (items && items.length > 0) {
    return items.map((plan) => {
      const fallback = createEmptyToothTreatmentPlan(plan.toothNumber || '');
      return {
        ...fallback,
        ...plan,
        id: plan.id || fallback.id,
        canalMAFs: plan.canalMAFs || [],
      };
    });
  }

  return [];
};

interface OutputEdits {
  noteText: string | null;
  referralText: string | null;
}

const initialOutputEdits: OutputEdits = {
  noteText: null,
  referralText: null,
};

const normalizeOutputEdits = (data?: Partial<OutputEdits>): OutputEdits => ({
  noteText: data?.noteText ?? null,
  referralText: data?.referralText ?? null,
});

const hasNonEmptyString = (value?: string) => Boolean(value && value.trim().length > 0);

const hasDraftContent = (data: NoteData): boolean => {
  if (
    hasNonEmptyString(data.toothNumber) ||
    hasNonEmptyString(data.patientName) ||
    hasNonEmptyString(data.patientChartNumber) ||
    hasNonEmptyString(data.patientDOB) ||
    hasNonEmptyString(data.age) ||
    hasNonEmptyString(data.gender) ||
    hasNonEmptyString(data.chiefComplaintCustom) ||
    hasNonEmptyString(data.painDuration) ||
    hasNonEmptyString(data.painDurationCustom) ||
    hasNonEmptyString(data.painHistoryOther) ||
    hasNonEmptyString(data.bloodPressure) ||
    hasNonEmptyString(data.pulse) ||
    hasNonEmptyString(data.respiratoryRate) ||
    hasNonEmptyString(data.medicalHistoryComments) ||
    hasNonEmptyString(data.continuingTreatmentComments) ||
    hasNonEmptyString(data.vitalityTestComments) ||
    hasNonEmptyString(data.clinicalFindingsComments) ||
    hasNonEmptyString(data.objectiveNotes) ||
    hasNonEmptyString(data.assessmentNotes) ||
    hasNonEmptyString(data.referralLetterDate) ||
    hasNonEmptyString(data.consultationDate) ||
    hasNonEmptyString(data.treatmentCompletionDate) ||
    hasNonEmptyString(data.treatmentPerformed) ||
    hasNonEmptyString(data.temporizedWith) ||
    hasNonEmptyString(data.referralComments) ||
    hasNonEmptyString(data.treatmentComments) ||
    data.isolation.length > 0 ||
    hasNonEmptyString(data.medicament) ||
    hasNonEmptyString(data.restoration) ||
    hasNonEmptyString(data.complicationsComments) ||
    hasNonEmptyString(data.additionalNotes) ||
    hasNonEmptyString(data.followUp) ||
    hasNonEmptyString(data.referral)
  ) {
    return true;
  }

  if (
    data.chiefComplaints.length > 0 ||
    data.painCharacteristics.length > 0 ||
    data.medicalHistoryAlerts.length > 0 ||
    data.coldTest.length > 0 ||
    data.eptTest.length > 0 ||
    data.heatTest.length > 0 ||
    data.percussion.length > 0 ||
    data.palpation.length > 0 ||
    data.mobility.length > 0 ||
    data.swelling.length > 0 ||
    data.radiographicFindings.length > 0 ||
    data.referralRadiographs.length > 0 ||
    data.anesthesiaLocations.length > 0 ||
    data.canalConfiguration.length > 0 ||
    data.customCanalNames.some((name) => hasNonEmptyString(name)) ||
    data.workingLengthMethod.length > 0 ||
    data.irrigationProtocol.length > 0 ||
    data.complications.length > 0 ||
    data.postOpInstructions.length > 0 ||
    data.nextVisit.length > 0
  ) {
    return true;
  }

  if (data.sinusTract || data.consentGiven) {
    return true;
  }

  if (Object.values(data.probingDepths).some((depth) => hasNonEmptyString(depth))) {
    return true;
  }

  if (
    Object.values(data.anesthesiaAmounts).some((amount) => hasNonEmptyString(amount) && parseFloat(amount) > 0)
  ) {
    return true;
  }

  if (Object.keys(data.anesthesiaLocationMapping).length > 0 || Object.keys(data.anesthesiaLocationSides).length > 0) {
    return true;
  }

  if (
    data.toothDiagnoses.some(
      (diagnosis) =>
        hasNonEmptyString(diagnosis.toothNumber) ||
        hasNonEmptyString(diagnosis.pulpalDiagnosis) ||
        hasNonEmptyString(diagnosis.periapicalDiagnosis) ||
        hasNonEmptyString(diagnosis.prognosis) ||
        (diagnosis.treatmentOptionsOffered ?? []).length > 0
    )
  ) {
    return true;
  }

  if (
    data.canalMAFs.some(
      (maf) =>
        maf.patent ||
        hasNonEmptyString(maf.workingLength) ||
        hasNonEmptyString(maf.referencePoint) ||
        (Array.isArray(maf.fileSystem) ? maf.fileSystem.length > 0 : hasNonEmptyString(maf.fileSystem as unknown as string)) ||
        hasNonEmptyString(maf.size) ||
        hasNonEmptyString(maf.taper) ||
        hasNonEmptyString(maf.obturationTechnique) ||
        hasNonEmptyString(maf.obturationMaterial) ||
        hasNonEmptyString(maf.obturationSealer)
    )
  ) {
    return true;
  }

  // Check toothTreatmentPlans
  if (
    data.toothTreatmentPlans &&
    data.toothTreatmentPlans.some(
      (plan) =>
        hasNonEmptyString(plan.toothNumber) ||
        plan.canalConfiguration.length > 0 ||
        plan.customCanalNames.some((name) => hasNonEmptyString(name)) ||
        plan.workingLengthMethod.length > 0 ||
        hasNonEmptyString(plan.restoration) ||
        plan.canalMAFs.some(
          (maf) =>
            maf.patent ||
            hasNonEmptyString(maf.workingLength) ||
            hasNonEmptyString(maf.referencePoint) ||
            (Array.isArray(maf.fileSystem) ? maf.fileSystem.length > 0 : hasNonEmptyString(maf.fileSystem as unknown as string)) ||
            hasNonEmptyString(maf.size) ||
            hasNonEmptyString(maf.taper) ||
            hasNonEmptyString(maf.obturationTechnique) ||
            hasNonEmptyString(maf.obturationMaterial) ||
            hasNonEmptyString(maf.obturationSealer)
        )
    )
  ) {
    return true;
  }

  return false;
};

// Initial state
const initialNoteData: NoteData = {
  // Patient/Tooth Info (for quick-select / first tooth)
  toothNumber: '',
  toothType: 'molar',
  patientName: '',
  patientChartNumber: '',
  patientDOB: '',

  // Subjective
  visitType: 'first_visit',
  age: '',
  gender: '',
  chiefComplaints: [],
  chiefComplaintCustom: '',
  painDuration: '',
  painDurationCustom: '',
  painCharacteristics: [],
  painHistoryOther: '',
  bloodPressure: '',
  pulse: '',
  respiratoryRate: '',
  medicalHistoryAlerts: [],
  medicalHistoryComments: '',
  continuingTreatmentComments: '',

  // Objective (clinical findings only)
  coldTest: [],
  eptTest: [],
  heatTest: [],
  vitalityTestComments: '',
  percussion: [],
  palpation: [],
  probingDepths: { MB: '', B: '', DB: '', DL: '', L: '', ML: '' },
  mobility: [],
  swelling: [],
  sinusTract: false,
  radiographicFindings: [],
  clinicalFindingsComments: '',
  objectiveNotes: '',
  continuingTreatmentObjectiveComments: '',

  // Assessment - multi-tooth diagnoses
  toothDiagnoses: [createEmptyToothDiagnosis()],
  assessmentNotes: '',

  // Referral Letter
  referralLetterDate: '',
  consultationDate: '',
  treatmentCompletionDate: '',
  treatmentPerformed: '',
  temporizedWith: '',
  referralComments: '',
  referralRadiographs: [],

  // Plan
  treatmentComments: '',
  consentGiven: false,
  anesthesiaAmounts: { ...initialAnesthesiaAmounts },
  anesthesiaLocations: [],
  anesthesiaLocationMapping: {},
  anesthesiaLocationSides: {},
  isolation: [],

  // Multi-tooth treatment plans
  toothTreatmentPlans: [],

  // Legacy single-tooth fields (kept for backward compatibility)
  canalConfiguration: [],
  customCanalNames: [],
  workingLengthMethod: [],
  canalMAFs: [],
  restoration: '',

  proceduralSteps: {},

  irrigationProtocol: [],
  medicament: '',
  complications: [],
  complicationsComments: '',
  postOpInstructions: [],
  additionalNotes: '',
  nextVisit: [],
  followUp: '',
  referral: '',
};

const normalizeNoteData = (data?: Partial<NoteData>): NoteData => {
  const merged = { ...initialNoteData, ...data };

  if (!Array.isArray(merged.referralRadiographs)) {
    merged.referralRadiographs = [];
  }

  // Migration: If toothTreatmentPlans is empty but legacy fields have data, migrate to new structure
  let treatmentPlans = normalizeToothTreatmentPlans(data?.toothTreatmentPlans);

  if (
    treatmentPlans.length === 0 &&
    data &&
    (data.canalConfiguration?.length ||
      data.customCanalNames?.some((n) => n) ||
      data.canalMAFs?.length ||
      data.workingLengthMethod?.length ||
      data.restoration)
  ) {
    // Migrate legacy data to new structure for the primary tooth
    const primaryTooth = data.toothNumber || data.toothDiagnoses?.[0]?.toothNumber || '';
    if (primaryTooth) {
      treatmentPlans = [
        {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          toothNumber: primaryTooth,
          toothType: getToothType(primaryTooth),
          canalConfiguration: data.canalConfiguration || [],
          customCanalNames: data.customCanalNames || [],
          canalMAFs: data.canalMAFs || [],
          workingLengthMethod: data.workingLengthMethod || [],
          coronalFlare: [],
          coronalFlareOther: '',
          restoration: data.restoration || '',
          treatmentOutcome: '',
          treatmentPerformed: [],
        },
      ];
    }
  }

  // Migrate canalMAFs fileSystem: string → string[], and ensure sizes field exists
  const migrateFileSystem = (mafs: CanalMAF[]): CanalMAF[] =>
    mafs.map((m) => ({
      ...m,
      fileSystem: typeof (m.fileSystem as unknown) === 'string'
        ? ((m.fileSystem as unknown as string) ? [(m.fileSystem as unknown as string)] : [])
        : Array.isArray(m.fileSystem) ? m.fileSystem : [],
      sizes: Array.isArray(m.sizes) ? m.sizes : [],
      systemSizes: (m.systemSizes && typeof m.systemSizes === 'object' && !Array.isArray(m.systemSizes)) ? m.systemSizes : {},
      systemTapers: (m.systemTapers && typeof m.systemTapers === 'object' && !Array.isArray(m.systemTapers)) ? m.systemTapers : {},
    }));

  return {
    ...merged,
    probingDepths: { ...initialNoteData.probingDepths, ...(data?.probingDepths ?? {}) },
    anesthesiaAmounts: { ...initialAnesthesiaAmounts, ...(data?.anesthesiaAmounts ?? {}) },
    anesthesiaLocationMapping: data?.anesthesiaLocationMapping ?? {},
    anesthesiaLocationSides: data?.anesthesiaLocationSides ?? {},
    proceduralSteps: data?.proceduralSteps ?? {},
    toothDiagnoses: normalizeToothDiagnoses(data?.toothDiagnoses, data?.toothNumber),
    toothTreatmentPlans: treatmentPlans.map((plan) => ({
      ...plan,
      treatmentOutcome: plan.treatmentOutcome ?? '',
      treatmentPerformed: plan.treatmentPerformed ?? [],
      canalMAFs: migrateFileSystem(plan.canalMAFs),
    })),
    canalMAFs: migrateFileSystem(merged.canalMAFs),
  };
};

const applyDefaultsFromPreferences = (prefs: Preferences): Partial<NoteData> => {
  const d = prefs.generalDefaults;
  const result: Partial<NoteData> = {};
  if (d.isolation.length > 0) result.isolation = d.isolation;
  if (d.irrigationProtocol.length > 0) result.irrigationProtocol = d.irrigationProtocol;
  if (d.postOpInstructions.length > 0) result.postOpInstructions = d.postOpInstructions;
  if (d.medicament) result.medicament = d.medicament;
  if (d.followUp) result.followUp = d.followUp;
  if (d.injectionLocations.length > 0) result.anesthesiaLocations = d.injectionLocations;
  return result;
};

const emptyProcedureDefaults: ProcedureDefaults = {
  anestheticTypes: [],
  injectionLocations: [],
  isolation: [],
  fileSystems: [],
  workingLengthMethod: [],
  obturationTechnique: '',
  obturationMaterial: '',
  obturationSealer: '',
  medicament: '',
  irrigationProtocol: [],
  temporaryRestoration: '',
  permanentRestoration: '',
  postOpInstructions: [],
  followUp: '',
  prognosis: '',
};

const initialPreferences: Preferences = {
  toothNotation: 'universal',
  darkMode: true,
  defaultCarpuleVolume: '1.8',
  generalDefaults: { ...emptyProcedureDefaults },
  defaultsByProcedure: {},
};

const createDefaultSavedReferralTemplate = (): SavedReferralTemplate => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: 'Default Referral Template',
    template: normalizeReferralTemplate(defaultReferralTemplate),
    createdAt: now,
    updatedAt: now,
  };
};

const createUSCSavedReferralTemplate = (): SavedReferralTemplate => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: USC_REFERRAL_TEMPLATE_NAME,
    template: buildUSCReferralTemplate(),
    createdAt: now,
    updatedAt: now,
  };
};

const ensureUSCReferralTemplate = (templates: SavedReferralTemplate[]) => {
  const hasUSC = templates.some(
    (template) => template.name.trim().toLowerCase() === USC_REFERRAL_TEMPLATE_NAME.toLowerCase()
  );
  if (hasUSC) {
    return templates.map((template) => {
      if (template.name.trim().toLowerCase() !== USC_REFERRAL_TEMPLATE_NAME.toLowerCase()) {
        return template;
      }

      const hasHeaderHeightSet = template.template.headerBlocks.some((block) => block.logo?.heightIn !== undefined);
      const footerWidth = template.template.footerImage?.widthIn;
      if (!hasHeaderHeightSet && footerWidth === 0.5) {
        return template;
      }

      return {
        ...template,
        template: normalizeReferralTemplate({
          ...template.template,
          headerBlocks: template.template.headerBlocks.map((block) => ({
            ...block,
            logo: block.logo
              ? {
                  ...block.logo,
                  heightIn: undefined,
                }
              : undefined,
          })),
          footerImage: template.template.footerImage
            ? {
                ...template.template.footerImage,
                widthIn: 0.5,
              }
            : template.template.footerImage,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  return [...templates, createUSCSavedReferralTemplate()];
};

const normalizeSavedReferralTemplate = (
  saved: Partial<SavedReferralTemplate>,
  index: number
): SavedReferralTemplate => {
  const now = new Date().toISOString();
  const templateSource = saved.template ?? (saved as Partial<ReferralTemplate>);
  return {
    id: saved.id || `referral-template-${index + 1}-${createId()}`,
    name: saved.name?.trim() || `Referral Template ${index + 1}`,
    template: normalizeReferralTemplate(templateSource),
    createdAt: saved.createdAt || now,
    updatedAt: saved.updatedAt || saved.createdAt || now,
  };
};

const normalizeReferralTemplatesState = (storedData?: StoredData) => {
  const normalizedReferralTemplates = Array.isArray(storedData?.referralTemplates)
    ? storedData.referralTemplates.map((template, index) =>
      normalizeSavedReferralTemplate(template as Partial<SavedReferralTemplate>, index)
    )
    : [];

  if (normalizedReferralTemplates.length > 0) {
    const templatesWithUSC = ensureUSCReferralTemplate(normalizedReferralTemplates);
    const activeIdFromStorage = storedData?.activeReferralTemplateId;
    const activeTemplate = templatesWithUSC.find((template) => template.id === activeIdFromStorage);
    return {
      referralTemplates: templatesWithUSC,
      activeReferralTemplateId: activeTemplate ? activeTemplate.id : templatesWithUSC[0].id,
    };
  }

  if (storedData?.referralTemplate) {
    const now = new Date().toISOString();
    const migratedTemplate: SavedReferralTemplate = {
      id: createId(),
      name: 'Migrated Referral Template',
      template: normalizeReferralTemplate(storedData.referralTemplate),
      createdAt: now,
      updatedAt: now,
    };
    const templatesWithUSC = ensureUSCReferralTemplate([migratedTemplate]);
    return {
      referralTemplates: templatesWithUSC,
      activeReferralTemplateId: migratedTemplate.id,
    };
  }

  const uscTemplate = createUSCSavedReferralTemplate();
  const defaultTemplate = createDefaultSavedReferralTemplate();
  const templatesWithUSC = ensureUSCReferralTemplate([uscTemplate, defaultTemplate]);
  return {
    referralTemplates: templatesWithUSC,
    activeReferralTemplateId: uscTemplate.id,
  };
};

interface State {
  noteData: NoteData;
  templates: Template[];
  preferences: Preferences;
  savedDrafts: SavedDraft[];
  referralTemplates: SavedReferralTemplate[];
  activeReferralTemplateId: string;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof NoteData; value: NoteData[keyof NoteData] }
  | { type: 'UPDATE_TOOTH'; toothNumber: string }
  | { type: 'ADD_TOOTH_DIAGNOSIS'; toothNumber?: string }
  | { type: 'UPDATE_TOOTH_DIAGNOSIS'; id: string; field: keyof ToothDiagnosis; value: string | string[] }
  | { type: 'REMOVE_TOOTH_DIAGNOSIS'; id: string }
  | { type: 'UPDATE_CANAL_MAF'; canal: string; field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer'; value: string | boolean | string[] }
  | { type: 'ADD_TOOTH_TREATMENT_PLAN'; toothNumber?: string }
  | { type: 'UPDATE_TOOTH_TREATMENT_PLAN'; id: string; field: keyof ToothTreatmentPlan; value: ToothTreatmentPlan[keyof ToothTreatmentPlan] }
  | { type: 'REMOVE_TOOTH_TREATMENT_PLAN'; id: string }
  | { type: 'UPDATE_TOOTH_TREATMENT_CANAL_MAF'; planId: string; canal: string; field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer'; value: string | boolean | string[] }
  | { type: 'UPDATE_TOOTH_TREATMENT_SYSTEM_SIZE'; planId: string; canal: string; system: string; size: string; taper: string }
  | { type: 'RESET_FORM'; defaults?: Partial<NoteData> }
  | { type: 'APPLY_TEMPLATE'; noteData: NoteData }
  | { type: 'UPSERT_TEMPLATE'; template: Template }
  | { type: 'RENAME_TEMPLATE'; id: string; name: string }
  | { type: 'DELETE_TEMPLATE'; id: string }
  | { type: 'UPDATE_PREFERENCES'; preferences: Partial<Preferences> }
  | { type: 'UPDATE_ACTIVE_REFERRAL_TEMPLATE'; template: ReferralTemplate }
  | { type: 'SAVE_REFERRAL_TEMPLATE'; template: SavedReferralTemplate }
  | { type: 'RENAME_REFERRAL_TEMPLATE'; id: string; name: string }
  | { type: 'DELETE_REFERRAL_TEMPLATE'; id: string }
  | { type: 'SET_ACTIVE_REFERRAL_TEMPLATE'; id: string }
  | { type: 'LOAD_STATE'; state: Partial<State> }
  | { type: 'ADD_SAVED_DRAFT'; draft: SavedDraft }
  | { type: 'DELETE_SAVED_DRAFT'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        noteData: {
          ...state.noteData,
          [action.field]: action.value,
        },
      };

    case 'UPDATE_TOOTH': {
      const newToothType = getToothType(action.toothNumber);
      // Also update the first tooth diagnosis if it's empty
      const updatedDiagnoses = [...state.noteData.toothDiagnoses];
      if (updatedDiagnoses[0] && !updatedDiagnoses[0].toothNumber) {
        updatedDiagnoses[0] = {
          ...updatedDiagnoses[0],
          toothNumber: action.toothNumber,
          toothType: newToothType,
        };
      }
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothNumber: action.toothNumber,
          toothType: newToothType,
          toothDiagnoses: updatedDiagnoses,
        },
      };
    }

    case 'ADD_TOOTH_DIAGNOSIS':
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothDiagnoses: [...state.noteData.toothDiagnoses, createEmptyToothDiagnosis(action.toothNumber || '')],
        },
      };

    case 'UPDATE_TOOTH_DIAGNOSIS': {
      const updatedDiagnoses = state.noteData.toothDiagnoses.map((d) => {
        if (d.id === action.id) {
          const updated = { ...d, [action.field]: action.value };
          // Update tooth type if tooth number changed
          if (action.field === 'toothNumber' && typeof action.value === 'string') {
            updated.toothType = getToothType(action.value);
          }
          return updated;
        }
        return d;
      });
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothDiagnoses: updatedDiagnoses,
        },
      };
    }

    case 'REMOVE_TOOTH_DIAGNOSIS':
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothDiagnoses: state.noteData.toothDiagnoses.filter((d) => d.id !== action.id),
        },
      };

    case 'ADD_TOOTH_TREATMENT_PLAN':
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothTreatmentPlans: [
            ...state.noteData.toothTreatmentPlans,
            createEmptyToothTreatmentPlan(action.toothNumber || ''),
          ],
        },
      };

    case 'UPDATE_TOOTH_TREATMENT_PLAN': {
      const updatedPlans = state.noteData.toothTreatmentPlans.map((plan) => {
        if (plan.id === action.id) {
          const updated = { ...plan, [action.field]: action.value };
          // Update tooth type if tooth number changed
          if (action.field === 'toothNumber' && typeof action.value === 'string') {
            updated.toothType = getToothType(action.value);
          }
          return updated;
        }
        return plan;
      });
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothTreatmentPlans: updatedPlans,
        },
      };
    }

    case 'REMOVE_TOOTH_TREATMENT_PLAN':
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothTreatmentPlans: state.noteData.toothTreatmentPlans.filter((p) => p.id !== action.id),
        },
      };

    case 'UPDATE_TOOTH_TREATMENT_CANAL_MAF': {
      const updatedPlans = state.noteData.toothTreatmentPlans.map((plan) => {
        if (plan.id === action.planId) {
          const existingIndex = plan.canalMAFs.findIndex((m) => m.canal === action.canal);
          let updatedMAFs: CanalMAF[];

          if (existingIndex >= 0) {
            updatedMAFs = plan.canalMAFs.map((m, i) =>
              i === existingIndex ? { ...m, [action.field]: action.value } : m
            );
          } else {
            updatedMAFs = [
              ...plan.canalMAFs,
              {
                canal: action.canal,
                patent: false,
                workingLength: '',
                referencePoint: '',
                fileSystem: [],
                size: '',
                sizes: [],
                systemSizes: {},
                taper: '',
                systemTapers: {},
                obturationTechnique: '',
                obturationMaterial: '',
                obturationSealer: '',
                [action.field]: action.value,
              },
            ];
          }

          return { ...plan, canalMAFs: updatedMAFs };
        }
        return plan;
      });
      return {
        ...state,
        noteData: {
          ...state.noteData,
          toothTreatmentPlans: updatedPlans,
        },
      };
    }

    case 'UPDATE_TOOTH_TREATMENT_SYSTEM_SIZE': {
      const updatedPlans = state.noteData.toothTreatmentPlans.map((plan) => {
        if (plan.id !== action.planId) return plan;
        const existingIndex = plan.canalMAFs.findIndex((m) => m.canal === action.canal);
        let updatedMAFs: CanalMAF[];
        if (existingIndex >= 0) {
          updatedMAFs = plan.canalMAFs.map((m, i) => {
            if (i !== existingIndex) return m;
            const nextSizes = { ...m.systemSizes };
            const nextTapers = { ...m.systemTapers };
            if (action.size) nextSizes[action.system] = action.size;
            else delete nextSizes[action.system];
            if (action.taper) nextTapers[action.system] = action.taper;
            else delete nextTapers[action.system];
            return { ...m, systemSizes: nextSizes, systemTapers: nextTapers };
          });
        } else {
          const nextSizes: Record<string, string> = {};
          const nextTapers: Record<string, string> = {};
          if (action.size) nextSizes[action.system] = action.size;
          if (action.taper) nextTapers[action.system] = action.taper;
          updatedMAFs = [...plan.canalMAFs, {
            canal: action.canal, patent: false, workingLength: '', referencePoint: '',
            fileSystem: [], size: '', sizes: [], systemSizes: nextSizes, taper: '', systemTapers: nextTapers,
            obturationTechnique: '', obturationMaterial: '', obturationSealer: '',
          }];
        }
        return { ...plan, canalMAFs: updatedMAFs };
      });
      return { ...state, noteData: { ...state.noteData, toothTreatmentPlans: updatedPlans } };
    }

    case 'UPDATE_CANAL_MAF': {
      const existingIndex = state.noteData.canalMAFs.findIndex((m) => m.canal === action.canal);
      let updatedMAFs: CanalMAF[];

      if (existingIndex >= 0) {
        updatedMAFs = state.noteData.canalMAFs.map((m, i) =>
          i === existingIndex ? { ...m, [action.field]: action.value } : m
        );
      } else {
        updatedMAFs = [
          ...state.noteData.canalMAFs,
          {
            canal: action.canal,
            patent: false,
            workingLength: '',
            referencePoint: '',
            fileSystem: [],
            size: '',
            sizes: [],
            systemSizes: {},
            taper: '',
            systemTapers: {},
            obturationTechnique: '',
            obturationMaterial: '',
            obturationSealer: '',
            [action.field]: action.value
          },
        ];
      }

      return {
        ...state,
        noteData: {
          ...state.noteData,
          canalMAFs: updatedMAFs,
        },
      };
    }

    case 'RESET_FORM':
      return {
        ...state,
        noteData: {
          ...initialNoteData,
          ...(action.defaults ?? {}),
          toothDiagnoses: [createEmptyToothDiagnosis()],
          toothTreatmentPlans: [],
        },
      };

    case 'APPLY_TEMPLATE':
      return {
        ...state,
        noteData: {
          ...action.noteData,
        },
      };

    case 'UPSERT_TEMPLATE': {
      const existingIndex = state.templates.findIndex((t) => t.id === action.template.id);
      if (existingIndex >= 0) {
        const updated = [...state.templates];
        updated[existingIndex] = action.template;
        return { ...state, templates: updated };
      }
      return {
        ...state,
        templates: [...state.templates, action.template],
      };
    }

    case 'RENAME_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map((template) =>
          template.id === action.id ? { ...template, name: action.name } : template
        ),
      };

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.id),
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences,
        },
      };
    case 'UPDATE_ACTIVE_REFERRAL_TEMPLATE':
      return {
        ...state,
        referralTemplates: state.referralTemplates.map((savedTemplate) =>
          savedTemplate.id === state.activeReferralTemplateId
            ? {
                ...savedTemplate,
                template: action.template,
                updatedAt: new Date().toISOString(),
              }
            : savedTemplate
        ),
      };

    case 'SAVE_REFERRAL_TEMPLATE': {
      const existingIndex = state.referralTemplates.findIndex((template) => template.id === action.template.id);
      if (existingIndex >= 0) {
        const updated = [...state.referralTemplates];
        updated[existingIndex] = action.template;
        return {
          ...state,
          referralTemplates: updated,
          activeReferralTemplateId: action.template.id,
        };
      }

      return {
        ...state,
        referralTemplates: [...state.referralTemplates, action.template],
        activeReferralTemplateId: action.template.id,
      };
    }

    case 'RENAME_REFERRAL_TEMPLATE':
      return {
        ...state,
        referralTemplates: state.referralTemplates.map((template) =>
          template.id === action.id
            ? { ...template, name: action.name, updatedAt: new Date().toISOString() }
            : template
        ),
      };

    case 'DELETE_REFERRAL_TEMPLATE': {
      if (state.referralTemplates.length <= 1) {
        return state;
      }

      const nextTemplates = state.referralTemplates.filter((template) => template.id !== action.id);
      const activeStillExists = nextTemplates.some((template) => template.id === state.activeReferralTemplateId);
      return {
        ...state,
        referralTemplates: nextTemplates,
        activeReferralTemplateId: activeStillExists
          ? state.activeReferralTemplateId
          : nextTemplates[0].id,
      };
    }

    case 'SET_ACTIVE_REFERRAL_TEMPLATE':
      if (!state.referralTemplates.some((template) => template.id === action.id)) {
        return state;
      }
      return {
        ...state,
        activeReferralTemplateId: action.id,
      };

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state,
      };

    case 'ADD_SAVED_DRAFT': {
      const newDrafts = [action.draft, ...state.savedDrafts];
      // Keep only the last 5 drafts
      return {
        ...state,
        savedDrafts: newDrafts.slice(0, 5),
      };
    }

    case 'DELETE_SAVED_DRAFT':
      return {
        ...state,
        savedDrafts: state.savedDrafts.filter((d) => d.id !== action.id),
      };

    default:
      return state;
  }
}

interface NoteContextType {
  noteData: NoteData;
  templates: Template[];
  preferences: Preferences;
  savedDrafts: SavedDraft[];
  referralTemplates: SavedReferralTemplate[];
  activeReferralTemplateId: string;
  referralTemplate: ReferralTemplate;
  noteOutputDraft: string | null;
  referralOutputDraft: string | null;
  hasPendingDraft: boolean;
  hasSavedDraft: boolean;
  restoreDraft: () => void;
  discardDraft: () => void;
  clearSavedDraft: () => void;
  clearDraftAndReset: () => void;
  saveDraftToHistory: () => void;
  loadDraftFromHistory: (draftId: string) => void;
  deleteDraftFromHistory: (draftId: string) => void;
  setNoteOutputDraft: (text: string | null) => void;
  setReferralOutputDraft: (text: string | null) => void;
  updateField: <K extends keyof NoteData>(field: K, value: NoteData[K]) => void;
  updateTooth: (toothNumber: string) => void;
  addToothDiagnosis: (toothNumber?: string) => void;
  updateToothDiagnosis: (id: string, field: keyof ToothDiagnosis, value: string | string[]) => void;
  removeToothDiagnosis: (id: string) => void;
  updateCanalMAF: (canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean | string[]) => void;
  addToothTreatmentPlan: (toothNumber?: string) => void;
  updateToothTreatmentPlan: <K extends keyof ToothTreatmentPlan>(id: string, field: K, value: ToothTreatmentPlan[K]) => void;
  removeToothTreatmentPlan: (id: string) => void;
  updateToothTreatmentCanalMAF: (planId: string, canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean | string[]) => void;
  updateToothTreatmentSystemSize: (planId: string, canal: string, system: string, size: string, taper: string) => void;
  resetForm: () => void;
  loadTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;
  renameTemplate: (id: string, name: string) => void;
  deleteTemplate: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  updateReferralTemplate: (template: ReferralTemplate) => void;
  setActiveReferralTemplate: (id: string) => void;
  saveReferralTemplateAs: (name: string) => string;
  renameReferralTemplate: (id: string, name: string) => void;
  deleteReferralTemplate: (id: string) => void;
}

const NoteContext = createContext<NoteContextType | null>(null);

const STORAGE_KEY = 'endonote_data';

const normalizeTemplate = (template: Partial<Template>): Template => {
  const data = template.data ?? {};
  const visitType = template.visitType ?? (data.visitType as NoteData['visitType']) ?? 'any';
  const scope = template.scope && template.scope.length > 0 ? template.scope : (['all'] as TemplateScope[]);
  return {
    id: template.id || Date.now().toString(),
    name: template.name || 'Untitled Template',
    data,
    scope,
    visitType,
    toothType: template.toothType ?? 'any',
    procedureTypes: template.procedureTypes ?? 'any',
    createdAt: template.createdAt || new Date().toISOString(),
  };
};

const cloneValue = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const applyTemplateToNoteData = (
  current: NoteData,
  template: Template
): NoteData => {
  if (template.scope.includes('all')) {
    return normalizeNoteData(template.data);
  }

  let next: NoteData = { ...current };
  const selectedFields = new Set<keyof NoteData>();
  template.scope.forEach((scope) => {
    if (scope === 'all') return;
    templateScopeFields[scope].forEach((field) => selectedFields.add(field));
  });

  selectedFields.forEach((field) => {
    if (field === 'toothDiagnoses') {
      next = {
        ...next,
        toothDiagnoses: normalizeToothDiagnoses(
          template.data.toothDiagnoses,
          template.data.toothNumber ?? current.toothNumber
        ),
      };
      return;
    }
    const value = template.data[field];
    if (value !== undefined) {
      next = { ...next, [field]: cloneValue(value) };
    } else {
      next = { ...next, [field]: cloneValue(initialNoteData[field]) };
    }
  });

  if (
    selectedFields.has('toothNumber') &&
    !template.data.toothType &&
    template.data.toothNumber
  ) {
    next = { ...next, toothType: getToothType(template.data.toothNumber) };
  }

  return next;
};

// Helper to generate a preview string for a draft
const generateDraftPreview = (noteData: NoteData): string => {
  const parts: string[] = [];
  if (noteData.patientName) parts.push(`Patient: ${noteData.patientName}`);
  if (noteData.toothNumber) parts.push(`Tooth: #${noteData.toothNumber}`);
  if (noteData.age) parts.push(`Age: ${noteData.age}`);
  if (parts.length === 0) parts.push('Draft Note');
  return parts.join(' | ');
};

export function NoteProvider({ children }: { children: ReactNode }) {
  const initialReferralTemplateState = useMemo(() => normalizeReferralTemplatesState(), []);
  const [state, dispatch] = useReducer(reducer, {
    noteData: { ...initialNoteData, toothDiagnoses: [createEmptyToothDiagnosis()] },
    templates: [],
    preferences: initialPreferences,
    savedDrafts: [],
    referralTemplates: initialReferralTemplateState.referralTemplates,
    activeReferralTemplateId: initialReferralTemplateState.activeReferralTemplateId,
  });
  const [outputEdits, setOutputEdits] = useState<OutputEdits>(initialOutputEdits);
  const [pendingDraft, setPendingDraft] = useState<NoteData | null>(null);
  const [pendingOutputEdits, setPendingOutputEdits] = useState<OutputEdits | null>(null);
  const [isDraftResolved, setIsDraftResolved] = useState(false);
  const activeReferralTemplateRecord = useMemo(
    () =>
      state.referralTemplates.find(
        (template) => template.id === state.activeReferralTemplateId
      ) ?? state.referralTemplates[0],
    [state.referralTemplates, state.activeReferralTemplateId]
  );
  const activeReferralTemplate = activeReferralTemplateRecord?.template ?? normalizeReferralTemplate(defaultReferralTemplate);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredData;
        const normalizedTemplates = Array.isArray(parsed.templates)
          ? parsed.templates.map((template: Partial<Template>) => normalizeTemplate(template))
          : [];
        const savedDrafts = Array.isArray(parsed.savedDrafts) ? parsed.savedDrafts : [];
        const storedNoteData = parsed.noteData ? normalizeNoteData(parsed.noteData) : undefined;
        const referralTemplatesState = normalizeReferralTemplatesState(parsed);
        const storedOutputEdits = normalizeOutputEdits(parsed.outputEdits);
        const hasStoredOutputEdits = Boolean(storedOutputEdits.noteText || storedOutputEdits.referralText);
        dispatch({
          type: 'LOAD_STATE',
          state: {
            templates: normalizedTemplates,
            preferences: { ...initialPreferences, ...parsed.preferences },
            savedDrafts,
            referralTemplates: referralTemplatesState.referralTemplates,
            activeReferralTemplateId: referralTemplatesState.activeReferralTemplateId,
          },
        });
        if ((storedNoteData && hasDraftContent(storedNoteData)) || hasStoredOutputEdits) {
          setPendingDraft(storedNoteData ?? null);
          setPendingOutputEdits(hasStoredOutputEdits ? storedOutputEdits : null);
          setIsDraftResolved(false);
        } else {
          setIsDraftResolved(true);
        }
      } catch (e) {
        console.error('Failed to load stored data:', e);
        setIsDraftResolved(true);
      }
    } else {
      setIsDraftResolved(true);
    }
  }, []);

  // Save to localStorage when templates, preferences, note data, or saved drafts change
  useEffect(() => {
    if (!isDraftResolved) {
      return;
    }
    const dataToStore = {
      templates: state.templates,
      preferences: state.preferences,
      noteData: state.noteData,
      referralTemplate: activeReferralTemplate, // legacy single-template compatibility
      referralTemplates: state.referralTemplates,
      activeReferralTemplateId: state.activeReferralTemplateId,
      outputEdits,
      savedDrafts: state.savedDrafts,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [
    state.templates,
    state.preferences,
    state.noteData,
    state.referralTemplates,
    state.activeReferralTemplateId,
    activeReferralTemplate,
    outputEdits,
    state.savedDrafts,
    isDraftResolved,
  ]);

  // Apply dark mode class to document
  useEffect(() => {
    if (state.preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.preferences.darkMode]);

  const updateField = <K extends keyof NoteData>(field: K, value: NoteData[K]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: value as NoteData[keyof NoteData] });
  };

  const updateTooth = (toothNumber: string) => {
    dispatch({ type: 'UPDATE_TOOTH', toothNumber });
  };

  const addToothDiagnosis = (toothNumber?: string) => {
    dispatch({ type: 'ADD_TOOTH_DIAGNOSIS', toothNumber });
  };

  const updateToothDiagnosis = (id: string, field: keyof ToothDiagnosis, value: string | string[]) => {
    dispatch({ type: 'UPDATE_TOOTH_DIAGNOSIS', id, field, value });
  };

  const removeToothDiagnosis = (id: string) => {
    dispatch({ type: 'REMOVE_TOOTH_DIAGNOSIS', id });
  };

  const updateCanalMAF = (canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean | string[]) => {
    dispatch({ type: 'UPDATE_CANAL_MAF', canal, field, value });
  };

  const addToothTreatmentPlan = (toothNumber?: string) => {
    dispatch({ type: 'ADD_TOOTH_TREATMENT_PLAN', toothNumber });
  };

  const updateToothTreatmentPlan = <K extends keyof ToothTreatmentPlan>(
    id: string,
    field: K,
    value: ToothTreatmentPlan[K]
  ) => {
    dispatch({
      type: 'UPDATE_TOOTH_TREATMENT_PLAN',
      id,
      field,
      value: value as ToothTreatmentPlan[keyof ToothTreatmentPlan]
    });
  };

  const removeToothTreatmentPlan = (id: string) => {
    dispatch({ type: 'REMOVE_TOOTH_TREATMENT_PLAN', id });
  };

  const updateToothTreatmentCanalMAF = (
    planId: string,
    canal: string,
    field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'sizes' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer',
    value: string | boolean | string[]
  ) => {
    dispatch({ type: 'UPDATE_TOOTH_TREATMENT_CANAL_MAF', planId, canal, field, value });
  };

  const updateToothTreatmentSystemSize = (planId: string, canal: string, system: string, size: string, taper: string) => {
    dispatch({ type: 'UPDATE_TOOTH_TREATMENT_SYSTEM_SIZE', planId, canal, system, size, taper });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM', defaults: applyDefaultsFromPreferences(state.preferences) });
  };

  const loadTemplate = (template: Template) => {
    dispatch({ type: 'APPLY_TEMPLATE', noteData: applyTemplateToNoteData(state.noteData, template) });
  };

  const saveTemplate = (template: Template) => {
    dispatch({ type: 'UPSERT_TEMPLATE', template });
  };

  const renameTemplate = (id: string, name: string) => {
    dispatch({ type: 'RENAME_TEMPLATE', id, name });
  };

  const deleteTemplate = (id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', id });
  };

  const updatePreferences = (prefs: Partial<Preferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', preferences: prefs });
  };

  const updateReferralTemplate = (template: ReferralTemplate) => {
    dispatch({ type: 'UPDATE_ACTIVE_REFERRAL_TEMPLATE', template: normalizeReferralTemplate(template) });
  };

  const setActiveReferralTemplate = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_REFERRAL_TEMPLATE', id });
  };

  const saveReferralTemplateAs = (name: string) => {
    const now = new Date().toISOString();
    const savedTemplate: SavedReferralTemplate = {
      id: createId(),
      name,
      template: cloneValue(activeReferralTemplate),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'SAVE_REFERRAL_TEMPLATE', template: savedTemplate });
    return savedTemplate.id;
  };

  const renameReferralTemplate = (id: string, name: string) => {
    dispatch({ type: 'RENAME_REFERRAL_TEMPLATE', id, name });
  };

  const deleteReferralTemplate = (id: string) => {
    dispatch({ type: 'DELETE_REFERRAL_TEMPLATE', id });
  };

  const restoreDraft = () => {
    if (pendingDraft) {
      dispatch({ type: 'LOAD_STATE', state: { noteData: pendingDraft } });
    }
    if (pendingOutputEdits) {
      setOutputEdits(pendingOutputEdits);
    }
    setPendingDraft(null);
    setPendingOutputEdits(null);
    setIsDraftResolved(true);
  };

  const clearSavedDraft = () => {
    const dataToStore = {
      templates: state.templates,
      preferences: state.preferences,
      referralTemplate: activeReferralTemplate,
      referralTemplates: state.referralTemplates,
      activeReferralTemplateId: state.activeReferralTemplateId,
      savedDrafts: state.savedDrafts,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    setPendingDraft(null);
    setPendingOutputEdits(null);
    setIsDraftResolved(true);
  };

  const discardDraft = () => {
    clearSavedDraft();
    setPendingDraft(null);
    setPendingOutputEdits(null);
    setOutputEdits(initialOutputEdits);
    setIsDraftResolved(true);
  };

  const clearDraftAndReset = () => {
    clearSavedDraft();
    setOutputEdits(initialOutputEdits);
    dispatch({ type: 'RESET_FORM', defaults: applyDefaultsFromPreferences(state.preferences) });
  };

  const saveDraftToHistory = () => {
    if (!hasDraftContent(state.noteData) && !outputEdits.noteText && !outputEdits.referralText) {
      return; // Don't save empty drafts
    }
    const draft: SavedDraft = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      noteData: cloneValue(state.noteData),
      outputEdits: {
        noteText: outputEdits.noteText,
        referralText: outputEdits.referralText,
      },
      preview: generateDraftPreview(state.noteData),
    };
    dispatch({ type: 'ADD_SAVED_DRAFT', draft });
  };

  const loadDraftFromHistory = (draftId: string) => {
    const draft = state.savedDrafts.find((d) => d.id === draftId);
    if (draft) {
      dispatch({ type: 'LOAD_STATE', state: { noteData: normalizeNoteData(draft.noteData) } });
      setOutputEdits(draft.outputEdits);
    }
  };

  const deleteDraftFromHistory = (draftId: string) => {
    dispatch({ type: 'DELETE_SAVED_DRAFT', id: draftId });
  };

  const hasPendingDraft = (Boolean(pendingDraft) || Boolean(pendingOutputEdits)) && !isDraftResolved;
  const hasSavedDraft =
    hasPendingDraft ||
    hasDraftContent(state.noteData) ||
    Boolean(outputEdits.noteText || outputEdits.referralText);

  const setNoteOutputDraft = (text: string | null) => {
    setOutputEdits((prev) => ({ ...prev, noteText: text }));
  };

  const setReferralOutputDraft = (text: string | null) => {
    setOutputEdits((prev) => ({ ...prev, referralText: text }));
  };

  return (
    <NoteContext.Provider
      value={{
        noteData: state.noteData,
        templates: state.templates,
        preferences: state.preferences,
        savedDrafts: state.savedDrafts,
        referralTemplates: state.referralTemplates,
        activeReferralTemplateId: state.activeReferralTemplateId,
        referralTemplate: activeReferralTemplate,
        noteOutputDraft: outputEdits.noteText,
        referralOutputDraft: outputEdits.referralText,
        hasPendingDraft,
        hasSavedDraft,
        restoreDraft,
        discardDraft,
        clearSavedDraft,
        clearDraftAndReset,
        saveDraftToHistory,
        loadDraftFromHistory,
        deleteDraftFromHistory,
        setNoteOutputDraft,
        setReferralOutputDraft,
        updateField,
        updateTooth,
        addToothDiagnosis,
        updateToothDiagnosis,
        removeToothDiagnosis,
        updateCanalMAF,
        addToothTreatmentPlan,
        updateToothTreatmentPlan,
        removeToothTreatmentPlan,
        updateToothTreatmentCanalMAF,
        updateToothTreatmentSystemSize,
        resetForm,
        loadTemplate,
        saveTemplate,
        renameTemplate,
        deleteTemplate,
        updatePreferences,
        updateReferralTemplate,
        setActiveReferralTemplate,
        saveReferralTemplateAs,
        renameReferralTemplate,
        deleteReferralTemplate,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNote() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
}
