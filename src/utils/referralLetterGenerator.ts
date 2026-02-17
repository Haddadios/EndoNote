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
  retroMaterials,
  graftOptions,
  antibioticPastes,
  regenScaffolds,
  storageMedia,
  pulpCapMaterials,
  apexPlugMaterials,
  rootDevStages,
  splintTypes,
  replantRctPlan,
  pulpotomyLevels,
} from '../data';

const placeholderDate = 'Click or tap to enter a date.';
const placeholderItem = '';

const findLabel = (options: { value: string; label: string }[], value?: string) =>
  options.find((opt) => opt.value === value)?.label || '';

const RCT_TYPES = new Set(['initial_rct', 'continuing_rct', 'ns_rerct']);
const noTreatmentValues = new Set(['no_treatment', 'no_treatment_monitoring', 'extraction', 'other']);

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export interface ReferralBlocks {
  patientMeta: string[];
  introParagraph: string;
  toothAreaLine: string;
  consultationLines: string[];
  completionLines: string[];
  comments: string;
  closing: string;
}

export function buildReferralBlocks(noteData: NoteData): ReferralBlocks {
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
    noteData.toothTreatmentPlans.flatMap((p) => p.treatmentPerformed ?? [])[0] ||
    primaryDiagnosis?.treatmentOptionsOffered?.[0] ||
    '';

  const hasTreatmentSelected = Boolean(selectedTreatmentValue) && !noTreatmentValues.has(selectedTreatmentValue);

  const letterDate = noteData.referralLetterDate || getCurrentDate();
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
        const treatmentRecommended = treatmentLabels[(diagnosis.treatmentOptionsOffered ?? [])[0] as keyof typeof treatmentLabels] || placeholderItem;
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
    const treatmentRecommended = treatmentLabels[(primaryDiagnosis?.treatmentOptionsOffered ?? [])[0] as keyof typeof treatmentLabels] || placeholderItem;
    const prognosis = findLabel(prognosisOptions, primaryDiagnosis?.prognosis) || placeholderItem;

    consultationSection.push(`  Pulpal Diagnosis: ${pulpalDiagnosis}`);
    consultationSection.push(`  Periapical Diagnosis: ${periapicalDiagnosis}`);
    consultationSection.push(`  Treatment Recommended: ${treatmentRecommended}`);
    consultationSection.push(`  Prognosis: ${prognosis}`);
  }

  // Helper: build detail lines for a single treatment type performed on a tooth
  const buildTreatmentDetailLines = (
    treatmentType: string,
    plan: typeof noteData.toothTreatmentPlans[0] | null,
    indent: string
  ): string[] => {
    const lines: string[] = [];
    const ps = noteData.proceduralSteps;

    if (RCT_TYPES.has(treatmentType) && plan) {
      // Canal count
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

      const _firstPlanFS = plan.canalMAFs.find((m) => m.fileSystem.length > 0)?.fileSystem ?? [];
      const instrumentedWith = _firstPlanFS.map((s) => findLabel(instrumentationSystems, s)).filter(Boolean).join(' + ') || placeholderItem;
      const obturationMaterialsUsed = Array.from(
        new Set(plan.canalMAFs.map((m) => findLabel(obturationMaterials, m.obturationMaterial)).filter(Boolean))
      );
      const obturationSealersUsed = Array.from(
        new Set(plan.canalMAFs.map((m) => findLabel(obturationSealers, m.obturationSealer)).filter(Boolean))
      );
      const obturatedWith = obturationMaterialsUsed.join(', ') || placeholderItem;
      const obturationSealer = obturationSealersUsed.join(', ');
      const obturationTechnique = findLabel(obturationTechniques, plan.canalMAFs.find((m) => m.obturationTechnique)?.obturationTechnique) || '';

      const canalLineParts: string[] = [];
      canalLineParts.push(canalCount ? `${canalCount} canal(s)` : 'Canal(s)');
      canalLineParts.push(instrumentedWith ? `instrumented with ${instrumentedWith}` : 'instrumented');
      canalLineParts.push(obturatedWith ? `and obturated with ${obturatedWith}` : 'and obturated');
      if (obturationTechnique) canalLineParts.push(`using ${obturationTechnique}`);
      if (obturationSealer) canalLineParts.push(`and ${obturationSealer}`);
      lines.push(`${indent}${canalLineParts.join(' ')}.`);

      const temporizedWith = findLabel(restorationTypes, plan.restoration) || placeholderItem;
      lines.push(`${indent}Temporized/Restored with: ${temporizedWith}`);

    } else if (treatmentType === 'apical_microsurgery' && ps.apical_microsurgery) {
      const s = ps.apical_microsurgery;
      if (s.retroMaterial) lines.push(`${indent}Retrograde Fill Material: ${findLabel(retroMaterials, s.retroMaterial)}`);
      if (s.graft) lines.push(`${indent}Graft: ${findLabel(graftOptions, s.graft)}`);
      if (s.biopsySent) lines.push(`${indent}Biopsy sent for pathology.`);

    } else if (treatmentType === 'hemisection' && ps.hemisection) {
      const s = ps.hemisection;
      if (s.rootsRetained.length) lines.push(`${indent}Roots Retained: ${s.rootsRetained.join(', ')}`);
      if (s.rootsResected.length) lines.push(`${indent}Roots Resected: ${s.rootsResected.join(', ')}`);
      if (s.crownRemovedFirst) lines.push(`${indent}Crown removed prior to hemisection.`);
      if (s.hemisectionNotes) lines.push(`${indent}Notes: ${s.hemisectionNotes}`);

    } else if (treatmentType === 'root_resection' && ps.root_resection) {
      const s = ps.root_resection;
      if (s.rootsResected.length) lines.push(`${indent}Roots Resected: ${s.rootsResected.join(', ')}`);
      if (s.resectionMm) lines.push(`${indent}Resection Length: ${s.resectionMm} mm`);
      if (s.resectionNotes) lines.push(`${indent}Notes: ${s.resectionNotes}`);

    } else if (treatmentType === 'apexification' && ps.apexification) {
      const s = ps.apexification;
      if (s.apicalPlugMaterial) lines.push(`${indent}Apical Plug Material: ${findLabel(apexPlugMaterials, s.apicalPlugMaterial)}`);
      if (s.plugThicknessMm) lines.push(`${indent}Plug Thickness: ${s.plugThicknessMm} mm`);
      if (s.apicalStopSize) lines.push(`${indent}Apical Stop Size: ${s.apicalStopSize}`);
      if (s.apexificationNotes) lines.push(`${indent}Notes: ${s.apexificationNotes}`);

    } else if (treatmentType === 'apexogenesis' && ps.apexogenesis) {
      const s = ps.apexogenesis;
      if (s.pulpCapMaterial) lines.push(`${indent}Pulp Cap Material: ${findLabel(pulpCapMaterials, s.pulpCapMaterial)}`);
      if (s.pulpotomyLevel) lines.push(`${indent}Pulpotomy Level: ${findLabel(pulpotomyLevels, s.pulpotomyLevel)}`);
      if (s.apexogenesisNotes) lines.push(`${indent}Notes: ${s.apexogenesisNotes}`);

    } else if (treatmentType === 'regenerative_endo' && ps.regenerative_endo) {
      const s = ps.regenerative_endo;
      if (s.scaffoldType) lines.push(`${indent}Scaffold: ${findLabel(regenScaffolds, s.scaffoldType)}`);
      if (s.antibioticPaste) lines.push(`${indent}Antibiotic Paste: ${findLabel(antibioticPastes, s.antibioticPaste)}`);
      if (s.bloodClotAchieved) lines.push(`${indent}Blood clot achieved.`);
      if (s.bioceramicPlugPlaced) lines.push(`${indent}Bioceramic plug placed.`);
      if (s.regenNotes) lines.push(`${indent}Notes: ${s.regenNotes}`);

    } else if (treatmentType === 'intentional_replantation' && ps.intentional_replantation) {
      const s = ps.intentional_replantation;
      if (s.extraOralTimeMins) lines.push(`${indent}Extra-oral Time: ${s.extraOralTimeMins} min`);
      if (s.storageMedia) lines.push(`${indent}Storage Media: ${findLabel(storageMedia, s.storageMedia)}`);
      if (s.retroPrepDone) {
        const retroLabel = s.retroMaterial ? findLabel(retroMaterials, s.retroMaterial) : '';
        lines.push(`${indent}Retrograde preparation performed${retroLabel ? ` with ${retroLabel}` : ''}.`);
      }
      if (s.splintType) lines.push(`${indent}Splint: ${findLabel(splintTypes, s.splintType)}${s.splintDurationWeeks ? ` for ${s.splintDurationWeeks} weeks` : ''}`);
      if (s.replantationNotes) lines.push(`${indent}Notes: ${s.replantationNotes}`);
    } else if (treatmentType === 'autotransplantation' && ps.autotransplantation) {
      const s = ps.autotransplantation;
      if (s.rctPlan) lines.push(`${indent}Rct Plan: ${findLabel(replantRctPlan, s.rctPlan)}`);
      if (s.rootDevStage) lines.push(`${indent}Root Development Stage: ${findLabel(rootDevStages, s.rootDevStage)}`);
      if (s.splintType) lines.push(`${indent}Splint: ${findLabel(splintTypes, s.splintType)}${s.splintDurationWeeks ? ` for ${s.splintDurationWeeks} weeks` : ''}`);
      if (s.autotransplantNotes) lines.push(`${indent}Notes: ${s.autotransplantNotes}`);
    }

    return lines;
  };

  // Completion section
  const completionSection: string[] = [];
  if (hasTreatmentSelected) {
    completionSection.push(`Treatment Completion Date: ${completionDate}`);

    // Multi-tooth plans
    if ((noteData.toothTreatmentPlans || []).length > 0) {
      noteData.toothTreatmentPlans.forEach((plan) => {
        if (plan.toothNumber) {
          completionSection.push(`  Tooth #${plan.toothNumber}:`);
          const planSelectedTreatment = (plan.treatmentPerformed ?? [])[0]
            ? treatmentLabels[(plan.treatmentPerformed ?? [])[0] as keyof typeof treatmentLabels]
            : '';
          const recommendedTreatmentLabel = treatmentLabels[(primaryDiagnosis?.treatmentOptionsOffered ?? [])[0] as keyof typeof treatmentLabels];
          const treatmentPerformed = planSelectedTreatment || recommendedTreatmentLabel || placeholderItem;
          completionSection.push(`    Treatment Performed: ${treatmentPerformed}`);

          const detailLines = buildTreatmentDetailLines((plan.treatmentPerformed ?? [])[0], plan, '    ');
          completionSection.push(...detailLines);

          if (!RCT_TYPES.has((plan.treatmentPerformed ?? [])[0] || '')) {
            const temporizedWith = findLabel(restorationTypes, plan.restoration) || placeholderItem;
            completionSection.push(`    Temporized/Restored with: ${temporizedWith}`);
          }
        }
      });

      completionSection.push(`  Post-Operative Instructions Given${postOpText ? `: ${postOpText}` : ''}`);
    } else {
      const _legacyPerformed = noteData.toothTreatmentPlans.flatMap((p) => p.treatmentPerformed ?? []);
      const planSelectedTreatment = _legacyPerformed[0]
        ? treatmentLabels[_legacyPerformed[0] as keyof typeof treatmentLabels]
        : '';
      const treatmentPerformedLabel = treatmentLabels[noteData.treatmentPerformed as keyof typeof treatmentLabels];
      const recommendedTreatmentLabel = treatmentLabels[(primaryDiagnosis?.treatmentOptionsOffered ?? [])[0] as keyof typeof treatmentLabels];
      const treatmentPerformed = treatmentPerformedLabel || planSelectedTreatment || recommendedTreatmentLabel || placeholderItem;

      completionSection.push(`  Treatment Performed: ${treatmentPerformed}`);

      const legacyType = noteData.treatmentPerformed || _legacyPerformed[0] || '';
      const legacyDetails = buildTreatmentDetailLines(legacyType, null, '  ');
      completionSection.push(...legacyDetails);

      const temporizedWith =
        findLabel(restorationTypes, noteData.restoration) ||
        findLabel(restorationTypes, noteData.temporizedWith) ||
        placeholderItem;
      if (temporizedWith && !RCT_TYPES.has(legacyType)) {
        completionSection.push(`  Temporized/Restored with: ${temporizedWith}`);
      }

      completionSection.push(`  Post-Operative Instructions Given${postOpText ? `: ${postOpText}` : ''}`);
    }
  }

  const defaultComments = allTeeth.length > 1
    ? `Please proceed with final restoration for teeth ${toothAreaDisplay}.`
    : `Please proceed with final restoration for Tooth ${toothAreaDisplay}.`;
  const comments = noteData.referralComments || defaultComments;

  return {
    patientMeta: [
      `Patient Name: ${noteData.patientName || ''}`,
      `Patient Chart Number: ${noteData.patientChartNumber || ''}`,
      `Patient DOB: ${noteData.patientDOB || ''}`,
      `Date: ${letterDate}`,
    ],
    introParagraph,
    toothAreaLine: `Tooth/Area: ${toothAreaDisplay}`,
    consultationLines: consultationSection,
    completionLines: completionSection,
    comments,
    closing:
      'Thank you for your kind referral and the opportunity to manage this patient, and please do not hesitate to reach out should you have any further questions.',
  };
}

export function generateReferralLetter(noteData: NoteData) {
  const blocks = buildReferralBlocks(noteData);
  const completionLines = blocks.completionLines.length > 0 ? blocks.completionLines : [];

  return [
    ...blocks.patientMeta,
    '',
    'Dear Colleague,',
    '',
    blocks.introParagraph,
    '',
    blocks.toothAreaLine,
    '',
    ...blocks.consultationLines,
    '',
    ...completionLines,
    ...(completionLines.length > 0 ? [''] : []),
    'Comments:',
    `  ${blocks.comments}`,
    '',
    blocks.closing,
  ].join('\n');
}
