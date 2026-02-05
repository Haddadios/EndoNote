import type { NoteData } from '../types';
import {
  instrumentationSystems,
  obturationMaterials,
  obturationSealers,
  obturationTechniques,
  periapicalDiagnoses,
  postOpInstructions,
  prognosisOptions,
  pulpalDiagnoses,
  restorationTypes,
  canalConfigurationToCanals,
  treatmentLabels,
} from '../data';

const placeholderDate = 'Click or tap to enter a date.';
const placeholderItem = '';

const findLabel = (options: { value: string; label: string }[], value?: string) =>
  options.find((opt) => opt.value === value)?.label || '';

export function generateReferralLetter(noteData: NoteData) {
  const tooth =
    noteData.toothNumber ||
    noteData.toothDiagnoses.find((d) => d.toothNumber)?.toothNumber ||
    '#';

  const primaryDiagnosis =
    noteData.toothDiagnoses.find((d) => d.toothNumber === tooth) ||
    noteData.toothDiagnoses.find((d) => d.toothNumber) ||
    noteData.toothDiagnoses[0];

  const pulpalDiagnosis = findLabel(pulpalDiagnoses, primaryDiagnosis?.pulpalDiagnosis) || placeholderItem;
  const periapicalDiagnosis = findLabel(periapicalDiagnoses, primaryDiagnosis?.periapicalDiagnosis) || placeholderItem;
  const treatmentRecommended =
    treatmentLabels[primaryDiagnosis?.recommendedTreatment as keyof typeof treatmentLabels] || placeholderItem;
  const prognosis = findLabel(prognosisOptions, primaryDiagnosis?.prognosis) || placeholderItem;

  const planSelectedTreatment = noteData.treatmentOptionsOffered[0]
    ? treatmentLabels[noteData.treatmentOptionsOffered[0] as keyof typeof treatmentLabels]
    : '';

  const treatmentPerformedLabel = treatmentLabels[noteData.treatmentPerformed as keyof typeof treatmentLabels];
  const recommendedTreatmentLabel =
    treatmentLabels[primaryDiagnosis?.recommendedTreatment as keyof typeof treatmentLabels];

  const selectedTreatmentValue =
    noteData.treatmentPerformed ||
    noteData.treatmentOptionsOffered[0] ||
    primaryDiagnosis?.recommendedTreatment ||
    '';

  const noTreatmentValues = new Set(['no_treatment_monitoring']);
  const hasTreatmentSelected = Boolean(selectedTreatmentValue) && !noTreatmentValues.has(selectedTreatmentValue);

  const treatmentPerformed =
    treatmentPerformedLabel ||
    planSelectedTreatment ||
    recommendedTreatmentLabel ||
    placeholderItem;

  const canalSet = new Set<string>();
  noteData.canalConfiguration.forEach((config) => {
    if (config === 'other') {
      noteData.customCanalNames.forEach((name) => {
        const trimmed = name.trim();
        if (trimmed) canalSet.add(trimmed);
      });
    } else {
      (canalConfigurationToCanals[config] || []).forEach((c) => canalSet.add(c));
    }
  });
  const canalCount =
    canalSet.size > 0
      ? canalSet.size.toString()
      : noteData.canalMAFs.length
        ? noteData.canalMAFs.length.toString()
        : '';
  const instrumentedWith =
    findLabel(instrumentationSystems, noteData.canalMAFs.find((m) => m.fileSystem)?.fileSystem) || placeholderItem;
  const obturationMaterialsUsed = Array.from(
    new Set(
      noteData.canalMAFs
        .map((m) => findLabel(obturationMaterials, m.obturationMaterial))
        .filter(Boolean)
    )
  );
  const obturationSealersUsed = Array.from(
    new Set(
      noteData.canalMAFs
        .map((m) => findLabel(obturationSealers, m.obturationSealer))
        .filter(Boolean)
    )
  );
  const obturatedWith = obturationMaterialsUsed.join(', ') || placeholderItem;
  const obturationSealer = obturationSealersUsed.join(', ');
  const obturationTechnique =
    findLabel(obturationTechniques, noteData.canalMAFs.find((m) => m.obturationTechnique)?.obturationTechnique) || '';

  const temporizedWith =
    findLabel(restorationTypes, noteData.restoration) ||
    findLabel(restorationTypes, noteData.temporizedWith) ||
    placeholderItem;

  const postOpText = noteData.postOpInstructions
    .map((val) => findLabel(postOpInstructions, val) || val)
    .filter(Boolean)
    .join('; ');

  const letterDate = noteData.referralLetterDate || placeholderDate;
  const consultationDate = noteData.consultationDate || placeholderDate;
  const completionDate = noteData.treatmentCompletionDate || placeholderDate;
  const patientNameForBody = noteData.patientName || 'the patient';
  const patientNameDisplay = noteData.patientName || 'NAME';

  const canalLineParts: string[] = [];
  canalLineParts.push(canalCount ? `${canalCount} canal(s)` : 'Canal(s)');
  canalLineParts.push(instrumentedWith ? `instrumented with ${instrumentedWith}` : 'instrumented');
  canalLineParts.push(obturatedWith ? `and obturated with ${obturatedWith}` : 'and obturated');
  if (obturationTechnique) {
    canalLineParts.push(`using ${obturationTechnique}`);
  }
  if (obturationSealer) {
    canalLineParts.push(`and ${obturationSealer}`);
  }
  const canalLine = canalLineParts.join(' ') + '.';

  const comments =
    noteData.referralComments || `Please proceed with final restoration for Tooth ${tooth}.`;

  const introParagraph = hasTreatmentSelected
    ? `Thank you for referring ${patientNameDisplay} to our clinic. Below please find a digital radiographic image of the completed treatment. ${patientNameForBody} tolerated the procedure well and has been referred to your clinic for the final restoration. The patient will then return to your clinic for continuation of general dental treatment. We appreciate your trust and confidence in us. We look forward to working with you again in the future. If you have any questions or comments, please do not hesitate to contact us at the number below.`
    : `Thank you for referring ${patientNameDisplay} to our clinic. We appreciate your trust and confidence in us. We look forward to working with you again in the future. If you have any questions or comments, please do not hesitate to contact us at the number below.`;

  const completionSection = hasTreatmentSelected
    ? [
        `Treatment Completion Date: ${completionDate}`,
        `  Treatment Performed: ${treatmentPerformed}`,
        `  ${canalLine}`,
        `  Temporized/Restored with: ${temporizedWith}`,
        `  Post-Operative Instructions Given${postOpText ? `: ${postOpText}` : ''}`,
        '',
      ]
    : [];

  return [
    `Patient Name: ${noteData.patientName || ''}`,
    `Patient Chart Number: ${noteData.patientChartNumber || ''}`,
    `Patient DOB: ${noteData.patientDOB || ''}`,
    `Date: ${letterDate}`,
    '',
    'Dear Colleague,',
    '',
    introParagraph,
    '',
    `Tooth/Area: ${tooth}`,
    '',
    `Consultation Date: ${consultationDate}`,
    `  Pulpal Diagnosis: ${pulpalDiagnosis}`,
    `  Periapical Diagnosis: ${periapicalDiagnosis}`,
    `  Treatment Recommended: ${treatmentRecommended}`,
    `  Prognosis: ${prognosis}`,
    '',
    ...completionSection,
    'Comments:',
    `  ${comments}`,
    '',
    'Thank you for your kind referral and the opportunity to manage this patient, and please do not hesitate to reach out should you have any further questions.',
  ].join('\n');
}
