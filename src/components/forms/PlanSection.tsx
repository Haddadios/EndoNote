import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
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
} from '../../data';

export function PlanSection() {
  const { noteData, updateField, updateCanalMAF } = useNote();

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

  // Get MAF for a specific canal
  const getCanalMAF = (canal: string) => {
    return noteData.canalMAFs.find((m) => m.canal === canal) || {
      canal,
      patent: false,
      fileSystem: '',
      size: '',
      taper: '',
      obturationTechnique: '',
      obturationMaterial: '',
      obturationSealer: ''
    };
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

      {/* Consent Checkbox */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noteData.consentGiven}
            onChange={(e) => updateField('consentGiven', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Has the patient consented to perform the recommended treatment?
          </span>
        </label>
      </div>

      {/* Anesthesia */}
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mt-2 mb-2">Anesthesia</h3>
      <CheckboxGroup
        label="Anesthesia Type"
        options={anesthesiaTypes}
        selectedValues={noteData.anesthesiaType}
        onChange={(values) => updateField('anesthesiaType', values)}
        columns={2}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          label="Amount"
          value={noteData.anesthesiaAmount}
          options={anesthesiaAmounts}
          onChange={(value) => updateField('anesthesiaAmount', value)}
          placeholder="Select amount..."
        />
      </div>

      <CheckboxGroup
        label="Location/Technique"
        options={anesthesiaLocations}
        selectedValues={noteData.anesthesiaLocations}
        onChange={(values) => updateField('anesthesiaLocations', values)}
        columns={2}
      />

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
        columns={2}
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
        columns={2}
      />

      <TextInput
        label="Measurements"
        value={noteData.workingLengthMeasurements}
        onChange={(value) => updateField('workingLengthMeasurements', value)}
        placeholder="e.g., MB: 21mm, DB: 20mm, P: 22mm"
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
                  
                  // Copy all fields except patent status
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maf.patent}
                        onChange={(e) => updateCanalMAF(canal, 'patent', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Patent</span>
                    </label>
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
        options={irrigationOptions}
        selectedValues={noteData.irrigationProtocol}
        onChange={(values) => updateField('irrigationProtocol', values)}
        columns={2}
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
      <CheckboxGroup
        label="Complications"
        options={complications}
        selectedValues={noteData.complications}
        onChange={(values) => updateField('complications', values)}
        columns={2}
      />

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
