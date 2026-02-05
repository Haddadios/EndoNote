import type { NoteData, TemplateScope } from '../types';

export const templateScopeLabels: Record<TemplateScope, string> = {
  all: 'All Sections',
  subjective: 'Subjective',
  objective: 'Objective',
  assessment: 'Assessment',
  plan: 'Plan',
  referral: 'Referral',
};

export const templateScopeFields: Record<Exclude<TemplateScope, 'all'>, (keyof NoteData)[]> = {
  subjective: [
    'visitType',
    'age',
    'gender',
    'chiefComplaints',
    'chiefComplaintCustom',
    'painDuration',
    'painDurationCustom',
    'painCharacteristics',
    'painHistoryOther',
    'bloodPressure',
    'pulse',
    'respiratoryRate',
    'medicalHistoryAlerts',
    'medicalHistoryComments',
    'continuingTreatmentComments',
  ],
  objective: [
    'toothNumber',
    'toothType',
    'coldTest',
    'eptTest',
    'heatTest',
    'vitalityTestComments',
    'percussion',
    'palpation',
    'probingDepths',
    'mobility',
    'swelling',
    'sinusTract',
    'radiographicFindings',
    'clinicalFindingsComments',
    'objectiveNotes',
    'continuingTreatmentObjectiveComments',
  ],
  assessment: ['toothDiagnoses', 'assessmentNotes'],
  plan: [
    'treatmentOptionsOffered',
    'treatmentComments',
    'consentGiven',
    'anesthesiaAmounts',
    'anesthesiaLocations',
    'anesthesiaLocationMapping',
    'anesthesiaLocationSides',
    'isolation',
    'canalConfiguration',
    'customCanalNames',
    'workingLengthMethod',
    'canalMAFs',
    'irrigationProtocol',
    'medicament',
    'restoration',
    'complications',
    'complicationsComments',
    'postOpInstructions',
    'additionalNotes',
    'nextVisit',
    'followUp',
    'referral',
  ],
  referral: [
    'patientName',
    'patientChartNumber',
    'patientDOB',
    'referralLetterDate',
    'consultationDate',
    'treatmentCompletionDate',
    'treatmentPerformed',
    'temporizedWith',
    'referralComments',
  ],
};

const cloneValue = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const buildTemplateData = (data: NoteData, scopes: TemplateScope[]): Partial<NoteData> => {
  if (scopes.includes('all')) {
    return cloneValue(data);
  }

  const selectedFields = new Set<keyof NoteData>();
  scopes.forEach((scope) => {
    if (scope === 'all') return;
    templateScopeFields[scope].forEach((field) => selectedFields.add(field));
  });

  const partial: Partial<NoteData> = {};
  selectedFields.forEach((field) => {
    (partial as Record<keyof NoteData, NoteData[keyof NoteData]>)[field] = cloneValue(data[field]);
  });

  return partial;
};
