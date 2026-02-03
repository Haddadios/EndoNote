import { useNote } from '../../context/NoteContext';
import { TextInput } from '../common';

export function ReferralSection() {
  const { noteData, updateField } = useNote();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Referral Letter Details</h2>

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
