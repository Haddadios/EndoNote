import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { NoteData, Template, Preferences, ToothDiagnosis, CanalMAF, AnesthesiaAmounts, TemplateScope } from '../types';
import { getToothType } from '../data';
import { templateScopeFields } from '../utils/templateUtils';

// Helper to create empty tooth diagnosis
const createEmptyToothDiagnosis = (toothNumber = ''): ToothDiagnosis => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  toothNumber,
  toothType: toothNumber ? getToothType(toothNumber) : 'molar',
  pulpalDiagnosis: '',
  periapicalDiagnosis: '',
  prognosis: '',
  recommendedTreatment: '',
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
    hasNonEmptyString(data.isolation) ||
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
    data.treatmentOptionsOffered.length > 0 ||
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
        hasNonEmptyString(diagnosis.recommendedTreatment)
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
        hasNonEmptyString(maf.fileSystem) ||
        hasNonEmptyString(maf.size) ||
        hasNonEmptyString(maf.taper) ||
        hasNonEmptyString(maf.obturationTechnique) ||
        hasNonEmptyString(maf.obturationMaterial) ||
        hasNonEmptyString(maf.obturationSealer)
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

  // Plan
  treatmentOptionsOffered: [],
  treatmentComments: '',
  consentGiven: false,
  anesthesiaAmounts: { ...initialAnesthesiaAmounts },
  anesthesiaLocations: [],
  anesthesiaLocationMapping: {},
  anesthesiaLocationSides: {},
  isolation: '',
  canalConfiguration: [],
  customCanalNames: [],
  workingLengthMethod: [],
  canalMAFs: [],
  irrigationProtocol: [],
  medicament: '',
  restoration: '',
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

  return {
    ...merged,
    probingDepths: { ...initialNoteData.probingDepths, ...(data?.probingDepths ?? {}) },
    anesthesiaAmounts: { ...initialAnesthesiaAmounts, ...(data?.anesthesiaAmounts ?? {}) },
    anesthesiaLocationMapping: data?.anesthesiaLocationMapping ?? {},
    anesthesiaLocationSides: data?.anesthesiaLocationSides ?? {},
    toothDiagnoses: normalizeToothDiagnoses(data?.toothDiagnoses, data?.toothNumber),
  };
};

const initialPreferences: Preferences = {
  toothNotation: 'universal',
  darkMode: false,
};

interface State {
  noteData: NoteData;
  templates: Template[];
  preferences: Preferences;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof NoteData; value: NoteData[keyof NoteData] }
  | { type: 'UPDATE_TOOTH'; toothNumber: string }
  | { type: 'ADD_TOOTH_DIAGNOSIS'; toothNumber?: string }
  | { type: 'UPDATE_TOOTH_DIAGNOSIS'; id: string; field: keyof ToothDiagnosis; value: string }
  | { type: 'REMOVE_TOOTH_DIAGNOSIS'; id: string }
  | { type: 'UPDATE_CANAL_MAF'; canal: string; field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer'; value: string | boolean }
  | { type: 'RESET_FORM' }
  | { type: 'APPLY_TEMPLATE'; noteData: NoteData }
  | { type: 'UPSERT_TEMPLATE'; template: Template }
  | { type: 'RENAME_TEMPLATE'; id: string; name: string }
  | { type: 'DELETE_TEMPLATE'; id: string }
  | { type: 'UPDATE_PREFERENCES'; preferences: Partial<Preferences> }
  | { type: 'LOAD_STATE'; state: Partial<State> };

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
          if (action.field === 'toothNumber') {
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
            fileSystem: '',
            size: '',
            taper: '',
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
          toothDiagnoses: [createEmptyToothDiagnosis()],
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

    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state,
      };

    default:
      return state;
  }
}

interface NoteContextType {
  noteData: NoteData;
  templates: Template[];
  preferences: Preferences;
  noteOutputDraft: string | null;
  referralOutputDraft: string | null;
  hasPendingDraft: boolean;
  hasSavedDraft: boolean;
  restoreDraft: () => void;
  discardDraft: () => void;
  clearSavedDraft: () => void;
  clearDraftAndReset: () => void;
  setNoteOutputDraft: (text: string | null) => void;
  setReferralOutputDraft: (text: string | null) => void;
  updateField: <K extends keyof NoteData>(field: K, value: NoteData[K]) => void;
  updateTooth: (toothNumber: string) => void;
  addToothDiagnosis: (toothNumber?: string) => void;
  updateToothDiagnosis: (id: string, field: keyof ToothDiagnosis, value: string) => void;
  removeToothDiagnosis: (id: string) => void;
  updateCanalMAF: (canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean) => void;
  resetForm: () => void;
  loadTemplate: (template: Template) => void;
  saveTemplate: (template: Template) => void;
  renameTemplate: (id: string, name: string) => void;
  deleteTemplate: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
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

export function NoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    noteData: { ...initialNoteData, toothDiagnoses: [createEmptyToothDiagnosis()] },
    templates: [],
    preferences: initialPreferences,
  });
  const [outputEdits, setOutputEdits] = useState<OutputEdits>(initialOutputEdits);
  const [pendingDraft, setPendingDraft] = useState<NoteData | null>(null);
  const [pendingOutputEdits, setPendingOutputEdits] = useState<OutputEdits | null>(null);
  const [isDraftResolved, setIsDraftResolved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalizedTemplates = Array.isArray(parsed.templates)
          ? parsed.templates.map((template: Partial<Template>) => normalizeTemplate(template))
          : [];
        const storedNoteData = parsed.noteData ? normalizeNoteData(parsed.noteData) : undefined;
        const storedOutputEdits = normalizeOutputEdits(parsed.outputEdits);
        const hasStoredOutputEdits = Boolean(storedOutputEdits.noteText || storedOutputEdits.referralText);
        dispatch({
          type: 'LOAD_STATE',
          state: {
            templates: normalizedTemplates,
            preferences: { ...initialPreferences, ...parsed.preferences },
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

  // Save to localStorage when templates, preferences, or note data change
  useEffect(() => {
    if (!isDraftResolved) {
      return;
    }
    const dataToStore = {
      templates: state.templates,
      preferences: state.preferences,
      noteData: state.noteData,
      outputEdits,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [state.templates, state.preferences, state.noteData, outputEdits, isDraftResolved]);

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

  const updateToothDiagnosis = (id: string, field: keyof ToothDiagnosis, value: string) => {
    dispatch({ type: 'UPDATE_TOOTH_DIAGNOSIS', id, field, value });
  };

  const removeToothDiagnosis = (id: string) => {
    dispatch({ type: 'REMOVE_TOOTH_DIAGNOSIS', id });
  };

  const updateCanalMAF = (canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean) => {
    dispatch({ type: 'UPDATE_CANAL_MAF', canal, field, value });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
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
    dispatch({ type: 'RESET_FORM' });
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
        noteOutputDraft: outputEdits.noteText,
        referralOutputDraft: outputEdits.referralText,
        hasPendingDraft,
        hasSavedDraft,
        restoreDraft,
        discardDraft,
        clearSavedDraft,
        clearDraftAndReset,
        setNoteOutputDraft,
        setReferralOutputDraft,
        updateField,
        updateTooth,
        addToothDiagnosis,
        updateToothDiagnosis,
        removeToothDiagnosis,
        updateCanalMAF,
        resetForm,
        loadTemplate,
        saveTemplate,
        renameTemplate,
        deleteTemplate,
        updatePreferences,
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
