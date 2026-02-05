const sections = [
  { id: 'subjective', label: 'Subjective' },
  { id: 'objective', label: 'Objective' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'plan', label: 'Plan' },
  { id: 'referral', label: 'Referral' },
];

export function SectionNav() {
  return (
    <nav className="sticky top-4 z-10 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
        Jump To
      </div>
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
