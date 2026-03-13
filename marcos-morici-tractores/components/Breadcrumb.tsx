import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-[#F0F3F6] border-b border-[#E0E5E9]">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-[#5A6C7D]" aria-label="Breadcrumb">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-[#1E3A5F] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#1E3A5F] font-semibold">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
