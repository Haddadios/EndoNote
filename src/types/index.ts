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
  fileSystem: string;
  size: string;
  taper: string;
  obturationTechnique: string;
  obturationMaterial: string;
  obturationSealer: string;
}

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

  // Subjective
  chiefComplaints: string[];
  chiefComplaintCustom: string;
  painDuration: string;
  painCharacteristics: string[];
  bloodPressure: string;
  pulse: string;
  respiratoryRate: string;
  medicalHistoryAlerts: string[];

  // Objective (clinical findings only, diagnoses moved to assessment)
  coldTest: string[];
  eptTest: string[];
  heatTest: string[];
  percussion: string[];
  palpation: string[];
  probingDepths: ProbingDepths;
  mobility: string[];
  swelling: string[];
  sinusTract: boolean;
  radiographicFindings: string[];
  objectiveNotes: string;

  // Assessment - multi-tooth diagnoses
  toothDiagnoses: ToothDiagnosis[];
  assessmentNotes: string;

  // Plan
  treatmentOptionsOffered: string[];
  consentGiven: boolean;
  anesthesiaType: string[];
  anesthesiaAmount: string;
  anesthesiaLocations: string[];
  isolation: string;
  canalConfiguration: string[];
  customCanalNames: string[];
  workingLengthMethod: string[];
  workingLengthMeasurements: string;
  canalMAFs: CanalMAF[];
  irrigationProtocol: string[];
  medicament: string;
  restoration: string;
  complications: string[];
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
  createdAt: string;
}

export interface Preferences {
  toothNotation: ToothNotation;
  darkMode: boolean;
}

export interface StoredData {
  templates: Template[];
  preferences: Preferences;
}

export interface SelectOption {
  value: string;
  label: string;
}
