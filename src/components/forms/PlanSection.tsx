import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
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
  restorationTypes,
  canalConfigurations,
  canalConfigurationToCanals,
  complications,
  postOpInstructions,
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
    return noteData.canalMAFs.find((m) => m.canal === canal) || { canal, size: '', taper: '' };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Plan / Treatment</h2>

      {/* Anesthesia */}
      <h3 className="text-md font-medium text-gray-700 mt-2 mb-2">Anesthesia</h3>
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Canal Names
          </label>
          <p className="text-xs text-gray-600 mb-2">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Working Length */}
      <h3 className="text-md font-medium text-gray-700 mt-4 mb-2">Working Length</h3>
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

      {/* Instrumentation */}
      <h3 className="text-md font-medium text-gray-700 mt-4 mb-2">Instrumentation</h3>
      <Dropdown
        label="File System"
        value={noteData.instrumentationSystem}
        options={instrumentationSystems}
        onChange={(value) => updateField('instrumentationSystem', value)}
        placeholder="Select file system..."
      />

      {/* Per-Canal MAF Selection */}
      {selectedCanals.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MAF / Final Size (per canal)
          </label>
          <div className="space-y-3">
            {selectedCanals.map((canal) => {
              const maf = getCanalMAF(canal);
              return (
                <div key={canal} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="w-20 font-medium text-gray-700">{canal}:</span>
                  <select
                    value={maf.size}
                    onChange={(e) => updateCanalMAF(canal, 'size', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Size...</option>
                    {mafSizes.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={maf.taper}
                    onChange={(e) => updateCanalMAF(canal, 'taper', e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Taper...</option>
                    {mafTapers.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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

      {/* Obturation */}
      <h3 className="text-md font-medium text-gray-700 mt-4 mb-2">Obturation</h3>
      <Dropdown
        label="Technique"
        value={noteData.obturationTechnique}
        options={obturationTechniques}
        onChange={(value) => updateField('obturationTechnique', value)}
        placeholder="Select technique..."
      />

      <CheckboxGroup
        label="Materials"
        options={obturationMaterials}
        selectedValues={noteData.obturationMaterials}
        onChange={(values) => updateField('obturationMaterials', values)}
        columns={2}
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
