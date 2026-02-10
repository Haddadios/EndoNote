import type { NoteData } from '../types';
import {
  chiefComplaints,
  painCharacteristics,
  painDurations,
  medicalHistoryAlerts,
  genderOptions,
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

// Helper to check if all items share the same non-empty value; returns it or undefined
function allSameValue<T>(items: T[], getValue: (item: T) => string | undefined): string | undefined {
  if (items.length <= 1) return undefined;
  const values = items.map(getValue).filter(Boolean) as string[];
  if (values.length !== items.length) return undefined;
  const first = values[0];
  return values.every((v) => v === first) ? first : undefined;
}

// Helper to join array with proper grammar
function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(' and ');
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

// Chief complaints that use "presenting for" instead of "presents with"
const presentingForComplaints = ['referred', 'retreatment', 'continued_treatment', 'recall'];

export function generateSOAPNote(data: NoteData): string {
  const lines: string[] = [];
  const isFirstVisit = data.visitType === 'first_visit';

  // === SUBJECTIVE ===
  lines.push('SUBJECTIVE:');
  lines.push('');

  // Demographics
  if (data.age || data.gender) {
    const demographics: string[] = [];
    if (data.age) demographics.push(`${data.age} year old`);
    if (data.gender) demographics.push(getLabel(genderOptions, data.gender).toLowerCase());
    if (demographics.length > 0) {
      lines.push(`Patient: ${demographics.join(' ')}`);
    }
  }

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

  // Medical history (only for first visit)
  if (isFirstVisit) {
    if (data.medicalHistoryAlerts.length > 0 && !data.medicalHistoryAlerts.includes('none')) {
      const alerts = getLabels(medicalHistoryAlerts, data.medicalHistoryAlerts);
      history += ` Medical history: ${joinList(alerts)}.`;
    }
    if (data.medicalHistoryComments && data.medicalHistoryComments.trim()) {
      history += ` ${data.medicalHistoryComments.trim()}`;
    }
  }

  lines.push(history || 'No history reported.');
  lines.push('');

  // Chief Complaint subsection
  lines.push('Chief Complaint:');

  if (!isFirstVisit) {
    // Continuing treatment
    lines.push('Patient presenting for continuation of treatment.');
    if (data.continuingTreatmentComments && data.continuingTreatmentComments.trim()) {
      lines.push(`Changes since last visit: ${data.continuingTreatmentComments.trim()}`);
    }
  } else {
    let chiefComplaint = '';

    // Chief complaints (now multi-select) with grammar logic
    if (data.chiefComplaints.length > 0) {
      const complaints = data.chiefComplaints.map((c) => {
        if (c === 'other') return data.chiefComplaintCustom;
        return getLabel(chiefComplaints, c);
      });

      // Determine if we should use "presenting for" or "presents with"
      const hasPresentingFor = data.chiefComplaints.some(c => presentingForComplaints.includes(c));

      if (hasPresentingFor) {
        chiefComplaint = `Patient presenting for ${joinList(complaints.map((c) => c.toLowerCase()))}.`;
      } else {
        chiefComplaint = `Patient presents with ${joinList(complaints.map((c) => c.toLowerCase()))}.`;
      }
    }

    // Add chief complaint details if provided (even if 'other' wasn't selected)
    if (data.chiefComplaintCustom && data.chiefComplaintCustom.trim() && !data.chiefComplaints.includes('other')) {
      if (chiefComplaint) {
        chiefComplaint += ` ${data.chiefComplaintCustom.trim()}.`;
      } else {
        chiefComplaint = data.chiefComplaintCustom.trim() + '.';
      }
    }

    // Pain characteristics - structured sentence
    if (data.painCharacteristics.length > 0) {
      const selectedValues = data.painCharacteristics;
      const findAllValues = (candidates: string[]) => selectedValues.filter((v) => candidates.includes(v));
      const valuesToLabels = (values: string[]) =>
        values.map(v => getLabel(painCharacteristics, v).toLowerCase());

      const charLabels = valuesToLabels(findAllValues(['sharp', 'dull', 'throbbing']));
      const onsetLabels = valuesToLabels(findAllValues(['spontaneous', 'provoked', 'wakes_from_sleep']));
      const locLabels = valuesToLabels(findAllValues(['localized', 'radiating', 'diffuse']));
      const durLabels = valuesToLabels(findAllValues(['constant', 'intermittent', 'lingering']));
      const severityLabels = valuesToLabels(findAllValues(['mild', 'moderate', 'severe']));
      const patternLabels = valuesToLabels(findAllValues(['worse_lying_down', 'relieved_cold', 'relieved_heat']));
      const assocLabels = valuesToLabels(findAllValues(['relieved_analgesics', 'not_relieved_analgesics']));

      const historyValues = findAllValues([
        'few_days',
        '1_week',
        'several_weeks',
        '1_month',
        'several_months',
        'unknown_history',
        'asymptomatic',
        'history_other',
      ]);

      let historyLabels: string[] = [];
      historyValues.forEach(value => {
        if (value === 'history_other' && data.painHistoryOther?.trim()) {
          historyLabels.push(data.painHistoryOther.trim().toLowerCase());
        } else {
          historyLabels.push(getLabel(painCharacteristics, value).toLowerCase());
        }
      });

      // Build sentence: "Patient reports <char>, <onset>, <loc>, <dur>, <severity> pain, that is <pattern>, <assoc>, and has been around for <history>"
      const beforePain: string[] = [];
      if (charLabels.length > 0) beforePain.push(joinList(charLabels));
      if (onsetLabels.length > 0) beforePain.push(joinList(onsetLabels));
      if (locLabels.length > 0) beforePain.push(joinList(locLabels));
      if (durLabels.length > 0) beforePain.push(joinList(durLabels));
      if (severityLabels.length > 0) beforePain.push(joinList(severityLabels));

      const afterPain: string[] = [];
      if (patternLabels.length > 0) afterPain.push(joinList(patternLabels));
      if (assocLabels.length > 0) afterPain.push(joinList(assocLabels));

      let painSentence = 'Patient reports ';
      if (beforePain.length > 0) {
        painSentence += beforePain.join(', ') + ' pain';
      } else {
        painSentence += 'pain';
      }

      if (afterPain.length > 0) {
        painSentence += ', that is ' + afterPain.join(', ');
      }

      if (historyLabels.length > 0) {
        painSentence += ', and has been around for ' + joinList(historyLabels);
      }

      chiefComplaint += ` ${painSentence}.`;
    } else if (data.painDuration && data.painDuration !== 'na') {
      if (data.painDuration === 'other' && data.painDurationCustom) {
        chiefComplaint += ` Duration: ${data.painDurationCustom}.`;
      } else {
        const duration = getLabel(painDurations, data.painDuration);
        chiefComplaint += ` Duration: ${duration}.`;
      }
    }

    lines.push(chiefComplaint || 'No chief complaint reported.');
  }

  lines.push('');

  // === OBJECTIVE ===
  lines.push('OBJECTIVE:');

  if (!isFirstVisit) {
    // Continuing treatment - simplified objective
    if (data.continuingTreatmentObjectiveComments && data.continuingTreatmentObjectiveComments.trim()) {
      lines.push(data.continuingTreatmentObjectiveComments.trim());
    } else {
      lines.push('Continuation of previously initiated treatment.');
    }
  } else {
    // First visit - full objective

    // Vitality tests
    const vitalityParts: string[] = [];
    if (data.coldTest.length > 0) {
      const coldLabels = getLabels(vitalityResults, data.coldTest);
      vitalityParts.push(`Cold: ${joinList(coldLabels)}`);
    }
    if (data.eptTest.length > 0) {
      const eptLabels = getLabels(vitalityResults, data.eptTest);
      vitalityParts.push(`EPT: ${joinList(eptLabels)}`);
    }
    if (data.heatTest.length > 0) {
      const heatLabels = getLabels(vitalityResults, data.heatTest);
      vitalityParts.push(`Heat: ${joinList(heatLabels)}`);
    }
    if (vitalityParts.length > 0) {
      lines.push(`Vitality: ${vitalityParts.join(' | ')}`);
    }

    // Vitality test comments
    if (data.vitalityTestComments && data.vitalityTestComments.trim()) {
      lines.push(`Vitality notes: ${data.vitalityTestComments.trim()}`);
    }

    // Clinical findings line
    const clinicalParts: string[] = [];
    if (data.percussion.length > 0) {
      const percussionLabels = getLabels(percussionPalpationResults, data.percussion);
      clinicalParts.push(`Percussion: ${joinList(percussionLabels)}`);
    }
    if (data.palpation.length > 0) {
      const palpationLabels = getLabels(percussionPalpationResults, data.palpation);
      clinicalParts.push(`Palpation: ${joinList(palpationLabels)}`);
    }
    if (clinicalParts.length > 0) {
      lines.push(clinicalParts.join(' | '));
    }

    // Probing and mobility
    const probingMobility: string[] = [];
    if (data.probingDepths) {
      const depths = data.probingDepths;
      const hasValues = Object.values(depths).some(v => v && v.trim());
      if (hasValues) {
        const surfaceValues = ['MB', 'B', 'DB', 'DL', 'L', 'ML']
          .map(surface => `${surface}: ${depths[surface as keyof typeof depths] || '-'}`)
          .join(', ');
        probingMobility.push(`Probing (mm): ${surfaceValues}`);
      }
    }
    if (data.mobility.length > 0) {
      const mobilityLabels = getLabels(mobilityGrades, data.mobility);
      probingMobility.push(`Mobility: ${joinList(mobilityLabels)}`);
    }
    if (probingMobility.length > 0) {
      lines.push(probingMobility.join(' | '));
    }

    // Swelling
    if (data.swelling.length > 0 && !data.swelling.includes('none')) {
      const swellingLabels = getLabels(swellingOptions, data.swelling);
      lines.push(`Swelling: ${joinList(swellingLabels)}`);
    }

    // Sinus tract (legacy support - if stored as separate field)
    if (data.sinusTract && !data.swelling.includes('sinus_tract')) {
      lines.push('Sinus tract: Present');
    }

    // Radiographic findings
    if (data.radiographicFindings.length > 0) {
      const findings = getLabels(radiographicFindings, data.radiographicFindings);
      lines.push(`Radiographic: ${joinList(findings)}`);
    }

    // Clinical findings comments
    if (data.clinicalFindingsComments && data.clinicalFindingsComments.trim()) {
      lines.push(`Clinical notes: ${data.clinicalFindingsComments.trim()}`);
    }

    // Objective additional comments
    if (data.objectiveNotes && data.objectiveNotes.trim()) {
      lines.push('');
      lines.push('Additional Comments:');
      lines.push(data.objectiveNotes.trim());
    }
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
    const options = data.treatmentOptionsOffered.map((opt) => {
      if (opt === 'other' && data.treatmentOptionsOfferedOther) {
        return data.treatmentOptionsOfferedOther;
      }
      return getLabel(treatmentOptionsOffered, opt);
    });
    lines.push(`Treatment options offered: ${joinList(options)}`);
  }

  // Treatment Comments
  if (data.treatmentComments && data.treatmentComments.trim()) {
    lines.push(`Treatment notes: ${data.treatmentComments.trim()}`);
  }

  if (data.treatmentOptionsOffered.length > 0 || data.treatmentComments) {
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

  // Anesthesia (new format with per-type amounts)
  const anesthesiaParts: string[] = [];
  const usedAnestheticKeys: string[] = [];
  Object.entries(data.anesthesiaAmounts).forEach(([key, amount]) => {
    if (amount && parseFloat(amount) > 0) {
      const typeLabel = anesthesiaTypes.find(t => t.value === key)?.label || key;
      anesthesiaParts.push(`${amount} carpule(s) ${typeLabel}`);
      usedAnestheticKeys.push(key);
    }
  });
  if (anesthesiaParts.length > 0 || data.anesthesiaLocations.length > 0) {
    let anesthesia = 'Anesthesia: ';
    const parts: string[] = [];
    if (anesthesiaParts.length > 0) {
      parts.push(joinList(anesthesiaParts));
    }
    if (data.anesthesiaLocations.length > 0) {
      // Check if we have multiple anesthetics and location mapping
      const hasMultipleAnesthetics = usedAnestheticKeys.length > 1;
      const locationParts = data.anesthesiaLocations.map((loc) => {
        let locationLabel = getLabel(anesthesiaLocations, loc);

        // Add side information if available
        if (data.anesthesiaLocationSides && data.anesthesiaLocationSides[loc]) {
          const side = data.anesthesiaLocationSides[loc];
          const sideLabel = side === 'rhs' ? 'RHS' : side === 'lhs' ? 'LHS' : 'bilateral';
          locationLabel = `${locationLabel} (${sideLabel})`;
        }

        if (hasMultipleAnesthetics && data.anesthesiaLocationMapping && data.anesthesiaLocationMapping[loc]) {
          const anestheticsForLocation = data.anesthesiaLocationMapping[loc]
            .map((aKey) => {
              const aType = anesthesiaTypes.find(t => t.value === aKey);
              // Return short label (e.g., "Lidocaine 2%" instead of full label)
              if (aType) {
                const shortLabel = aType.label.split(' w/')[0]; // Take part before " w/"
                return shortLabel;
              }
              return aKey;
            })
            .filter(Boolean);
          if (anestheticsForLocation.length > 0) {
            // If we already have side info in locationLabel, append anesthetics
            if (data.anesthesiaLocationSides && data.anesthesiaLocationSides[loc]) {
              // Remove the closing paren and append anesthetic info
              locationLabel = locationLabel.slice(0, -1) + `, ${anestheticsForLocation.join(', ')})`;
            } else {
              locationLabel = `${locationLabel} (${anestheticsForLocation.join(', ')})`;
            }
          }
        }
        return locationLabel;
      });
      parts.push(`via ${joinList(locationParts)}`);
    }
    anesthesia += parts.join(' ');
    lines.push(anesthesia);
  }

  // Isolation
  if (data.isolation.length > 0) {
    lines.push(`Isolation: ${joinList(getLabels(isolationMethods, data.isolation))}`);
  }

  // === PER-TOOTH TREATMENT ===
  // If we have tooth treatment plans, output them
  if (data.toothTreatmentPlans && data.toothTreatmentPlans.length > 0) {
    lines.push('');
    data.toothTreatmentPlans.forEach((plan) => {
      if (plan.toothNumber) {
        lines.push(`Tooth #${plan.toothNumber}:`);

        // Canal configuration
        if (plan.canalConfiguration.length > 0) {
          const configs = getLabels(canalConfigurations, plan.canalConfiguration);
          let canalText = joinList(configs);

          // If "other" is selected and custom canals are specified, append them
          if (plan.canalConfiguration.includes('other') && plan.customCanalNames.length > 0) {
            const customCanals = plan.customCanalNames.filter(name => name.trim());
            if (customCanals.length > 0) {
              // Replace "Other (custom)" with the actual canal names
              const nonOtherConfigs = configs.filter(c => c !== 'Other (custom)');
              canalText = nonOtherConfigs.length > 0
                ? `${joinList(nonOtherConfigs)}, ${joinList(customCanals)}`
                : joinList(customCanals);
            }
          }

          lines.push(`  Canals: ${canalText}`);
        }

        // Working length method
        if (plan.workingLengthMethod.length > 0) {
          lines.push(`  Working length: ${joinList(getLabels(workingLengthMethods, plan.workingLengthMethod))}`);
        }

        // Per-canal details
        if (plan.canalMAFs.length > 0) {
          // Get all valid canals from selected configurations
          const validCanals = new Set<string>();
          plan.canalConfiguration.forEach((config) => {
            if (config === 'other') {
              plan.customCanalNames.forEach((canal) => {
                if (canal.trim()) validCanals.add(canal.trim());
              });
            } else {
              const canals = canalConfigurationToCanals[config];
              if (canals) {
                canals.forEach((canal) => validCanals.add(canal));
              }
            }
          });

          const relevantCanalMAFs = plan.canalMAFs.filter(
            (m) => (m.workingLength || m.referencePoint || m.fileSystem || m.size || m.taper || m.obturationTechnique || m.obturationMaterial || m.obturationSealer) && validCanals.has(m.canal)
          );

          if (relevantCanalMAFs.length > 0) {
            // Detect shared properties across all canals (size/taper always shown per-canal)
            const sharedFileSystem = allSameValue(relevantCanalMAFs, (m) => m.fileSystem);
            const sharedObtTechnique = allSameValue(relevantCanalMAFs, (m) => m.obturationTechnique);
            const sharedObtMaterial = allSameValue(relevantCanalMAFs, (m) => m.obturationMaterial);
            const sharedObtSealer = allSameValue(relevantCanalMAFs, (m) => m.obturationSealer);

            lines.push('  Per-canal details:');

            // Show shared summary line if any properties are common across all canals
            const sharedInstrParts: string[] = [];
            if (sharedFileSystem) sharedInstrParts.push(getLabel(instrumentationSystems, sharedFileSystem));
            const sharedObtParts: string[] = [];
            if (sharedObtTechnique) sharedObtParts.push(getLabel(obturationTechniques, sharedObtTechnique));
            if (sharedObtMaterial) sharedObtParts.push(getLabel(obturationMaterials, sharedObtMaterial));
            if (sharedObtSealer) sharedObtParts.push(`Sealer: ${getLabel(obturationSealers, sharedObtSealer)}`);
            if (sharedInstrParts.length > 0 || sharedObtParts.length > 0) {
              const sharedLineParts: string[] = [];
              if (sharedInstrParts.length > 0) sharedLineParts.push(`Prep: ${sharedInstrParts.join(' ')}`);
              if (sharedObtParts.length > 0) sharedLineParts.push(`Obt: ${sharedObtParts.join(' with ')}`);
              lines.push(`  All canals: ${sharedLineParts.join(' | ')}`);
            }

            relevantCanalMAFs.forEach((m) => {
              const parts: string[] = [];

              const patentStatus = m.patent ? 'Patent' : 'Not Patent';
              parts.push(patentStatus);

              if (m.workingLength) {
                let wlText = `WL: ${m.workingLength}mm`;
                if (m.referencePoint) wlText += ` from ${m.referencePoint}`;
                parts.push(wlText);
              }

              // Show per-canal instrumentation: skip fileSystem if shared, always show size/taper
              const instrParts: string[] = [];
              if (m.fileSystem && m.fileSystem !== sharedFileSystem) instrParts.push(getLabel(instrumentationSystems, m.fileSystem));
              if (m.size) instrParts.push(getLabel(mafSizes, m.size));
              if (m.taper) instrParts.push(getLabel(mafTapers, m.taper));
              if (instrParts.length > 0) parts.push(`Prep: ${instrParts.join(' ')}`);

              // Only show obturation properties that differ from shared
              const obtParts: string[] = [];
              if (m.obturationTechnique && m.obturationTechnique !== sharedObtTechnique) obtParts.push(getLabel(obturationTechniques, m.obturationTechnique));
              if (m.obturationMaterial && m.obturationMaterial !== sharedObtMaterial) obtParts.push(getLabel(obturationMaterials, m.obturationMaterial));
              if (m.obturationSealer && m.obturationSealer !== sharedObtSealer) obtParts.push(`Sealer: ${getLabel(obturationSealers, m.obturationSealer)}`);
              if (obtParts.length > 0) parts.push(`Obt: ${obtParts.join(' with ')}`);

              lines.push(`    ${m.canal} - ${parts.join('; ')}`);
            });
          }
        }

        lines.push('');
      }
    });
  } else {
    // === LEGACY SINGLE-TOOTH FORMAT (for backward compatibility) ===
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

  // Working length method
  if (data.workingLengthMethod.length > 0) {
    lines.push(`Working length determined using ${joinList(getLabels(workingLengthMethods, data.workingLengthMethod))}`);
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

    const relevantCanalMAFs = data.canalMAFs.filter(
      (m) => (m.workingLength || m.referencePoint || m.fileSystem || m.size || m.taper || m.obturationTechnique || m.obturationMaterial || m.obturationSealer) && validCanals.has(m.canal)
    );

    if (relevantCanalMAFs.length > 0) {
      // Detect shared properties across all canals (size/taper always shown per-canal)
      const sharedFileSystem = allSameValue(relevantCanalMAFs, (m) => m.fileSystem);
      const sharedObtTechnique = allSameValue(relevantCanalMAFs, (m) => m.obturationTechnique);
      const sharedObtMaterial = allSameValue(relevantCanalMAFs, (m) => m.obturationMaterial);
      const sharedObtSealer = allSameValue(relevantCanalMAFs, (m) => m.obturationSealer);

      lines.push('');
      lines.push('Per-canal details:');

      // Show shared summary line if any properties are common across all canals
      const sharedInstrParts: string[] = [];
      if (sharedFileSystem) sharedInstrParts.push(getLabel(instrumentationSystems, sharedFileSystem));
      const sharedObtParts: string[] = [];
      if (sharedObtTechnique) sharedObtParts.push(getLabel(obturationTechniques, sharedObtTechnique));
      if (sharedObtMaterial) sharedObtParts.push(getLabel(obturationMaterials, sharedObtMaterial));
      if (sharedObtSealer) sharedObtParts.push(`Sealer: ${getLabel(obturationSealers, sharedObtSealer)}`);
      if (sharedInstrParts.length > 0 || sharedObtParts.length > 0) {
        const sharedLineParts: string[] = [];
        if (sharedInstrParts.length > 0) sharedLineParts.push(`Prep: ${sharedInstrParts.join(' ')}`);
        if (sharedObtParts.length > 0) sharedLineParts.push(`Obt: ${sharedObtParts.join(' with ')}`);
        lines.push(`All canals: ${sharedLineParts.join(' | ')}`);
      }

      relevantCanalMAFs.forEach((m) => {
        const parts: string[] = [];

        const patentStatus = m.patent ? 'Patent' : 'Not Patent';
        parts.push(patentStatus);

        if (m.workingLength) {
          let wlText = `WL: ${m.workingLength}mm`;
          if (m.referencePoint) wlText += ` from ${m.referencePoint}`;
          parts.push(wlText);
        }

        // Show per-canal instrumentation: skip fileSystem if shared, always show size/taper
        const instrParts: string[] = [];
        if (m.fileSystem && m.fileSystem !== sharedFileSystem) instrParts.push(getLabel(instrumentationSystems, m.fileSystem));
        if (m.size) instrParts.push(getLabel(mafSizes, m.size));
        if (m.taper) instrParts.push(getLabel(mafTapers, m.taper));
        if (instrParts.length > 0) parts.push(`Prep: ${instrParts.join(' ')}`);

        // Only show obturation properties that differ from shared
        const obtParts: string[] = [];
        if (m.obturationTechnique && m.obturationTechnique !== sharedObtTechnique) obtParts.push(getLabel(obturationTechniques, m.obturationTechnique));
        if (m.obturationMaterial && m.obturationMaterial !== sharedObtMaterial) obtParts.push(getLabel(obturationMaterials, m.obturationMaterial));
        if (m.obturationSealer && m.obturationSealer !== sharedObtSealer) obtParts.push(`Sealer: ${getLabel(obturationSealers, m.obturationSealer)}`);
        if (obtParts.length > 0) parts.push(`Obt: ${obtParts.join(' with ')}`);

        lines.push(`  ${m.canal} - ${parts.join('; ')}`);
      });
    }
  }

  } // End of legacy format else block

  // Medicament (placed immediately after prep/canal details)
  if (data.medicament && data.medicament !== 'none') {
    lines.push(`Medicament: ${getLabel(medicaments, data.medicament)}`);
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

  // Restoration (after irrigation, before complications)
  if (data.toothTreatmentPlans && data.toothTreatmentPlans.length > 0) {
    const restorationLines = data.toothTreatmentPlans
      .filter((plan) => plan.toothNumber && plan.restoration)
      .map((plan) => `  Tooth #${plan.toothNumber}: ${getLabel(restorationTypes, plan.restoration!)}`);
    if (restorationLines.length > 0) {
      lines.push(`Restoration:`);
      restorationLines.forEach((r) => lines.push(r));
    }
  } else if (data.restoration) {
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

  // Complications comments
  if (data.complicationsComments && data.complicationsComments.trim()) {
    lines.push(`Complications notes: ${data.complicationsComments.trim()}`);
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
