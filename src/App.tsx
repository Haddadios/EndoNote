import { NoteProvider } from './context/NoteContext';
import { Header } from './components/layout';
import {
  SubjectiveSection,
  ObjectiveSection,
  AssessmentSection,
  PlanSection,
  ReferralSection,
} from './components/forms';
import { NoteOutput, ReferralLetterOutput, TemplateManager } from './components/output';

function App() {
  return (
    <NoteProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />

        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Sections (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <SubjectiveSection />
              <ObjectiveSection />
              <AssessmentSection />
              <PlanSection />
            </div>

            {/* Right Column - Output and Templates (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-6">
                <NoteOutput />
                <ReferralSection />
                <ReferralLetterOutput />
                <TemplateManager />
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              EndoNote - Endodontic Chart Note Generator
            </p>
          </div>
        </footer>
      </div>
    </NoteProvider>
  );
}

export default App;
