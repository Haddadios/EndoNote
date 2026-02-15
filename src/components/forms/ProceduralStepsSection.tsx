import type {
  ProceduralSteps,
  ToothTreatmentPlan,
  ApicalMicrosurgerySteps,
  HemisectionSteps,
  RootResectionSteps,
  ApexificationSteps,
  ApexogenesisSteps,
  RegenerativeEndoSteps,
  IntentionalReplantationSteps,
  AutotransplantationSteps,
} from '../../types';
import {
  flapDesigns,
  retroMaterials,
  graftOptions,
  hemostaticAgents,
  sutureMaterials,
  antibioticPastes,
  regenScaffolds,
  storageMedia,
  pulpCapMaterials,
  apexPlugMaterials,
  rootDevStages,
  splintTypes,
  replantRctPlan,
  pulpotomyLevels,
} from '../../data';

interface Props {
  treatmentOptionsOffered: string[];
  proceduralSteps: ProceduralSteps;
  toothTreatmentPlans: ToothTreatmentPlan[];
  onChange: (steps: ProceduralSteps) => void;
}

const SURGICAL_PROCEDURES = [
  'apical_microsurgery',
  'hemisection',
  'root_resection',
  'apexification',
  'apexogenesis',
  'regenerative_endo',
  'intentional_replantation',
  'autotransplantation',
] as const;

type SurgicalProcedure = (typeof SURGICAL_PROCEDURES)[number];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 border-b border-teal-200 dark:border-teal-700">
      <span className="text-xs font-semibold tracking-wide text-teal-800 dark:text-teal-200 uppercase">
        {title}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TextFieldSmall({
  label,
  value,
  onChange,
  placeholder = '',
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      )}
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
      />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

