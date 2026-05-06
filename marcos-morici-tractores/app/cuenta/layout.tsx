import CuentaAuthGate from '@/components/account/cuenta/CuentaAuthGate';
import CuentaTabs from '@/components/account/cuenta/CuentaTabs';

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CuentaAuthGate>
      <div className="min-h-[60vh] bg-[#F8FAFB] py-10">
        <div className="container mx-auto px-4">
          <CuentaTabs />
          {children}
        </div>
      </div>
    </CuentaAuthGate>
  );
}
