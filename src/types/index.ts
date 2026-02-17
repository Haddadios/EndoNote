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
  treatmentOptionsOffered: string[];
}

export type CarpuleVolume = '1.7' | '1.8' | '2.2';

export interface ProcedureDefaults {
  anestheticTypes: string[];
  injectionLocations: string[];
  isolation: string[];
  fileSystems: string[];
  workingLengthMethod: string[];
  obturationTechnique: string;
  obturationMaterial: string;
  obturationSealer: string;
  medicament: string;
  irrigationProtocol: string[];
  temporaryRestoration: string;
  permanentRestoration: string;
  postOpInstructions: string[];
  followUp: string;
  prognosis: string;
}

export interface CanalMAF {
  canal: string;
  patent: boolean;
  workingLength: string;
  referencePoint: string;
  fileSystem: string[];
  size: string;
  sizes: string[];
  systemSizes: Record<string, string>;
  taper: string;
  systemTapers: Record<string, string>;
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
  coronalFlare: string[];
  coronalFlareOther: string;
  restoration: string;
  treatmentOutcome: 'finish' | 'single_visit' | 'pulp_extirpation' | 'cleaning_shaping' | 'open_medicate' | '';
  treatmentPerformed: string[];
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
  referralRadiographs: string[];

  // Plan
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

  proceduralSteps: ProceduralSteps;

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
  toothType?: ToothType | 'any';
  procedureTypes?: string[] | 'any';
  createdAt: string;
}

export type ReferralRadiographPlacement = 'after_completion' | 'before_comments' | 'end';

export interface ReferralTemplateImage {
  dataUrl: string;
  widthIn: number;
  heightIn?: number;
  aspectRatio?: number;
}

export type ReferralTemplateHeaderLayout = 'single_column' | 'logo_left_text_right' | 'stacked_center';

export interface ReferralTemplateHeaderBlock {
  id: string;
  enabled: boolean;
  text: string;
  align: 'left' | 'center' | 'right';
  logo?: ReferralTemplateImage;
}

export interface ReferralTemplateFooterImage extends ReferralTemplateImage {
  align: 'left' | 'center' | 'right';
}

export type ReferralTemplateFooterImagePlacement = 'above_text' | 'below_text';

export interface ReferralTemplate {
  page: {
    marginsIn: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  headerFontSizePt: number;
  footerFontSizePt: number;
  bodyFontSizePt: number;
  headerLayout: ReferralTemplateHeaderLayout;
  headerBlocks: ReferralTemplateHeaderBlock[];
  header: {
    enabled: boolean;
    text: string;
    align: 'left' | 'center' | 'right';
    logo?: ReferralTemplateImage;
  };
  footer: {
    enabled: boolean;
    text: string;
    align: 'left' | 'center' | 'right';
  };
  footerImage?: ReferralTemplateFooterImage;
  footerImagePlacement: ReferralTemplateFooterImagePlacement;
  radiographs: {
    enabled: boolean;
    placement: ReferralRadiographPlacement;
    slots: number;
    columns: number;
    slotWidthIn: number;
    slotHeightIn: number;
  };
  includePostOpInstructions: boolean;
  signature: {
    enabled: boolean;
    lines: string[];
    image?: ReferralTemplateImage;
  };
}

export interface ApicalMicrosurgerySteps {
  rootsTreated: string;
  flapDesign: string;
  osteotomyDescription: string;
  resectionMm: string;
  retroPrepDepthMm: string;
  resectionAngle: string;
  methyleneBlueFindings: string;
  retroMaterial: string;
  graft: string;
  hemostaticAgent: string;
  sutureMaterial: string;
  sutureCount: string;
  biopsySent: boolean;
  surgicalNotes: string;
}

export interface HemisectionSteps {
  rootsRetained: string[];
  rootsResected: string[];
  crownRemovedFirst: boolean;
  hemisectionNotes: string;
}

export interface RootResectionSteps {
  rootsResected: string[];
  resectionMm: string;
  resectionNotes: string;
}

export interface ApexificationSteps {
  apicalPlugMaterial: string;
  plugThicknessMm: string;
  apicalStopSize: string;
  apexificationNotes: string;
}

export interface ApexogenesisSteps {
  pulpCapMaterial: string;
  pulpotomyLevel: string;
  apexogenesisNotes: string;
}

export interface RegenerativeEndoSteps {
  bloodClotAchieved: boolean;
  scaffoldType: string;
  antibioticPaste: string;
  bioceramicPlugPlaced: boolean;
  regenNotes: string;
}

export interface IntentionalReplantationSteps {
  extraOralTimeMins: string;
  storageMedia: string;
  retroPrepDone: boolean;
  retroMaterial: string;
  splintType: string;
  splintDurationWeeks: string;
  replantationNotes: string;
}

export interface AutotransplantationSteps {
  donorTooth: string;
  recipientSite: string;
  rootDevStage: string;
  splintType: string;
  splintDurationWeeks: string;
  rctPlan: string;
  autotransplantNotes: string;
}

export interface ProceduralSteps {
  apical_microsurgery?: ApicalMicrosurgerySteps;
  hemisection?: HemisectionSteps;
  root_resection?: RootResectionSteps;
  apexification?: ApexificationSteps;
  apexogenesis?: ApexogenesisSteps;
  regenerative_endo?: RegenerativeEndoSteps;
  intentional_replantation?: IntentionalReplantationSteps;
  autotransplantation?: AutotransplantationSteps;
}

export interface Preferences {
  toothNotation: ToothNotation;
  darkMode: boolean;
  defaultCarpuleVolume: CarpuleVolume;
  generalDefaults: ProcedureDefaults;
  defaultsByProcedure: Record<string, ProcedureDefaults>;
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
