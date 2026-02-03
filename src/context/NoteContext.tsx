import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NoteData, Template, Preferences, ToothDiagnosis, CanalMAF, AnesthesiaAmounts } from '../types';
import { getToothType } from '../data';

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
  | { type: 'LOAD_TEMPLATE'; template: Partial<NoteData> }
  | { type: 'SAVE_TEMPLATE'; template: Template }
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

    case 'LOAD_TEMPLATE':
      return {
        ...state,
        noteData: {
          ...initialNoteData,
          ...action.template,
          toothDiagnoses:
            action.template.toothDiagnoses?.length
              ? action.template.toothDiagnoses
              : [createEmptyToothDiagnosis()],
        },
      };

    case 'SAVE_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, action.template],
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
  updateField: <K extends keyof NoteData>(field: K, value: NoteData[K]) => void;
  updateTooth: (toothNumber: string) => void;
  addToothDiagnosis: (toothNumber?: string) => void;
  updateToothDiagnosis: (id: string, field: keyof ToothDiagnosis, value: string) => void;
  removeToothDiagnosis: (id: string) => void;
  updateCanalMAF: (canal: string, field: 'patent' | 'workingLength' | 'referencePoint' | 'fileSystem' | 'size' | 'taper' | 'obturationTechnique' | 'obturationMaterial' | 'obturationSealer', value: string | boolean) => void;
  resetForm: () => void;
  loadTemplate: (template: Partial<NoteData>) => void;
  saveTemplate: (name: string) => void;
  deleteTemplate: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
}

const NoteContext = createContext<NoteContextType | null>(null);

const STORAGE_KEY = 'endonote_data';

export function NoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    noteData: { ...initialNoteData, toothDiagnoses: [createEmptyToothDiagnosis()] },
    templates: [],
    preferences: initialPreferences,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({
          type: 'LOAD_STATE',
          state: {
            templates: parsed.templates || [],
            preferences: { ...initialPreferences, ...parsed.preferences },
          },
        });
      } catch (e) {
        console.error('Failed to load stored data:', e);
      }
    }
  }, []);

  // Save to localStorage when templates or preferences change
  useEffect(() => {
    const dataToStore = {
      templates: state.templates,
      preferences: state.preferences,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }, [state.templates, state.preferences]);

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

  const loadTemplate = (template: Partial<NoteData>) => {
    dispatch({ type: 'LOAD_TEMPLATE', template });
  };

  const saveTemplate = (name: string) => {
    const template: Template = {
      id: Date.now().toString(),
      name,
      data: { ...state.noteData },
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SAVE_TEMPLATE', template });
  };

  const deleteTemplate = (id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', id });
  };

  const updatePreferences = (prefs: Partial<Preferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', preferences: prefs });
  };

  return (
    <NoteContext.Provider
      value={{
        noteData: state.noteData,
        templates: state.templates,
        preferences: state.preferences,
        updateField,
        updateTooth,
        addToothDiagnosis,
        updateToothDiagnosis,
        removeToothDiagnosis,
        updateCanalMAF,
        resetForm,
        loadTemplate,
        saveTemplate,
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
