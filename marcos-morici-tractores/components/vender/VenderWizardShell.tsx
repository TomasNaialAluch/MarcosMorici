import { VENDER_STEP_TITLES } from '@/lib/vender/constants';

interface VenderWizardShellProps {
  currentStep: 0 | 1;
  children: React.ReactNode;
}

export default function VenderWizardShell({ currentStep, children }: VenderWizardShellProps) {
  return (
    <div className="rounded-xl border border-[#E0E5E9] bg-white shadow-sm overflow-hidden">
      <div className="flex border-b border-[#E0E5E9] bg-[#F8FAFB]">
        {VENDER_STEP_TITLES.map((title, index) => {
          const active = currentStep === index;
          return (
            <div
              key={title}
              className={`flex-1 px-4 py-3 text-center text-sm font-semibold transition-colors ${
                active ? 'text-[#1E3A5F] border-b-2 border-b-[#4A7C59] bg-white' : 'text-[#5A6C7D]'
              }`}
            >
              <span className="mr-1.5 text-[#5A6C7D]">{index + 1}.</span>
              {title}
            </div>
          );
        })}
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
}
