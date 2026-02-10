export type TreatmentType =
  | 'initial_rct'
  | 'continuing_rct'
  | 'ns_rerct'
  | 'apical_microsurgery'
  | 'hemisection'
  | 'root_resection'
  | 'apexification'
  | 'apexogenesis'
  | 'regenerative_endo'
  | 'intentional_replantation'
  | 'autotransplantation'
  | 'direct_restoration'
  | 'extraction'
  | 'no_treatment_monitoring'
  | 'trauma'
  | 'other';

export type ToothType = 'anterior' | 'premolar' | 'molar';

export type ToothNotation = 'universal' | 'fdi';

export interface ToothDiagnosis {
  id: string;
  toothNumber: string;
  toothType: ToothType;
  pulpalDiagnosis: string;
  periapicalDiagnosis: string;
  prognosis: string;
  recommendedTreatment: string;
}

export interface CanalMAF {
  canal: string;
  patent: boolean;
  workingLength: string;
  referencePoint: string;
  fileSystem: string;
  size: string;
  taper: string;
  obturationTechnique: string;
  obturationMaterial: string;
  obturationSealer: string;
}

export interface ToothTreatmentPlan {
  id: string;
  toothNumber: string;
  toothType: ToothType;
  canalConfiguration: string[];
  customCanalNames: string[];
  canalMAFs: CanalMAF[];
  workingLengthMethod: string[];
  restoration: string;
}

export interface AnesthesiaAmounts {
  lidocaine_epi: string;
  lidocaine_no_epi: string;
  articaine_epi: string;
  articaine_200: string;
  carbocaine: string;
  bupivacaine: string;
  marcaine: string;
}

export type VisitType = 'first_visit' | 'continuing_treatment';
export type TemplateScope = 'all' | 'subjective' | 'objective' | 'assessment' | 'plan' | 'referral';

export interface ProbingDepths {
  MB: string; // Mesio-Buccal
  B: string;  // Buccal
  DB: string; // Disto-Buccal
  DL: string; // Disto-Lingual
  L: string;  // Lingual
  ML: string; // Mesio-Lingual
}

export interface NoteData {
  // Patient/Tooth Info (for quick-select / first tooth)
  toothNumber: string;
  toothType: ToothType;
  patientName: string;
  patientChartNumber: string;
  patientDOB: string;

  // Subjective
  visitType: VisitType;
  age: string;
  gender: string;
  chiefComplaints: string[];
  chiefComplaintCustom: string;
  painDuration: string;
  painDurationCustom: string;
  painCharacteristics: string[];
  painHistoryOther: string;
  bloodPressure: string;
  pulse: string;
  respiratoryRate: string;
  medicalHistoryAlerts: string[];
  medicalHistoryComments: string;
  continuingTreatmentComments: string;

  // Objective (clinical findings only, diagnoses moved to assessment)
  coldTest: string[];
  eptTest: string[];
  heatTest: string[];
  vitalityTestComments: string;
  percussion: string[];
  palpation: string[];
  probingDepths: ProbingDepths;
  mobility: string[];
  swelling: string[];
  sinusTract: boolean;
  radiographicFindings: string[];
  clinicalFindingsComments: string;
  objectiveNotes: string;
  continuingTreatmentObjectiveComments: string;

  // Assessment - multi-tooth diagnoses
  toothDiagnoses: ToothDiagnosis[];
  assessmentNotes: string;

  // Referral Letter
  referralLetterDate: string;
  consultationDate: string;
  treatmentCompletionDate: string;
  treatmentPerformed: string;
  temporizedWith: string;
  referralComments: string;

  // Plan
  treatmentOptionsOffered: string[];
  treatmentOptionsOfferedOther: string;
  treatmentComments: string;
  consentGiven: boolean;
  anesthesiaAmounts: AnesthesiaAmounts;
  anesthesiaLocations: string[];
  anesthesiaLocationMapping: Record<string, string[]>; // maps location to array of anesthetic types
  anesthesiaLocationSides: Record<string, string>; // maps location to 'rhs' | 'lhs' | 'bilateral'
  isolation: string[];

  // Multi-tooth treatment plans
  toothTreatmentPlans: ToothTreatmentPlan[];

  // Legacy single-tooth fields (kept for backward compatibility)
  canalConfiguration: string[];
  customCanalNames: string[];
  workingLengthMethod: string[];
  canalMAFs: CanalMAF[];
  restoration: string;

  irrigationProtocol: string[];
  medicament: string;
  complications: string[];
  complicationsComments: string;
  postOpInstructions: string[];
  additionalNotes: string;
  nextVisit: string[];
  followUp: string;
  referral: string;
}

export interface Template {
  id: string;
  name: string;
  data: Partial<NoteData>;
  scope: TemplateScope[];
  visitType: VisitType | 'any';
  createdAt: string;
}

export interface Preferences {
  toothNotation: ToothNotation;
  darkMode: boolean;
}

export interface SavedDraft {
  id: string;
  timestamp: string;
  noteData: NoteData;
  outputEdits: {
    noteText: string | null;
    referralText: string | null;
  };
  preview: string; // Short preview for UI display
}

export interface StoredData {
  templates: Template[];
  preferences: Preferences;
  noteData?: NoteData;
  outputEdits?: {
    noteText?: string | null;
    referralText?: string | null;
  };
  savedDrafts?: SavedDraft[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  columns?: 1 | 2 | 3 | 4;
  colSpan?: 1 | 2 | 3 | 4;
}