export function ProceduralStepsSection({ treatmentOptionsOffered, proceduralSteps, toothTreatmentPlans, onChange }: Props) {
  const activeProcedures = SURGICAL_PROCEDURES.filter((p) => treatmentOptionsOffered.includes(p));

  if (activeProcedures.length === 0) return null;

  const updateSteps = <K extends keyof ProceduralSteps>(key: K, value: ProceduralSteps[K]) =>
    onChange({ ...proceduralSteps, [key]: value });

  // Collect all canal names from all tooth treatment plans
  const allCanals: string[] = [];
  toothTreatmentPlans.forEach((plan) => {
    plan.canalMAFs.forEach((m) => {
      if (m.canal && !allCanals.includes(m.canal)) allCanals.push(m.canal);
    });
  });

  const renderApicalMicrosurgery = () => {
    const s: ApicalMicrosurgerySteps = proceduralSteps.apical_microsurgery ?? {
      rootsTreated: '',
      flapDesign: '',
      osteotomyDescription: '',
      resectionMm: '',
      retroPrepDepthMm: '',
      resectionAngle: '',
      methyleneBlueFindings: '',
      retroMaterial: '',
      graft: '',
      hemostaticAgent: '',
      sutureMaterial: '',
      sutureCount: '',
      biopsySent: false,
      surgicalNotes: '',
    };
    const u = (patch: Partial<ApicalMicrosurgerySteps>) =>
      updateSteps('apical_microsurgery', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Apical Microsurgery Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <TextFieldSmall label="Roots/Canals Treated" value={s.rootsTreated} onChange={(v) => u({ rootsTreated: v })} placeholder="e.g., palatal root, MB1+MB2" />
          </div>
          <SelectField label="Flap Design" value={s.flapDesign} options={flapDesigns} onChange={(v) => u({ flapDesign: v })} />
          <TextFieldSmall label="Osteotomy Description" value={s.osteotomyDescription} onChange={(v) => u({ osteotomyDescription: v })} placeholder="e.g., 3×4mm oval" />
          <TextFieldSmall label="Root End Resection (mm)" value={s.resectionMm} onChange={(v) => u({ resectionMm: v })} placeholder="e.g., 3" />
          <TextFieldSmall label="Retro-prep Depth (mm)" value={s.retroPrepDepthMm} onChange={(v) => u({ retroPrepDepthMm: v })} placeholder="e.g., 3" />
          <TextFieldSmall label="Resection/Bevel Angle" value={s.resectionAngle} onChange={(v) => u({ resectionAngle: v })} placeholder="e.g., 0°" />
          <div className="md:col-span-2">
            <TextFieldSmall label="Methylene Blue Findings" value={s.methyleneBlueFindings} onChange={(v) => u({ methyleneBlueFindings: v })} placeholder="e.g., isthmus identified between MB1 and MB2, no cracks detected" />
          </div>
          <SelectField label="Retrograde Material" value={s.retroMaterial} options={retroMaterials} onChange={(v) => u({ retroMaterial: v })} />
          <SelectField label="Graft" value={s.graft} options={graftOptions} onChange={(v) => u({ graft: v })} />
          <SelectField label="Hemostatic Agent" value={s.hemostaticAgent} options={hemostaticAgents} onChange={(v) => u({ hemostaticAgent: v })} />
          <SelectField label="Suture Material" value={s.sutureMaterial} options={sutureMaterials} onChange={(v) => u({ sutureMaterial: v })} />
          <TextFieldSmall label="Suture Count" value={s.sutureCount} onChange={(v) => u({ sutureCount: v })} placeholder="e.g., 4" />
          <div className="flex items-center mt-4">
            <CheckboxField label="Biopsy sent for pathology" checked={s.biopsySent} onChange={(v) => u({ biopsySent: v })} />
          </div>
          <div className="md:col-span-2">
            <TextFieldSmall label="Surgical Notes" value={s.surgicalNotes} onChange={(v) => u({ surgicalNotes: v })} placeholder="Additional surgical notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderHemisection = () => {
    const s: HemisectionSteps = proceduralSteps.hemisection ?? {
      rootsRetained: [],
      rootsResected: [],
      crownRemovedFirst: false,
      hemisectionNotes: '',
    };
    const u = (patch: Partial<HemisectionSteps>) =>
      updateSteps('hemisection', { ...s, ...patch });

    const toggleList = (list: string[], value: string): string[] =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Hemisection Details" />
        <div className="p-3 space-y-3">
          {allCanals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Roots Retained</label>
                <div className="space-y-1">
                  {allCanals.map((canal) => (
                    <CheckboxField
                      key={canal}
                      label={canal}
                      checked={s.rootsRetained.includes(canal)}
                      onChange={() => u({ rootsRetained: toggleList(s.rootsRetained, canal) })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Roots Resected</label>
                <div className="space-y-1">
                  {allCanals.map((canal) => (
                    <CheckboxField
                      key={canal}
                      label={canal}
                      checked={s.rootsResected.includes(canal)}
                      onChange={() => u({ rootsResected: toggleList(s.rootsResected, canal) })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <CheckboxField label="Crown removed first" checked={s.crownRemovedFirst} onChange={(v) => u({ crownRemovedFirst: v })} />
          <TextFieldSmall label="Notes" value={s.hemisectionNotes} onChange={(v) => u({ hemisectionNotes: v })} placeholder="Additional notes..." multiline />
        </div>
      </div>
    );
  };

  const renderRootResection = () => {
    const s: RootResectionSteps = proceduralSteps.root_resection ?? {
      rootsResected: [],
      resectionMm: '',
      resectionNotes: '',
    };
    const u = (patch: Partial<RootResectionSteps>) =>
      updateSteps('root_resection', { ...s, ...patch });

    const toggleList = (list: string[], value: string): string[] =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Root Resection Details" />
        <div className="p-3 space-y-3">
          {allCanals.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Roots Resected</label>
              <div className="flex flex-wrap gap-3">
                {allCanals.map((canal) => (
                  <CheckboxField
                    key={canal}
                    label={canal}
                    checked={s.rootsResected.includes(canal)}
                    onChange={() => u({ rootsResected: toggleList(s.rootsResected, canal) })}
                  />
                ))}
              </div>
            </div>
          )}
          <TextFieldSmall label="Resection Length (mm)" value={s.resectionMm} onChange={(v) => u({ resectionMm: v })} placeholder="e.g., 3" />
          <TextFieldSmall label="Notes" value={s.resectionNotes} onChange={(v) => u({ resectionNotes: v })} placeholder="Additional notes..." multiline />
        </div>
      </div>
    );
  };

  const renderApexification = () => {
    const s: ApexificationSteps = proceduralSteps.apexification ?? {
      apicalPlugMaterial: '',
      plugThicknessMm: '',
      apicalStopSize: '',
      apexificationNotes: '',
    };
    const u = (patch: Partial<ApexificationSteps>) =>
      updateSteps('apexification', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Apexification Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField label="Apical Plug Material" value={s.apicalPlugMaterial} options={apexPlugMaterials} onChange={(v) => u({ apicalPlugMaterial: v })} />
          <TextFieldSmall label="Plug Thickness (mm)" value={s.plugThicknessMm} onChange={(v) => u({ plugThicknessMm: v })} placeholder="e.g., 4" />
          <TextFieldSmall label="Apical Stop Size" value={s.apicalStopSize} onChange={(v) => u({ apicalStopSize: v })} placeholder="e.g., #80" />
          <div className="md:col-span-2">
            <TextFieldSmall label="Notes" value={s.apexificationNotes} onChange={(v) => u({ apexificationNotes: v })} placeholder="Additional notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderApexogenesis = () => {
    const s: ApexogenesisSteps = proceduralSteps.apexogenesis ?? {
      pulpCapMaterial: '',
      pulpotomyLevel: '',
      apexogenesisNotes: '',
    };
    const u = (patch: Partial<ApexogenesisSteps>) =>
      updateSteps('apexogenesis', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Apexogenesis Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectField label="Pulp Cap Material" value={s.pulpCapMaterial} options={pulpCapMaterials} onChange={(v) => u({ pulpCapMaterial: v })} />
          <SelectField label="Pulpotomy Level" value={s.pulpotomyLevel} options={pulpotomyLevels} onChange={(v) => u({ pulpotomyLevel: v })} />
          <div className="md:col-span-2">
            <TextFieldSmall label="Notes" value={s.apexogenesisNotes} onChange={(v) => u({ apexogenesisNotes: v })} placeholder="Additional notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderRegenerativeEndo = () => {
    const s: RegenerativeEndoSteps = proceduralSteps.regenerative_endo ?? {
      bloodClotAchieved: false,
      scaffoldType: '',
      antibioticPaste: '',
      bioceramicPlugPlaced: false,
      regenNotes: '',
    };
    const u = (patch: Partial<RegenerativeEndoSteps>) =>
      updateSteps('regenerative_endo', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Regenerative Endodontics Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center mt-2">
            <CheckboxField label="Blood clot achieved" checked={s.bloodClotAchieved} onChange={(v) => u({ bloodClotAchieved: v })} />
          </div>
          <div className="flex items-center mt-2">
            <CheckboxField label="Bioceramic plug placed" checked={s.bioceramicPlugPlaced} onChange={(v) => u({ bioceramicPlugPlaced: v })} />
          </div>
          <SelectField label="Scaffold Type" value={s.scaffoldType} options={regenScaffolds} onChange={(v) => u({ scaffoldType: v })} />
          <SelectField label="Antibiotic Paste" value={s.antibioticPaste} options={antibioticPastes} onChange={(v) => u({ antibioticPaste: v })} />
          <div className="md:col-span-2">
            <TextFieldSmall label="Notes" value={s.regenNotes} onChange={(v) => u({ regenNotes: v })} placeholder="Additional notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderIntentionalReplantation = () => {
    const s: IntentionalReplantationSteps = proceduralSteps.intentional_replantation ?? {
      extraOralTimeMins: '',
      storageMedia: '',
      retroPrepDone: false,
      retroMaterial: '',
      splintType: '',
      splintDurationWeeks: '',
      replantationNotes: '',
    };
    const u = (patch: Partial<IntentionalReplantationSteps>) =>
      updateSteps('intentional_replantation', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Intentional Replantation Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextFieldSmall label="Extra-oral Time (min)" value={s.extraOralTimeMins} onChange={(v) => u({ extraOralTimeMins: v })} placeholder="e.g., 12" />
          <SelectField label="Storage Media" value={s.storageMedia} options={storageMedia} onChange={(v) => u({ storageMedia: v })} />
          <div className="flex items-center mt-2">
            <CheckboxField label="Retrograde preparation performed" checked={s.retroPrepDone} onChange={(v) => u({ retroPrepDone: v })} />
          </div>
          {s.retroPrepDone && (
            <SelectField label="Retrograde Material" value={s.retroMaterial} options={retroMaterials} onChange={(v) => u({ retroMaterial: v })} />
          )}
          <SelectField label="Splint Type" value={s.splintType} options={splintTypes} onChange={(v) => u({ splintType: v })} />
          <TextFieldSmall label="Splint Duration (weeks)" value={s.splintDurationWeeks} onChange={(v) => u({ splintDurationWeeks: v })} placeholder="e.g., 2" />
          <div className="md:col-span-2">
            <TextFieldSmall label="Notes" value={s.replantationNotes} onChange={(v) => u({ replantationNotes: v })} placeholder="Additional notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderAutotransplantation = () => {
    const s: AutotransplantationSteps = proceduralSteps.autotransplantation ?? {
      donorTooth: '',
      recipientSite: '',
      rootDevStage: '',
      splintType: '',
      splintDurationWeeks: '',
      rctPlan: '',
      autotransplantNotes: '',
    };
    const u = (patch: Partial<AutotransplantationSteps>) =>
      updateSteps('autotransplantation', { ...s, ...patch });

    return (
      <div className="border border-teal-200 dark:border-teal-700 rounded-md overflow-hidden mb-4">
        <SectionHeader title="Autotransplantation Details" />
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextFieldSmall label="Donor Tooth" value={s.donorTooth} onChange={(v) => u({ donorTooth: v })} placeholder="e.g., #18" />
          <TextFieldSmall label="Recipient Site" value={s.recipientSite} onChange={(v) => u({ recipientSite: v })} placeholder="e.g., #36 socket" />
          <SelectField label="Root Development Stage" value={s.rootDevStage} options={rootDevStages} onChange={(v) => u({ rootDevStage: v })} />
          <SelectField label="RCT Plan" value={s.rctPlan} options={replantRctPlan} onChange={(v) => u({ rctPlan: v })} />
          <SelectField label="Splint Type" value={s.splintType} options={splintTypes} onChange={(v) => u({ splintType: v })} />
          <TextFieldSmall label="Splint Duration (weeks)" value={s.splintDurationWeeks} onChange={(v) => u({ splintDurationWeeks: v })} placeholder="e.g., 4" />
          <div className="md:col-span-2">
            <TextFieldSmall label="Notes" value={s.autotransplantNotes} onChange={(v) => u({ autotransplantNotes: v })} placeholder="Additional notes..." multiline />
          </div>
        </div>
      </div>
    );
  };

  const renderMap: Record<SurgicalProcedure, () => React.ReactElement> = {
    apical_microsurgery: renderApicalMicrosurgery,
    hemisection: renderHemisection,
    root_resection: renderRootResection,
    apexification: renderApexification,
    apexogenesis: renderApexogenesis,
    regenerative_endo: renderRegenerativeEndo,
    intentional_replantation: renderIntentionalReplantation,
    autotransplantation: renderAutotransplantation,
  };

  return (
    <div className="mt-4 mb-4">
      <div className="flex items-center mb-3">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Surgical / Special Procedure Details</h3>
      </div>
      {activeProcedures.map((proc) => (
        <div key={proc}>{renderMap[proc]()}</div>
      ))}
    </div>
  );
}
