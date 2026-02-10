import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { Dropdown, CheckboxGroup, TextInput } from '../common';
import {
  chiefComplaints,
  painCharacteristics,
  painCharacteristicGroups,
  medicalHistoryAlerts,
  genderOptions,
} from '../../data';

export function SubjectiveSection() {
  const { noteData, updateField } = useNote();
  const [clearedState, setClearedState] = useState<{
    age: string;
    gender: string;
    chiefComplaints: string[];
    chiefComplaintCustom: string;
    painDuration: string;
    painDurationCustom: string;
    painCharacteristics: string[];
    painHistoryOther: string;
    bloodPressure: string;
    pulse: string;
    respiratoryRate: string;
    medicalHistoryAlerts: string[];
    medicalHistoryComments: string;
    continuingTreatmentComments: string;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const isFirstVisit = noteData.visitType === 'first_visit';

  // Split medical history alerts into main and more options
  const mainMedicalHistoryItems = [
    'none',
    'hypertension',
    'diabetes',
    'pregnancy',
    'allergy_latex',
    'hiv',
    'anxiety',
    'other',
  ];

  const medicalHistoryMainOptions = medicalHistoryAlerts.filter((opt) =>
    mainMedicalHistoryItems.includes(opt.value)
  );

  const medicalHistoryMoreOptions = medicalHistoryAlerts.filter(
    (opt) => !mainMedicalHistoryItems.includes(opt.value)
  );

  // Chief complaint options split (keep core items visible)
  const mainChiefComplaintItems = ['pain', 'swelling', 'sensitivity_bite', 'trauma', 'recall', 'other'];
  const chiefComplaintMainOptions = chiefComplaints.filter((opt) => mainChiefComplaintItems.includes(opt.value));
  const chiefComplaintMoreOptions = chiefComplaints.filter((opt) => !mainChiefComplaintItems.includes(opt.value));

  const handleClearSection = () => {
    setClearedState({
      age: noteData.age,
      gender: noteData.gender,
      chiefComplaints: noteData.chiefComplaints,
      chiefComplaintCustom: noteData.chiefComplaintCustom,
      painDuration: noteData.painDuration,
      painDurationCustom: noteData.painDurationCustom,
      painCharacteristics: noteData.painCharacteristics,
      painHistoryOther: noteData.painHistoryOther,
      bloodPressure: noteData.bloodPressure,
      pulse: noteData.pulse,
      respiratoryRate: noteData.respiratoryRate,
      medicalHistoryAlerts: noteData.medicalHistoryAlerts,
      medicalHistoryComments: noteData.medicalHistoryComments,
      continuingTreatmentComments: noteData.continuingTreatmentComments,
    });

    updateField('age', '');
    updateField('gender', '');
    updateField('chiefComplaints', []);
    updateField('chiefComplaintCustom', '');
    updateField('painDuration', '');
    updateField('painDurationCustom', '');
    updateField('painCharacteristics', []);
    updateField('painHistoryOther', '');
    updateField('bloodPressure', '');
    updateField('pulse', '');
    updateField('respiratoryRate', '');
    updateField('medicalHistoryAlerts', []);
    updateField('medicalHistoryComments', '');
    updateField('continuingTreatmentComments', '');
    setShowUndo(true);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateField('age', clearedState.age);
    updateField('gender', clearedState.gender);
    updateField('chiefComplaints', clearedState.chiefComplaints);
    updateField('chiefComplaintCustom', clearedState.chiefComplaintCustom);
    updateField('painDuration', clearedState.painDuration);
    updateField('painDurationCustom', clearedState.painDurationCustom);
    updateField('painCharacteristics', clearedState.painCharacteristics);
    updateField('painHistoryOther', clearedState.painHistoryOther);
    updateField('bloodPressure', clearedState.bloodPressure);
    updateField('pulse', clearedState.pulse);
    updateField('respiratoryRate', clearedState.respiratoryRate);
    updateField('medicalHistoryAlerts', clearedState.medicalHistoryAlerts);
    updateField('medicalHistoryComments', clearedState.medicalHistoryComments);
    updateField('continuingTreatmentComments', clearedState.continuingTreatmentComments);
    setShowUndo(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Subjective</h2>
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
          <span>Subjective section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Visit Type Toggle */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visit Type</span>
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${isFirstVisit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              First Visit
            </span>
            <button
              type="button"
              onClick={() => updateField('visitType', isFirstVisit ? 'continuing_treatment' : 'first_visit')}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isFirstVisit ? 'bg-blue-600' : 'bg-green-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isFirstVisit ? 'translate-x-1' : 'translate-x-8'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${!isFirstVisit ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Continuing Treatment
            </span>
          </div>
        </div>
      </div>

      {/* Age and Gender Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TextInput
          label="Age"
          value={noteData.age}
          onChange={(value) => updateField('age', value)}
          placeholder="e.g., 45"
        />

        <Dropdown
          label="Gender"
          value={noteData.gender}
          options={genderOptions}
          onChange={(value) => updateField('gender', value)}
          placeholder="Select gender..."
        />
      </div>

      {/* Vitals Section - Always shown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextInput
          label="Blood Pressure"
          value={noteData.bloodPressure}
          onChange={(value) => updateField('bloodPressure', value)}
          placeholder="e.g., 120/80 mmHg"
        />

        <TextInput
          label="Pulse"
          value={noteData.pulse}
          onChange={(value) => updateField('pulse', value)}
          placeholder="e.g., 72 bpm"
        />

        <TextInput
          label="Respiratory Rate"
          value={noteData.respiratoryRate}
          onChange={(value) => updateField('respiratoryRate', value)}
          placeholder="e.g., 16/min"
        />
      </div>

      {/* Continuing Treatment Comments - Only shown for continuing treatment */}
      {!isFirstVisit && (
        <div className="mt-4">
          <TextInput
            label="Changes Since Last Visit"
            value={noteData.continuingTreatmentComments}
            onChange={(value) => updateField('continuingTreatmentComments', value)}
            placeholder="Note any changes, symptoms, or concerns since the last visit..."
            multiline
            rows={3}
          />
        </div>
      )}

      {/* First Visit Content - Only shown for first visit */}
      {isFirstVisit && (
        <>
          <CheckboxGroup
            label="Medical History Alerts"
            sectionLabel
            mainOptions={medicalHistoryMainOptions}
            moreOptions={medicalHistoryMoreOptions}
            selectedValues={noteData.medicalHistoryAlerts}
            onChange={(values) => updateField('medicalHistoryAlerts', values)}
            columns={2}
          />

          <TextInput
            label="Medical History Comments"
            value={noteData.medicalHistoryComments}
            onChange={(value) => updateField('medicalHistoryComments', value)}
            placeholder="Additional medical history notes..."
            multiline
            rows={2}
          />

          <CheckboxGroup
            label="Chief Complaint(s)"
            sectionLabel
            mainOptions={chiefComplaintMainOptions}
            moreOptions={chiefComplaintMoreOptions}
            selectedValues={noteData.chiefComplaints}
            onChange={(values) => updateField('chiefComplaints', values)}
            columns={2}
          />

          <TextInput
            label="Chief Complaint Details"
            value={noteData.chiefComplaintCustom}
            onChange={(value) => updateField('chiefComplaintCustom', value)}
            placeholder="Enter chief complaint details..."
          />
          <CheckboxGroup
            label="Pain Characteristics"
            options={painCharacteristics}
            groups={painCharacteristicGroups}
            selectedValues={noteData.painCharacteristics}
            onChange={(values) => updateField('painCharacteristics', values)}
            columns={3}
            inlineTextInputs={{
              history_other: {
                value: noteData.painHistoryOther,
                onChange: (value) => updateField('painHistoryOther', value),
                placeholder: 'Specify...',
              },
            }}
          />
        </>
      )}
    </div>
  );
}
