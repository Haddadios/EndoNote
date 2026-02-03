import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import type { AnesthesiaAmounts } from '../../types';
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
  const { noteData, updateField, updateCanalMAF } = useNote();
  const [hasComplications, setHasComplications] = useState(false);

  // Get canal names based on selected configuration
  const getSelectedCanals = (): string[] => {
    const canals: string[] = [];
    noteData.canalConfiguration.forEach((config) => {
      if (config === 'other') {
        // Use custom canal names
        noteData.customCanalNames.forEach((canal) => {
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

  // Get MAF for a specific canal
  const getCanalMAF = (canal: string) => {
    return noteData.canalMAFs.find((m) => m.canal === canal) || {
      canal,
      patent: false,
      workingLength: '',
      referencePoint: '',
      fileSystem: '',
      size: '',
      taper: '',
      obturationTechnique: '',
      obturationMaterial: '',
      obturationSealer: ''
    };
  };

  // Handle anesthesia amount change
  const handleAnesthesiaAmountChange = (key: keyof AnesthesiaAmounts, value: string) => {
    updateField('anesthesiaAmounts', {
      ...noteData.anesthesiaAmounts,
      [key]: value
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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Plan / Treatment</h2>

      {/* Treatment Options Offered */}
      <CheckboxGroup
        label="Treatment Options Offered"
        options={treatmentOptionsOffered}
        selectedValues={noteData.treatmentOptionsOffered}
        onChange={(values) => updateField('treatmentOptionsOffered', values)}
        columns={2}
      />

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

      {/* Canal Configuration */}
      <CheckboxGroup
        label="Canal Configuration"
        options={canalConfigurations}
        selectedValues={noteData.canalConfiguration}
        onChange={(values) => updateField('canalConfiguration', values)}
        columns={3}
      />

      {/* Custom Canal Names Input */}
      {noteData.canalConfiguration.includes('other') && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Canal Names
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Enter canal names separated by commas (e.g., "MB, DB, P" or "Canal 1, Canal 2, Canal 3")
          </p>
          <input
            type="text"
            value={noteData.customCanalNames.join(', ')}
            onChange={(e) => {
              const names = e.target.value.split(',').map(name => name.trim());
              updateField('customCanalNames', names);
            }}
            placeholder="e.g., MB, DB, P"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Working Length */}
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">Working Length</h3>
      <CheckboxGroup
        label="Method"
        options={workingLengthMethods}
        selectedValues={noteData.workingLengthMethod}
        onChange={(values) => updateField('workingLengthMethod', values)}
        columns={3}
      />

      {/* Per-Canal Instrumentation Setup */}
      {selectedCanals.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-3">Instrumentation & Obturation (per canal)</h3>
          <div className="space-y-4">
            {selectedCanals.map((canal, canalIndex) => {
              const maf = getCanalMAF(canal);

              // Function to copy from previous canal
              const copyFromPreviousCanal = () => {
                if (canalIndex > 0) {
                  const previousCanal = selectedCanals[canalIndex - 1];
                  const previousMAF = getCanalMAF(previousCanal);

                  // Copy all fields including patent, workingLength, and referencePoint
                  updateCanalMAF(canal, 'patent', previousMAF.patent);
                  if (previousMAF.workingLength) updateCanalMAF(canal, 'workingLength', previousMAF.workingLength);
                  if (previousMAF.referencePoint) updateCanalMAF(canal, 'referencePoint', previousMAF.referencePoint);
                  if (previousMAF.fileSystem) updateCanalMAF(canal, 'fileSystem', previousMAF.fileSystem);
                  if (previousMAF.size) updateCanalMAF(canal, 'size', previousMAF.size);
                  if (previousMAF.taper) updateCanalMAF(canal, 'taper', previousMAF.taper);
                  if (previousMAF.obturationTechnique) updateCanalMAF(canal, 'obturationTechnique', previousMAF.obturationTechnique);
                  if (previousMAF.obturationMaterial) updateCanalMAF(canal, 'obturationMaterial', previousMAF.obturationMaterial);
                  if (previousMAF.obturationSealer) updateCanalMAF(canal, 'obturationSealer', previousMAF.obturationSealer);
                }
              };

              return (
                <div key={canal} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
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
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">Patency:</span>
                      <button
                        onClick={() => updateCanalMAF(canal, 'patent', true)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                          maf.patent
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                      >
                        Patent
                      </button>
                      <button
                        onClick={() => updateCanalMAF(canal, 'patent', false)}
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Working Length (mm)</label>
                      <input
                        type="text"
                        value={maf.workingLength}
                        onChange={(e) => updateCanalMAF(canal, 'workingLength', e.target.value)}
                        placeholder="e.g., 21"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Reference Point</label>
                      <input
                        type="text"
                        value={maf.referencePoint}
                        onChange={(e) => updateCanalMAF(canal, 'referencePoint', e.target.value)}
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
                        onChange={(e) => updateCanalMAF(canal, 'fileSystem', e.target.value)}
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
                        onChange={(e) => updateCanalMAF(canal, 'size', e.target.value)}
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
                        onChange={(e) => updateCanalMAF(canal, 'taper', e.target.value)}
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Obturation Technique</label>
                      <select
                        value={maf.obturationTechnique}
                        onChange={(e) => updateCanalMAF(canal, 'obturationTechnique', e.target.value)}
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
                        onChange={(e) => updateCanalMAF(canal, 'obturationMaterial', e.target.value)}
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
                        onChange={(e) => updateCanalMAF(canal, 'obturationSealer', e.target.value)}
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

      {/* Restoration */}
      <Dropdown
        label="Restoration"
        value={noteData.restoration}
        options={restorationTypes}
        onChange={(value) => updateField('restoration', value)}
        placeholder="Select restoration..."
      />

      {/* Complications */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Complications
        </label>
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
