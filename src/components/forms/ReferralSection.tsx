import { useState } from 'react';
import { useNote } from '../../context/NoteContext';
import { TextInput } from '../common';

export function ReferralSection() {
  const { noteData, updateField } = useNote();
  const [clearedState, setClearedState] = useState<{
    patientName: string;
    patientChartNumber: string;
    patientDOB: string;
    referralLetterDate: string;
    consultationDate: string;
    treatmentCompletionDate: string;
    referralComments: string;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const handleClearSection = () => {
    setClearedState({
      patientName: noteData.patientName,
      patientChartNumber: noteData.patientChartNumber,
      patientDOB: noteData.patientDOB,
      referralLetterDate: noteData.referralLetterDate,
      consultationDate: noteData.consultationDate,
      treatmentCompletionDate: noteData.treatmentCompletionDate,
      referralComments: noteData.referralComments,
    });

    updateField('patientName', '');
    updateField('patientChartNumber', '');
    updateField('patientDOB', '');
    updateField('referralLetterDate', '');
    updateField('consultationDate', '');
    updateField('treatmentCompletionDate', '');
    updateField('referralComments', '');
    setShowUndo(true);
  };

  const handleUndoClear = () => {
    if (!clearedState) {
      setShowUndo(false);
      return;
    }
    updateField('patientName', clearedState.patientName);
    updateField('patientChartNumber', clearedState.patientChartNumber);
    updateField('patientDOB', clearedState.patientDOB);
    updateField('referralLetterDate', clearedState.referralLetterDate);
    updateField('consultationDate', clearedState.consultationDate);
    updateField('treatmentCompletionDate', clearedState.treatmentCompletionDate);
    updateField('referralComments', clearedState.referralComments);
    setShowUndo(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Referral Letter Details</h2>
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
          <span>Referral section cleared.</span>
          <button
            type="button"
            onClick={handleUndoClear}
            className="text-xs font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
          >
            Undo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Patient Name"
          value={noteData.patientName}
          onChange={(value) => updateField('patientName', value)}
          placeholder="Enter patient name..."
        />
        <TextInput
          label="Patient Chart Number"
          value={noteData.patientChartNumber}
          onChange={(value) => updateField('patientChartNumber', value)}
          placeholder="Enter chart number..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Patient DOB"
          value={noteData.patientDOB}
          onChange={(value) => updateField('patientDOB', value)}
          type="date"
        />
        <TextInput
          label="Letter Date"
          value={noteData.referralLetterDate}
          onChange={(value) => updateField('referralLetterDate', value)}
          type="date"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Consultation Date"
          value={noteData.consultationDate}
          onChange={(value) => updateField('consultationDate', value)}
          type="date"
        />
        <TextInput
          label="Treatment Completion Date"
          value={noteData.treatmentCompletionDate}
          onChange={(value) => updateField('treatmentCompletionDate', value)}
          type="date"
        />
      </div>

      <TextInput
        label="Referral Comments"
        value={noteData.referralComments}
        onChange={(value) => updateField('referralComments', value)}
        placeholder="Enter any comments for the referring provider..."
        multiline
        rows={3}
      />
    </div>
  );
}
