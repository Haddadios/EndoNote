import type { NoteData } from '../types';
import {
  chiefComplaints,
  painCharacteristics,
  painDurations,
  medicalHistoryAlerts,
  pulpalDiagnoses,
  periapicalDiagnoses,
  vitalityResults,
  percussionPalpationResults,
  mobilityGrades,
  swellingOptions,
  radiographicFindings,
  treatmentTypes,
  prognosisOptions,
  treatmentOptionsOffered,
  anesthesiaTypes,
  anesthesiaAmounts,
  anesthesiaLocations,
  isolationMethods,
  workingLengthMethods,
  instrumentationSystems,
  mafSizes,
  mafTapers,
  irrigationSolutions,
  irrigationTechniques,
  medicaments,
  obturationTechniques,
  obturationMaterials,
  obturationSealers,
  restorationTypes,
  canalConfigurations,
  canalConfigurationToCanals,
  complications,
  postOpInstructions,
  nextVisitOptions,
  followUpOptions,
  referralOptions,
} from '../data';

// Helper to get label from options array
function getLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label || value;
}

// Helper to get labels for multiple values
function getLabels(options: { value: string; label: string }[], values: string[]): string[] {
  return values
    .map((v) => {
      // Handle prefixed values (e.g., tech_passive)
      const cleanValue = v.startsWith('tech_') ? v.replace('tech_', '') : v;
      return options.find((o) => o.value === cleanValue || o.value === v)?.label;
    })
    .filter(Boolean) as string[];
}

// Helper to join array with proper grammar
function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(' and ');
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

