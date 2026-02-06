import { useState, useEffect } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import type { AnesthesiaAmounts, ToothTreatmentPlan, CanalMAF } from '../../types';
import { getToothType } from '../../data';
import {
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
} from '../../data';

export function PlanSection() {
  const {
    noteData,
    updateField,
    preferences,
    addToothTreatmentPlan,
    updateToothTreatmentPlan,
    removeToothTreatmentPlan,
    updateToothTreatmentCanalMAF,
  } = useNote();

  const [activeTabId, setActiveTabId] = useState<string | null>(
    noteData.toothTreatmentPlans.length > 0 ? noteData.toothTreatmentPlans[0].id : null
  );
  const [hasComplications, setHasComplications] = useState(false);
  const [clearedState, setClearedState] = useState<{
    treatmentOptionsOffered: string[];
    treatmentOptionsOfferedOther: string;
    treatmentComments: string;
    consentGiven: boolean;
    anesthesiaAmounts: AnesthesiaAmounts;
    anesthesiaLocations: string[];
    anesthesiaLocationMapping: Record<string, string[]>;
    anesthesiaLocationSides: Record<string, string>;
    isolation: string;
    toothTreatmentPlans: ToothTreatmentPlan[];
    canalConfiguration: string[];
    customCanalNames: string[];
    workingLengthMethod: string[];
    canalMAFs: typeof noteData.canalMAFs;
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
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Get active treatment plan
  const activePlan = noteData.toothTreatmentPlans.find((p) => p.id === activeTabId);

  // Auto-sync from Assessment section when diagnoses change
  useEffect(() => {
    const diagnosedTeeth = noteData.toothDiagnoses
      .filter((d) => d.toothNumber)
      .map((d) => d.toothNumber);

    // Add treatment plans for teeth that don't have one yet
    diagnosedTeeth.forEach((toothNumber) => {
      const existingPlan = noteData.toothTreatmentPlans.find(
        (p) => p.toothNumber === toothNumber
      );
      if (!existingPlan) {
        addToothTreatmentPlan(toothNumber);
      }
    });

    // Set active tab to first plan if none is active and we have plans
    if (!activeTabId && noteData.toothTreatmentPlans.length > 0) {
      setActiveTabId(noteData.toothTreatmentPlans[0].id);
    }
  }, [noteData.toothDiagnoses, noteData.toothTreatmentPlans, activeTabId, addToothTreatmentPlan]);

  // Sync teeth from Assessment section (manual trigger)
  const handleSyncFromAssessment = () => {
    const diagnosedTeeth = noteData.toothDiagnoses
      .filter((d) => d.toothNumber)
      .map((d) => d.toothNumber);

    // Add treatment plans for teeth that don't have one yet
    diagnosedTeeth.forEach((toothNumber) => {
      const existingPlan = noteData.toothTreatmentPlans.find(
        (p) => p.toothNumber === toothNumber
      );
      if (!existingPlan) {
        addToothTreatmentPlan(toothNumber);
      }
    });

    // Set active tab to first plan if none is active
    if (!activeTabId && noteData.toothTreatmentPlans.length > 0) {
      setActiveTabId(noteData.toothTreatmentPlans[0].id);
    }
  };

  // Add a new tooth treatment plan
  const handleAddTooth = () => {
    addToothTreatmentPlan();
    // The newly added plan will be at the end of the array
    setTimeout(() => {
      const plans = noteData.toothTreatmentPlans;
      if (plans.length > 0) {
        setActiveTabId(plans[plans.length - 1].id);
      }
    }, 0);
  };

  // Remove tooth treatment plan
  const handleRemoveTooth = (planId: string) => {
    removeToothTreatmentPlan(planId);
    if (activeTabId === planId) {
      const remainingPlans = noteData.toothTreatmentPlans.filter((p) => p.id !== planId);
      setActiveTabId(remainingPlans.length > 0 ? remainingPlans[0].id : null);
    }
  };

  // Copy settings to all other teeth
  const handleCopyToOtherTeeth = () => {
    if (!activePlan) return;

    noteData.toothTreatmentPlans.forEach((plan) => {
      if (plan.id !== activePlan.id) {
        updateToothTreatmentPlan(plan.id, 'canalConfiguration', activePlan.canalConfiguration);
        updateToothTreatmentPlan(plan.id, 'customCanalNames', activePlan.customCanalNames);
        updateToothTreatmentPlan(plan.id, 'workingLengthMethod', activePlan.workingLengthMethod);
        updateToothTreatmentPlan(plan.id, 'restoration', activePlan.restoration);
        // Copy canal MAFs
        updateToothTreatmentPlan(plan.id, 'canalMAFs', JSON.parse(JSON.stringify(activePlan.canalMAFs)));
      }
    });
  };

  // Get canal names based on selected configuration for active plan
  const getSelectedCanals = (): string[] => {
    if (!activePlan) return [];

    const canals: string[] = [];
    activePlan.canalConfiguration.forEach((config) => {
      if (config === 'other') {
        // Use custom canal names
        activePlan.customCanalNames.forEach((canal) => {
          if (canal.trim() && !canals.includes(canal.trim())) {
            canals.push(canal.trim());
          }
        });
      } else {
        const configCanals = canalConfigurationToCanals[config];
        if (configCanals) {
          configCanals.forEach((canal) => {
            if (!canals.includes(canal)) {
              canals.push(canal);
            }
          });
        }
      }
    });
    return canals;
  };

  const selectedCanals = getSelectedCanals();

  // Combine irrigation solutions and techniques for the checkbox group
  const irrigationOptions = [
    ...irrigationSolutions,
    ...irrigationTechniques.map((t) => ({ ...t, value: `tech_${t.value}` })),
  ];

  // Split irrigation options into main and more options
  const mainIrrigationItems = [
    'naocl_4',
    'edta_17',
    'tech_manual_agitation',
    'tech_pui',
    'c_solution',
    'tech_endoactivator',
  ];

  const irrigationMainOptions = irrigationOptions.filter((opt) =>
    mainIrrigationItems.includes(opt.value)
  );

  const irrigationMoreOptions = irrigationOptions.filter(
    (opt) => !mainIrrigationItems.includes(opt.value)
  );

  // Get MAF for a specific canal in active plan
  const getCanalMAF = (canal: string): CanalMAF => {
    if (!activePlan) {
      return {
        canal,
        patent: false,
        workingLength: '',
        referencePoint: '',
        fileSystem: '',
        size: '',
        taper: '',
        obturationTechnique: '',
        obturationMaterial: '',
        obturationSealer: '',
      };
    }
    return (
      activePlan.canalMAFs.find((m) => m.canal === canal) || {
        canal,
        patent: false,
        workingLength: '',
        referencePoint: '',
        fileSystem: '',
        size: '',
        taper: '',
        obturationTechnique: '',
        obturationMaterial: '',
        obturationSealer: '',
      }
    );
  };

  // Handle anesthesia amount change
  const handleAnesthesiaAmountChange = (key: keyof AnesthesiaAmounts, value: string) => {
    updateField('anesthesiaAmounts', {
      ...noteData.anesthesiaAmounts,
      [key]: value,
    });
  };

  // Get list of anesthetics that are being used (amount > 0)
  const getUsedAnesthetics = (): { value: string; label: string }[] => {
    return anesthesiaTypes.filter((type) => {
      const key = type.value as keyof AnesthesiaAmounts;
      const amount = noteData.anesthesiaAmounts[key];
      return amount && parseFloat(amount) > 0;
    });
  };

  const usedAnesthetics = getUsedAnesthetics();
  const multipleAnestheticsUsed = usedAnesthetics.length > 1;

  // Define bilateral locations that need RHS/LHS toggle
  const bilateralLocations = [
    'ian_block',
    'gow_gates',
    'akinosi',
    'mental',
    'asa',
    'psa',
    'msa',
    'greater_palatine',
  ];

  // Handle location toggle
  const handleLocationToggle = (locationValue: string) => {
    if (noteData.anesthesiaLocations.includes(locationValue)) {
      // Remove location
      updateField('anesthesiaLocations', noteData.anesthesiaLocations.filter((v) => v !== locationValue));
      // Remove from mapping
      const newMapping = { ...noteData.anesthesiaLocationMapping };
      delete newMapping[locationValue];
      updateField('anesthesiaLocationMapping', newMapping);
      // Remove from sides
      const newSides = { ...noteData.anesthesiaLocationSides };
      delete newSides[locationValue];
      updateField('anesthesiaLocationSides', newSides);
    } else {
      // Add location
      updateField('anesthesiaLocations', [...noteData.anesthesiaLocations, locationValue]);
      // Initialize mapping with all used anesthetics if multiple are used
      if (multipleAnestheticsUsed) {
        updateField('anesthesiaLocationMapping', {
          ...noteData.anesthesiaLocationMapping,
          [locationValue]: usedAnesthetics.map((a) => a.value),
        });
      }
      // Initialize side for bilateral locations
      if (bilateralLocations.includes(locationValue)) {
        updateField('anesthesiaLocationSides', {
          ...noteData.anesthesiaLocationSides,
          [locationValue]: 'rhs',
        });
      }
    }
  };

  // Handle side toggle for bilateral locations
  const handleLocationSideToggle = (locationValue: string, side: string) => {
    updateField('anesthesiaLocationSides', {
      ...noteData.anesthesiaLocationSides,
      [locationValue]: side,
    });
  };

  // Handle anesthetic toggle for a specific location
  const handleLocationAnestheticToggle = (locationValue: string, anestheticValue: string) => {
    const currentAnesthetics = noteData.anesthesiaLocationMapping[locationValue] || [];
    let newAnesthetics: string[];

    if (currentAnesthetics.includes(anestheticValue)) {
      // Remove anesthetic
      newAnesthetics = currentAnesthetics.filter((a) => a !== anestheticValue);
    } else {
      // Add anesthetic
      newAnesthetics = [...currentAnesthetics, anestheticValue];
    }

    updateField('anesthesiaLocationMapping', {
      ...noteData.anesthesiaLocationMapping,
      [locationValue]: newAnesthetics,
    });
  };

  const emptyAnesthesiaAmounts: AnesthesiaAmounts = {
    lidocaine_epi: '',
    lidocaine_no_epi: '',
    articaine_epi: '',
    articaine_200: '',
    carbocaine: '',
    bupivacaine: '',
    marcaine: '',
  };

  const handleClearSection = () => {
    setClearedState({
      treatmentOptionsOffered: noteData.treatmentOptionsOffered,
      treatmentOptionsOfferedOther: noteData.treatmentOptionsOfferedOther,
      treatmentComments: noteData.treatmentComments,
      consentGiven: noteData.consentGiven,
      anesthesiaAmounts: noteData.anesthesiaAmounts,
      anesthesiaLocations: noteData.anesthesiaLocations,
      anesthesiaLocationMapping: noteData.anesthesiaLocationMapping,
      anesthesiaLocationSides: noteData.anesthesiaLocationSides,
      isolation: noteData.isolation,
      toothTreatmentPlans: noteData.toothTreatmentPlans,
      canalConfiguration: noteData.canalConfiguration,
      customCanalNames: noteData.customCanalNames,
      workingLengthMethod: noteData.workingLengthMethod,
      canalMAFs: noteData.canalMAFs,
      restoration: noteData.restoration,
      irrigationProtocol: noteData.irrigationProtocol,
      medicament: noteData.medicament,
      complications: noteData.complications,
      complicationsComments: noteData.complicationsComments,
      postOpInstructions: noteData.postOpInstructions,
      additionalNotes: noteData.additionalNotes,
      nextVisit: noteData.nextVisit,
      followUp: noteData.followUp,
      referral: noteData.referral,
    });

    updateField('treatmentOptionsOffered', []);
    updateField('treatmentOptionsOfferedOther', '');
    updateField('treatmentComments', '');
    updateField('consentGiven', false);
    updateField('anesthesiaAmounts', emptyAnesthesiaAmounts);
    updateField('anesthesiaLocations', []);
    updateField('anesthesiaLocationMapping', {});
    updateField('anesthesiaLocationSides', {});
    updateField('isolation', '');
    updateField('toothTreatmentPlans', []);
    updateField('canalConfiguration', []);
    updateField('customCanalNames', []);
    updateField('workingLengthMethod', []);
    updateField('canalMAFs', []);
    updateField('irrigationProtocol', []);
    updateField('medicament', '');
    updateField('restoration', '');
    updateField('complications', []);
    updateField('complicationsComments', '');
    updateField('postOpInstructions', []);
    updateField('additionalNotes', '');
    updateField('nextVisit', []);
    updateField('followUp', '');
    updateField('referral', '');
    setHasComplications(false);
    setShowUndo(true);
    setActiveTabId(null);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateField('treatmentOptionsOffered', clearedState.treatmentOptionsOffered);
    updateField('treatmentOptionsOfferedOther', clearedState.treatmentOptionsOfferedOther);
    updateField('treatmentComments', clearedState.treatmentComments);
    updateField('consentGiven', clearedState.consentGiven);
    updateField('anesthesiaAmounts', clearedState.anesthesiaAmounts);
    updateField('anesthesiaLocations', clearedState.anesthesiaLocations);
    updateField('anesthesiaLocationMapping', clearedState.anesthesiaLocationMapping);
    updateField('anesthesiaLocationSides', clearedState.anesthesiaLocationSides);
    updateField('isolation', clearedState.isolation);
    updateField('toothTreatmentPlans', clearedState.toothTreatmentPlans);
    updateField('canalConfiguration', clearedState.canalConfiguration);
    updateField('customCanalNames', clearedState.customCanalNames);
    updateField('workingLengthMethod', clearedState.workingLengthMethod);
    updateField('canalMAFs', clearedState.canalMAFs);
    updateField('restoration', clearedState.restoration);
    updateField('irrigationProtocol', clearedState.irrigationProtocol);
    updateField('medicament', clearedState.medicament);
    updateField('complications', clearedState.complications);
    updateField('complicationsComments', clearedState.complicationsComments);
    updateField('postOpInstructions', clearedState.postOpInstructions);
    updateField('additionalNotes', clearedState.additionalNotes);
    updateField('nextVisit', clearedState.nextVisit);
    updateField('followUp', clearedState.followUp);
    updateField('referral', clearedState.referral);
    setHasComplications(clearedState.complications.length > 0 || Boolean(clearedState.complicationsComments.trim()));
    setShowUndo(false);
    if (clearedState.toothTreatmentPlans.length > 0) {
      setActiveTabId(clearedState.toothTreatmentPlans[0].id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Plan / Treatment</h2>
        <button
          type="button"
          onClick={handleClearSection}
          className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Clear Section
        </button>
      </div>

      {showUndo && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
          <span>Plan section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* === GLOBAL SETTINGS - TOP === */}

      {/* Treatment Options Offered */}
      <CheckboxGroup
        label="Treatment Options Offered"
        options={treatmentOptionsOffered}
        selectedValues={noteData.treatmentOptionsOffered}
        onChange={(values) => updateField('treatmentOptionsOffered', values)}
        columns={3}
      />

      {noteData.treatmentOptionsOffered.includes('other') && (
        <TextInput
          label="Specify Other Treatment Option"
          value={noteData.treatmentOptionsOfferedOther}
          onChange={(value) => updateField('treatmentOptionsOfferedOther', value)}
          placeholder="Enter other treatment option details..."
        />
      )}

      <TextInput
        label="Treatment Comments"
        value={noteData.treatmentComments}
        onChange={(value) => updateField('treatmentComments', value)}
        placeholder="Additional treatment notes..."
        multiline
        rows={2}
      />

      {/* Consent Checkbox - Enlarged and Highlighted */}
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={noteData.consentGiven}
            onChange={(e) => updateField('consentGiven', e.target.checked)}
            className="w-6 h-6 text-green-600 border-2 border-gray-400 rounded focus:ring-green-500 focus:ring-2"
          />
          <span className="text-base font-bold text-gray-800 dark:text-gray-200">
            Has the patient consented to perform the recommended treatment?
          </span>
        </label>
      </div>

      {/* Anesthesia */}
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-2 mb-2">Anesthesia</h3>

      {/* Anesthesia Type with Carpule Inputs */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Anesthesia Type & Amount (carpules)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anesthesiaTypes.map((type) => {
            const key = type.value as keyof AnesthesiaAmounts;
            const amount = noteData.anesthesiaAmounts[key] || '';
            return (
              <div key={type.value} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={amount}
                  onChange={(e) => handleAnesthesiaAmountChange(key, e.target.value)}
                  placeholder="0"
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anesthesia Location/Technique */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location/Technique
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {anesthesiaLocations.map((location) => {
            const isSelected = noteData.anesthesiaLocations.includes(location.value);
            const locationAnesthetics = noteData.anesthesiaLocationMapping[location.value] || [];
            const isBilateral = bilateralLocations.includes(location.value);
            const locationSide = noteData.anesthesiaLocationSides[location.value] || 'rhs';

            return (
              <div key={location.value} className="flex flex-col">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleLocationToggle(location.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{location.label}</span>
                </label>

                {/* Show RHS/LHS toggle for bilateral locations */}
                {isSelected && isBilateral && (
                  <div className="ml-6 mt-1 flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Side:</span>
                    <button
                      type="button"
                      onClick={() => handleLocationSideToggle(location.value, 'rhs')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        locationSide === 'rhs'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      RHS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationSideToggle(location.value, 'lhs')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        locationSide === 'lhs'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      LHS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationSideToggle(location.value, 'bilateral')}
                      className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                        locationSide === 'bilateral'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      Both
                    </button>
                  </div>
                )}

                {/* Show anesthetic checkboxes if location is selected and multiple anesthetics are used */}
                {isSelected && multipleAnestheticsUsed && (
                  <div className="ml-6 mt-1 space-y-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Anesthetic(s) used:
                    </div>
                    {usedAnesthetics.map((anesthetic) => (
                      <label
                        key={anesthetic.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={locationAnesthetics.includes(anesthetic.value)}
                          onChange={() => handleLocationAnestheticToggle(location.value, anesthetic.value)}
                          className="w-3 h-3 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{anesthetic.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Isolation */}
      <Dropdown
        label="Isolation"
        value={noteData.isolation}
        options={isolationMethods}
        onChange={(value) => updateField('isolation', value)}
        placeholder="Select isolation method..."
      />

      {/* === PER-TOOTH TREATMENT - TABS === */}

      <div className="mt-6 mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Per-Tooth Treatment</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSyncFromAssessment}
              className="text-xs px-3 py-1 rounded-md border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              title="Create treatment plans for all teeth in Assessment section"
            >
              Sync from Assessment
            </button>
            <button
              type="button"
              onClick={handleAddTooth}
              className="text-xs px-3 py-1 rounded-md border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
            >
              + Add Tooth
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        {noteData.toothTreatmentPlans.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {noteData.toothTreatmentPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTabId(plan.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-all whitespace-nowrap ${
                    activeTabId === plan.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.toothNumber ? `#${plan.toothNumber}` : 'New Tooth'}
                </button>
                {noteData.toothTreatmentPlans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTooth(plan.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                    title="Remove this tooth"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activePlan && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            {/* Tooth Number Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tooth Number
              </label>
              <input
                type="text"
                value={activePlan.toothNumber}
                onChange={(e) => {
                  const toothNumber = e.target.value;
                  updateToothTreatmentPlan(activePlan.id, 'toothNumber', toothNumber);
                  if (toothNumber) {
                    updateToothTreatmentPlan(activePlan.id, 'toothType', getToothType(toothNumber));
                  }
                }}
                placeholder={preferences.toothNotation === 'universal' ? 'e.g., 3, 14, 19' : 'e.g., 16, 26, 36'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Copy to Other Teeth Button */}
            {noteData.toothTreatmentPlans.length > 1 && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleCopyToOtherTeeth}
                  className="text-xs px-3 py-1 rounded-md border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                >
                  Copy Settings to All Other Teeth
                </button>
              </div>
            )}

            {/* Canal Configuration */}
            <CheckboxGroup
              label="Canal Configuration"
              options={canalConfigurations}
              selectedValues={activePlan.canalConfiguration}
              onChange={(values) => updateToothTreatmentPlan(activePlan.id, 'canalConfiguration', values)}
              columns={3}
            />

            {/* Custom Canal Names Input */}
            {activePlan.canalConfiguration.includes('other') && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Canal Names
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Enter canal names separated by commas (e.g., "MB, DB, P" or "Canal 1, Canal 2, Canal 3")
                </p>
                <input
                  type="text"
                  value={activePlan.customCanalNames.join(', ')}
                  onChange={(e) => {
                    const names = e.target.value.split(',').map((name) => name.trim());
                    updateToothTreatmentPlan(activePlan.id, 'customCanalNames', names);
                  }}
                  placeholder="e.g., MB, DB, P"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Working Length */}
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">Working Length</h4>
            <CheckboxGroup
              label="Method"
              options={workingLengthMethods}
              selectedValues={activePlan.workingLengthMethod}
              onChange={(values) => updateToothTreatmentPlan(activePlan.id, 'workingLengthMethod', values)}
              columns={3}
            />

            {/* Per-Canal Instrumentation Setup */}
            {selectedCanals.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Instrumentation & Obturation (per canal)
                </h4>
                <div className="space-y-4">
                  {selectedCanals.map((canal, canalIndex) => {
                    const maf = getCanalMAF(canal);

                    // Function to copy from previous canal
                    const copyFromPreviousCanal = () => {
                      if (canalIndex > 0 && activePlan) {
                        const previousCanal = selectedCanals[canalIndex - 1];
                        const previousMAF = getCanalMAF(previousCanal);

                        // Copy all fields including patent, workingLength, and referencePoint
                        updateToothTreatmentCanalMAF(activePlan.id, canal, 'patent', previousMAF.patent);
                        if (previousMAF.workingLength)
                          updateToothTreatmentCanalMAF(activePlan.id, canal, 'workingLength', previousMAF.workingLength);
                        if (previousMAF.referencePoint)
                          updateToothTreatmentCanalMAF(activePlan.id, canal, 'referencePoint', previousMAF.referencePoint);
                        if (previousMAF.fileSystem)
                          updateToothTreatmentCanalMAF(activePlan.id, canal, 'fileSystem', previousMAF.fileSystem);
                        if (previousMAF.size)
                          updateToothTreatmentCanalMAF(activePlan.id, canal, 'size', previousMAF.size);
                        if (previousMAF.taper)
                          updateToothTreatmentCanalMAF(activePlan.id, canal, 'taper', previousMAF.taper);
                        if (previousMAF.obturationTechnique)
                          updateToothTreatmentCanalMAF(
                            activePlan.id,
                            canal,
                            'obturationTechnique',
                            previousMAF.obturationTechnique
                          );
                        if (previousMAF.obturationMaterial)
                          updateToothTreatmentCanalMAF(
                            activePlan.id,
                            canal,
                            'obturationMaterial',
                            previousMAF.obturationMaterial
                          );
                        if (previousMAF.obturationSealer)
                          updateToothTreatmentCanalMAF(
                            activePlan.id,
                            canal,
                            'obturationSealer',
                            previousMAF.obturationSealer
                          );
                      }
                    };

                    return (
                      <div
                        key={canal}
                        className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-gray-700 dark:text-gray-200">{canal}</div>
                            {canalIndex > 0 && (
                              <button
                                onClick={copyFromPreviousCanal}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                title="Copy setup from previous canal"
                              >
                                Copy from above
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">
                              Patency:
                            </span>
                            <button
                              onClick={() => updateToothTreatmentCanalMAF(activePlan.id, canal, 'patent', true)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                                maf.patent
                                  ? 'bg-green-600 text-white shadow-md'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                              }`}
                            >
                              Patent
                            </button>
                            <button
                              onClick={() => updateToothTreatmentCanalMAF(activePlan.id, canal, 'patent', false)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                                !maf.patent
                                  ? 'bg-red-600 text-white shadow-md'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                              }`}
                            >
                              Not Patent
                            </button>
                          </div>
                        </div>

                        {/* Working Length & Reference Point */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Working Length (mm)
                            </label>
                            <input
                              type="text"
                              value={maf.workingLength}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'workingLength', e.target.value)
                              }
                              placeholder="e.g., 21"
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Reference Point
                            </label>
                            <input
                              type="text"
                              value={maf.referencePoint}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'referencePoint', e.target.value)
                              }
                              placeholder="e.g., cusp tip, incisal edge"
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Instrumentation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">File System</label>
                            <select
                              value={maf.fileSystem}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'fileSystem', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {instrumentationSystems.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Size</label>
                            <select
                              value={maf.size}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'size', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {mafSizes.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Taper</label>
                            <select
                              value={maf.taper}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'taper', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {mafTapers.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Obturation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Obturation Technique
                            </label>
                            <select
                              value={maf.obturationTechnique}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(
                                  activePlan.id,
                                  canal,
                                  'obturationTechnique',
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {obturationTechniques.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Material</label>
                            <select
                              value={maf.obturationMaterial}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(
                                  activePlan.id,
                                  canal,
                                  'obturationMaterial',
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {obturationMaterials.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Sealer</label>
                            <select
                              value={maf.obturationSealer}
                              onChange={(e) =>
                                updateToothTreatmentCanalMAF(activePlan.id, canal, 'obturationSealer', e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {obturationSealers.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Restoration */}
            <div className="mt-4">
              <Dropdown
                label="Restoration"
                value={activePlan.restoration}
                options={restorationTypes}
                onChange={(value) => updateToothTreatmentPlan(activePlan.id, 'restoration', value)}
                placeholder="Select restoration..."
              />
            </div>
          </div>
        )}

        {noteData.toothTreatmentPlans.length === 0 && (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="mb-2">No teeth selected for treatment</p>
            <p className="text-sm">
              Use "Sync from Assessment" to import teeth or "Add Tooth" to add manually
            </p>
          </div>
        )}
      </div>

      {/* === GLOBAL SETTINGS - BOTTOM === */}

      {/* Irrigation */}
      <CheckboxGroup
        label="Irrigation Protocol"
        mainOptions={irrigationMainOptions}
        moreOptions={irrigationMoreOptions}
        selectedValues={noteData.irrigationProtocol}
        onChange={(values) => updateField('irrigationProtocol', values)}
        columns={3}
      />

      {/* Medicament */}
      <Dropdown
        label="Intracanal Medicament"
        value={noteData.medicament}
        options={medicaments}
        onChange={(value) => updateField('medicament', value)}
        placeholder="Select medicament..."
      />

      {/* Complications */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complications</label>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Were there any complications?</span>
          <button
            type="button"
            onClick={() => {
              setHasComplications(true);
            }}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              hasComplications
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setHasComplications(false);
              // Clear complications when set to No
              updateField('complications', []);
              updateField('complicationsComments', '');
            }}
            className={`px-4 py-2 text-sm font-medium rounded transition-all ${
              !hasComplications
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {hasComplications && (
        <>
          <CheckboxGroup
            label="Select Complications"
            options={complications}
            selectedValues={noteData.complications}
            onChange={(values) => updateField('complications', values)}
            columns={2}
          />

          <TextInput
            label="Complications Comments"
            value={noteData.complicationsComments}
            onChange={(value) => updateField('complicationsComments', value)}
            placeholder="Additional details about complications..."
            multiline
            rows={2}
          />
        </>
      )}

      {/* Post-op Instructions */}
      <CheckboxGroup
        label="Post-op Instructions"
        options={postOpInstructions}
        selectedValues={noteData.postOpInstructions}
        onChange={(values) => updateField('postOpInstructions', values)}
        columns={2}
      />

      {/* Additional Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes/Comments
        </label>
        <textarea
          value={noteData.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          rows={4}
          placeholder="Enter any additional notes, observations, or comments here..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Next Visit */}
      <CheckboxGroup
        label="Next Visit"
        options={nextVisitOptions}
        selectedValues={noteData.nextVisit}
        onChange={(values) => updateField('nextVisit', values)}
        columns={3}
      />

      {/* Follow-up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Follow-up"
          value={noteData.followUp}
          options={followUpOptions}
          onChange={(value) => updateField('followUp', value)}
          placeholder="Select follow-up..."
        />

        <Dropdown
          label="Referral"
          value={noteData.referral}
          options={referralOptions}
          onChange={(value) => updateField('referral', value)}
          placeholder="Select referral..."
        />
      </div>
    </div>
  );
}
