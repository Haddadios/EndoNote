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
  // Collect all teeth from diagnoses
  const diagnosedTeeth = noteData.toothDiagnoses
    .filter((d) => d.toothNumber)
    .map((d) => d.toothNumber);

  // Collect all teeth from treatment plans
  const treatedTeeth = (noteData.toothTreatmentPlans || [])
    .filter((p) => p.toothNumber)
    .map((p) => p.toothNumber);

  // Combine and deduplicate
  const allTeeth = Array.from(new Set([...diagnosedTeeth, ...treatedTeeth]));

  // Fallback to legacy single tooth
  const tooth =
    allTeeth.length > 0
      ? allTeeth.join(', #')
      : noteData.toothNumber || '#';

  const toothAreaDisplay = allTeeth.length > 0 ? `#${tooth}` : tooth;

  // Determine if treatment was performed
  const primaryDiagnosis =
    noteData.toothDiagnoses.find((d) => d.toothNumber) ||
    noteData.toothDiagnoses[0];

  const selectedTreatmentValue =
    noteData.treatmentPerformed ||
    noteData.treatmentOptionsOffered[0] ||
    primaryDiagnosis?.recommendedTreatment ||
    '';

  const noTreatmentValues = new Set(['no_treatment_monitoring']);
  const hasTreatmentSelected = Boolean(selectedTreatmentValue) && !noTreatmentValues.has(selectedTreatmentValue);

  const letterDate = noteData.referralLetterDate || placeholderDate;
  const consultationDate = noteData.consultationDate || placeholderDate;
  const completionDate = noteData.treatmentCompletionDate || placeholderDate;
  const patientNameForBody = noteData.patientName || 'the patient';
  const patientNameDisplay = noteData.patientName || 'NAME';

  const postOpText = noteData.postOpInstructions
    .map((val) => findLabel(postOpInstructions, val) || val)
    .filter(Boolean)
    .join('; ');

  const introParagraph = hasTreatmentSelected
    ? `Thank you for referring ${patientNameDisplay} to our clinic. Below please find a digital radiographic image of the completed treatment. ${patientNameForBody} tolerated the procedure well and has been referred to your clinic for the final restoration. The patient will then return to your clinic for continuation of general dental treatment. We appreciate your trust and confidence in us. We look forward to working with you again in the future. If you have any questions or comments, please do not hesitate to contact us at the number below.`
    : `Thank you for referring ${patientNameDisplay} to our clinic. We appreciate your trust and confidence in us. We look forward to working with you again in the future. If you have any questions or comments, please do not hesitate to contact us at the number below.`;

  // Build consultation section with per-tooth diagnoses
  const consultationSection: string[] = [`Consultation Date: ${consultationDate}`];

  if (noteData.toothDiagnoses.length > 0 && noteData.toothDiagnoses.some(d => d.toothNumber)) {
    // Multi-tooth format
    noteData.toothDiagnoses.forEach((diagnosis) => {
      if (diagnosis.toothNumber) {
        consultationSection.push(`  Tooth #${diagnosis.toothNumber}:`);
        const pulpalDiagnosis = findLabel(pulpalDiagnoses, diagnosis.pulpalDiagnosis) || placeholderItem;
        const periapicalDiagnosis = findLabel(periapicalDiagnoses, diagnosis.periapicalDiagnosis) || placeholderItem;
        const treatmentRecommended = treatmentLabels[diagnosis.recommendedTreatment as keyof typeof treatmentLabels] || placeholderItem;
        const prognosis = findLabel(prognosisOptions, diagnosis.prognosis) || placeholderItem;

        consultationSection.push(`    Pulpal Diagnosis: ${pulpalDiagnosis}`);
        consultationSection.push(`    Periapical Diagnosis: ${periapicalDiagnosis}`);
        consultationSection.push(`    Treatment Recommended: ${treatmentRecommended}`);
        consultationSection.push(`    Prognosis: ${prognosis}`);
      }
    });
  } else {
    // Legacy format fallback
    const pulpalDiagnosis = findLabel(pulpalDiagnoses, primaryDiagnosis?.pulpalDiagnosis) || placeholderItem;
    const periapicalDiagnosis = findLabel(periapicalDiagnoses, primaryDiagnosis?.periapicalDiagnosis) || placeholderItem;
    const treatmentRecommended = treatmentLabels[primaryDiagnosis?.recommendedTreatment as keyof typeof treatmentLabels] || placeholderItem;
    const prognosis = findLabel(prognosisOptions, primaryDiagnosis?.prognosis) || placeholderItem;

    consultationSection.push(`  Pulpal Diagnosis: ${pulpalDiagnosis}`);
    consultationSection.push(`  Periapical Diagnosis: ${periapicalDiagnosis}`);
    consultationSection.push(`  Treatment Recommended: ${treatmentRecommended}`);
    consultationSection.push(`  Prognosis: ${prognosis}`);
  }

  // Build treatment completion section
  let completionSection: string[] = [];

  if (hasTreatmentSelected) {
    completionSection.push(`Treatment Completion Date: ${completionDate}`);

    // Check if we have per-tooth treatment plans
    if (noteData.toothTreatmentPlans && noteData.toothTreatmentPlans.length > 0) {
      // Multi-tooth treatment format
      const planSelectedTreatment = noteData.treatmentOptionsOffered[0]
        ? treatmentLabels[noteData.treatmentOptionsOffered[0] as keyof typeof treatmentLabels]
        : '';
      const treatmentPerformedLabel = treatmentLabels[noteData.treatmentPerformed as keyof typeof treatmentLabels];
      const treatmentPerformed = treatmentPerformedLabel || planSelectedTreatment || placeholderItem;

      completionSection.push(`  Treatment Performed: ${treatmentPerformed}`);
      completionSection.push('');

      noteData.toothTreatmentPlans.forEach((plan) => {
        if (plan.toothNumber) {
          completionSection.push(`  Tooth #${plan.toothNumber}:`);

          // Count canals
          const canalSet = new Set<string>();
          plan.canalConfiguration.forEach((config) => {
            if (config === 'other') {
              plan.customCanalNames.forEach((name) => {
                const trimmed = name.trim();
                if (trimmed) canalSet.add(trimmed);
              });
            } else {
              (canalConfigurationToCanals[config] || []).forEach((c) => canalSet.add(c));
            }
          });
          const canalCount = canalSet.size > 0 ? canalSet.size.toString() : plan.canalMAFs.length ? plan.canalMAFs.length.toString() : '';

          // Get instrumentation and obturation details
          const instrumentedWith = findLabel(instrumentationSystems, plan.canalMAFs.find((m) => m.fileSystem)?.fileSystem) || placeholderItem;
          const obturationMaterialsUsed = Array.from(
            new Set(
              plan.canalMAFs
                .map((m) => findLabel(obturationMaterials, m.obturationMaterial))
                .filter(Boolean)
            )
          );
          const obturationSealersUsed = Array.from(
            new Set(
              plan.canalMAFs
                .map((m) => findLabel(obturationSealers, m.obturationSealer))
                .filter(Boolean)
            )
          );
          const obturatedWith = obturationMaterialsUsed.join(', ') || placeholderItem;
          const obturationSealer = obturationSealersUsed.join(', ');
          const obturationTechnique = findLabel(obturationTechniques, plan.canalMAFs.find((m) => m.obturationTechnique)?.obturationTechnique) || '';

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

          completionSection.push(`    ${canalLine}`);

          const temporizedWith = findLabel(restorationTypes, plan.restoration) || placeholderItem;
          completionSection.push(`    Temporized/Restored with: ${temporizedWith}`);
        }
      });

      completionSection.push('');
      completionSection.push(`  Post-Operative Instructions Given${postOpText ? `: ${postOpText}` : ''}`);
    } else {
      // Legacy single-tooth format
      const planSelectedTreatment = noteData.treatmentOptionsOffered[0]
        ? treatmentLabels[noteData.treatmentOptionsOffered[0] as keyof typeof treatmentLabels]
        : '';
      const treatmentPerformedLabel = treatmentLabels[noteData.treatmentPerformed as keyof typeof treatmentLabels];
      const recommendedTreatmentLabel = treatmentLabels[primaryDiagnosis?.recommendedTreatment as keyof typeof treatmentLabels];
      const treatmentPerformed = treatmentPerformedLabel || planSelectedTreatment || recommendedTreatmentLabel || placeholderItem;

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
      const canalCount = canalSet.size > 0 ? canalSet.size.toString() : noteData.canalMAFs.length ? noteData.canalMAFs.length.toString() : '';
      const instrumentedWith = findLabel(instrumentationSystems, noteData.canalMAFs.find((m) => m.fileSystem)?.fileSystem) || placeholderItem;
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
      const obturationTechnique = findLabel(obturationTechniques, noteData.canalMAFs.find((m) => m.obturationTechnique)?.obturationTechnique) || '';

      const temporizedWith =
        findLabel(restorationTypes, noteData.restoration) ||
        findLabel(restorationTypes, noteData.temporizedWith) ||
        placeholderItem;

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

      completionSection.push(`  Treatment Performed: ${treatmentPerformed}`);
      completionSection.push(`  ${canalLine}`);
      completionSection.push(`  Temporized/Restored with: ${temporizedWith}`);
      completionSection.push(`  Post-Operative Instructions Given${postOpText ? `: ${postOpText}` : ''}`);
    }

    completionSection.push('');
  }

  // Comments section
  const defaultComments = allTeeth.length > 1
    ? `Please proceed with final restoration for teeth ${toothAreaDisplay}.`
    : `Please proceed with final restoration for Tooth ${toothAreaDisplay}.`;
  const comments = noteData.referralComments || defaultComments;

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
    `Tooth/Area: ${toothAreaDisplay}`,
    '',
    ...consultationSection,
    '',
    ...completionSection,
    'Comments:',
    `  ${comments}`,
    '',
    'Thank you for your kind referral and the opportunity to manage this patient, and please do not hesitate to reach out should you have any further questions.',
  ].join('\n');
}