export function generateSOAPNote(data: NoteData): string {
  const lines: string[] = [];

  // === SUBJECTIVE ===
  lines.push('SUBJECTIVE:');
  lines.push('');

  // History subsection
  lines.push('History:');
  let history = '';

  // Vital signs
  const vitals: string[] = [];
  if (data.bloodPressure) {
    vitals.push(`BP: ${data.bloodPressure} mmHg`);
  }
  if (data.pulse) {
    vitals.push(`Pulse: ${data.pulse} bpm`);
  }
  if (data.respiratoryRate) {
    vitals.push(`RR: ${data.respiratoryRate} breaths/min unlaboured`);
  }
  if (vitals.length > 0) {
    history = vitals.join(', ') + '.';
  }

  // Medical history
  if (data.medicalHistoryAlerts.length > 0 && !data.medicalHistoryAlerts.includes('none')) {
    const alerts = getLabels(medicalHistoryAlerts, data.medicalHistoryAlerts);
    history += ` Medical history: ${joinList(alerts)}.`;
  }

  lines.push(history || 'No history reported.');
  lines.push('');

  // Chief Complaint subsection
  lines.push('Chief Complaint:');
  let chiefComplaint = '';

  // Chief complaints (now multi-select)
  if (data.chiefComplaints.length > 0) {
    const complaints = data.chiefComplaints.map((c) => {
      if (c === 'other') return data.chiefComplaintCustom;
      return getLabel(chiefComplaints, c);
    });
    chiefComplaint = `Patient presents with ${joinList(complaints.map((c) => c.toLowerCase()))}.`;
  }

  // Pain characteristics
  if (data.painCharacteristics.length > 0) {
    const chars = getLabels(painCharacteristics, data.painCharacteristics);
    chiefComplaint += ` Reports ${joinList(chars.map((c) => c.toLowerCase()))} pain`;

    if (data.painDuration) {
      const duration = getLabel(painDurations, data.painDuration);
      chiefComplaint += ` for ${duration.toLowerCase()}`;
    }
    chiefComplaint += '.';
  } else if (data.painDuration && data.painDuration !== 'na') {
    const duration = getLabel(painDurations, data.painDuration);
    chiefComplaint += ` Duration: ${duration}.`;
  }

  lines.push(chiefComplaint || 'No chief complaint reported.');
  lines.push('');

  // === OBJECTIVE ===
  lines.push('OBJECTIVE:');

  // Vitality tests
  const vitalityParts: string[] = [];
  if (data.coldTest) {
    vitalityParts.push(`Cold: ${getLabel(vitalityResults, data.coldTest)}`);
  }
  if (data.eptTest) {
    vitalityParts.push(`EPT: ${getLabel(vitalityResults, data.eptTest)}`);
  }
  if (data.heatTest) {
    vitalityParts.push(`Heat: ${getLabel(vitalityResults, data.heatTest)}`);
  }
  if (vitalityParts.length > 0) {
    lines.push(`Vitality: ${vitalityParts.join(' | ')}`);
  }

  // Clinical findings line
  const clinicalParts: string[] = [];
  if (data.percussion) {
    clinicalParts.push(`Percussion: ${getLabel(percussionPalpationResults, data.percussion)}`);
  }
  if (data.palpation) {
    clinicalParts.push(`Palpation: ${getLabel(percussionPalpationResults, data.palpation)}`);
  }
  if (clinicalParts.length > 0) {
    lines.push(clinicalParts.join(' | '));
  }

  // Probing and mobility
  const probingMobility: string[] = [];
  if (data.probingDepths) {
    probingMobility.push(`Probing: ${data.probingDepths}`);
  }
  if (data.mobility) {
    probingMobility.push(`Mobility: ${getLabel(mobilityGrades, data.mobility)}`);
  }
  if (probingMobility.length > 0) {
    lines.push(probingMobility.join(' | '));
  }

  // Swelling
  if (data.swelling.length > 0 && !data.swelling.includes('none')) {
    const swellingLabels = getLabels(swellingOptions, data.swelling);
    lines.push(`Swelling: ${joinList(swellingLabels)}`);
  }

  // Sinus tract
  if (data.sinusTract) {
    lines.push('Sinus tract: Present');
  }

  // Radiographic findings
  if (data.radiographicFindings.length > 0) {
    const findings = getLabels(radiographicFindings, data.radiographicFindings);
    lines.push(`Radiographic: ${joinList(findings)}`);
  }

  // Objective additional comments
  if (data.objectiveNotes && data.objectiveNotes.trim()) {
    lines.push('');
    lines.push('Additional Comments:');
    lines.push(data.objectiveNotes.trim());
  }

  lines.push('');

  // === ASSESSMENT ===
  lines.push('ASSESSMENT:');

  // Multi-tooth diagnoses
  if (data.toothDiagnoses.length > 0) {
    data.toothDiagnoses.forEach((tooth) => {
      if (tooth.toothNumber) {
        const toothLine: string[] = [`Tooth #${tooth.toothNumber}`];

        if (tooth.pulpalDiagnosis) {
          toothLine.push(`Pulpal: ${getLabel(pulpalDiagnoses, tooth.pulpalDiagnosis)}`);
        }
        if (tooth.periapicalDiagnosis) {
          toothLine.push(`Periapical: ${getLabel(periapicalDiagnoses, tooth.periapicalDiagnosis)}`);
        }
        if (tooth.prognosis) {
          toothLine.push(`Prognosis: ${getLabel(prognosisOptions, tooth.prognosis)}`);
        }
        if (tooth.recommendedTreatment) {
          toothLine.push(`Treatment: ${getLabel(treatmentTypes, tooth.recommendedTreatment)}`);
        }

        lines.push(toothLine.join(' | '));
      }
    });
  } else {
    lines.push('Assessment pending.');
  }

  // Assessment additional comments
  if (data.assessmentNotes && data.assessmentNotes.trim()) {
    lines.push('');
    lines.push('Additional Comments:');
    lines.push(data.assessmentNotes.trim());
  }

  lines.push('');

  // === PLAN ===
  lines.push('PLAN:');

  // Treatment Options Offered
  if (data.treatmentOptionsOffered.length > 0) {
    const options = getLabels(treatmentOptionsOffered, data.treatmentOptionsOffered);
    lines.push(`Treatment options offered: ${joinList(options)}`);
    lines.push('');
  }

  // Consent (if given)
  if (data.consentGiven) {
    lines.push('CONSENT:');
    lines.push('Explained diagnosis and treatment option to patient. Discussed digital xray and CBCT findings. Patient would like to proceed with endodontic therapy as recommended. Discussed that after treatment, patient may need to return to referring doctor for continued dental treatment for this tooth which may include build-up, post, and crown. Patient understood and had no further questions.');
    lines.push('');
    lines.push('Reviewed consent form with pt thoroughly.');
    lines.push('');
    lines.push('Discussed risks, benefits, and alternatives, including no treatment. Risks discussed including but not limited to: swelling; sensitivity; bleeding; pain either during or after treatment; infection; treatment failure; complications resulting from the use of dental instruments (broken instruments-perforation of tooth, root, sinus), medications, anesthetics and injections; fracture or damage to existing restorations on the tooth being worked on or nearby teeth; fracture to tooth structure or tooth roots of tooth being worked on and/or nearby teeth; possibility of root fracture or tooth splitting during, or after treatment discussed.');
    lines.push('');
    lines.push('Patient was able to ask questions and get answers to all questions before treatment. Patient fully understands and agrees with the proposed treatment. Informed consent was obtained and signed.');
    lines.push('');
  }

  // Anesthesia
  if (data.anesthesiaType.length > 0 || data.anesthesiaAmount || data.anesthesiaLocations.length > 0) {
    let anesthesia = 'Anesthesia: ';
    const parts: string[] = [];
    if (data.anesthesiaType.length > 0) {
      parts.push(joinList(getLabels(anesthesiaTypes, data.anesthesiaType)));
    }
    if (data.anesthesiaAmount) {
      parts.push(getLabel(anesthesiaAmounts, data.anesthesiaAmount));
    }
    if (data.anesthesiaLocations.length > 0) {
      parts.push(joinList(getLabels(anesthesiaLocations, data.anesthesiaLocations)));
    }
    anesthesia += parts.join(', ');
    lines.push(anesthesia);
  }

  // Isolation
  if (data.isolation) {
    lines.push(`Isolation: ${getLabel(isolationMethods, data.isolation)}`);
  }

  // Canal configuration
  if (data.canalConfiguration.length > 0) {
    const configs = getLabels(canalConfigurations, data.canalConfiguration);
    let canalText = joinList(configs);

    // If "other" is selected and custom canals are specified, append them
    if (data.canalConfiguration.includes('other') && data.customCanalNames.length > 0) {
      const customCanals = data.customCanalNames.filter(name => name.trim());
      if (customCanals.length > 0) {
        // Replace "Other (custom)" with the actual canal names
        const otherIndex = configs.indexOf('Other (custom)');
        const nonOtherConfigs = configs.filter(c => c !== 'Other (custom)');
        if (otherIndex >= 0) {
          canalText = nonOtherConfigs.length > 0
            ? `${joinList(nonOtherConfigs)}, ${joinList(customCanals)}`
            : joinList(customCanals);
        }
      }
    }

    lines.push(`Canals: ${canalText}`);
  }

  // Working length
  if (data.workingLengthMethod.length > 0 || data.workingLengthMeasurements) {
    let wl = 'Working length: ';
    const parts: string[] = [];
    if (data.workingLengthMethod.length > 0) {
      parts.push(joinList(getLabels(workingLengthMethods, data.workingLengthMethod)));
    }
    if (data.workingLengthMeasurements) {
      parts.push(data.workingLengthMeasurements);
    }
    wl += parts.join(' - ');
    lines.push(wl);
  }

  // Per-canal Instrumentation & Obturation (only show canals that match selected configurations)
  if (data.canalMAFs.length > 0 && data.canalConfiguration.length > 0) {
    // Get all valid canals from selected configurations
    const validCanals = new Set<string>();
    data.canalConfiguration.forEach((config) => {
      if (config === 'other') {
        // Add custom canal names
        data.customCanalNames.forEach((canal) => {
          if (canal.trim()) {
            validCanals.add(canal.trim());
          }
        });
      } else {
        const canals = canalConfigurationToCanals[config];
        if (canals) {
          canals.forEach((canal) => validCanals.add(canal));
        }
      }
    });

    const canalDetails = data.canalMAFs
      .filter((m) => (m.fileSystem || m.size || m.taper || m.obturationTechnique || m.obturationMaterial || m.obturationSealer) && validCanals.has(m.canal))
      .map((m) => {
        const parts: string[] = [];

        // Patent status
        const patentStatus = m.patent ? 'Patent' : 'Not Patent';
        parts.push(patentStatus);

        // Instrumentation details
        const instrParts: string[] = [];
        if (m.fileSystem) instrParts.push(getLabel(instrumentationSystems, m.fileSystem));
        if (m.size) instrParts.push(getLabel(mafSizes, m.size));
        if (m.taper) instrParts.push(getLabel(mafTapers, m.taper));
        if (instrParts.length > 0) {
          parts.push(`Prep: ${instrParts.join(' ')}`);
        }

        // Obturation details
        const obtParts: string[] = [];
        if (m.obturationTechnique) obtParts.push(getLabel(obturationTechniques, m.obturationTechnique));
        if (m.obturationMaterial) obtParts.push(getLabel(obturationMaterials, m.obturationMaterial));
        if (m.obturationSealer) obtParts.push(`Sealer: ${getLabel(obturationSealers, m.obturationSealer)}`);
        if (obtParts.length > 0) {
          parts.push(`Obt: ${obtParts.join(' with ')}`);
        }

        return `${m.canal} - ${parts.join('; ')}`;
      });

    if (canalDetails.length > 0) {
      lines.push('');
      lines.push('Per-canal details:');
      canalDetails.forEach((detail) => lines.push(`  ${detail}`));
    }
  }

  // Irrigation
  if (data.irrigationProtocol.length > 0) {
    const allOptions = [...irrigationSolutions, ...irrigationTechniques];
    const irrigation = data.irrigationProtocol.map((v) => {
      const cleanValue = v.startsWith('tech_') ? v.replace('tech_', '') : v;
      return allOptions.find((o) => o.value === cleanValue)?.label || v;
    });
    lines.push(`Irrigation: ${joinList(irrigation)}`);
  }

  // Medicament
  if (data.medicament && data.medicament !== 'none') {
    lines.push(`Medicament: ${getLabel(medicaments, data.medicament)}`);
  }

  // Restoration
  if (data.restoration) {
    lines.push(`Restoration: ${getLabel(restorationTypes, data.restoration)}`);
  }

  // Complications
  if (data.complications.length > 0) {
    if (data.complications.includes('none') && data.complications.length === 1) {
      lines.push('Complications: None');
    } else {
      const comps = getLabels(
        complications,
        data.complications.filter((c) => c !== 'none')
      );
      lines.push(`Complications: ${joinList(comps)}`);
    }
  }

  lines.push('');

  // Post-op instructions
  if (data.postOpInstructions.length > 0) {
    const instructions = getLabels(postOpInstructions, data.postOpInstructions);
    lines.push(`Post-op: ${joinList(instructions)}.`);
  }

  // Additional notes
  if (data.additionalNotes && data.additionalNotes.trim()) {
    lines.push('');
    lines.push('Additional Notes:');
    lines.push(data.additionalNotes.trim());
  }

  // Next visit
  if (data.nextVisit.length > 0) {
    const nextVisitLabels = getLabels(nextVisitOptions, data.nextVisit);
    lines.push(`Next Visit: ${joinList(nextVisitLabels)}`);
  }

  // Follow-up
  if (data.followUp) {
    lines.push(`Follow-up: ${getLabel(followUpOptions, data.followUp)}.`);
  }

  // Referral
  if (data.referral && data.referral !== 'none') {
    lines.push(`Referral: ${getLabel(referralOptions, data.referral)}.`);
  }

  return lines.join('\n');
}
